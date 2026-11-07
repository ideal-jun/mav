<script setup lang="ts">
interface Props {
  id: string;
}

const { id } = defineProps<Props>();
</script>

<template>
  <LookForward :data-id="id" />
</template>

<style scoped></style>
