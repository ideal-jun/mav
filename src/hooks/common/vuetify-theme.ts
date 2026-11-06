import { watch } from 'vue';
import { useTheme } from 'vuetify';
import { useThemeStore } from '@/store/modules/theme';
import { themeSettings } from '@/theme/settings';

/** Keep Vuetify's runtime theme aligned with Soybean's appearance store. */
export function useVuetifyTheme() {
  const theme = useTheme();
  const themeStore = useThemeStore();
  const lightTokens = themeSettings.tokens.light.colors;
  const darkTokens = themeSettings.tokens.dark?.colors;

  watch(
    () =>
      [
        themeStore.darkMode,
        themeStore.themeColors.primary,
        themeStore.themeColors.info,
        themeStore.themeColors.success,
        themeStore.themeColors.warning,
        themeStore.themeColors.error
      ] as const,
    ([darkMode, primary, info, success, warning, error]) => {
      const name = darkMode ? 'dark' : 'light';
      const colors = theme.themes.value[name]?.colors;

      theme.global.name.value = name;

      if (!colors) return;

      Object.assign(colors, {
        primary,
        info,
        success,
        warning,
        error,
        background: darkMode ? darkTokens?.layout : lightTokens.layout,
        surface: darkMode ? darkTokens?.container : lightTokens.container
      });
    },
    { immediate: true }
  );
}
