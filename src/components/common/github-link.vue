<script setup lang="ts">
defineOptions({
  name: 'GithubLink'
});

interface Props {
  /** github repository url */
  link: string;
  /** button label */
  label?: string;
}

withDefaults(defineProps<Props>(), {
  label: 'Github'
});
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
    prepend-icon="mdi-github"
  >
    {{ label }}
  </VBtn>
</template>

<style scoped></style>
