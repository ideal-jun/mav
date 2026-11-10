<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

/** Inner link route used by the ruoyi menu whose component is `InnerLink`. */
defineOptions({
  name: 'InnerLink'
});

const route = useRoute();

const url = computed(() => (route.meta.link as string) || '');
</script>

<template>
  <div class="h-full w-full">
    <iframe :src="url" class="h-full w-full border-0" allowfullscreen />
  </div>
</template>

<style scoped></style>
