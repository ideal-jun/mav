<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { useAppStore } from '@/store/modules/app';
import { useThemeStore } from '@/store/modules/theme';
import GlobalHeader from '../modules/global-header/index.vue';
import GlobalSider from '../modules/global-sider/index.vue';
import GlobalTab from '../modules/global-tab/index.vue';
import GlobalContent from '../modules/global-content/index.vue';
import GlobalFooter from '../modules/global-footer/index.vue';
import ThemeDrawer from '../modules/theme-drawer/index.vue';
import { provideMixMenuContext } from '../modules/global-menu/context';

defineOptions({
  name: 'BaseLayout'
});

const appStore = useAppStore();
const themeStore = useThemeStore();
const { secondLevelMenus, childLevelMenus, isActiveFirstLevelMenuHasChildren } = provideMixMenuContext();

const GlobalMenu = defineAsyncComponent(() => import('../modules/global-menu/index.vue'));

const isTopHybridHeaderFirst = computed(() => themeStore.layout.mode === 'top-hybrid-header-first');
const isVerticalMix = computed(() => themeStore.layout.mode === 'vertical-mix');
const isVerticalHybridHeaderFirst = computed(() => themeStore.layout.mode === 'vertical-hybrid-header-first');
const isTopHybridSidebarFirst = computed(() => themeStore.layout.mode === 'top-hybrid-sidebar-first');

/** the horizontal layout family: the header is full width and the sider starts below it */
const isHorizontalLayout = computed(
  () => themeStore.layout.mode === 'horizontal' || isTopHybridSidebarFirst.value || isTopHybridHeaderFirst.value
);

/**
 * The order of the Vuetify layout items decides the geometry.
 * - vertical family: sider spans the full height, header and tab start to its right
 * - horizontal family: header is full width, sider starts below the header
 */
const layoutOrder = computed(() =>
  isHorizontalLayout.value ? { header: 0, tab: 1, sider: 2, footer: 3 } : { sider: 0, header: 1, tab: 2, footer: 3 }
);

const headerProps = computed(() => {
  const { mode } = themeStore.layout;

  const headerPropsConfig: Record<UnionKey.ThemeLayoutMode, App.Global.HeaderProps> = {
    vertical: {
      showLogo: false,
      showMenu: false,
      showMenuToggler: true
    },
    'vertical-mix': {
      showLogo: false,
      showMenu: false,
      showMenuToggler: false
    },
    'vertical-hybrid-header-first': {
      showLogo: !isActiveFirstLevelMenuHasChildren.value,
      showMenu: true,
      showMenuToggler: false
    },
    horizontal: {
      showLogo: true,
      showMenu: true,
      showMenuToggler: false
    },
    'top-hybrid-sidebar-first': {
      showLogo: true,
      showMenu: true,
      showMenuToggler: false
    },
    'top-hybrid-header-first': {
      showLogo: true,
      showMenu: true,
      showMenuToggler: isActiveFirstLevelMenuHasChildren.value
    }
  };

  return headerPropsConfig[mode];
});

const siderVisible = computed(() => themeStore.layout.mode !== 'horizontal');

const siderWidth = computed(() => getSiderAndCollapsedWidth(false));

const siderCollapsedWidth = computed(() => getSiderAndCollapsedWidth(true));

/** Whether the sider takes part in the current layout (layout mode and width) */
const siderEnabled = computed(() => siderVisible.value && (siderWidth.value > 0 || siderCollapsedWidth.value > 0));

const currentSiderWidth = computed(() => (appStore.siderCollapse ? siderCollapsedWidth.value : siderWidth.value));

/** The app bar height, it collapses to 0 in full content mode so only the tab extension is kept */
const headerHeight = computed(() => (appStore.fullContent ? 0 : themeStore.header.height));

const showTab = computed(() => themeStore.tab.visible);

const showFooter = computed(() => !appStore.fullContent && themeStore.footer.visible);

/**
 * The drawer model, it is driven by the component properties instead of `v-if`:
 * - full content mode closes the drawer
 * - the horizontal layout family has no sider
 * - on mobile the sider becomes a temporary drawer controlled by the sider-collapse state
 */
const drawerModel = computed({
  get: () => {
    if (appStore.fullContent || !siderEnabled.value) {
      return false;
    }

    return appStore.isMobile ? !appStore.siderCollapse : true;
  },
  set: (value: boolean) => {
    if (appStore.isMobile) {
      appStore.setSiderCollapse(!value);
    }
  }
});

function getSiderAndCollapsedWidth(isCollapsed: boolean) {
  const {
    mixChildMenuWidth,
    collapsedWidth,
    width: themeWidth,
    mixCollapsedWidth,
    mixWidth: themeMixWidth
  } = themeStore.sider;

  const width = isCollapsed ? collapsedWidth : themeWidth;
  const mixWidth = isCollapsed ? mixCollapsedWidth : themeMixWidth;

  if (isTopHybridHeaderFirst.value) {
    return isActiveFirstLevelMenuHasChildren.value ? width : 0;
  }

  if (isVerticalHybridHeaderFirst.value && !isActiveFirstLevelMenuHasChildren.value) {
    return 0;
  }

  const isMixMode = isVerticalMix.value || isTopHybridSidebarFirst.value || isVerticalHybridHeaderFirst.value;
  let finalWidth = isMixMode ? mixWidth : width;

  if (isVerticalMix.value && appStore.mixSiderFixed && secondLevelMenus.value.length) {
    finalWidth += mixChildMenuWidth;
  }

  if (isVerticalHybridHeaderFirst.value && appStore.mixSiderFixed && childLevelMenus.value.length) {
    finalWidth += mixChildMenuWidth;
  }

  return finalWidth;
}
</script>

<template>
  <VNavigationDrawer
    v-model="drawerModel"
    :rail="appStore.siderRail"
    expand-on-hover
    :permanent="!appStore.isMobile"
    :width="currentSiderWidth"
  >
    <GlobalSider />
  </VNavigationDrawer>

  <VAppBar :height="headerHeight" :extension-height="themeStore.tab.height">
    <GlobalHeader v-show="!appStore.fullContent" v-bind="headerProps" />
    <template v-if="showTab" #extension>
      <GlobalTab />
    </template>
  </VAppBar>

  <VMain scrollable>
    <GlobalContent />
  </VMain>

  <VFooter v-if="showFooter" app :order="layoutOrder.footer" :height="themeStore.footer.height">
    <GlobalFooter />
  </VFooter>

  <GlobalMenu />
  <ThemeDrawer />
</template>

<style lang="scss"></style>
