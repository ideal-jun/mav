<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import type { RouteKey } from '@elegant-router/types';
import { GLOBAL_HEADER_MENU_ID, GLOBAL_SIDER_MENU_ID } from '@/constants/app';
import { useAppStore } from '@/store/modules/app';
import { useRouteStore } from '@/store/modules/route';
import { useRouterPush } from '@/hooks/common/router';
import { useMenu, useMixMenuContext } from '../context';
import AppMenu from '../components/app-menu.vue';
import AppHorizontalMenu from '../components/app-horizontal-menu.vue';

defineOptions({
  name: 'TopHybridHeaderFirst'
});

const route = useRoute();
const appStore = useAppStore();
const routeStore = useRouteStore();
const { routerPushByKeyWithMetaQuery } = useRouterPush();
const {
  firstLevelMenus,
  secondLevelMenus,
  activeFirstLevelMenuKey,
  handleSelectFirstLevelMenu,
  activeDeepestLevelMenuKey
} = useMixMenuContext('TopHybridHeaderFirst');
const { selectedKey } = useMenu();

const expandedKeys = ref<string[]>([]);

/**
 * Handle first level menu select
 * @param key RouteKey
 */
function handleSelectMenu(key: RouteKey) {
  handleSelectFirstLevelMenu(key);

  // if there are second level menus, select the deepest one by default
  activeDeepestLevelMenuKey();
}

function updateExpandedKeys() {
  if (appStore.siderCollapse || !selectedKey.value) {
    expandedKeys.value = [];
    return;
  }
  expandedKeys.value = routeStore.getSelectedMenuKeyPath(selectedKey.value);
}

watch(
  () => route.name,
  () => {
    updateExpandedKeys();
  },
  { immediate: true }
);
</script>

<template>
  <Teleport :to="`#${GLOBAL_HEADER_MENU_ID}`">
    <AppHorizontalMenu :menus="firstLevelMenus" :selected-key="activeFirstLevelMenuKey" @select="handleSelectMenu" />
  </Teleport>
  <Teleport :to="`#${GLOBAL_SIDER_MENU_ID}`">
    <div class="h-full overflow-hidden">
      <AppMenu
        v-model:expanded-keys="expandedKeys"
        :menus="secondLevelMenus"
        :selected-key="selectedKey"
        :collapsed="appStore.siderCollapse"
        @select="routerPushByKeyWithMetaQuery"
      />
    </div>
  </Teleport>
</template>

<style scoped></style>
