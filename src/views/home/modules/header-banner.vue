<script setup lang="ts">
import { computed } from 'vue';
import { useAppStore } from '@/store/modules/app';
import { useAuthStore } from '@/store/modules/auth';
import { $t } from '@/locales';

defineOptions({
  name: 'HeaderBanner'
});

const appStore = useAppStore();
const authStore = useAuthStore();

const gap = computed(() => (appStore.isMobile ? 0 : 16));

interface StatisticData {
  id: number;
  label: string;
  value: string;
}

const statisticData = computed<StatisticData[]>(() => [
  { id: 0, label: $t('page.home.projectCount'), value: '25' },
  { id: 1, label: $t('page.home.todo'), value: '4/16' },
  { id: 2, label: $t('page.home.message'), value: '12' }
]);
</script>

<template>
  <VCard class="card-wrapper">
    <VCardText>
      <VRow :gutter="gap">
        <VCol cols="12" md="8">
          <div class="flex items-center">
            <div class="size-18 shrink-0 overflow-hidden rounded-full">
              <img src="@/assets/imgs/soybean.jpg" class="size-full" />
            </div>
            <div class="pl-3">
              <h3 class="text-lg font-semibold">
                {{ $t('page.home.greeting', { userName: authStore.userInfo.userName }) }}
              </h3>
              <p class="leading-7 text-medium-emphasis">{{ $t('page.home.weatherDesc') }}</p>
            </div>
          </div>
        </VCol>
        <VCol cols="12" md="4">
          <div class="flex items-center justify-end gap-6">
            <div v-for="item in statisticData" :key="item.id" class="whitespace-nowrap text-right">
              <div class="text-sm text-medium-emphasis">{{ item.label }}</div>
              <div class="text-2xl font-medium">{{ item.value }}</div>
            </div>
          </div>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>

<style scoped></style>
