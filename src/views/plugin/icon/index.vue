<script lang="ts" setup>
import CustomIconSelect from '@/components/custom/custom-icon-select.vue';
import SvgIcon from '@/components/custom/svg-icon.vue';
import { ref } from 'vue';
import { mdiIcons } from '@/constants/icon';
import { getLocalIcons } from '@/utils/icon';

const selectValue = ref('');

const localIcons = getLocalIcons();

/** the MDI icons used by the menus */
const menuIcons = [
  'mdi-home',
  'mdi-monitor-dashboard',
  'mdi-shield-account-outline',
  'mdi-account-supervisor-outline',
  'mdi-routes',
  'mdi-cog-outline'
];
</script>

<template>
  <div class="h-full">
    <VCard class="card-wrapper">
      <VCardTitle>Material Design Icons 示例</VCardTitle>
      <VCardText>
        <div class="grid grid-cols-10">
          <div v-for="item in mdiIcons" :key="item" class="mt-5px flex justify-center">
            <VIcon :icon="item" size="30" />
          </div>
        </div>
        <div class="mt-50px">
          <h1 class="mb-20px text-18px font-500">MDI 图标选择器</h1>
          <CustomIconSelect v-model:value="selectValue" :icons="mdiIcons" />
        </div>
      </VCardText>
    </VCard>

    <VCard class="mt-10px card-wrapper">
      <VCardTitle>使用说明</VCardTitle>
      <VCardText>
        <div class="pb-12px text-16px">
          MDI 图标用 Vuetify 的 VIcon 渲染（图标名形如 mdi-home），本地 svg 图标用 SvgIcon 渲染（local-icon 传文件名）。
        </div>
        <div class="pb-12px text-16px">
          MDI 中不存在的图标，直接把 svg 文件放到 src/assets/svg-icon 目录，用 SvgIcon 的 local-icon 渲染即可。
        </div>
        <div class="flex flex-wrap items-center gap-6 pt-8px">
          <div v-for="item in menuIcons" :key="item" class="flex flex-col items-center gap-1">
            <VIcon :icon="item" size="30" class="text-primary" />
            <span class="text-12px">{{ item }}</span>
          </div>
        </div>
      </VCardText>
    </VCard>

    <VCard class="mt-10px card-wrapper">
      <VCardTitle>本地 svg 图标示例</VCardTitle>
      <VCardText>
        <div class="pb-16px text-16px">
          src/assets/svg-icon 目录下的 svg 文件，通过 SvgIcon 的 local-icon 属性渲染（图标 id 前缀来自
          VITE_ICON_LOCAL_PREFIX），MDI 中缺失的图标可以用这种方式补充。
        </div>
        <div class="grid grid-cols-10">
          <div v-for="fileName in localIcons" :key="fileName" class="mt-5px flex flex-col items-center gap-1">
            <SvgIcon :local-icon="fileName" class="text-30px text-primary" />
            <span class="text-12px">{{ fileName }}</span>
          </div>
        </div>
      </VCardText>
    </VCard>
  </div>
</template>

<style scoped></style>
