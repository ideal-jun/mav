<script setup lang="ts">
import { computed } from 'vue';
import { themeSchemaRecord } from '@/constants/app';
import { useThemeStore } from '@/store/modules/theme';
import { $t } from '@/locales';
import SettingItem from '../../../components/setting-item.vue';

defineOptions({
  name: 'ThemeSchema'
});

const themeStore = useThemeStore();

const icons: Record<UnionKey.ThemeScheme, string> = {
  light: 'mdi-weather-sunny',
  dark: 'mdi-weather-night',
  auto: 'mdi-theme-light-dark'
};

function handleSegmentChange(value: unknown) {
  if (typeof value === 'string') {
    themeStore.setThemeScheme(value as UnionKey.ThemeScheme);
  }
}

function handleGrayscaleChange(value: boolean | null) {
  themeStore.setGrayscale(Boolean(value));
}

function handleColourWeaknessChange(value: boolean | null) {
  themeStore.setColourWeakness(Boolean(value));
}

const showSiderInverted = computed(() => !themeStore.darkMode && themeStore.layout.mode.includes('vertical'));
</script>

<template>
  <div class="flex flex-col">
    <VDivider class="my-8">{{ $t('theme.appearance.themeSchema.title') }}</VDivider>
    <VTabs
      v-model="themeStore.themeScheme"
      density="compact"
      grow
      inset
      class="mx-16 shadow-none"
      @update:model-value="handleSegmentChange"
    >
      <VTab v-for="(_, key) in themeSchemaRecord" :key="key" :value="key" min-width="30" :ripple="false">
        <VIcon :icon="icons[key]"></VIcon>
      </VTab>
    </VTabs>

    <Transition name="sider-inverted">
      <SettingItem v-if="showSiderInverted" :label="$t('theme.layout.sider.inverted')">
        <VSwitch
          :model-value="themeStore.sider.inverted"
          color="primary"
          hide-details
          density="compact"
          @update:model-value="value => (themeStore.sider.inverted = Boolean(value))"
        />
      </SettingItem>
    </Transition>
    <SettingItem :label="$t('theme.appearance.grayscale')">
      <VSwitch
        :model-value="themeStore.grayscale"
        color="primary"
        hide-details
        density="compact"
        @update:model-value="handleGrayscaleChange"
      />
    </SettingItem>
    <SettingItem :label="$t('theme.appearance.colourWeakness')">
      <VSwitch
        :model-value="themeStore.colourWeakness"
        color="primary"
        hide-details
        density="compact"
        @update:model-value="handleColourWeaknessChange"
      />
    </SettingItem>
  </div>
</template>

<style scoped>
.theme-schema-toggle :deep(.v-btn) {
  width: 44px;
  height: 32px;
}

.sider-inverted-enter-active,
.sider-inverted-leave-active {
  --uno: h-22px transition-all-300;
}

.sider-inverted-enter-from,
.sider-inverted-leave-to {
  --uno: translate-x-20px opacity-0 h-0;
}
</style>
