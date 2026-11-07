<script setup lang="ts">
import { GLOBAL_HEADER_MENU_ID } from '@/constants/app';
import { useRouteStore } from '@/store/modules/route';
import { useRouterPush } from '@/hooks/common/router';
import { useMenu } from '../context';
import AppHorizontalMenu from '../components/app-horizontal-menu.vue';

defineOptions({
  name: 'HorizontalMenu'
});

const routeStore = useRouteStore();
const { routerPushByKeyWithMetaQuery } = useRouterPush();
const { selectedKey } = useMenu();
</script>

<template>
  <Teleport :to="`#${GLOBAL_HEADER_MENU_ID}`">
    <AppHorizontalMenu :menus="routeStore.menus" :selected-key="selectedKey" @select="routerPushByKeyWithMetaQuery" />
  </Teleport>
</template>

<style scoped></style>
