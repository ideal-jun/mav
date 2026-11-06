<script setup lang="ts">
import { computed } from 'vue';
import { useThemeStore } from '@/store/modules/theme';
import { $t } from '@/locales';

defineOptions({
  name: 'ConfigOperation'
});

const themeStore = useThemeStore();

function getClipboardText() {
  const reg = /"\w+":/g;
  return themeStore.settingsJson.replace(reg, match => match.replace(/"/g, ''));
}

const dataClipboardText = computed(() => getClipboardText());

async function handleCopy() {
  await navigator.clipboard.writeText(dataClipboardText.value);
  window.$message?.success($t('theme.configOperation.copySuccessMsg'));
}

function handleReset() {
  themeStore.resetStore();

  setTimeout(() => {
    window.$message?.success($t('theme.configOperation.resetSuccessMsg'));
  }, 50);
}
</script>

<template>
  <div class="flex w-full justify-between">
    <VBtn color="error" variant="tonal" @click="handleReset">{{ $t('theme.configOperation.resetConfig') }}</VBtn>
    <VBtn color="primary" variant="flat" @click="handleCopy">{{ $t('theme.configOperation.copyConfig') }}</VBtn>
  </div>
</template>

<style scoped></style>
