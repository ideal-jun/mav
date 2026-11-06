<script lang="ts" setup>
import { $t } from '@/locales';

defineOptions({ name: 'SearchFooter' });
</script>

<template>
  <div class="flex h-11 items-center gap-4 px-6 text-sm text-medium-emphasis">
    <span class="flex items-center gap-1">
      <VIcon icon="mdi-keyboard-return" size="20" />
      <span>{{ $t('common.confirm') }}</span>
    </span>
    <span class="flex items-center gap-1">
      <VIcon icon="mdi-arrow-up-thin" size="20" />
      <VIcon icon="mdi-arrow-down-thin" size="20" />
      <span>{{ $t('common.switch') }}</span>
    </span>
    <span class="flex items-center gap-1">
      <VIcon icon="mdi-keyboard-esc" size="20" />
      <span>{{ $t('common.close') }}</span>
    </span>
  </div>
</template>

<style lang="scss" scoped></style>
