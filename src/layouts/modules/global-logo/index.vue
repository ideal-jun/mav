<script setup lang="ts">
import SystemLogo from '@/components/common/system-logo.vue';
import { $t } from '@/locales';

defineOptions({
  name: 'GlobalLogo'
});

interface Props {
  /** Whether to show the title */
  showTitle?: boolean;
}

withDefaults(defineProps<Props>(), {
  showTitle: true
});
</script>

<template>
  <RouterLink to="/" class="flex w-full items-center overflow-hidden whitespace-nowrap">
    <SystemLogo class="size-8" />
    <h2 v-show="showTitle" class="pl-2 text-base font-bold text-primary transition duration-300 ease-in-out">
      {{ $t('system.title') }}
    </h2>
  </RouterLink>
</template>

<style scoped></style>
