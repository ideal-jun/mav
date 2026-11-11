<script setup lang="ts">
import { computed, ref } from 'vue';
import TableHeaderOperation from '@/components/advanced/table-header-operation.vue';
import DictTag from '@/components/common/dict-tag.vue';
import { useAuth } from '@/hooks/business/auth';
import { toSelectItems, useDict } from '@/hooks/business/dict';
import { useRuoYiTable } from '@/hooks/common/ruoyi-table';
import type { TableColumn } from '@/hooks/common/table';
import { cleanOperlog, delOperlog, listOperLog } from '@/service/api/ruoyi/monitor/operlog';
import type { OperLogQuery, OperLogVO } from '@/service/api/ruoyi/monitor/types';
import { download } from '@/utils/download';
import { addDateRange, formatFilterDate, parseTime } from '@/utils/ruoyi';
import OperInfoDialog from './modules/oper-info-dialog.vue';

defineOptions({
  name: 'MonitorOperlog'
});

const { hasAuth } = useAuth();

const dict = useDict('sys_oper_type', 'sys_common_status');

/** 操作日志查询参数 */
const query = ref<OperLogQuery>({
  pageNum: 1,
  pageSize: 10,
  operIp: '',
  title: '',
  operName: '',
  userId: '',
  deptId: '',
  clientKey: '',
  deviceType: '',
  browser: '',
  os: '',
  businessType: '',
  status: '',
  orderByColumn: 'operTime',
  isAsc: 'descending'
});

/** 操作时间范围 */
const beginTime = ref<Date | null>(null);
const endTime = ref<Date | null>(null);

function dateRangeParams() {
  const begin = formatFilterDate(beginTime.value);
  const end = formatFilterDate(endTime.value);

  return [begin ? `${begin} 00:00:00` : undefined, end ? `${end} 23:59:59` : undefined];
}

/** 附带操作时间范围的操作日志列表查询 */
function listOperLogWithRange(params: OperLogQuery) {
  const searchParams: Record<string, any> = { ...params };

  addDateRange(searchParams, dateRangeParams());

  return listOperLog(searchParams as OperLogQuery);
}

const { data, loading, pagination, columnChecks, columns, checkedRowKeys, getData, handleQuery } = useRuoYiTable<
  OperLogVO,
  OperLogQuery
>({
  api: listOperLogWithRange,
  query,
  showSelect: true,
  columns: (): TableColumn[] => [
    { key: 'index', title: '序号', align: 'center', width: 70, sortable: false },
    { key: 'operId', title: '日志编号', align: 'center', minWidth: 100, sortable: false },
    { key: 'title', title: '系统模块', align: 'center', minWidth: 120, sortable: false },
    { key: 'businessType', title: '操作类型', align: 'center', width: 100, sortable: false },
    { key: 'requestMethod', title: '请求方式', align: 'center', width: 100, sortable: false },
    { key: 'operName', title: '操作人员', align: 'center', minWidth: 110, sortable: false },
    { key: 'deptName', title: '部门', align: 'center', minWidth: 120, sortable: false },
    { key: 'operIp', title: '操作地址', align: 'center', minWidth: 130, sortable: false },
    { key: 'status', title: '操作状态', align: 'center', width: 100, sortable: false },
    { key: 'operTime', title: '操作日期', align: 'center', width: 170, sortable: false },
    { key: 'costTime', title: '耗时', align: 'center', width: 100, sortable: false },
    { key: 'actions', title: '操作', align: 'center', width: 90, sortable: false, fixed: 'end' }
  ]
});

const businessTypeItems = computed(() => toSelectItems(dict.sys_oper_type));
const statusItems = computed(() => toSelectItems(dict.sys_common_status));

/* ------------------------------ 查询与重置 ------------------------------ */

async function handleSearch() {
  await handleQuery();
}

async function handleReset() {
  query.value.operIp = '';
  query.value.title = '';
  query.value.operName = '';
  query.value.businessType = '';
  query.value.status = '';
  beginTime.value = null;
  endTime.value = null;
  checkedRowKeys.value = [];

  await handleSearch();
}

/* ------------------------------ 详情 ------------------------------ */

const infoVisible = ref(false);
const infoRow = ref<OperLogVO | null>(null);

function handleView(row: OperLogVO) {
  infoRow.value = row;
  infoVisible.value = true;
}

/* ------------------------------ 删除 / 清空 ------------------------------ */

const deleteVisible = ref(false);
const deleteIds = ref<Array<string | number>>([]);
const deleting = ref(false);

const deleteTip = computed(() => `是否确认删除日志编号为"${deleteIds.value.join(',')}"的数据项？`);

function handleDelete(row?: OperLogVO) {
  deleteIds.value = row ? [row.operId] : [...checkedRowKeys.value];

  if (!deleteIds.value.length) {
    window.$message?.warning('请选择要删除的操作日志');
    return;
  }

  deleteVisible.value = true;
}

async function confirmDelete() {
  deleting.value = true;

  const { error } = await delOperlog(deleteIds.value);

  deleting.value = false;

  if (!error) {
    window.$message?.success('删除成功');
    deleteVisible.value = false;
    deleteIds.value = [];
    checkedRowKeys.value = [];
    await getData();
  }
}

const cleanVisible = ref(false);
const cleaning = ref(false);

function handleClean() {
  cleanVisible.value = true;
}

async function confirmClean() {
  cleaning.value = true;

  const { error } = await cleanOperlog();

  cleaning.value = false;

  if (!error) {
    window.$message?.success('清空成功');
    cleanVisible.value = false;
    checkedRowKeys.value = [];
    await getData();
  }
}

/* ------------------------------ 导出 ------------------------------ */

