<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Component } from 'vue';
import { BaiduMap, GaodeMap, TencentMap } from './components';

interface Map {
  id: string;
  label: string;
  component: Component;
}

const maps: Map[] = [
  { id: 'gaode', label: '高德地图', component: GaodeMap },
  { id: 'tencent', label: '腾讯地图', component: TencentMap },
  { id: 'baidu', label: '百度地图', component: BaiduMap }
];

const activeTab = ref(maps[0].id);

const activeMap = computed(() => maps.find(item => item.id === activeTab.value) ?? maps[0]);
</script>

<template>
  <div class="h-full">
    <VCard class="h-full card-wrapper flex flex-col">
      <VCardTitle>地图插件</VCardTitle>
      <VTabs v-model="activeTab" color="primary" density="compact" class="px-2">
        <VTab v-for="item in maps" :key="item.id" :value="item.id">{{ item.label }}</VTab>
      </VTabs>
      <div class="min-h-0 flex-1 overflow-hidden">
        <KeepAlive>
          <component :is="activeMap.component" />
        </KeepAlive>
      </div>
    </VCard>
  </div>
</template>

<style scoped></style>
