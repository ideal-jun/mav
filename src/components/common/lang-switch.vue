<script setup lang="ts">
import { computed } from 'vue';
import { $t } from '@/locales';

defineOptions({
  name: 'LangSwitch'
});

interface Props {
  /** Current language */
  lang: App.I18n.LangType;
  /** Language options */
  langOptions: App.I18n.LangOption[];
  /** Show tooltip */
  showTooltip?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showTooltip: true
});

type Emits = {
  (e: 'changeLang', lang: App.I18n.LangType): void;
};

const emit = defineEmits<Emits>();

const tooltipContent = computed(() => (props.showTooltip ? $t('icon.lang') : ''));

function changeLang(lang: App.I18n.LangType) {
  emit('changeLang', lang);
}
</script>

<template>
  <VMenu location="bottom end">
    <template #activator="{ props: activatorProps }">
      <VBtn
        v-bind="activatorProps"
        :aria-label="tooltipContent"
        class="h-9 w-9"
        density="comfortable"
        icon
        variant="text"
      >
        <VTooltip :text="tooltipContent" :disabled="!tooltipContent" location="left">
          <template #activator="{ props: tooltipProps }">
            <span v-bind="tooltipProps" class="inline-flex">
              <SvgIcon icon="heroicons:language" />
            </span>
          </template>
        </VTooltip>
      </VBtn>
    </template>
    <VList density="compact">
      <VListItem
        v-for="option in langOptions"
        :key="option.key"
        :active="option.key === lang"
        color="primary"
        @click="changeLang(option.key)"
      >
        <VListItemTitle>{{ option.label }}</VListItemTitle>
      </VListItem>
    </VList>
  </VMenu>
</template>

<style scoped></style>
