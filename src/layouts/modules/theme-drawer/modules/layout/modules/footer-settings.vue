<script setup lang="ts">
import { computed } from 'vue';
import { useThemeStore } from '@/store/modules/theme';
import { $t } from '@/locales';
import SettingItem from '../../../components/setting-item.vue';

defineOptions({
  name: 'FooterSettings'
});

const themeStore = useThemeStore();

const layoutMode = computed(() => themeStore.layout.mode);
const isWrapperScrollMode = computed(() => themeStore.layout.scrollMode === 'wrapper');
const isMixHorizontalMode = computed(() =>
  ['top-hybrid-sidebar-first', 'top-hybrid-header-first'].includes(layoutMode.value)
);
</script>

<template>
  <VDivider>{{ $t('theme.layout.footer.title') }}</VDivider>
  <TransitionGroup tag="div" name="setting-list" class="flex-col-stretch gap-12px">
    <SettingItem key="1" :label="$t('theme.layout.footer.visible')">
      <VSwitch v-model="themeStore.footer.visible" color="primary" density="compact" hide-details inset />
    </SettingItem>
    <SettingItem
      v-if="themeStore.footer.visible && isWrapperScrollMode"
      key="2"
      :label="$t('theme.layout.footer.fixed')"
    >
      <VSwitch v-model="themeStore.footer.fixed" color="primary" density="compact" hide-details inset />
    </SettingItem>
    <SettingItem v-if="themeStore.footer.visible" key="3" :label="$t('theme.layout.footer.height')">
      <VNumberInput
        v-model="themeStore.footer.height"
        :step="1"
        density="compact"
        variant="outlined"
        hide-details
        class="w-120px"
      />
    </SettingItem>
    <SettingItem
      v-if="themeStore.footer.visible && isMixHorizontalMode"
      key="4"
      :label="$t('theme.layout.footer.right')"
    >
      <VSwitch v-model="themeStore.footer.right" color="primary" density="compact" hide-details inset />
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
