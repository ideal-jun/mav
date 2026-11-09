<script setup lang="ts">
import LookForward from '@/components/custom/look-forward.vue';
interface Props {
  id: string;
}

const { id } = defineProps<Props>();
</script>

<template>
  <LookForward :data-id="id" />
</template>

<style scoped></style>
