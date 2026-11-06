<script setup lang="ts">
defineOptions({
  name: 'GlobalFooter'
});
</script>

<template>
  <VSheet class="flex h-full items-center justify-center" color="surface" rounded="0">
    <a
      class="text-sm text-medium-emphasis no-underline hover:text-primary"
      href="https://github.com/soybeanjs/soybean-admin/blob/main/LICENSE"
      target="_blank"
      rel="noopener noreferrer"
    >
      Copyright MIT © 2021 Soybean
    </a>
  </VSheet>
</template>

<style scoped></style>
