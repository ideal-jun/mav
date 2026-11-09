<script setup lang="ts">
import { computed } from 'vue';
import MenuIcon from './menu-icon.vue';

defineOptions({ name: 'AppMenuNodes' });

interface Props {
  menus: App.Global.Menu[];
  level?: number;
  collapsed?: boolean;
  selectedKey?: string;
}

const props = withDefaults(defineProps<Props>(), {
  level: 0,
  collapsed: false,
  selectedKey: ''
});

const emit = defineEmits<{
  /** menu item selected */
  (e: 'select', key: string): void;
}>();

/** only the first level is rendered as icon-only when the sider is collapsed */
const isCollapsed = computed(() => props.collapsed && props.level === 0);

function isActive(menu: App.Global.Menu) {
  const selected = props.selectedKey;

  if (!selected) {
    return false;
  }

  return menu.key === selected || selected.startsWith(`${menu.key}_`);
}

function handleSelect(key: string) {
  emit('select', key);
}
</script>

<template>
  <!-- collapsed sider: icon only + popover submenu / tooltip -->
  <template v-if="isCollapsed">
    <template v-for="menu in menus" :key="menu.key">
      <VMenu v-if="menu.children?.length" location="end top" open-on-hover>
        <template #activator="{ props: activatorProps }">
          <VListItem v-bind="activatorProps" :value="menu.key" :active="isActive(menu)" class="justify-center px-0">
            <template #prepend>
              <MenuIcon :icon="menu.icon" />
            </template>
          </VListItem>
        </template>
        <VList nav density="compact" min-width="220" class="app-menu py-1">
          <AppMenuNodes :menus="menu.children" :level="1" :selected-key="selectedKey" @select="handleSelect" />
        </VList>
      </VMenu>
      <VTooltip v-else :text="menu.label" location="end">
        <template #activator="{ props: tooltipProps }">
          <VListItem
            v-bind="tooltipProps"
            :value="menu.key"
            :active="isActive(menu)"
            class="justify-center px-0"
            @click="handleSelect(menu.routeKey)"
          >
            <template #prepend>
              <MenuIcon :icon="menu.icon" />
            </template>
          </VListItem>
        </template>
      </VTooltip>
    </template>
  </template>

  <!-- expanded sider: recursive groups + items -->
  <template v-else>
    <template v-for="menu in menus" :key="menu.key">
      <VListGroup v-if="menu.children?.length" :value="menu.key">
        <template #activator="{ props: activatorProps }">
          <VListItem v-bind="activatorProps" :value="menu.key" :active="isActive(menu)">
            <template #prepend>
              <MenuIcon :icon="menu.icon" />
            </template>
            <VListItemTitle>{{ menu.label }}</VListItemTitle>
          </VListItem>
        </template>
        <AppMenuNodes :menus="menu.children" :level="level + 1" :selected-key="selectedKey" @select="handleSelect" />
      </VListGroup>
      <VListItem v-else :value="menu.key" :active="isActive(menu)" @click="handleSelect(menu.routeKey)">
        <template #prepend>
          <MenuIcon :icon="menu.icon" />
        </template>
        <VListItemTitle>{{ menu.label }}</VListItemTitle>
      </VListItem>
    </template>
  </template>
</template>

<style scoped></style>
