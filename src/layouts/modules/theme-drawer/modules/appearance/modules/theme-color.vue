<script setup lang="ts">
import { computed } from 'vue';
import { useThemeStore } from '@/store/modules/theme';
import { $t } from '@/locales';
import SettingItem from '../../../components/setting-item.vue';

defineOptions({
  name: 'ThemeColor'
});

const themeStore = useThemeStore();

const themeColorEntries = computed(() => Object.entries(themeStore.themeColors) as [App.Theme.ThemeColorKey, string][]);

function getColorLabel(key: App.Theme.ThemeColorKey) {
  return $t(`theme.appearance.themeColor.${key}` as App.I18n.I18nKey);
}

function handleUpdateColor(color: string | null, key: App.Theme.ThemeColorKey) {
  if (!color) return;
  themeStore.updateThemeColors(key, color);
}

const swatches: string[] = [
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#a855f7',
  '#0ea5e9',
  '#06b6d4',
  '#f43f5e',
  '#ef4444',
  '#ec4899',
  '#d946ef',
  '#f97316',
  '#f59e0b',
  '#eab308',
  '#84cc16',
  '#22c55e',
  '#10b981'
];
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center gap-3 text-sm font-medium">
      <span>{{ $t('theme.appearance.themeColor.title') }}</span>
      <VDivider class="flex-1" />
    </div>

    <SettingItem :label="$t('theme.appearance.recommendColor')">
      <template #suffix>
        <IconTooltip>
          <p>
            <span class="pr-3">{{ $t('theme.appearance.recommendColorDesc') }}</span>
            <br />
            <VBtn
              href="https://uicolors.app/create"
              target="_blank"
              rel="noopener noreferrer"
              variant="text"
              size="small"
              class="px-1"
            >
              https://uicolors.app/create
            </VBtn>
          </p>
        </IconTooltip>
      </template>
      <VSwitch
        :model-value="themeStore.recommendColor"
        color="primary"
        hide-details
        density="compact"
        @update:model-value="value => (themeStore.recommendColor = Boolean(value))"
      />
    </SettingItem>

    <SettingItem v-for="[key, color] in themeColorEntries" :key="key" :label="getColorLabel(key)">
      <template v-if="key === 'info'" #suffix>
        <VCheckbox
          :model-value="themeStore.isInfoFollowPrimary"
          color="primary"
          density="compact"
          hide-details
          :label="$t('theme.appearance.themeColor.followPrimary')"
          @update:model-value="value => (themeStore.isInfoFollowPrimary = Boolean(value))"
        />
      </template>
      <div class="w-24">
        <VColorPicker
          :model-value="color"
          :disabled="key === 'info' && themeStore.isInfoFollowPrimary"
          :show-swatches="false"
          :swatches="[swatches]"
          hide-canvas
          hide-inputs
          @update:model-value="value => handleUpdateColor(value, key)"
        />
      </div>
    </SettingItem>
  </div>
</template>

<style scoped></style>
