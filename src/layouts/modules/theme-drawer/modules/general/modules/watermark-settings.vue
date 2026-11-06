<script setup lang="ts">
import { computed } from 'vue';
import { watermarkTimeFormatOptions } from '@/constants/app';
import { useThemeStore } from '@/store/modules/theme';
import { $t } from '@/locales';
import SettingItem from '../../../components/setting-item.vue';

defineOptions({
  name: 'WatermarkSettings'
});

const themeStore = useThemeStore();

const isWatermarkTextVisible = computed(
  () => themeStore.watermark.visible && !themeStore.watermark.enableUserName && !themeStore.watermark.enableTime
);

function setVisible(value: boolean | null) {
  themeStore.watermark.visible = Boolean(value);
}

function setEnableUserName(value: boolean | null) {
  if (value !== null) themeStore.setWatermarkEnableUserName(value);
}

function setEnableTime(value: boolean | null) {
  if (value !== null) themeStore.setWatermarkEnableTime(value);
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center gap-3 text-sm font-medium">
      <span>{{ $t('theme.general.watermark.title') }}</span>
      <VDivider class="flex-1" />
    </div>

    <TransitionGroup tag="div" name="setting-list" class="flex flex-col gap-3">
      <SettingItem key="1" :label="$t('theme.general.watermark.visible')">
        <VSwitch
          :model-value="themeStore.watermark.visible"
          color="primary"
          hide-details
          density="compact"
          @update:model-value="setVisible"
        />
      </SettingItem>
      <SettingItem v-if="themeStore.watermark.visible" key="2" :label="$t('theme.general.watermark.enableUserName')">
        <VSwitch
          :model-value="themeStore.watermark.enableUserName"
          color="primary"
          hide-details
          density="compact"
          @update:model-value="setEnableUserName"
        />
      </SettingItem>
      <SettingItem v-if="themeStore.watermark.visible" key="3" :label="$t('theme.general.watermark.enableTime')">
        <VSwitch
          :model-value="themeStore.watermark.enableTime"
          color="primary"
          hide-details
          density="compact"
          @update:model-value="setEnableTime"
        />
      </SettingItem>
      <SettingItem
        v-if="themeStore.watermark.visible && themeStore.watermark.enableTime"
        key="4"
        :label="$t('theme.general.watermark.timeFormat')"
      >
        <div class="w-52">
          <VSelect
            v-model="themeStore.watermark.timeFormat"
            :items="watermarkTimeFormatOptions"
            item-title="label"
            item-value="value"
            density="compact"
            hide-details
          />
        </div>
      </SettingItem>
      <SettingItem v-if="isWatermarkTextVisible" key="5" :label="$t('theme.general.watermark.text')">
        <div class="w-32">
          <VTextField v-model="themeStore.watermark.text" density="compact" hide-details placeholder="SoybeanAdmin" />
        </div>
      </SettingItem>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.setting-list-move,
.setting-list-enter-active,
.setting-list-leave-active {
  --uno: transition-all-300;
}

.setting-list-enter-from,
.setting-list-leave-to {
  --uno: opacity-0 -translate-x-30px;
}

.setting-list-leave-active {
  --uno: absolute;
}
</style>
