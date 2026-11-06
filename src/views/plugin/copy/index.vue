<script lang="ts" setup>
import { ref } from 'vue';
import { useClipboard } from '@vueuse/core';

const { copy, isSupported } = useClipboard();

const source = ref('');

async function handleCopy() {
  if (!isSupported) {
    window.$message?.error('您的浏览器不支持Clipboard API');
    return;
  }

  if (!source.value) {
    window.$message?.error('请输入要复制的内容');
    return;
  }

  await copy(source.value);
  window.$message?.success(`复制成功：${source.value}`);
}
</script>

<template>
  <div class="h-full">
    <VCard class="h-full card-wrapper">
      <VCardTitle>文本复制</VCardTitle>
      <VCardText>
        <div class="flex items-start gap-2">
          <VTextField v-model="source" hide-details placeholder="请输入要复制的内容吧" />
          <VBtn color="primary" variant="flat" @click="handleCopy">复制</VBtn>
        </div>
      </VCardText>
    </VCard>
  </div>
</template>
