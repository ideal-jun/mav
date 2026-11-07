<script setup lang="ts">
import { themeTabModeOptions } from '@/constants/app';
import { useThemeStore } from '@/store/modules/theme';
import { translateOptions } from '@/utils/common';
import { $t } from '@/locales';
import SettingItem from '../../../components/setting-item.vue';

defineOptions({
  name: 'TabSettings'
});

const themeStore = useThemeStore();
</script>

<template>
  <VDivider>{{ $t('theme.layout.tab.title') }}</VDivider>
  <TransitionGroup tag="div" name="setting-list" class="flex-col-stretch gap-12px">
    <SettingItem key="1" :label="$t('theme.layout.tab.visible')">
      <VSwitch v-model="themeStore.tab.visible" color="primary" density="compact" hide-details inset />
    </SettingItem>
    <SettingItem v-if="themeStore.tab.visible" key="2" :label="$t('theme.layout.tab.cache')">
      <template #suffix>
        <IconTooltip :desc="$t('theme.layout.tab.cacheTip')" />
      </template>
      <VSwitch v-model="themeStore.tab.cache" color="primary" density="compact" hide-details inset />
    </SettingItem>
    <SettingItem v-if="themeStore.tab.visible" key="3" :label="$t('theme.layout.tab.height')">
      <VNumberInput
        v-model="themeStore.tab.height"
        :step="1"
        density="compact"
        variant="outlined"
        hide-details
        class="w-120px"
      />
    </SettingItem>
    <SettingItem v-if="themeStore.tab.visible" key="4" :label="$t('theme.layout.tab.mode.title')">
      <VSelect
        v-model="themeStore.tab.mode"
        :items="translateOptions(themeTabModeOptions)"
        item-title="label"
        item-value="value"
        density="compact"
        variant="outlined"
        hide-details
        class="w-120px"
      />
    </SettingItem>
    <SettingItem v-if="themeStore.tab.visible" key="5" :label="$t('theme.layout.tab.closeByMiddleClick')">
      <template #suffix>
        <IconTooltip :desc="$t('theme.layout.tab.closeByMiddleClickTip')" />
      </template>
      <VSwitch v-model="themeStore.tab.closeTabByMiddleClick" color="primary" density="compact" hide-details inset />
    </SettingItem>
  </TransitionGroup>
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
