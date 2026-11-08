<script setup lang="ts">
import { computed, useAttrs } from 'vue';

defineOptions({ name: 'SvgIcon', inheritAttrs: false });

/**
 * Props
 *
 * - Render the local svg icons in `src/assets/svg-icon` only, the icon sprite is injected by
 *   `vite-plugin-svg-icons` (`virtual:svg-icons-register`)
 * - Material Design Icons are rendered by the Vuetify `<VIcon>` component, not by this component
 */
interface Props {
  /** Local svg icon name, it is the file name in `src/assets/svg-icon` */
  localIcon?: string;
  /** Icon size, a `number` is treated as `px` */
  size?: number | string;
}

const props = defineProps<Props>();

const attrs = useAttrs();

const bindAttrs = computed<{ class: string; style: string }>(() => ({
  class: (attrs.class as string) || '',
  style: (attrs.style as string) || ''
}));

const symbolId = computed(() => {
  const { VITE_ICON_LOCAL_PREFIX: prefix } = import.meta.env;

  return `#${prefix}-${props.localIcon || 'no-icon'}`;
});

/** The svg is `1em` wide and high, so it is sized with font-size */
const iconStyle = computed(() => {
  const fontSize = typeof props.size === 'number' ? `${props.size}px` : props.size;

  if (!fontSize) {
    return bindAttrs.value.style;
  }

  return bindAttrs.value.style ? `font-size:${fontSize};${bindAttrs.value.style}` : `font-size:${fontSize}`;
});
</script>

<template>
  <svg aria-hidden="true" width="1em" height="1em" :class="bindAttrs.class" :style="iconStyle">
    <use :xlink:href="symbolId" fill="currentColor" />
  </svg>
</template>
