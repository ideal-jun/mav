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
  <div class="flex flex-col">
    <VDivider class="my-8">{{ $t('theme.appearance.themeRadius.title') }}</VDivider>
    <TransitionGroup tag="div" name="setting-list" class="flex flex-col gap-4">
      <SettingItem key="1" :label="$t('theme.appearance.themeRadius.title')">
        <VNumberInput
          v-model="themeStore.themeRadius"
          :step="1"
          :min="0"
          :max="16"
          density="compact"
          variant="outlined"
          control-variant="stacked"
          hide-details
          max-width="140"
        />
      </SettingItem>
    </TransitionGroup>
  </div>
</template>

<style scoped></style>
