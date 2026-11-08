<script setup lang="ts">
import { $t } from '@/locales';

defineOptions({
  name: 'FullScreen'
});

interface Props {
  full?: boolean;
  density?: null | 'default' | 'comfortable' | 'compact';
}

withDefaults(defineProps<Props>(), {
  full: false,
  density: 'default'
});
</script>

<template>
  <ButtonIcon
    :key="String(full)"
    :tooltip-content="full ? $t('icon.fullscreenExit') : $t('icon.fullscreen')"
    :density="density"
  >
    <VIcon v-if="full" icon="mdi-fullscreen-exit" />
    <VIcon v-else icon="mdi-fullscreen" />
  </ButtonIcon>
</template>

<style scoped></style>
