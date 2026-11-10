<script setup lang="ts">
import { computed } from 'vue';
import type { DictOption } from '@/store/modules/dict';
import { getDictLabel } from '@/hooks/business/dict';

defineOptions({
  name: 'DictTag'
});

interface Props {
  /** the dict options of the dict type */
  options: DictOption[];
  /** the value to display */
  value?: string | number | null;
  /** the size of the chip */
  size?: 'x-small' | 'small' | 'default' | 'large' | 'x-large';
}

const props = withDefaults(defineProps<Props>(), {
  size: 'small'
});

const activeOption = computed(() => props.options.find(option => option.value == `${props.value}`));

const colorMap: Record<string, string> = {
  default: 'default',
  primary: 'primary',
  success: 'success',
  info: 'info',
  warning: 'warning',
  danger: 'error'
};

const color = computed(() => {
  const listClass = activeOption.value?.listClass || 'default';

  return colorMap[listClass] || 'default';
});

const label = computed(() => getDictLabel(props.options, props.value));
</script>

<template>
  <VChip v-if="label" :color="color" :size="size" variant="tonal">{{ label }}</VChip>
</template>

<style scoped></style>
