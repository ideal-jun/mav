<script setup lang="ts">
import SvgIcon from '@/components/custom/svg-icon.vue';
import MenuToggler from '@/components/common/menu-toggler.vue';
import { computed } from 'vue';
import { createReusableTemplate } from '@vueuse/core';
import { transformColorWithOpacity } from '@sa/color';

defineOptions({
  name: 'FirstLevelMenu'
});

interface Props {
  menus: App.Global.Menu[];
  activeMenuKey?: string;
  inverted?: boolean;
  siderCollapse?: boolean;
  darkMode?: boolean;
  themeColor: string;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'select', menuKey: string): boolean;
  (e: 'toggleSiderCollapse'): void;
}

const emit = defineEmits<Emits>();

interface MixMenuItemProps {
  /** Menu item label */
  label: App.Global.Menu['label'];
  /** Menu item icon */
  icon: App.Global.Menu['icon'];
  /** Menu item local icon */
  localIcon: App.Global.Menu['localIcon'];
  /** Active menu item */
  active: boolean;
  /** Mini size */
  isMini?: boolean;
}
const [DefineMixMenuItem, MixMenuItem] = createReusableTemplate<MixMenuItemProps>();

const selectedBgColor = computed(() => {
  const { darkMode, themeColor } = props;

  const light = transformColorWithOpacity(themeColor, 0.1, '#ffffff');
  const dark = transformColorWithOpacity(themeColor, 0.3, '#000000');

  return darkMode ? dark : light;
});

function handleClickMixMenu(menuKey: string) {
  emit('select', menuKey);
}

function toggleSiderCollapse() {
  emit('toggleSiderCollapse');
}
</script>

<template>
  <!-- define component: MixMenuItem -->
  <DefineMixMenuItem v-slot="{ label, icon, localIcon, active, isMini }">
    <div
      class="mx-4px mb-6px flex-col-center cursor-pointer rounded-8px bg-transparent px-4px py-8px transition-300 hover:bg-[rgb(0,0,0,0.08)]"
      :class="{
        'text-primary selected-mix-menu': active,
        'text-white:65 hover:text-white': inverted,
        '!text-white !bg-primary': active && inverted
      }"
    >
      <SvgIcon v-if="localIcon" :local-icon="localIcon" :size="isMini ? 18 : 22" />
      <VIcon v-else :icon="icon" :size="isMini ? 18 : 22" />
      <p
        class="w-full ellipsis-text text-center text-12px transition-height-300"
        :class="[isMini ? 'h-0 pt-0' : 'h-20px pt-4px']"
      >
        {{ label }}
      </p>
    </div>
  </DefineMixMenuItem>
  <!-- define component end: MixMenuItem -->

  <div class="h-full flex-col-stretch flex-1-hidden">
    <slot></slot>
    <div class="min-h-0 flex-1 overflow-y-auto">
      <MixMenuItem
        v-for="menu in menus"
        :key="menu.key"
        :label="menu.label"
        :icon="menu.icon"
        :local-icon="menu.localIcon"
        :active="menu.key === activeMenuKey"
        :is-mini="siderCollapse"
        @click="handleClickMixMenu(menu.routeKey)"
      />
    </div>
    <MenuToggler
      arrow-icon
      :collapsed="siderCollapse"
      :z-index="99"
      :class="{ 'text-white:88 !hover:text-white': inverted }"
      @click="toggleSiderCollapse"
    />
  </div>
</template>

<style scoped>
.selected-mix-menu {
  background-color: v-bind(selectedBgColor);
}
</style>
