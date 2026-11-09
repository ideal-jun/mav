<script setup lang="ts">
import CountTo from '@/components/custom/count-to.vue';
import { computed } from 'vue';
import { createReusableTemplate } from '@vueuse/core';
import { useThemeStore } from '@/store/modules/theme';
import { $t } from '@/locales';

defineOptions({
  name: 'CardData'
});

interface CardData {
  key: string;
  title: string;
  value: number;
  unit: string;
  color: {
    start: string;
    end: string;
  };
  icon: string;
}

const cardData = computed<CardData[]>(() => [
  {
    key: 'visitCount',
    title: $t('page.home.visitCount'),
    value: 9725,
    unit: '',
    color: {
      start: '#ec4786',
      end: '#b955a4'
    },
    icon: 'mdi-chart-bar'
  },
  {
    key: 'turnover',
    title: $t('page.home.turnover'),
    value: 1026,
    unit: '$',
    color: {
      start: '#865ec0',
      end: '#5144b4'
    },
    icon: 'mdi-cash-multiple'
  },
  {
    key: 'downloadCount',
    title: $t('page.home.downloadCount'),
    value: 970925,
    unit: '',
    color: {
      start: '#56cdf3',
      end: '#719de3'
    },
    icon: 'mdi-file-download-outline'
  },
  {
    key: 'dealCount',
    title: $t('page.home.dealCount'),
    value: 9527,
    unit: '',
    color: {
      start: '#fcbc25',
      end: '#f68057'
    },
    icon: 'mdi-certificate-outline'
  }
]);

interface GradientBgProps {
  gradientColor: string;
}

const [DefineGradientBg, GradientBg] = createReusableTemplate<GradientBgProps>();

const themeStore = useThemeStore();

function getGradientColor(color: CardData['color']) {
  return `linear-gradient(to bottom right, ${color.start}, ${color.end})`;
}
</script>

<template>
  <VCard class="card-wrapper">
    <VCardText>
      <!-- define component start: GradientBg -->
      <DefineGradientBg v-slot="{ $slots, gradientColor }">
        <div
          class="px-16px pb-4px pt-8px text-white"
          :style="{ backgroundImage: gradientColor, borderRadius: themeStore.themeRadius + 'px' }"
        >
          <component :is="$slots.default" />
        </div>
      </DefineGradientBg>
      <!-- define component end: GradientBg -->

      <VRow :gutter="16">
        <VCol v-for="item in cardData" :key="item.key" cols="12" sm="6" lg="3">
          <GradientBg :gradient-color="getGradientColor(item.color)" class="flex-1">
            <h3 class="text-base">{{ item.title }}</h3>
            <div class="flex justify-between pt-3">
              <VIcon :icon="item.icon" size="32" />
              <CountTo
                :prefix="item.unit"
                :start-value="1"
                :end-value="item.value"
                class="text-3xl text-white dark:text-dark"
              />
            </div>
          </GradientBg>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>

<style scoped></style>
