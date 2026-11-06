<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import Player from 'xgplayer';
import 'xgplayer/dist/index.min.css';

const domRef = ref<HTMLElement>();
const player = ref<Player>();

function renderXgPlayer() {
  if (!domRef.value) return;
  const url = 'https://lf9-cdn-tos.bytecdntp.com/cdn/expire-1-M/byted-player-videos/1.0.0/xgplayer-demo.mp4';
  player.value = new Player({
    el: domRef.value,
    url,
    playbackRate: [0.5, 0.75, 1, 1.5, 2]
  });
}
function destroyXgPlayer() {
  player.value?.destroy();
}

onMounted(() => {
  renderXgPlayer();
});

onUnmounted(() => {
  destroyXgPlayer();
});
</script>

<template>
  <div>
    <VCard class="h-full card-wrapper">
      <VCardTitle>视频播放器插件</VCardTitle>
      <VCardText>
        <div class="flex items-center justify-center">
          <div ref="domRef" class="h-auto w-full shadow-md"></div>
        </div>
      </VCardText>
    </VCard>
  </div>
</template>

<style scoped></style>
