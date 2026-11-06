<script setup lang="ts">
import { useFullscreen } from '@vueuse/core';
import { GLOBAL_HEADER_MENU_ID } from '@/constants/app';
import { useAppStore } from '@/store/modules/app';
import { useThemeStore } from '@/store/modules/theme';
import GlobalLogo from '../global-logo/index.vue';
import GlobalBreadcrumb from '../global-breadcrumb/index.vue';
import GlobalSearch from '../global-search/index.vue';
import ThemeButton from './components/theme-button.vue';
import UserAvatar from './components/user-avatar.vue';

defineOptions({
  name: 'GlobalHeader'
});

interface Props {
  /** Whether to show the logo */
  showLogo?: App.Global.HeaderProps['showLogo'];
  /** Whether to show the menu toggler */
  showMenuToggler?: App.Global.HeaderProps['showMenuToggler'];
  /** Whether to show the menu */
  showMenu?: App.Global.HeaderProps['showMenu'];
}

defineProps<Props>();

const appStore = useAppStore();
const themeStore = useThemeStore();
const { isFullscreen, toggle } = useFullscreen();
</script>

<template>
  <VSheet class="h-full px-3 shadow-sm" color="surface" rounded="0">
    <div class="flex h-full items-center">
      <GlobalLogo v-if="showLogo" class="h-full" :style="{ width: themeStore.sider.width + 'px' }" />
      <MenuToggler v-if="showMenuToggler" :collapsed="appStore.siderCollapse" @click="appStore.toggleSiderCollapse" />
      <div v-if="showMenu" :id="GLOBAL_HEADER_MENU_ID" class="h-full flex flex-1 items-center overflow-hidden"></div>
      <div v-else class="h-full flex flex-1 items-center overflow-hidden">
        <GlobalBreadcrumb v-if="!appStore.isMobile" class="ml-3" />
      </div>
      <div class="flex h-full items-center justify-end">
        <GlobalSearch v-if="themeStore.header.globalSearch.visible" />
        <FullScreen v-if="!appStore.isMobile" :full="isFullscreen" @click="toggle" />
        <LangSwitch
          v-if="themeStore.header.multilingual.visible"
          :lang="appStore.locale"
          :lang-options="appStore.localeOptions"
          @change-lang="appStore.changeLocale"
        />
        <ThemeSchemaSwitch
          :theme-schema="themeStore.themeScheme"
          :is-dark="themeStore.darkMode"
          @switch="themeStore.toggleThemeScheme"
        />
        <ThemeButton />
        <UserAvatar />
      </div>
    </div>
  </VSheet>
</template>

<style scoped></style>
