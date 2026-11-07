<script setup lang="ts">
import { computed } from 'vue';
import type { RouteKey } from '@elegant-router/types';
import AppMenuNodes from './app-menu-nodes.vue';

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
  (e: 'select', key: RouteKey): void;
  /** expanded keys changed */
  (e: 'update:expandedKeys', keys: string[]): void;
}>();

const opened = computed({
  get: () => props.expandedKeys,
  set: value => emit('update:expandedKeys', value as string[])
});
</script>

<template>
  <VList
    v-model:opened="opened"
    nav
    density="compact"
    class="app-menu h-full overflow-y-auto py-1"
    :class="{ 'app-menu--inverted': inverted, 'app-menu--collapsed': collapsed }"
  >
    <AppMenuNodes
      :menus="menus"
      :level="0"
      :collapsed="collapsed"
      :selected-key="selectedKey"
      @select="key => emit('select', key)"
    />
  </VList>
</template>

<style scoped>
.app-menu :deep(.v-list-item) {
  min-height: 40px;
  border-radius: 8px;
}

.app-menu--inverted :deep(.v-list-item) {
  color: rgba(255, 255, 255, 0.82);
}

.app-menu--inverted :deep(.v-list-item--active) {
  color: #fff;
}

.app-menu--inverted :deep(.v-list-group__items .v-list-item) {
  color: rgba(255, 255, 255, 0.72);
}

.app-menu--inverted :deep(.v-list-item:hover) {
  background-color: rgba(255, 255, 255, 0.08);
}

.app-menu--collapsed :deep(.v-list-item) {
  border-radius: 8px;
}
</style>
