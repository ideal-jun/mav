<script setup lang="ts">
defineOptions({
  name: 'SettingItem'
});

interface Props {
  /** Label */
  label: string;
}

defineProps<Props>();
</script>

<template>
  <div class="flex w-full items-center justify-between gap-3">
    <div class="flex min-w-0 items-center">
      <span class="pr-2 text-sm text-medium-emphasis">{{ label }}</span>
      <slot name="suffix"></slot>
    </div>
    <slot></slot>
  </div>
</template>

<style scoped></style>