function handleExport() {
  const searchParams: Record<string, any> = { ...query.value };

  delete searchParams.params;

  const begin = formatFilterDate(beginTime.value);
  const end = formatFilterDate(endTime.value);

  if (begin) {
    searchParams['params[beginTime]'] = `${begin} 00:00:00`;
  }

  if (end) {
    searchParams['params[endTime]'] = `${end} 23:59:59`;
  }

  download('monitor/operlog/export', searchParams, `operlog_${Date.now()}.xlsx`);
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col gap-4">
    <VCard class="card-wrapper shrink-0">
      <VCardText class="py-3">
        <VForm @submit.prevent="handleSearch">
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <VTextField
              v-model="query.title"
              label="系统模块"
              placeholder="请输入系统模块"
              density="compact"
              variant="outlined"
              clearable
              hide-details="auto"
            />
            <VSelect
              v-model="query.businessType"
              label="操作类型"
              placeholder="请选择操作类型"
              :items="businessTypeItems"
              density="compact"
              variant="outlined"
              clearable
              hide-details="auto"
            />
            <VTextField
              v-model="query.operName"
              label="操作人员"
              placeholder="请输入操作人员"
              density="compact"
              variant="outlined"
              clearable
              hide-details="auto"
            />
            <VSelect
              v-model="query.status"
              label="操作状态"
              placeholder="请选择操作状态"
              :items="statusItems"
              density="compact"
              variant="outlined"
              clearable
              hide-details="auto"
            />
            <VTextField
              v-model="query.operIp"
              label="操作地址"
              placeholder="请输入操作地址"
              density="compact"
              variant="outlined"
              clearable
              hide-details="auto"
            />
            <VDateInput
              v-model="beginTime"
              label="操作时间（开始）"
              density="compact"
              variant="outlined"
              clearable
              hide-details="auto"
            />
            <VDateInput
              v-model="endTime"
              label="操作时间（结束）"
              density="compact"
              variant="outlined"
              clearable
              hide-details="auto"
            />
            <div class="flex items-center justify-end gap-2">
              <VBtn variant="text" prepend-icon="mdi-refresh" @click="handleReset">重置</VBtn>
              <VBtn color="primary" variant="outlined" prepend-icon="mdi-magnify" @click="handleSearch">搜索</VBtn>
            </div>
          </div>
        </VForm>
      </VCardText>
    </VCard>

    <VCard class="card-wrapper flex min-h-0 flex-1 flex-col">
      <VCardTitle class="flex shrink-0 flex-wrap items-center justify-between gap-2">
        <span>操作日志（共 {{ pagination.total }} 条）</span>
        <TableHeaderOperation v-model:columns="columnChecks" :loading="loading" @refresh="getData">
          <template #default>
            <VBtn
              v-if="hasAuth('monitor:operlog:remove')"
              size="small"
              variant="outlined"
              color="error"
              prepend-icon="mdi-delete"
              :disabled="checkedRowKeys.length === 0"
              @click="handleDelete()"
            >
              删除
            </VBtn>
            <VBtn
              v-if="hasAuth('monitor:operlog:remove')"
              size="small"
              variant="outlined"
              color="warning"
              prepend-icon="mdi-broom"
              @click="handleClean"
            >
              清空
            </VBtn>
          </template>
          <template #prefix>
            <VBtn
              v-if="hasAuth('monitor:operlog:export')"
              size="small"
              variant="outlined"
              color="success"
              prepend-icon="mdi-export"
              @click="handleExport"
            >
              导出
            </VBtn>
          </template>
        </TableHeaderOperation>
      </VCardTitle>
      <div class="min-h-0 flex-1">
        <VDataTableServer
          v-model:page="pagination.page"
          v-model:items-per-page="pagination.pageSize"
          v-model="checkedRowKeys"
          :headers="columns"
          :items="data"
          :items-length="pagination.total"
          :items-per-page-options="[10, 20, 50, 100]"
          :loading="loading"
          :show-select="true"
          item-value="operId"
          class="manage-data-table"
          fixed-header
        >
          <template #item.index="{ index }">{{ index + 1 }}</template>
          <template #item.businessType="{ item }">
            <DictTag :options="dict.sys_oper_type" :value="item.businessType" />
          </template>
          <template #item.status="{ item }">
            <DictTag :options="dict.sys_common_status" :value="item.status" />
          </template>
          <template #item.operTime="{ item }">
            {{ parseTime(item.operTime) }}
          </template>
          <template #item.costTime="{ item }">{{ item.costTime }}毫秒</template>
          <template #item.actions="{ item }">
            <div class="flex items-center justify-center whitespace-nowrap">
              <VBtn
                v-if="hasAuth('monitor:operlog:query')"
                size="small"
                variant="text"
                color="primary"
                prepend-icon="mdi-eye"
                @click="handleView(item)"
              >
                详情
              </VBtn>
            </div>
          </template>
        </VDataTableServer>
      </div>
    </VCard>

    <!-- 操作日志详细 -->
    <OperInfoDialog v-model="infoVisible" :info="infoRow" />

    <!-- 删除确认 -->
    <VDialog v-model="deleteVisible" max-width="420">
      <VCard>
        <VCardTitle>系统提示</VCardTitle>
        <VCardText>{{ deleteTip }}</VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn variant="text" @click="deleteVisible = false">取消</VBtn>
          <VBtn :loading="deleting" color="error" variant="flat" @click="confirmDelete">确定</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- 清空确认 -->
    <VDialog v-model="cleanVisible" max-width="420">
      <VCard>
        <VCardTitle>系统提示</VCardTitle>
        <VCardText>是否确认清空所有操作日志数据项？</VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn variant="text" @click="cleanVisible = false">取消</VBtn>
          <VBtn :loading="cleaning" color="error" variant="flat" @click="confirmClean">确定</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<style scoped></style>
