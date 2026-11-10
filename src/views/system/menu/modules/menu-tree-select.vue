<script setup lang="ts">
import { computed, ref } from 'vue';

defineOptions({
  name: 'MenuTreeSelect'
});

/** the menu tree node used by the parent menu selector */
export interface MenuTreeSelectItem {
  menuId: string | number;
  menuName: string;
  children?: MenuTreeSelectItem[];
}

interface Props {
  /** the menu tree options, the root item is usually `主类目` */
  items: MenuTreeSelectItem[];
  /** the selected menu id */
  modelValue?: string | number;
  /** the field label */
  label?: string;
  /** whether the selector is disabled */
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  label: '上级菜单',
  disabled: false
});

interface Emits {
  (e: 'update:modelValue', value: string | number): void;
}

const emit = defineEmits<Emits>();

const menuVisible = ref(false);

function findLabel(nodes: MenuTreeSelectItem[], id: string | number): string {
  for (const node of nodes) {
    if (String(node.menuId) === String(id)) {
      return node.menuName;
    }

    if (node.children?.length) {
      const label = findLabel(node.children, id);

      if (label) {
        return label;
      }
    }
  }

  return '';
}

const selectedLabel = computed(() => findLabel(props.items, props.modelValue) || '主类目');

function handleSelected(value: unknown) {
  const selected = Array.isArray(value) ? value : [];

  if (!selected.length) {
    return;
  }

  emit('update:modelValue', selected[0] as string | number);
  menuVisible.value = false;
}
</script>

<template>
  <VMenu v-model="menuVisible" :close-on-content-click="false" location="bottom start" :max-width="420">
    <template #activator="{ props: activatorProps }">
      <VTextField
        v-bind="activatorProps"
        :label="label"
        :model-value="selectedLabel"
        :disabled="disabled"
        readonly
        prepend-inner-icon="mdi-file-tree"
        append-inner-icon="mdi-menu-down"
        hide-details="auto"
      />
    </template>
    <VCard max-height="360" class="overflow-y-auto">
      <VTreeview
        :items="items"
        :selected="[modelValue]"
        item-title="menuName"
        item-value="menuId"
        item-children="children"
        selectable
        select-strategy="single-independent"
        open-all
        density="compact"
        no-data-text="暂无菜单数据"
        @update:selected="handleSelected"
      />
    </VCard>
  </VMenu>
</template>

<style scoped></style>
