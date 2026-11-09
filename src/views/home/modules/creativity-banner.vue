<script setup lang="ts">
import SvgIcon from '@/components/custom/svg-icon.vue';
import { $t } from '@/locales';

defineOptions({
  name: 'CreativityBanner'
});
</script>

<template>
  <VCard class="card-wrapper h-full">
    <VCardTitle>{{ $t('page.home.creativity') }}</VCardTitle>
    <VCardText class="flex h-full items-center justify-center">
      <SvgIcon local-icon="banner" class="text-400px text-primary sm:text-320px" />
    </VCardText>
  </VCard>
</template>

<style scoped></style>
