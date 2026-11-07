<script setup lang="ts">
import { ref } from 'vue';
import { $t } from '@/locales';
import { useTabStore } from '@/store/modules/tab';
import { useRouterPush } from '@/hooks/common/router';

const tabStore = useTabStore();
const { routerPushByKey } = useRouterPush();

const tabLabel = ref('');

function changeTabLabel() {
  tabStore.setTabLabel(tabLabel.value);
}

function resetTabLabel() {
  tabStore.resetTabLabel();
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <VCard class="card-wrapper">
      <VCardTitle>{{ $t('page.function.tab.tabOperate.title') }}</VCardTitle>
      <VCardText>
        <VDivider class="mb-3">{{ $t('page.function.tab.tabOperate.addTab') }}</VDivider>
        <VBtn color="primary" variant="flat" @click="routerPushByKey('about')">
          {{ $t('page.function.tab.tabOperate.addTabDesc') }}
        </VBtn>

        <VDivider class="my-3">{{ $t('page.function.tab.tabOperate.closeTab') }}</VDivider>
        <div class="flex flex-wrap gap-3">
          <VBtn color="primary" variant="flat" @click="tabStore.removeActiveTab">
            {{ $t('page.function.tab.tabOperate.closeCurrentTab') }}
          </VBtn>
          <VBtn color="primary" variant="flat" @click="tabStore.removeTabByRouteName('about')">
            {{ $t('page.function.tab.tabOperate.closeAboutTab') }}
          </VBtn>
        </div>

        <VDivider class="my-3">{{ $t('page.function.tab.tabOperate.addMultiTab') }}</VDivider>
        <div class="flex flex-wrap gap-3">
          <VBtn color="primary" variant="flat" @click="routerPushByKey('function_multi-tab')">
            {{ $t('page.function.tab.tabOperate.addMultiTabDesc1') }}
          </VBtn>
          <VBtn color="primary" variant="flat" @click="routerPushByKey('function_multi-tab', { query: { a: '1' } })">
            {{ $t('page.function.tab.tabOperate.addMultiTabDesc2') }}
          </VBtn>
        </div>
      </VCardText>
    </VCard>

    <VCard class="card-wrapper">
      <VCardTitle>{{ $t('page.function.tab.tabTitle.title') }}</VCardTitle>
      <VCardText>
        <VDivider class="mb-3">{{ $t('page.function.tab.tabTitle.changeTitle') }}</VDivider>
        <div class="max-w-240px flex items-center gap-2">
          <VTextField v-model="tabLabel" class="flex-1" />
          <VBtn color="primary" variant="flat" @click="changeTabLabel">
            {{ $t('page.function.tab.tabTitle.change') }}
          </VBtn>
        </div>

        <VDivider class="my-3">{{ $t('page.function.tab.tabTitle.resetTitle') }}</VDivider>
        <VBtn color="error" variant="outlined" class="w-80px" @click="resetTabLabel">
          {{ $t('page.function.tab.tabTitle.reset') }}
        </VBtn>
      </VCardText>
    </VCard>
  </div>
</template>

<style scoped></style>
