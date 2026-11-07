<script setup lang="ts">
import { $t } from '@/locales';
import BrowserVisibilityRequest from './modules/browser-visibility-request.vue';
import CaptchaVerification from './modules/captcha-verification.vue';
import CrossComponentRequest from './modules/cross-component-request.vue';
import NetworkToggleRequest from './modules/network-toggle-request.vue';
import PollingRequest from './modules/polling-request.vue';
</script>

<template>
  <div class="flex flex-col gap-4">
    <VCard class="card-wrapper">
      <VCardTitle>{{ $t('page.alova.scenes.captchaSend') }}</VCardTitle>
      <VCardText>
        <CaptchaVerification class="w-1/3" />
      </VCardText>
    </VCard>

    <VCard class="card-wrapper">
      <VCardTitle>{{ $t('page.alova.scenes.autoRequest') }}</VCardTitle>
      <VCardText>
        <div class="flex gap-4">
          <BrowserVisibilityRequest />
          <PollingRequest />
          <NetworkToggleRequest />
        </div>
      </VCardText>
    </VCard>

    <VCard class="card-wrapper">
      <VCardTitle>{{ $t('page.alova.scenes.requestCrossComponent') }}</VCardTitle>
      <VCardText>
        <CrossComponentRequest />
      </VCardText>
    </VCard>
  </div>
</template>

<style scoped></style>
