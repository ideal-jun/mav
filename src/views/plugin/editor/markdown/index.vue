<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import Vditor from 'vditor';
import 'vditor/dist/index.css';
import { useThemeStore } from '@/store/modules/theme';

const theme = useThemeStore();

const vditor = ref<Vditor>();
const domRef = ref<HTMLElement>();

function renderVditor() {
  if (!domRef.value) return;
  vditor.value = new Vditor(domRef.value, {
    minHeight: 400,
    theme: theme.darkMode ? 'dark' : 'classic',
    icon: 'material',
    cache: { enable: false }
  });
}

const stopHandle = watch(
  () => theme.darkMode,
  newValue => {
    const themeMode = newValue ? 'dark' : 'classic';
    vditor.value?.setTheme(themeMode);
  }
);

onMounted(() => {
  renderVditor();
});

onUnmounted(() => {
  stopHandle();
});
</script>

<template>
  <div class="h-full">
    <VCard class="card-wrapper">
      <VCardTitle>markdown插件</VCardTitle>
      <VCardText>
        <div ref="domRef"></div>
      </VCardText>
      <VCardActions>
        <GithubLink link="https://github.com/Vanessa219/vditor" />
      </VCardActions>
    </VCard>
  </div>
</template>

<style scoped></style>
