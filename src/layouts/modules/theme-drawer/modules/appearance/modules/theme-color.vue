<script setup lang="ts">
import IconTooltip from '@/components/common/icon-tooltip.vue';
import { computed } from 'vue';
import { useThemeStore } from '@/store/modules/theme';
import { $t } from '@/locales';
import SettingItem from '../../../components/setting-item.vue';

defineOptions({
  name: 'ThemeColor'
});

const themeStore = useThemeStore();

const recommendColor = computed(() => themeStore.recommendColor);
const infoFollowPrimary = computed(() => themeStore.isInfoFollowPrimary);

function setRecommendColor(value: boolean | null) {
  themeStore.recommendColor = Boolean(value);
}

function setInfoFollowPrimary(value: boolean | null) {
  themeStore.isInfoFollowPrimary = Boolean(value);
}

const themeColorEntries = computed(() => Object.entries(themeStore.themeColors) as [App.Theme.ThemeColorKey, string][]);

function getColorLabel(key: App.Theme.ThemeColorKey) {
  return $t(`theme.appearance.themeColor.${key}` as App.I18n.I18nKey);
}

function handleUpdateColor(color: string | null, key: App.Theme.ThemeColorKey) {
  if (!color) return;
  themeStore.updateThemeColors(key, color);
}

function isColorDisabled(key: App.Theme.ThemeColorKey) {
  return key === 'info' && themeStore.isInfoFollowPrimary;
}

/** VColorPicker expects an array of columns, each column is stacked vertically */
const swatchColumns: string[][] = [
  ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7'],
  ['#0ea5e9', '#06b6d4', '#14b8a6', '#10b981'],
  ['#22c55e', '#84cc16', '#eab308', '#f59e0b'],
  ['#f97316', '#ef4444', '#ec4899', '#d946ef'],
  ['#64748b', '#0f172a', '#94a3b8', '#e2e8f0']
];
</script>

<template>
  <div class="flex flex-col">
    <VDivider class="my-8">{{ $t('theme.appearance.themeColor.title') }}</VDivider>

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
        :model-value="recommendColor"
        color="primary"
        hide-details
        density="compact"
        @update:model-value="setRecommendColor"
      />
    </SettingItem>

    <SettingItem v-for="[key, color] in themeColorEntries" :key="key" :label="getColorLabel(key)">
      <template v-if="key === 'info'" #suffix>
        <VCheckbox
          :model-value="infoFollowPrimary"
          color="primary"
          density="compact"
          hide-details
          :label="$t('theme.appearance.themeColor.followPrimary')"
          @update:model-value="setInfoFollowPrimary"
        />
      </template>
      <VColorInput
        :model-value="color"
        :disabled="isColorDisabled(key)"
        :swatches="swatchColumns"
        show-swatches
        hide-inputs
        density="compact"
        variant="outlined"
        hide-details
        hide-actions
        :base-color="color"
        :color="color"
        pip-location="prepend-inner"
        color-pip
        max-width="140"
        @update:model-value="value => handleUpdateColor(value, key)"
      />
    </SettingItem>
  </div>
</template>

<style scoped></style>
