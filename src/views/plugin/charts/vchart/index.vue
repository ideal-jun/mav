<script setup lang="ts">
import WebSiteLink from '@/components/common/web-site-link.vue';
import { useVChart } from '@/hooks/common/vchart';
import {
  barMarkPointSpec,
  circularProgressTickSpec,
  histogramDifferentBinSpec,
  liquidChartSmartInvertSpec,
  rankingBarSpec,
  shapeWordCloudSpec,
  stackedDashAreaSpec
} from './data';

const { domRef: stackedDashAreaRef } = useVChart(() => stackedDashAreaSpec);
const { domRef: barMarkPointRef } = useVChart(() => barMarkPointSpec);
const { domRef: histogramDifferentBinRef } = useVChart(() => histogramDifferentBinSpec);
const { domRef: rankingBarRef } = useVChart(() => rankingBarSpec);
const { domRef: shapeWordCloudRef } = useVChart(() => shapeWordCloudSpec);
const { domRef: circularProgressTickRef } = useVChart(() => circularProgressTickSpec);
const { domRef: liquidChartSmartInvertRef } = useVChart(() => liquidChartSmartInvertSpec);
</script>

<template>
  <div class="flex flex-col gap-4">
    <VCard class="h-full card-wrapper">
      <VCardTitle>VChart</VCardTitle>
      <VCardText>
        <WebSiteLink label="More Demos: " link="https://www.visactor.com/vchart/example" />
      </VCardText>
    </VCard>
    <VCard class="h-full card-wrapper">
      <VCardTitle>Stacked Dash Area Chart</VCardTitle>
      <VCardText>
        <div ref="stackedDashAreaRef" class="h-400px" />
      </VCardText>
    </VCard>
    <VCard class="h-full card-wrapper">
      <VCardTitle>Bar Mark Point Chart</VCardTitle>
      <VCardText>
        <div ref="barMarkPointRef" class="h-400px" />
      </VCardText>
    </VCard>
    <VCard class="h-full card-wrapper">
      <VCardTitle>Histogram Different Bin Chart</VCardTitle>
      <VCardText>
        <div ref="histogramDifferentBinRef" class="h-400px" />
      </VCardText>
    </VCard>
    <VCard class="h-full card-wrapper">
      <VCardTitle>Ranking Bar Chart</VCardTitle>
      <VCardText>
        <div ref="rankingBarRef" class="h-400px" />
      </VCardText>
    </VCard>
    <VCard class="h-full card-wrapper">
      <VCardTitle>Circular Progress Tick Chart</VCardTitle>
      <VCardText>
        <div ref="circularProgressTickRef" class="h-400px" />
      </VCardText>
    </VCard>
    <VCard class="h-full card-wrapper">
      <VCardTitle>Liquid Chart Smart Invert Chart</VCardTitle>
      <VCardText>
        <div ref="liquidChartSmartInvertRef" class="h-400px" />
      </VCardText>
    </VCard>
    <VCard class="h-full card-wrapper">
      <VCardTitle>Shape Word Cloud Chart</VCardTitle>
      <VCardText>
        <div ref="shapeWordCloudRef" class="h-400px" />
      </VCardText>
    </VCard>
  </div>
</template>

<style scoped></style>
