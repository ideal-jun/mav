<script setup lang="ts">
import type { VNode } from 'vue';

defineOptions({ name: 'MenuIcon' });

interface Props {
  /** The menu icon render function from the route store */
  icon?: () => VNode;
  /** icon size in px */
  size?: number;
}

withDefaults(defineProps<Props>(), {
  icon: undefined,
  size: 20
});
</script>

<template>
  <span v-if="icon" class="menu-icon flex shrink-0 items-center justify-center" :style="{ fontSize: `${size}px` }">
    <component :is="icon" />
  </span>
</template>

<style scoped></style>
