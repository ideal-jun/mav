<script setup lang="ts">
import { computed } from 'vue';
import DictTag from '@/components/common/dict-tag.vue';
import { getDictLabel, useDict } from '@/hooks/business/dict';
import type { OperLogVO } from '@/service/api/ruoyi/monitor/types';
import { parseTime } from '@/utils/ruoyi';

defineOptions({
  name: 'OperInfoDialog'
});

/** 弹窗显示状态 */
const visible = defineModel<boolean>({ default: false });

const props = defineProps<{
  info: OperLogVO | null;
}>();

const dict = useDict('sys_oper_type', 'sys_common_status', 'sys_device_type');

/** 把后端保存的 json 字符串格式化为可读 json */
function formatJson(data?: string) {
  if (!data) {
    return '-';
  }

  try {
    return JSON.stringify(JSON.parse(data), null, 2);
  } catch {
    return data;
  }
}

const paramsJson = computed(() => formatJson(props.info?.operParam));
const resultJson = computed(() => formatJson(props.info?.jsonResult));
const deviceTypeLabel = computed(() => getDictLabel(dict.sys_device_type, props.info?.deviceType));
</script>

<template>
  <VDialog v-model="visible" max-width="860" scrollable>
    <VCard>
      <VCardTitle>操作日志详细</VCardTitle>
      <VCardText v-if="info">
        <div class="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
          <div class="flex gap-2">
            <span class="w-24 shrink-0 text-medium-emphasis">操作状态</span>
            <DictTag :options="dict.sys_common_status" :value="info.status" />
          </div>
          <div class="flex gap-2">
            <span class="w-24 shrink-0 text-medium-emphasis">操作模块</span>
            <span class="break-all">{{ info.title || '-' }}</span>
          </div>
          <div class="flex gap-2">
            <span class="w-24 shrink-0 text-medium-emphasis">操作类型</span>
            <DictTag :options="dict.sys_oper_type" :value="info.businessType" />
          </div>
          <div class="flex gap-2">
            <span class="w-24 shrink-0 text-medium-emphasis">消耗时间</span>
            <span>{{ info.costTime }}ms</span>
          </div>
          <div class="flex gap-2">
            <span class="w-24 shrink-0 text-medium-emphasis">操作人员</span>
            <span class="break-all">{{ info.operName || '-' }}</span>
          </div>
          <div class="flex gap-2">
            <span class="w-24 shrink-0 text-medium-emphasis">所属部门</span>
            <span class="break-all">{{ info.deptName || '-' }}</span>
          </div>
          <div class="flex gap-2">
            <span class="w-24 shrink-0 text-medium-emphasis">客户端</span>
            <span class="break-all">{{ info.clientKey || '-' }}</span>
          </div>
          <div class="flex gap-2">
            <span class="w-24 shrink-0 text-medium-emphasis">设备类型</span>
            <span class="break-all">{{ deviceTypeLabel || '-' }}</span>
          </div>
          <div class="flex gap-2">
            <span class="w-24 shrink-0 text-medium-emphasis">浏览器</span>
            <span class="break-all">{{ info.browser || '-' }}</span>
          </div>
          <div class="flex gap-2">
            <span class="w-24 shrink-0 text-medium-emphasis">操作系统</span>
            <span class="break-all">{{ info.os || '-' }}</span>
          </div>
          <div class="flex gap-2">
            <span class="w-24 shrink-0 text-medium-emphasis">操作地址</span>
            <span class="break-all">{{ info.operIp || '-' }}</span>
          </div>
          <div class="flex gap-2">
            <span class="w-24 shrink-0 text-medium-emphasis">操作地点</span>
            <span class="break-all">{{ info.operLocation || '-' }}</span>
          </div>
          <div class="flex gap-2 sm:col-span-2">
            <span class="w-24 shrink-0 text-medium-emphasis">请求信息</span>
            <span class="break-all">{{ info.requestMethod }} {{ info.operUrl }}</span>
          </div>
          <div class="flex gap-2 sm:col-span-2">
            <span class="w-24 shrink-0 text-medium-emphasis">操作方法</span>
            <span class="break-all">{{ info.method || '-' }}</span>
          </div>
          <div class="flex gap-2 sm:col-span-2">
            <span class="w-24 shrink-0 text-medium-emphasis">操作时间</span>
            <span>{{ parseTime(info.operTime) }}</span>
          </div>
          <div v-if="info.status === 1" class="flex gap-2 sm:col-span-2">
            <span class="w-24 shrink-0 text-medium-emphasis">异常信息</span>
            <span class="break-all text-error">{{ info.errorMsg || '-' }}</span>
          </div>
          <div class="sm:col-span-2">
            <div class="mb-1 text-medium-emphasis">请求参数</div>
            <pre
              class="max-h-240 overflow-auto rounded border border-solid border-gray-200 bg-gray-50 p-2 text-xs dark:border-gray-700 dark:bg-gray-800"
              >{{ paramsJson }}</pre>
          </div>
          <div class="sm:col-span-2">
            <div class="mb-1 text-medium-emphasis">返回参数</div>
            <pre
              class="max-h-240 overflow-auto rounded border border-solid border-gray-200 bg-gray-50 p-2 text-xs dark:border-gray-700 dark:bg-gray-800"
              >{{ resultJson }}</pre>
          </div>
        </div>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="visible = false">关闭</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped></style>
