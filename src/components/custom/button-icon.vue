<script setup lang="ts">
import { computed } from 'vue';
import type { Anchor } from 'vuetify';
import { twMerge } from 'tailwind-merge';

defineOptions({
  name: 'ButtonIcon',
  inheritAttrs: false
});

interface Props {
  /** Button class */
  class?: string;
  /** Iconify icon name */
  icon?: string;
  /** Tooltip content */
  tooltipContent?: string;
  /** Tooltip placement */
  tooltipPlacement?: string;
  zIndex?: number;
}

const props = withDefaults(defineProps<Props>(), {
  class: '',
  icon: '',
  tooltipContent: '',
  tooltipPlacement: 'bottom',
  zIndex: 98
});

const DEFAULT_CLASS = 'h-9 w-9 text-icon';

const placements: Record<string, Anchor> = {
  top: 'top',
  bottom: 'bottom',
  left: 'left',
  right: 'right',
  'top-start': 'top start',
  'top-end': 'top end',
  'bottom-start': 'bottom start',
  'bottom-end': 'bottom end',
  'left-start': 'left top',
  'left-end': 'left bottom',
  'right-start': 'right top',
  'right-end': 'right bottom'
};

const location = computed<Anchor>(() => placements[props.tooltipPlacement] ?? 'bottom');
</script>

<template>
  <VTooltip :location="location" :disabled="!tooltipContent" :z-index="zIndex">
    <template #activator="{ props: activatorProps }">
      <VBtn
        v-bind="{ ...activatorProps, ...$attrs }"
        :class="twMerge(DEFAULT_CLASS, props.class)"
        density="comfortable"
        icon
        variant="text"
      >
        <slot>
          <SvgIcon :icon="icon" />
        </slot>
      </VBtn>
    </template>
    {{ tooltipContent }}
  </VTooltip>
</template>

<style scoped></style>
