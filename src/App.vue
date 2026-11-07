<script setup lang="ts">
import { computed } from 'vue';
import type { DefaultsInstance } from 'vuetify';
import { useThemeStore } from './store/modules/theme';
import { useVuetifyTheme } from './hooks/common/vuetify-theme';

defineOptions({
  name: 'App'
});

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
</script>

<template>
  <VDefaultsProvider :defaults="defaultValue">
    <VApp>
      <AppProvider>
        <RouterView />
        <AppWatermark
          :visible="themeStore.watermark.visible"
          :content="themeStore.watermarkContent"
          :font-size="16"
          :width="384"
          :height="384"
          :x-offset="12"
          :y-offset="60"
          :rotate="-15"
          :z-index="2400"
        />
      </AppProvider>
    </VApp>
  </VDefaultsProvider>
</template>

<style scoped></style>
