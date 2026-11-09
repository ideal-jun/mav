<script lang="ts" setup>
import SvgIcon from '@/components/custom/svg-icon.vue';
import { computed, useSlots } from 'vue';
import type { Anchor } from 'vuetify';

defineOptions({ name: 'IconTooltip' });

interface Props {
  icon?: string;
  localIcon?: string;
  desc?: string;
  placement?: string;
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'mdi-help-circle',
  localIcon: '',
  desc: '',
  placement: 'top'
});

const slots = useSlots();
const hasCustomTrigger = computed(() => Boolean(slots.trigger));

if (!hasCustomTrigger.value && !props.icon && !props.localIcon) {
  throw new Error('icon or localIcon is required when no custom trigger slot is provided');
}

const placements: Record<string, Anchor> = {
  top: 'top',
  bottom: 'bottom',
  left: 'left',
  right: 'right',
  'top-start': 'top start',
  'top-end': 'top end',
  'bottom-start': 'bottom start',
  'bottom-end': 'bottom end'
};

const location = computed<Anchor>(() => placements[props.placement] ?? 'top');
</script>

<template>
  <VTooltip :location="location" interactive close-delay="200">
    <template #activator="{ props: activatorProps }">
      <span v-bind="activatorProps">
        <slot name="trigger">
          <div class="cursor-pointer">
            <SvgIcon v-if="localIcon" :local-icon="localIcon" />
            <VIcon v-else :icon="icon" size="small" />
          </div>
        </slot>
      </span>
    </template>
    <slot>
      <span>{{ desc }}</span>
    </slot>
  </VTooltip>
</template>

<style scoped></style>
