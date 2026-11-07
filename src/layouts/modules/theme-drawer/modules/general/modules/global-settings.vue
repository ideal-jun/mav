<script setup lang="ts">
import { useThemeStore } from '@/store/modules/theme';
import { $t } from '@/locales';
import SettingItem from '../../../components/setting-item.vue';

defineOptions({
  name: 'GlobalSettings'
});

const themeStore = useThemeStore();
</script>

<template>
  <VDivider class="my-8">{{ $t('theme.general.title') }}</VDivider>
  <SettingItem :label="$t('theme.general.multilingual.visible')">
    <VSwitch v-model="themeStore.header.multilingual.visible" color="primary" hide-details density="compact" />
  </SettingItem>

  <SettingItem :label="$t('theme.general.globalSearch.visible')">
    <VSwitch v-model="themeStore.header.globalSearch.visible" color="primary" hide-details density="compact" />
  </SettingItem>
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
