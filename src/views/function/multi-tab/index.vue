<script setup lang="ts">
import LookForward from '@/components/custom/look-forward.vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { $t } from '@/locales';
import { useRouterPush } from '@/hooks/common/router';

const route = useRoute();
const { routerPushByKey } = useRouterPush();

const routeQuery = computed(() => JSON.stringify(route.query));
</script>

<template>
  <div>
    <LookForward>
      <div>
        <VBtn variant="outlined" @click="routerPushByKey('function_tab')">
          {{ $t('page.function.multiTab.backTab') }}
        </VBtn>
        <div class="py-24px">{{ $t('page.function.multiTab.routeParam') }}: {{ routeQuery }}</div>
      </div>
    </LookForward>
  </div>
</template>

<style scoped></style>
