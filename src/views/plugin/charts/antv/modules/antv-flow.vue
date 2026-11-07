<script setup lang="ts">
import { shallowRef, useTemplateRef, watch } from 'vue';
import { vResizeObserver } from '@vueuse/components';
import { useDebounceFn } from '@vueuse/core';
import type { CustomBehaviorOption, Graph } from '@antv/g6';
import { useAntFlow } from './antv-g6-flow';
import { nodeStatus } from './status';
import type { CustomGraphData } from './types';

defineOptions({
  name: 'AntvFLow'
});

interface Props {
  behaviors?: CustomBehaviorOption[];
  data: CustomGraphData;
  selected?: string;
  height?: string;
  autoFit?: 'view' | 'center';
}

const props = defineProps<Props>();

const containerRef = useTemplateRef('containerRef');
const graphRef = shallowRef<Graph | null>(null);

// 监听容器尺寸变化，调整画布大小为图容器大小
const onContainerResize = useDebounceFn(() => {
  if (graphRef.value) {
    graphRef.value.resize();
  }
}, 5);

async function draw() {
  if (graphRef.value) {
    graphRef.value.destroy();
  }
  const { graph } = useAntFlow({
    container: 'antv-flow',
    data: props.data,
    behaviors: props.behaviors,
    autoFit: props.autoFit
  });
  graphRef.value = graph;
  await selectNode();
}

async function selectNode() {
  if (props.selected && graphRef.value) {
    try {
      await graphRef.value.setElementState(props.selected, 'selected');
    } catch {}
  }
}

function zoomOut() {
  graphRef.value?.zoomBy(0.9);
}

function zoomIn() {
  graphRef.value?.zoomBy(1.1);
}

function resetZoom() {
  graphRef.value?.zoomTo(1);
  graphRef.value?.fitCenter();
}

function fitZoom() {
  graphRef.value?.fitView();
  graphRef.value?.fitCenter();
}

watch(
  [() => props.data, () => props.selected],
  () => {
    draw();
  },
  { deep: true }
);

defineExpose({ selectNode, graph: graphRef });
</script>

<template>
  <div class="relative">
    <!-- 画布操作栏 -->
    <div class="absolute left-0 right-0 z-1 flex items-stretch justify-between">
      <VBtnGroup density="compact" variant="outlined" class="bg-white!">
        <VBtn @click="zoomOut">
          <SvgIcon icon="mingcute:zoom-out-line" />
        </VBtn>
        <VBtn @click="zoomIn">
          <SvgIcon icon="mingcute:zoom-in-line" />
        </VBtn>
        <VBtn @click="resetZoom">
          <SvgIcon icon="icon-park-outline:equal-ratio" />
        </VBtn>
        <VBtn @click="fitZoom">
          <SvgIcon icon="gg:ratio" />
        </VBtn>
      </VBtnGroup>
      <div class="flex items-center gap-3">
        <VMenu location="bottom end">
          <template #activator="{ props: activatorProps }">
            <VBtn v-bind="activatorProps" density="compact" variant="outlined" class="bg-white!">
              <SvgIcon icon="fe:question" />
            </VBtn>
          </template>
          <div class="flex flex-col gap-2 p-4">
            <div class="text-12px font-bold">节点图例</div>
            <div class="grid w-180px! grid-cols-2 gap-y-2">
              <div v-for="(config, status) in nodeStatus" :key="status" class="flex items-center justify-center">
                <VChip size="small" variant="tonal" rounded="pill">
                  <SvgIcon
                    :icon="status === 'MILESTONE' ? 'f7:flag-circle-fill' : 'f7:circle-fill'"
                    :style="{ color: config.color }"
                    class="mr-1"
                  />
                  {{ config.type }}
                </VChip>
              </div>
            </div>
          </div>
        </VMenu>
      </div>
    </div>
    <!-- 画布 -->
    <div
      id="antv-flow"
      ref="containerRef"
      v-resize-observer="onContainerResize"
      class="w-full"
      :style="{ height: props.height || '300px' }"
      @contextmenu="event => event.preventDefault()"
    ></div>
  </div>
</template>
