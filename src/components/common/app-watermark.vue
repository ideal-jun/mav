<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  /** watermark text */
  content?: string;
  /** whether to show the watermark */
  visible?: boolean;
  /** fullscreen watermark */
  fullscreen?: boolean;
  /** font size */
  fontSize?: number;
  /** tile width */
  width?: number;
  /** tile height */
  height?: number;
  /** x offset of the text inside the tile */
  xOffset?: number;
  /** y offset of the text inside the tile */
  yOffset?: number;
  /** rotate angle */
  rotate?: number;
  /** z-index */
  zIndex?: number;
}

const props = withDefaults(defineProps<Props>(), {
  content: '',
  visible: false,
  fullscreen: true,
  fontSize: 16,
  width: 384,
  height: 384,
  xOffset: 12,
  yOffset: 60,
  rotate: -15,
  zIndex: 2400
});

function escapeText(text: string) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const backgroundStyle = computed(() => {
  const tileWidth = props.width;
  const tileHeight = props.height;
  const text = escapeText(props.content);

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${tileWidth}" height="${tileHeight}">` +
    `<text x="${props.xOffset}" y="${props.yOffset}" transform="rotate(${props.rotate} ${tileWidth / 2} ${tileHeight / 2})" ` +
    `fill="rgba(148, 148, 148, 0.22)" font-size="${props.fontSize}" font-family="Roboto, sans-serif">${text}</text></svg>`;

  return {
    backgroundImage: `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}")`,
    backgroundRepeat: 'repeat',
    backgroundSize: `${tileWidth}px ${tileHeight}px`,
    zIndex: String(props.zIndex)
  };
});

const positionStyle = computed(() => (props.fullscreen ? { position: 'fixed' as const, inset: '0' } : {}));
</script>

<template>
  <div v-if="visible && content" class="app-watermark" :style="[positionStyle, backgroundStyle]" />
</template>

<style scoped>
.app-watermark {
  pointer-events: none;
  user-select: none;
}
</style>
