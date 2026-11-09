<script setup lang="ts">
import GithubLink from '@/components/common/github-link.vue';
import WebSiteLink from '@/components/common/web-site-link.vue';
import ButtonIcon from '@/components/custom/button-icon.vue';
import { computed, ref, shallowRef } from 'vue';
import VuePdfEmbed from 'vue-pdf-embed';
import { useLoading } from '@sa/hooks';

const { loading, endLoading } = useLoading(true);

const pdfRef = shallowRef<InstanceType<typeof VuePdfEmbed> | null>(null);
const source = `https://xiaoxian521.github.io/hyperlink/pdf/Cookie%E5%92%8CSession%E5%8C%BA%E5%88%AB%E7%94%A8%E6%B3%95.pdf`;

const showAllPages = ref(false);
const currentPage = ref<undefined | number>(1);
const pageCount = ref(1);

function onPdfRendered() {
  endLoading();

  if (pdfRef.value?.doc) {
    pageCount.value = pdfRef.value.doc.numPages;
  }
}

function showAllPagesChange(value: boolean | null) {
  showAllPages.value = Boolean(value);
  currentPage.value = value ? undefined : 1;
}

const rotations = [0, 90, 180, 270];
const currentRotation = ref(0);
const rotation = computed(() => rotations[currentRotation.value]);

function handleRotate() {
  currentRotation.value = (currentRotation.value + 1) % 4;
}

async function handlePrint() {
  await pdfRef.value?.print(undefined, 'test.pdf', true);
}

async function handleDownload() {
  await pdfRef.value?.download('test.pdf');
}
</script>

<template>
  <div class="overflow-hidden">
    <VCard class="h-full card-wrapper flex flex-col">
      <VCardTitle>PDF 预览</VCardTitle>
      <VCardText class="min-h-0 flex flex-1 flex-col">
        <GithubLink link="https://github.com/hrynko/vue-pdf-embed" />
        <WebSiteLink label="文档地址：" link="https://www.npmjs.com/package/vue-pdf-embed" />
        <div class="flex items-center justify-end gap-3">
          <VCheckbox :model-value="showAllPages" @update:model-value="showAllPagesChange">显示所有页面</VCheckbox>
          <ButtonIcon tooltip-content="旋转90度" @click="handleRotate">
            <VIcon icon="mdi-rotate-left" />
          </ButtonIcon>
          <ButtonIcon tooltip-content="打印" @click="handlePrint">
            <VIcon icon="mdi-printer" />
          </ButtonIcon>
          <ButtonIcon tooltip-content="下载" @click="handleDownload">
            <VIcon icon="mdi-download" />
          </ButtonIcon>
        </div>
        <div class="min-h-0 flex-1 overflow-auto">
          <VSkeletonLoader v-if="loading" type="text@12" class="mt-3" />
          <VuePdfEmbed
            ref="pdfRef"
            class="container overflow-auto"
            :class="{ 'h-0': loading }"
            :rotation="rotation"
            :page="currentPage"
            :source="source"
            @rendered="onPdfRendered"
          />
        </div>
        <div class="flex items-center justify-between">
          <div v-if="showAllPages" class="text-18px font-medium">共{{ pageCount }}页</div>
          <VPagination
            v-else
            :model-value="currentPage ?? 1"
            :length="pageCount"
            :total-visible="7"
            @update:model-value="currentPage = $event"
          />
        </div>
      </VCardText>
    </VCard>
  </div>
</template>

<style scoped></style>
