<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAppStore } from '@/store/modules/app';
import { $t } from '@/locales';
import AppearanceSettings from './modules/appearance/index.vue';
import LayoutSettings from './modules/layout/index.vue';
import GeneralSettings from './modules/general/index.vue';
import ConfigOperation from './modules/config-operation.vue';
import PresetSettings from './modules/preset/index.vue';

defineOptions({
  name: 'ThemeDrawer'
});

const appStore = useAppStore();
const activeTab = ref('appearance');

const drawerWidth = computed(() => {
  const width = 400;

  // On mobile devices, use 90% of viewport width with a maximum of 400px
  if (appStore.isMobile) {
    return `min(90vw, ${width}px)`;
  }

  return width;
});
</script>

<template>
  <VNavigationDrawer v-model="appStore.themeDrawerVisible" location="right" temporary :width="drawerWidth" order="-1">
    <div class="flex h-full flex-col">
      <div class="flex items-center justify-between px-4 py-3">
        <h2 class="text-lg font-medium">{{ $t('theme.themeDrawerTitle') }}</h2>
        <VBtn icon="mdi-close" variant="text" density="comfortable" @click="appStore.closeThemeDrawer" />
      </div>

      <div class="shrink-0">
        <VTabs v-model="activeTab" density="compact" :show-arrows="false" grow inset class="mx-4 shadow-none">
          <VTab value="appearance" min-width="30" :ripple="false">{{ $t('theme.tabs.appearance') }}</VTab>
          <VTab value="layout" min-width="30" :ripple="false">{{ $t('theme.tabs.layout') }}</VTab>
          <VTab value="general" min-width="30" :ripple="false">{{ $t('theme.tabs.general') }}</VTab>
          <VTab value="preset" min-width="30" :ripple="false">{{ $t('theme.tabs.preset') }}</VTab>
        </VTabs>
      </div>

      <div class="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <KeepAlive>
          <AppearanceSettings v-if="activeTab === 'appearance'" />
          <LayoutSettings v-else-if="activeTab === 'layout'" />
          <GeneralSettings v-else-if="activeTab === 'general'" />
          <PresetSettings v-else-if="activeTab === 'preset'" />
        </KeepAlive>
      </div>

      <VDivider />
      <div class="p-4">
        <ConfigOperation />
      </div>
    </div>
  </VNavigationDrawer>
</template>

<style scoped></style>
