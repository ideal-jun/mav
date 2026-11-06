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
  light: 'material-symbols:sunny',
  dark: 'material-symbols:nightlight-rounded',
  auto: 'material-symbols:hdr-auto'
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
  <div class="flex flex-col gap-3">
    <div class="flex items-center gap-3 text-sm font-medium">
      <span>{{ $t('theme.appearance.themeSchema.title') }}</span>
      <VDivider class="flex-1" />
    </div>
    <div class="flex justify-center">
      <VBtnToggle
        :model-value="themeStore.themeScheme"
        mandatory
        divided
        density="compact"
        color="primary"
        @update:model-value="handleSegmentChange"
      >
        <VBtn v-for="(_, key) in themeSchemaRecord" :key="key" :value="key">
          <SvgIcon :icon="icons[key]" class="h-5 text-icon-small" />
        </VBtn>
      </VBtnToggle>
    </div>
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
.sider-inverted-enter-active,
.sider-inverted-leave-active {
  --uno: h-22px transition-all-300;
}

.sider-inverted-enter-from,
.sider-inverted-leave-to {
  --uno: translate-x-20px opacity-0 h-0;
}
</style>
