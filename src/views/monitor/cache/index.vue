<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { getCache } from '@/service/api/ruoyi/monitor/cache';
import type { CacheVO } from '@/service/api/ruoyi/monitor/types';

defineOptions({
  name: 'MonitorCache'
});

const loading = ref(false);

const cache = ref<Partial<CacheVO>>({});

/** 缓存 info 键值对 */
const info = computed<Record<string, string>>(() => cache.value.info ?? {});

async function getData() {
  loading.value = true;

  const { data: result, error } = await getCache();

  loading.value = false;

  if (!error && result) {
    cache.value = result;
  }
}

/** 读取 info 字段，缺失时展示 - */
function infoValue(key: string) {
  const value = info.value[key];

  return value === undefined || value === null || value === '' ? '-' : value;
}

/** 读取数字型 info 字段并保留两位小数 */
function infoNumber(key: string) {
  const value = Number.parseFloat(info.value[key] ?? '');

  return Number.isNaN(value) ? '-' : value.toFixed(2);
}

/** 概览信息 */
const overviewItems = computed(() => [
  { label: 'Redis版本', value: infoValue('redis_version') },
  { label: '运行模式', value: !info.value.redis_mode ? '-' : info.value.redis_mode === 'standalone' ? '单机' : '集群' },
  { label: '端口', value: infoValue('tcp_port') },
  { label: '客户端数', value: infoValue('connected_clients') },
  { label: '运行时间(天)', value: infoValue('uptime_in_days') },
  { label: '使用内存', value: infoValue('used_memory_human') },
  { label: '使用CPU', value: infoNumber('used_cpu_user_children') },
  { label: '内存配置', value: infoValue('maxmemory_human') },
  {
    label: 'AOF是否开启',
    value: info.value.aof_enabled === undefined ? '-' : info.value.aof_enabled === '0' ? '否' : '是'
  },
  { label: 'RDB是否成功', value: infoValue('rdb_last_bgsave_status') },
  { label: 'Key数量', value: cache.value.dbSize === undefined ? '-' : String(cache.value.dbSize) },
  {
    label: '网络入口/出口',
    value: `${infoValue('instantaneous_input_kbps')}kps/${infoValue('instantaneous_output_kbps')}kps`
  }
]);

/** 命令统计（按调用次数倒序） */
const commandStats = computed(() =>
  [...(cache.value.commandStats ?? [])]
    .map(item => ({ name: item.name, value: Number(item.value) || 0 }))
    .sort((a, b) => b.value - a.value)
);

const commandHeaders = [
  { key: 'name', title: '命令', align: 'start' as const },
  { key: 'value', title: '调用次数', align: 'end' as const, width: 140 }
];

/** 内存信息 */
const memoryItems = computed(() => [
  { name: '已用内存', value: infoValue('used_memory_human') },
  { name: '峰值内存', value: infoValue('used_memory_peak_human') },
  { name: '内存碎片率', value: infoValue('mem_fragmentation_ratio') },
  { name: '最大内存', value: infoValue('maxmemory_human') },
  { name: '淘汰策略', value: infoValue('maxmemory_policy') },
  { name: '系统总内存', value: infoValue('total_system_memory_human') },
  { name: '使用CPU', value: infoNumber('used_cpu_user_children') },
  { name: 'Key数量', value: cache.value.dbSize === undefined ? '-' : String(cache.value.dbSize) }
]);

const memoryHeaders = [
  { key: 'name', title: '指标', align: 'start' as const },
  { key: 'value', title: '数值', align: 'end' as const, width: 200 }
];

/** 已用内存占最大内存的百分比 */
const memoryPercent = computed(() => {
  const used = Number(info.value.used_memory);
  const max = Number(info.value.maxmemory);

  if (!used || !max || Number.isNaN(used) || Number.isNaN(max)) {
    return null;
  }

  return Math.min(100, Math.round((used / max) * 100));
});

/** 完整缓存信息 */
const completeInfo = computed(() =>
  Object.keys(info.value)
    .sort()
    .map(key => ({ key, value: info.value[key] }))
);

const completeHeaders = [
  { key: 'key', title: '配置项', align: 'start' as const, width: 280 },
  { key: 'value', title: '值', align: 'start' as const }
];

onMounted(() => {
  getData();
});
</script>

<template>
  <div class="flex h-full min-h-0 flex-col gap-4">
    <div class="min-h-0 flex-1 overflow-y-auto">
      <div class="flex flex-col gap-4">
        <!-- 缓存概览 -->
        <VCard class="card-wrapper" :loading="loading">
          <VCardTitle class="flex flex-wrap items-center justify-between gap-2">
            <span>缓存概览</span>
            <VBtn size="small" variant="text" prepend-icon="mdi-refresh" @click="getData">刷新</VBtn>
          </VCardTitle>
          <VCardText>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div
                v-for="item in overviewItems"
                :key="item.label"
                class="rounded border border-solid border-gray-200 pa-3 dark:border-gray-700"
              >
                <div class="text-xs text-medium-emphasis">{{ item.label }}</div>
                <div class="mt-1 break-all text-lg font-medium">{{ item.value }}</div>
              </div>
            </div>
          </VCardText>
        </VCard>

        <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <!-- 命令统计 -->
          <VCard class="card-wrapper">
            <VCardTitle>命令统计</VCardTitle>
            <VCardText class="pt-0">
              <VDataTable
                :headers="commandHeaders"
                :items="commandStats"
                item-value="name"
                density="compact"
                :items-per-page="10"
                class="manage-data-table"
              />
            </VCardText>
          </VCard>

          <!-- 内存信息 -->
          <VCard class="card-wrapper">
            <VCardTitle>内存信息</VCardTitle>
            <VCardText class="pt-0">
              <div v-if="memoryPercent !== null" class="mb-3">
                <div class="mb-1 flex items-center justify-between text-xs text-medium-emphasis">
                  <span>内存使用率</span>
                  <span>{{ memoryPercent }}%</span>
                </div>
                <VProgressLinear :model-value="memoryPercent" color="primary" height="8" rounded />
              </div>
              <VDataTable
                :headers="memoryHeaders"
                :items="memoryItems"
                item-value="name"
                density="compact"
                hide-default-footer
                :items-per-page="-1"
                class="manage-data-table"
              />
            </VCardText>
          </VCard>
        </div>

        <!-- 完整缓存信息 -->
        <VCard class="card-wrapper">
          <VExpansionPanels variant="accordion">
            <VExpansionPanel title="完整缓存信息" eager>
              <VExpansionPanelText>
                <VDataTable
                  :headers="completeHeaders"
                  :items="completeInfo"
                  item-value="key"
                  density="compact"
                  :items-per-page="15"
                  class="manage-data-table"
                />
              </VExpansionPanelText>
            </VExpansionPanel>
          </VExpansionPanels>
        </VCard>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
