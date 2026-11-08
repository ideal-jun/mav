<script setup lang="ts">
defineOptions({ name: 'MenuIcon' });

interface Props {
  /** The Material Design Icons name of the menu */
  icon?: string;
  /** The local svg icon name of the menu */
  localIcon?: string;
  /** icon size in px */
  size?: number;
}

withDefaults(defineProps<Props>(), {
  icon: undefined,
  localIcon: undefined,
  size: 20
});
</script>

<template>
  <span v-if="icon || localIcon" class="menu-icon flex shrink-0 items-center justify-center">
    <SvgIcon v-if="localIcon" :local-icon="localIcon" :size="size" />
    <VIcon v-else :icon="icon" :size="size" />
  </span>
</template>

<style scoped></style>
