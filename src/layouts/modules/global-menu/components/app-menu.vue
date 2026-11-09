<script setup lang="ts">
import { computed } from 'vue';
import MenuGroup from '@/layouts/modules/global-menu/components/MenuGroup.vue';

defineOptions({ name: 'AppMenu' });

interface Props {
  /** global menus */
  menus: App.Global.Menu[];
  /** currently selected route key */
  selectedKey?: string;
  /** collapsed (icon only) menu */
  collapsed?: boolean;
  /** inverted (dark sider) menu */
  inverted?: boolean;
  /** expanded group keys */
  expandedKeys?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  selectedKey: '',
  collapsed: false,
  inverted: false,
  expandedKeys: () => []
});

const emit = defineEmits<{
  /** menu item selected */
  (e: 'select', key: string): void;
  /** expanded keys changed */
  (e: 'update:expandedKeys', keys: string[]): void;
}>();

const opened = computed({
  get: () => props.expandedKeys,
  set: value => emit('update:expandedKeys', value as string[])
});
</script>

<template>
  <VList v-model:opened="opened" color="primary" nav density="compact" prepend-gap="12" indent="32">
    <template v-for="menu in menus" :key="menu.key">
      <MenuGroup v-if="menu.children?.length" :menu="menu" />
      <VListItem
        v-else
        :value="menu.key"
        :title="menu.label"
        :prepend-icon="menu.icon"
        :to="menu.routePath"
      ></VListItem>
    </template>
  </VList>
</template>

<style scoped></style>
