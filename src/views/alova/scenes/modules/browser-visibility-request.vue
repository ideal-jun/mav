<script setup lang="ts">
import { ref } from 'vue';
import { actionDelegationMiddleware, useAutoRequest } from '@sa/alova/client';
import { alova } from '@/service-alova/request';

const getLastTime = alova.Get<{ time: string }>('/mock/getLastTime', { cacheFor: null });
const isStop = ref(false);
const { loading, data } = useAutoRequest(getLastTime, {
  enableVisibility: true,
  enableNetwork: false,
  enableFocus: false,
  initialData: {
    time: ''
  },
  async middleware(_, next) {
    await actionDelegationMiddleware('autoRequest:1')(_, () => Promise.resolve());
    if (!isStop.value) {
      next();
    }
  }
});

const toggleStop = () => {
  isStop.value = !isStop.value;
};
</script>

<template>
  <div class="flex flex-col gap-4">
    <VAlert type="info" variant="tonal">
      {{ $t('page.alova.scenes.visibilityRequestTips') }}
    </VAlert>
    <VBtn color="primary" variant="flat" :prepend-icon="isStop ? 'mdi-play' : 'mdi-stop'" @click="toggleStop">
      {{ isStop ? $t('page.alova.scenes.startRequest') : $t('page.alova.scenes.stopRequest') }}
    </VBtn>
    <div class="flex items-center gap-3">
      <span>{{ $t('page.alova.scenes.refreshTime') }}: {{ data.time || '--' }}</span>
      <VProgressCircular v-if="loading" indeterminate size="16" color="primary" />
    </div>
  </div>
</template>

<style scoped></style>
