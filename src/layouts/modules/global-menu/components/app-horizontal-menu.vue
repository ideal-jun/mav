<script setup lang="ts">
import type { RouteKey } from '@elegant-router/types';
import MenuIcon from './menu-icon.vue';
import AppMenuNodes from './app-menu-nodes.vue';

defineOptions({ name: 'AppHorizontalMenu' });

interface Props {
  /** global menus */
  menus: App.Global.Menu[];
  /** currently selected route key */
  selectedKey?: string;
}

const props = withDefaults(defineProps<Props>(), {
  selectedKey: ''
});

const emit = defineEmits<{
  /** menu item selected */
  (e: 'select', key: RouteKey): void;
}>();

function isActive(menu: App.Global.Menu) {
  if (!props.selectedKey) {
    return false;
  }

  return menu.key === props.selectedKey || props.selectedKey.startsWith(`${menu.key}_`);
}
</script>

<template>
  <div class="app-horizontal-menu flex h-full min-w-0 flex-1 items-center overflow-x-auto">
    <template v-for="menu in menus" :key="menu.key">
      <VMenu v-if="menu.children?.length" location="bottom start" open-on-hover>
        <template #activator="{ props: activatorProps }">
          <VBtn
            v-bind="activatorProps"
            variant="text"
            class="normal-case ml-1 shrink-0"
            :color="isActive(menu) ? 'primary' : undefined"
          >
            <template #prepend>
              <MenuIcon :icon="menu.icon" :size="18" />
            </template>
            {{ menu.label }}
            <VIcon end icon="mdi-chevron-down" size="16" class="ml-1" />
          </VBtn>
        </template>
        <VList nav density="compact" min-width="220" class="app-menu py-1">
          <AppMenuNodes
            :menus="menu.children"
            :level="1"
            :selected-key="selectedKey"
            @select="key => emit('select', key)"
          />
        </VList>
      </VMenu>
      <VBtn
        v-else
        variant="text"
        class="normal-case ml-1 shrink-0"
        :color="isActive(menu) ? 'primary' : undefined"
        @click="emit('select', menu.routeKey)"
      >
        <template #prepend>
          <MenuIcon :icon="menu.icon" :size="18" />
        </template>
        {{ menu.label }}
      </VBtn>
    </template>
  </div>
</template>

<style scoped></style>
