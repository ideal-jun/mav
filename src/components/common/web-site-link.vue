<script setup lang="ts">
defineOptions({
  name: 'WebSiteLink'
});

interface Props {
  /** website label */
  label: string;
  /** website url */
  link: string;
}

defineProps<Props>();
</script>

<template>
  <VBtn
    :href="link"
    target="_blank"
    rel="noopener noreferrer"
    variant="text"
    color="primary"
    size="small"
    class="normal-case px-2"
    append-icon="mdi-open-in-new"
  >
    {{ label }}
  </VBtn>
</template>

<style scoped></style>
