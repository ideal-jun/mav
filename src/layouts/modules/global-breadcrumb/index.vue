<script setup lang="ts">
import { createReusableTemplate } from '@vueuse/core';
import type { RouteKey } from '@elegant-router/types';
import { useThemeStore } from '@/store/modules/theme';
import { useRouteStore } from '@/store/modules/route';
import { useRouterPush } from '@/hooks/common/router';

defineOptions({
  name: 'GlobalBreadcrumb'
});

const themeStore = useThemeStore();
const routeStore = useRouteStore();
const { routerPushByKey } = useRouterPush();

interface BreadcrumbContentProps {
  breadcrumb: App.Global.Menu;
}

const [DefineBreadcrumbContent, BreadcrumbContent] = createReusableTemplate<BreadcrumbContentProps>();

function handleClickMenu(key: string) {
  routerPushByKey(key as RouteKey);
}
</script>

<template>
  <VBreadcrumb v-if="themeStore.header.breadcrumb.visible" class="ml-3">
    <!-- define component start: BreadcrumbContent -->
    <DefineBreadcrumbContent v-slot="{ breadcrumb }">
      <span class="inline-flex items-center">
        <component :is="breadcrumb.icon" v-if="themeStore.header.breadcrumb.showIcon" class="mr-1 text-icon" />
        {{ breadcrumb.label }}
      </span>
    </DefineBreadcrumbContent>
    <!-- define component end: BreadcrumbContent -->

    <VBreadcrumbItem v-for="item in routeStore.breadcrumbs" :key="item.key">
      <VMenu v-if="item.options?.length" location="bottom start">
        <template #activator="{ props }">
          <span v-bind="props" class="inline-flex cursor-pointer items-center">
            <BreadcrumbContent :breadcrumb="item" />
          </span>
        </template>
        <VList density="compact">
          <VListItem v-for="option in item.options" :key="option.key" @click="handleClickMenu(option.key)">
            <VListItemTitle>{{ option.label }}</VListItemTitle>
          </VListItem>
        </VList>
      </VMenu>
      <BreadcrumbContent v-else :breadcrumb="item" />
    </VBreadcrumbItem>
  </VBreadcrumb>
</template>

<style scoped></style>
