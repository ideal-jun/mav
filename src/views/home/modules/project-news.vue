<script setup lang="ts">
import SoybeanAvatar from '@/components/custom/soybean-avatar.vue';
import { computed } from 'vue';
import { $t } from '@/locales';

defineOptions({
  name: 'ProjectNews'
});

interface NewsItem {
  id: number;
  content: string;
  time: string;
}

const newses = computed<NewsItem[]>(() => [
  { id: 1, content: $t('page.home.projectNews.desc1'), time: '2021-05-28 22:22:22' },
  { id: 2, content: $t('page.home.projectNews.desc2'), time: '2021-10-27 10:24:54' },
  { id: 3, content: $t('page.home.projectNews.desc3'), time: '2021-10-31 22:43:12' },
  { id: 4, content: $t('page.home.projectNews.desc4'), time: '2021-11-03 20:33:31' },
  { id: 5, content: $t('page.home.projectNews.desc5'), time: '2021-11-07 22:45:32' }
]);
</script>

<template>
  <VCard class="card-wrapper">
    <VCardTitle class="flex items-center justify-between">
      <span>{{ $t('page.home.projectNews.title') }}</span>
      <a class="text-sm text-primary" href="javascript:;">{{ $t('page.home.projectNews.moreNews') }}</a>
    </VCardTitle>
    <VCardText>
      <VList>
        <VListItem v-for="item in newses" :key="item.id">
          <template #prepend>
            <SoybeanAvatar class="size-12" />
          </template>
          <VListItemTitle class="text-sm">{{ item.content }}</VListItemTitle>
          <VListItemSubtitle>{{ item.time }}</VListItemSubtitle>
        </VListItem>
      </VList>
    </VCardText>
  </VCard>
</template>

<style scoped></style>
