<script setup lang="ts">
import GlobalContent from '../modules/global-content/index.vue';

defineOptions({
  name: 'BlankLayout'
});
</script>

<template>
  <VMain class="h-[100dvh]">
    <GlobalContent :show-padding="false" />
  </VMain>
</template>

<style scoped></style>
