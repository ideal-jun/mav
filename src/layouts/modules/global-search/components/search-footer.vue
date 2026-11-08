<script lang="ts" setup>
import { $t } from '@/locales';

defineOptions({ name: 'SearchFooter' });
</script>

<template>
  <div class="flex h-11 items-center gap-4 px-6 text-sm text-medium-emphasis">
    <span class="flex items-center gap-1">
      <VHotkey keys="enter" display-mode="icon" />
      <span>{{ $t('common.confirm') }}</span>
    </span>
    <span class="flex items-center gap-1">
      <VHotkey keys="arrowup" display-mode="icon" />
      <VHotkey keys="arrowdown" display-mode="icon" />
      <span>{{ $t('common.switch') }}</span>
    </span>
    <span class="flex items-center gap-1">
      <VHotkey keys="esc" display-mode="icon" />
      <span>{{ $t('common.close') }}</span>
    </span>
  </div>
</template>

<style lang="scss" scoped></style>
