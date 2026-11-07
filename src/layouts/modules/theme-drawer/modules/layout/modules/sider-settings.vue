<script setup lang="ts">
import { computed } from 'vue';
import { useThemeStore } from '@/store/modules/theme';
import { $t } from '@/locales';
import SettingItem from '../../../components/setting-item.vue';

defineOptions({
  name: 'SiderSettings'
});

const themeStore = useThemeStore();

const layoutMode = computed(() => themeStore.layout.mode);
const isMixLayoutMode = computed(() => layoutMode.value.includes('mix') || layoutMode.value.includes('hybrid'));
const isHybridLayoutMode = computed(() => layoutMode.value.includes('hybrid'));
</script>

<template>
  <VDivider>{{ $t('theme.layout.sider.title') }}</VDivider>
  <TransitionGroup tag="div" name="setting-list" class="flex-col-stretch gap-12px">
    <SettingItem v-if="layoutMode === 'vertical'" key="1" :label="$t('theme.layout.sider.width')">
      <VNumberInput
        v-model="themeStore.sider.width"
        :step="1"
        density="compact"
        variant="outlined"
        hide-details
        class="w-120px"
      />
    </SettingItem>
    <SettingItem v-if="layoutMode === 'vertical'" key="2" :label="$t('theme.layout.sider.collapsedWidth')">
      <VNumberInput
        v-model="themeStore.sider.collapsedWidth"
        :step="1"
        density="compact"
        variant="outlined"
        hide-details
        class="w-120px"
      />
    </SettingItem>
    <SettingItem v-if="isMixLayoutMode" key="3" :label="$t('theme.layout.sider.mixWidth')">
      <VNumberInput
        v-model="themeStore.sider.mixWidth"
        :step="1"
        density="compact"
        variant="outlined"
        hide-details
        class="w-120px"
      />
    </SettingItem>
    <SettingItem v-if="isMixLayoutMode" key="4" :label="$t('theme.layout.sider.mixCollapsedWidth')">
      <VNumberInput
        v-model="themeStore.sider.mixCollapsedWidth"
        :step="1"
        density="compact"
        variant="outlined"
        hide-details
        class="w-120px"
      />
    </SettingItem>
    <SettingItem v-if="layoutMode === 'vertical-mix'" key="5" :label="$t('theme.layout.sider.mixChildMenuWidth')">
      <VNumberInput
        v-model="themeStore.sider.mixChildMenuWidth"
        :step="1"
        density="compact"
        variant="outlined"
        hide-details
        class="w-120px"
      />
    </SettingItem>
    <SettingItem v-if="isHybridLayoutMode" key="6" :label="$t('theme.layout.sider.autoSelectFirstMenu')">
      <template #suffix>
        <IconTooltip :desc="$t('theme.layout.sider.autoSelectFirstMenuTip')" />
      </template>
      <VSwitch v-model="themeStore.sider.autoSelectFirstMenu" color="primary" density="compact" hide-details inset />
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
