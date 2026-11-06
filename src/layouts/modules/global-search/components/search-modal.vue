<script lang="ts" setup>
import { computed, ref, shallowRef } from 'vue';
import { useRouter } from 'vue-router';
import { onKeyStroke, useDebounceFn } from '@vueuse/core';
import { useRouteStore } from '@/store/modules/route';
import { useAppStore } from '@/store/modules/app';
import { $t } from '@/locales';
import SearchResult from './search-result.vue';
import SearchFooter from './search-footer.vue';

defineOptions({ name: 'SearchModal' });

const router = useRouter();
const appStore = useAppStore();
const routeStore = useRouteStore();

const isMobile = computed(() => appStore.isMobile);

const keyword = ref('');
const activePath = ref('');
const resultOptions = shallowRef<App.Global.Menu[]>([]);

const handleSearch = useDebounceFn(search, 300);

const visible = defineModel<boolean>('show', { required: true });

function search() {
  resultOptions.value = routeStore.searchMenus.filter(menu => {
    const trimKeyword = keyword.value.toLocaleLowerCase().trim();
    const title = (menu.i18nKey ? $t(menu.i18nKey) : menu.label).toLocaleLowerCase();
    return trimKeyword && title.includes(trimKeyword);
  });
  activePath.value = resultOptions.value[0]?.routePath ?? '';
}

function handleClose() {
  setTimeout(() => {
    visible.value = false;
    resultOptions.value = [];
    keyword.value = '';
  }, 200);
}

function handleUp() {
  const { length } = resultOptions.value;
  if (length === 0) return;

  const index = getActivePathIndex();
  if (index === -1) return;

  const activeIndex = index === 0 ? length - 1 : index - 1;
  activePath.value = resultOptions.value[activeIndex].routePath;
}

function handleDown() {
  const { length } = resultOptions.value;
  if (length === 0) return;

  const index = getActivePathIndex();
  if (index === -1) return;

  const activeIndex = index === length - 1 ? 0 : index + 1;
  activePath.value = resultOptions.value[activeIndex].routePath;
}

function getActivePathIndex() {
  return resultOptions.value.findIndex(item => item.routePath === activePath.value);
}

function handleEnter() {
  if (resultOptions.value?.length === 0 || activePath.value === '') return;
  handleClose();
  router.push(activePath.value);
}

function registerShortcut() {
  onKeyStroke('Escape', handleClose);
  onKeyStroke('Enter', handleEnter);
  onKeyStroke('ArrowUp', handleUp);
  onKeyStroke('ArrowDown', handleDown);
}

registerShortcut();
</script>

<template>
  <VDialog v-model="visible" :fullscreen="isMobile" :max-width="isMobile ? undefined : 630" @after-leave="handleClose">
    <VCard rounded="lg">
      <VCardText class="pb-0">
        <div class="flex items-start gap-2">
          <VTextField
            v-model="keyword"
            autofocus
            clearable
            hide-details
            :placeholder="$t('common.keywordSearch')"
            prepend-inner-icon="mdi-magnify"
            @keydown.esc="handleClose"
            @update:model-value="handleSearch"
          />
          <VBtn v-if="isMobile" color="primary" variant="tonal" @click="handleClose">
            {{ $t('common.cancel') }}
          </VBtn>
        </div>
      </VCardText>
      <VCardText class="pt-4">
        <div v-if="resultOptions.length === 0" class="py-10 text-center text-medium-emphasis">
          {{ $t('common.noData') }}
        </div>
        <SearchResult v-else v-model:path="activePath" :options="resultOptions" @enter="handleEnter" />
      </VCardText>
      <template v-if="!isMobile">
        <VDivider />
        <SearchFooter />
      </template>
    </VCard>
  </VDialog>
</template>

<style lang="scss" scoped></style>
