<script setup lang="ts">
import GithubLink from '@/components/common/github-link.vue';
import WebSiteLink from '@/components/common/web-site-link.vue';
import { onMounted, ref } from 'vue';
import domPurify from 'dompurify';
import { html } from 'pinyin-pro';

const domRef = ref<HTMLElement | null>(null);
const domRef2 = ref<HTMLElement | null>(null);
const domRef3 = ref<HTMLElement | null>(null);

function renderHtml() {
  if (!domRef.value || !domRef2.value || !domRef3.value) return;

  const text = 'SoybeanAdmin是一个清新优雅、高颜值且功能强大的后台管理模板';

  const code = domPurify.sanitize(html(text));
  const code2 = domPurify.sanitize(html(text, { toneType: 'none' }));

  domRef.value.innerHTML = code;
  domRef2.value.innerHTML = code2;
  domRef3.value.innerHTML = code;
}

onMounted(() => {
  renderHtml();
});
</script>

<template>
  <div>
    <VCard class="h-full card-wrapper">
      <VCardTitle>pinyin 插件</VCardTitle>
      <VCardText>
        <div class="flex flex-col gap-3">
          <GithubLink link="https://github.com/zh-lx/pinyin-pro" />
          <WebSiteLink label="文档地址：" link="https://pinyin-pro.cn/" />
        </div>
        <VDivider class="my-4">常规使用</VDivider>
        <p ref="domRef" class="text-18px"></p>
        <VDivider class="my-4">不带音调</VDivider>
        <p ref="domRef2" class="text-18px"></p>
        <VDivider class="my-4">自定义样式</VDivider>
        <p ref="domRef3" class="custom-style text-18px"></p>
      </VCardText>
    </VCard>
  </div>
</template>

<style lang="scss" scoped>
.custom-style {
  :deep(.py-result-item) {
    .py-chinese-item {
      --uno: text-primary;
    }

    .py-pinyin-item {
      --uno: text-error;
    }
  }
}
</style>
