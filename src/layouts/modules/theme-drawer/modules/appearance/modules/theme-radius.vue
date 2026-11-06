<script setup lang="ts">
import { useThemeStore } from '@/store/modules/theme';
import { $t } from '@/locales';
import SettingItem from '../../../components/setting-item.vue';

defineOptions({
  name: 'ThemeRadius'
});

const themeStore = useThemeStore();
</script>

<template>
  <VDivider class="mb-3">{{ $t('theme.appearance.themeRadius.title') }}</VDivider>
  <TransitionGroup tag="div" name="setting-list" class="flex flex-col gap-3">
    <SettingItem key="1" :label="$t('theme.appearance.themeRadius.title')">
      <div class="w-32">
        <VSlider v-model="themeStore.themeRadius" :min="0" :max="16" :step="1" hide-details density="compact" />
      </div>
    </SettingItem>
  </TransitionGroup>
</template>

<style scoped></style>
