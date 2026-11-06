<script setup lang="ts">
import { computed } from 'vue';
import { NConfigProvider, darkTheme } from 'naive-ui';
import type { WatermarkProps } from 'naive-ui';
import type { DefaultsInstance } from 'vuetify';
import { useAppStore } from './store/modules/app';
import { useThemeStore } from './store/modules/theme';
import { useVuetifyTheme } from './hooks/common/vuetify-theme';
import { naiveDateLocales, naiveLocales } from './locales/naive';

defineOptions({
  name: 'App'
});

const appStore = useAppStore();
const themeStore = useThemeStore();

useVuetifyTheme();

// Global Vuetify defaults, same contract as fruit-admin-vuetify. A numeric `rounded`
// value becomes an inline border-radius so Soybean's theme drawer updates components.
const defaultValue = computed<DefaultsInstance>(() => {
  const rounded = themeStore.themeRadius;
  const fieldRounded = Math.min(rounded, 12);

  return {
    global: { rounded },
    VAppBar: { rounded: 0 },
    VNavigationDrawer: { rounded: 0 },
    VAvatar: { rounded: 'circle' },
    VBadge: { rounded: 'circle' },
    VChip: { rounded: 'pill' },
    VIconBtn: { rounded: 'circle' },
    VImg: { rounded: 0 },
    VProgressLinear: { rounded: 'pill' },
    VSlider: { rounded: 'pill' },
    VTextField: { rounded: fieldRounded },
    VSelect: { rounded: fieldRounded },
    VAutocomplete: { rounded: fieldRounded },
    VCombobox: { rounded: fieldRounded },
    VTextarea: { rounded: fieldRounded },
    VFileInput: { rounded: fieldRounded },
    VNumberInput: { rounded: fieldRounded },
    VField: { rounded: fieldRounded }
  };
});

const naiveDarkTheme = computed(() => (themeStore.darkMode ? darkTheme : undefined));

const naiveLocale = computed(() => {
  return naiveLocales[appStore.locale];
});

const naiveDateLocale = computed(() => {
  return naiveDateLocales[appStore.locale];
});

const watermarkProps = computed<WatermarkProps>(() => {
  return {
    content: themeStore.watermarkContent,
    cross: true,
    fullscreen: true,
    fontSize: 16,
    lineHeight: 16,
    width: 384,
    height: 384,
    xOffset: 12,
    yOffset: 60,
    rotate: -15,
    zIndex: 9999
  };
});
</script>

<template>
  <VDefaultsProvider :defaults="defaultValue">
    <VApp>
      <NConfigProvider
        :theme="naiveDarkTheme"
        :theme-overrides="themeStore.naiveTheme"
        :locale="naiveLocale"
        :date-locale="naiveDateLocale"
        class="h-full"
      >
        <AppProvider>
          <RouterView class="bg-layout" />
          <NWatermark v-if="themeStore.watermark.visible" v-bind="watermarkProps" />
        </AppProvider>
      </NConfigProvider>
    </VApp>
  </VDefaultsProvider>
</template>

<style scoped></style>
