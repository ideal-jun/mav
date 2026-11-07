<script setup lang="ts">
import { computed } from 'vue';
import { useAppStore } from '@/store/modules/app';
import HeaderBanner from './modules/header-banner.vue';
import CardData from './modules/card-data.vue';
import LineChart from './modules/line-chart.vue';
import PieChart from './modules/pie-chart.vue';
import ProjectNews from './modules/project-news.vue';
import CreativityBanner from './modules/creativity-banner.vue';

const appStore = useAppStore();

const gap = computed(() => (appStore.isMobile ? 0 : 16));
</script>

<template>
  <div class="flex flex-col">
    <HeaderBanner class="mb-4" />
    <CardData class="mb-4" />
    <VRow :gap="gap">
      <VCol cols="12" md="7">
        <VCard class="card-wrapper">
          <VCardText class="p-4">
            <LineChart />
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" md="5">
        <VCard class="card-wrapper">
          <VCardText class="p-4">
            <PieChart />
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
    <VRow :gap="gap">
      <VCol cols="12" md="7">
        <ProjectNews />
      </VCol>
      <VCol cols="12" md="5">
        <CreativityBanner />
      </VCol>
    </VRow>
  </div>
</template>

<style scoped></style>
