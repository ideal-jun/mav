<script setup lang="ts">
import { $t } from '@/locales';
import { fetchCustomBackendError } from '@/service/api';

async function logout() {
  await fetchCustomBackendError('8888', $t('request.logoutMsg'));
}

async function logoutWithModal() {
  await fetchCustomBackendError('7777', $t('request.logoutWithModalMsg'));
}

async function refreshToken() {
  await fetchCustomBackendError('9999', $t('request.tokenExpired'));
}

async function handleRepeatedMessageError() {
  await Promise.all([
    fetchCustomBackendError('2222', $t('page.function.request.repeatedErrorMsg1')),
    fetchCustomBackendError('2222', $t('page.function.request.repeatedErrorMsg1')),
    fetchCustomBackendError('2222', $t('page.function.request.repeatedErrorMsg1')),
    fetchCustomBackendError('3333', $t('page.function.request.repeatedErrorMsg2')),
    fetchCustomBackendError('3333', $t('page.function.request.repeatedErrorMsg2')),
    fetchCustomBackendError('3333', $t('page.function.request.repeatedErrorMsg2'))
  ]);
}

async function handleRepeatedModalError() {
  await Promise.all([
    fetchCustomBackendError('7777', $t('request.logoutWithModalMsg')),
    fetchCustomBackendError('7777', $t('request.logoutWithModalMsg')),
    fetchCustomBackendError('7777', $t('request.logoutWithModalMsg'))
  ]);
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <VCard class="card-wrapper">
      <VCardTitle>{{ $t('request.logout') }}</VCardTitle>
      <VCardText>
        <VBtn color="primary" variant="flat" @click="logout">{{ $t('common.trigger') }}</VBtn>
      </VCardText>
    </VCard>

    <VCard class="card-wrapper">
      <VCardTitle>{{ $t('request.logoutWithModal') }}</VCardTitle>
      <VCardText>
        <VBtn color="primary" variant="flat" @click="logoutWithModal">{{ $t('common.trigger') }}</VBtn>
      </VCardText>
    </VCard>

    <VCard class="card-wrapper">
      <VCardTitle>{{ $t('request.refreshToken') }}</VCardTitle>
      <VCardText>
        <VBtn color="primary" variant="flat" @click="refreshToken">{{ $t('common.trigger') }}</VBtn>
      </VCardText>
    </VCard>

    <VCard class="card-wrapper">
      <VCardTitle>{{ $t('page.function.request.repeatedErrorOccurOnce') }}</VCardTitle>
      <VCardText>
        <div class="flex flex-wrap gap-3">
          <VBtn color="primary" variant="flat" @click="handleRepeatedMessageError">
            {{ $t('page.function.request.repeatedError') }}(Message)
          </VBtn>
          <VBtn color="primary" variant="flat" @click="handleRepeatedModalError">
            {{ $t('page.function.request.repeatedError') }}(Modal)
          </VBtn>
        </div>
      </VCardText>
    </VCard>
  </div>
</template>

<style scoped></style>
