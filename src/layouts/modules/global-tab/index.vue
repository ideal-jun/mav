<script setup lang="ts">
import { nextTick, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAppStore } from '@/store/modules/app';
import { useThemeStore } from '@/store/modules/theme';
import { useTabStore } from '@/store/modules/tab';
import ContextMenu from './context-menu.vue';

defineOptions({
  name: 'GlobalTab'
});

const route = useRoute();
const appStore = useAppStore();
const themeStore = useThemeStore();
const tabStore = useTabStore();

const tabScrollRef = ref<HTMLElement>();

const TAB_DATA_ID = 'data-tab-id';
const MIDDLE_MOUSE_BUTTON = 1;
const RIGHT_MOUSE_BUTTON = 2;

async function scrollToActiveTab() {
  await nextTick();

  const container = tabScrollRef.value;

  if (!container) return;

  const children = Array.from(container.querySelectorAll<HTMLElement>('[' + TAB_DATA_ID + ']'));

  const activeTab = children.find(child => child.dataset.tabId === tabStore.activeTabId);

  activeTab?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}

function getTabClass(tab: App.Global.Tab) {
  const active = tab.id === tabStore.activeTabId;
  const mode = themeStore.tab.mode;

  if (mode === 'button') {
    return active ? 'tab-item--button-active' : 'tab-item--button';
  }

  if (mode === 'slider') {
    return active ? 'tab-item--slider-active' : 'tab-item--slider';
  }

  return active ? 'tab-item--chrome-active' : 'tab-item--chrome';
}

function getContextMenuDisabledKeys(tabId: string) {
  const disabledKeys: App.Global.DropdownKey[] = [];

  if (tabStore.isTabRetain(tabId)) {
    const homeDisable: App.Global.DropdownKey[] = ['closeCurrent', 'closeLeft'];
    disabledKeys.push(...homeDisable);
  }

  return disabledKeys;
}

function handleCloseTab(tab: App.Global.Tab) {
  tabStore.removeTab(tab.id);
}

function handleMousedown(e: MouseEvent, tab: App.Global.Tab) {
  const isMiddleClick = e.button === MIDDLE_MOUSE_BUTTON;
  if (!isMiddleClick || !themeStore.tab.closeTabByMiddleClick) {
    return;
  }

  if (tabStore.isTabRetain(tab.id)) {
    return;
  }

  e.preventDefault();
  handleCloseTab(tab);
}

function switchTab(e: MouseEvent, tab: App.Global.Tab) {
  if ([MIDDLE_MOUSE_BUTTON, RIGHT_MOUSE_BUTTON].includes(e.button)) return;

  tabStore.switchRouteByTab(tab);
}

async function refresh() {
  appStore.reloadPage(500);
}

interface DropdownConfig {
  visible: boolean;
  x: number;
  y: number;
  tabId: string;
}

const dropdown: DropdownConfig = reactive({
  visible: false,
  x: 0,
  y: 0,
  tabId: ''
});

function setDropdown(config: Partial<DropdownConfig>) {
  Object.assign(dropdown, config);
}

let isClickContextMenu = false;

function handleDropdownVisible(visible: boolean | undefined) {
  if (!isClickContextMenu) {
    setDropdown({ visible });
  }
}

async function handleContextMenu(e: MouseEvent, tabId: string) {
  e.preventDefault();

  const { clientX, clientY } = e;

  isClickContextMenu = true;

  const DURATION = dropdown.visible ? 150 : 0;

  setDropdown({ visible: false });

  setTimeout(() => {
    setDropdown({
      visible: true,
      x: clientX,
      y: clientY,
      tabId
    });
    isClickContextMenu = false;
  }, DURATION);
}

function init() {
  tabStore.initTabStore(route);
}

function removeFocus() {
  (document.activeElement as HTMLElement)?.blur();
}

// watch
watch(
  () => route.fullPath,
  () => {
    tabStore.addTab(route);
  }
);
watch(
  () => tabStore.activeTabId,
  () => {
    scrollToActiveTab();
  }
);

// init
init();
</script>

<template>
  <div class="flex size-full items-center gap-2 px-3">
    <div
      ref="tabScrollRef"
      class="tab-scroll h-full min-w-0 flex flex-1 items-center gap-2 overflow-x-auto"
      @click="removeFocus"
    >
      <div
        v-for="tab in tabStore.tabs"
        :key="tab.id"
        :data-tab-id="tab.id"
        class="tab-item group flex h-full shrink-0 cursor-pointer items-center transition-colors"
        :class="getTabClass(tab)"
        @pointerdown="switchTab($event, tab)"
        @mousedown="handleMousedown($event, tab)"
        @contextmenu="handleContextMenu($event, tab.id)"
      >
        <div class="flex h-8 items-center pl-3" :class="tabStore.isTabRetain(tab.id) ? 'pr-3' : 'pr-1'">
          <SvgIcon :icon="tab.icon" :local-icon="tab.localIcon" class="mr-1.5 text-16px" />
          <span class="max-w-240px ellipsis-text text-sm">{{ tab.label }}</span>
          <VBtn
            v-if="!tabStore.isTabRetain(tab.id)"
            icon="mdi-close"
            size="x-small"
            variant="text"
            density="comfortable"
            class="ml-1 opacity-60 hover:opacity-100"
            @pointerdown.stop
            @mousedown.stop
            @click.stop="handleCloseTab(tab)"
          />
        </div>
      </div>
    </div>
    <ReloadButton :loading="!appStore.reloadFlag" @click="refresh" />
    <FullScreen :full="appStore.fullContent" @click="appStore.toggleFullContent" />
  </div>
  <ContextMenu
    :visible="dropdown.visible"
    :tab-id="dropdown.tabId"
    :disabled-keys="getContextMenuDisabledKeys(dropdown.tabId)"
    :x="dropdown.x"
    :y="dropdown.y"
    @update:visible="handleDropdownVisible"
  />
</template>

<style scoped>
.tab-scroll {
  scrollbar-width: none;
}

.tab-scroll::-webkit-scrollbar {
  display: none;
}

.tab-item {
  border-radius: 8px;
  color: rgb(var(--v-theme-on-surface));
}

.tab-item:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.06);
}

.tab-item--button {
  background-color: rgba(var(--v-theme-on-surface), 0.04);
}

.tab-item--button-active {
  background-color: rgb(var(--v-theme-primary));
  color: #fff;
}

.tab-item--chrome {
  border-radius: 8px 8px 0 0;
}

.tab-item--chrome-active {
  border-radius: 8px 8px 0 0;
  background-color: rgb(var(--v-theme-surface));
  box-shadow: inset 0 -2px 0 rgb(var(--v-theme-primary));
}

.tab-item--slider-active {
  color: rgb(var(--v-theme-primary));
  box-shadow: inset 0 -2px 0 rgb(var(--v-theme-primary));
}
</style>
