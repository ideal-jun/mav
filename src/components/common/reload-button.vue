<script setup lang="ts">
import ButtonIcon from '@/components/custom/button-icon.vue';
import { $t } from '@/locales';

defineOptions({
  name: 'ReloadButton'
});

interface Props {
  loading?: boolean;
}

defineProps<Props>();
</script>

<template>
  <ButtonIcon :tooltip-content="$t('icon.reload')" icon="mdi-refresh" density="comfortable">
    <VIcon icon="mdi-refresh" :class="{ 'animate-spin animate-duration-750': loading }" />
  </ButtonIcon>
</template>

<style scoped></style>
