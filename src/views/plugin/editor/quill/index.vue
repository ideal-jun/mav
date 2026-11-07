<script setup lang="ts">
import { onMounted, ref } from 'vue';
import WangEditor from 'wangeditor';

const editor = ref<WangEditor>();
const domRef = ref<HTMLElement>();

function renderWangEditor() {
  editor.value = new WangEditor(domRef.value);
  setEditorConfig();
  editor.value.create();
}

function setEditorConfig() {
  if (editor.value?.config?.zIndex) {
    editor.value.config.zIndex = 10;
  }
}

onMounted(() => {
  renderWangEditor();
});
</script>

<template>
  <div class="h-full">
    <VCard class="card-wrapper">
      <VCardTitle>富文本插件</VCardTitle>
      <VCardText>
        <div ref="domRef" class="bg-white dark:bg-dark"></div>
      </VCardText>
      <VCardActions>
        <GithubLink link="https://github.com/wangeditor-team/wangEditor" />
      </VCardActions>
    </VCard>
  </div>
</template>

<style scoped>
:deep(.w-e-toolbar) {
  background: inherit !important;
  border-color: #999 !important;
}
:deep(.w-e-text-container) {
  background: inherit;
  border-color: #999 !important;
}
</style>
