<script setup lang="ts">
import { computed } from 'vue';
import { themePageAnimationModeOptions, themeScrollModeOptions } from '@/constants/app';
import { useThemeStore } from '@/store/modules/theme';
import { translateOptions } from '@/utils/common';
import { $t } from '@/locales';
import SettingItem from '../../../components/setting-item.vue';

defineOptions({
  name: 'ContentSettings'
});

const themeStore = useThemeStore();

const isWrapperScrollMode = computed(() => themeStore.layout.scrollMode === 'wrapper');
</script>

<template>
  <VDivider>{{ $t('theme.layout.content.title') }}</VDivider>
  <TransitionGroup tag="div" name="setting-list" class="flex-col-stretch gap-12px">
    <SettingItem key="1" :label="$t('theme.layout.content.scrollMode.title')">
      <template #suffix>
        <IconTooltip :desc="$t('theme.layout.content.scrollMode.tip')" />
      </template>
      <VSelect
        v-model="themeStore.layout.scrollMode"
        :items="translateOptions(themeScrollModeOptions)"
        item-title="label"
        item-value="value"
        density="compact"
        variant="outlined"
        hide-details
        class="w-120px"
      />
    </SettingItem>
    <SettingItem key="2" :label="$t('theme.layout.content.page.animate')">
      <VSwitch v-model="themeStore.page.animate" color="primary" density="compact" hide-details inset />
    </SettingItem>
    <SettingItem v-if="themeStore.page.animate" key="3" :label="$t('theme.layout.content.page.mode.title')">
      <VSelect
        v-model="themeStore.page.animateMode"
        :items="translateOptions(themePageAnimationModeOptions)"
        item-title="label"
        item-value="value"
        density="compact"
        variant="outlined"
        hide-details
        class="w-120px"
      />
    </SettingItem>
    <SettingItem v-if="isWrapperScrollMode" key="4" :label="$t('theme.layout.content.fixedHeaderAndTab')">
      <VSwitch v-model="themeStore.fixedHeaderAndTab" color="primary" density="compact" hide-details inset />
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
