<script setup lang="ts">
import { computed, ref } from 'vue';
import TableHeaderOperation from '@/components/advanced/table-header-operation.vue';
import DictTag from '@/components/common/dict-tag.vue';
import { useAuth } from '@/hooks/business/auth';
import { toSelectItems, useDict } from '@/hooks/business/dict';
import { useRuoYiTable } from '@/hooks/common/ruoyi-table';
import type { TableColumn } from '@/hooks/common/table';
import { cleanLoginInfo, delLoginInfo, listLoginInfo, unlockLoginInfo } from '@/service/api/ruoyi/monitor/logininfo';
import type { LoginInfoQuery, LoginInfoVO } from '@/service/api/ruoyi/monitor/types';
import { download } from '@/utils/download';
import { addDateRange, parseTime } from '@/utils/ruoyi';

defineOptions({
  name: 'MonitorLoginInfo'
});

const { hasAuth } = useAuth();

const dict = useDict('sys_common_status');

/** 登录日志查询参数 */
const query = ref<LoginInfoQuery>({
  pageNum: 1,
  pageSize: 10,
  ipaddr: '',
  userName: '',
  status: '',
  orderByColumn: 'loginTime',
  isAsc: 'descending'
});

/** 登录时间范围 */
const beginTime = ref('');
const endTime = ref('');

function dateRangeParams() {
  return [
    beginTime.value ? `${beginTime.value} 00:00:00` : undefined,
    endTime.value ? `${endTime.value} 23:59:59` : undefined
  ];
}

/** 附带登录时间范围的登录日志列表查询 */
function listLoginInfoWithRange(params: LoginInfoQuery) {
  const searchParams: Record<string, any> = { ...params };

  addDateRange(searchParams, dateRangeParams());

  return listLoginInfo(searchParams as LoginInfoQuery);
}

const { data, loading, pagination, columnChecks, columns, checkedRowKeys, getData, handleQuery } = useRuoYiTable<
  LoginInfoVO,
  LoginInfoQuery
>({
  api: listLoginInfoWithRange,
  query,
  showSelect: true,
  columns: (): TableColumn[] => [
    { key: 'index', title: '序号', align: 'center', width: 70, sortable: false },
    { key: 'infoId', title: '访问编号', align: 'center', minWidth: 100, sortable: false },
    { key: 'userName', title: '用户名称', align: 'center', minWidth: 110, sortable: false },
    { key: 'ipaddr', title: '登录地址', align: 'center', minWidth: 130, sortable: false },
    { key: 'loginLocation', title: '登录地点', align: 'center', minWidth: 120, sortable: false },
    { key: 'browser', title: '浏览器', align: 'center', minWidth: 110, sortable: false },
    { key: 'os', title: '操作系统', align: 'center', minWidth: 110, sortable: false },
    { key: 'status', title: '登录状态', align: 'center', width: 100, sortable: false },
    { key: 'msg', title: '操作信息', align: 'center', minWidth: 150, sortable: false },
    { key: 'loginTime', title: '登录日期', align: 'center', width: 170, sortable: false }
  ]
});

const statusItems = computed(() => toSelectItems(dict.sys_common_status));

/** 选中的登录日志对应的用户名（后端解锁接口按用户名操作） */
const selectedUserNames = computed(() =>
  data.value.filter(item => checkedRowKeys.value.includes(item.infoId)).map(item => item.userName)
);

/* ------------------------------ 查询与重置 ------------------------------ */

async function handleSearch() {
  await handleQuery();
}

async function handleReset() {
  query.value.ipaddr = '';
  query.value.userName = '';
  query.value.status = '';
  beginTime.value = '';
  endTime.value = '';
  checkedRowKeys.value = [];

  await handleSearch();
}

/* ------------------------------ 删除 ------------------------------ */

const deleteVisible = ref(false);
const deleteIds = ref<Array<string | number>>([]);
const deleting = ref(false);

const deleteTip = computed(() => `是否确认删除访问编号为"${deleteIds.value.join(',')}"的数据项？`);

function handleDelete() {
  deleteIds.value = [...checkedRowKeys.value];

  if (!deleteIds.value.length) {
    window.$message?.warning('请选择要删除的登录日志');
    return;
  }

  deleteVisible.value = true;
}

async function confirmDelete() {
  deleting.value = true;

  const { error } = await delLoginInfo(deleteIds.value);

  deleting.value = false;

  if (!error) {
    window.$message?.success('删除成功');
    deleteVisible.value = false;
    deleteIds.value = [];
    checkedRowKeys.value = [];
    await getData();
  }
}

/* ------------------------------ 清空 ------------------------------ */

const cleanVisible = ref(false);
const cleaning = ref(false);

async function confirmClean() {
  cleaning.value = true;

  const { error } = await cleanLoginInfo();

  cleaning.value = false;

  if (!error) {
    window.$message?.success('清空成功');
    cleanVisible.value = false;
    checkedRowKeys.value = [];
    await getData();
  }
}

/* ------------------------------ 解锁 ------------------------------ */

const unlockVisible = ref(false);
const unlocking = ref(false);

const unlockTip = computed(() => `是否确认解锁用户"${selectedUserNames.value.join(',')}"？`);

function handleUnlock() {
  if (!selectedUserNames.value.length) {
    window.$message?.warning('请选择要解锁的用户');
    return;
  }

  unlockVisible.value = true;
}

async function confirmUnlock() {
  unlocking.value = true;

  const results = await Promise.all(selectedUserNames.value.map(userName => unlockLoginInfo(userName)));

  unlocking.value = false;

  if (results.some(result => result.error)) {
    return;
  }

  window.$message?.success(`用户${selectedUserNames.value.join(',')}解锁成功`);
  unlockVisible.value = false;
  checkedRowKeys.value = [];
  await getData();
}

/* ------------------------------ 导出 ------------------------------ */

function handleExport() {
  const searchParams: Record<string, any> = { ...query.value };

  delete searchParams.params;

  if (beginTime.value) {
    searchParams['params[beginTime]'] = `${beginTime.value} 00:00:00`;
  }

  if (endTime.value) {
    searchParams['params[endTime]'] = `${endTime.value} 23:59:59`;
  }

  download('monitor/loginInfo/export', searchParams, `logininfo_${Date.now()}.xlsx`);
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col gap-4">
    <VCard class="card-wrapper shrink-0">
      <VCardText class="py-3">
        <VForm @submit.prevent="handleSearch">
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <VTextField
              v-model="query.ipaddr"
              label="登录地址"
              placeholder="请输入登录地址"
              density="compact"
              variant="outlined"
              clearable
              hide-details="auto"
            />
            <VTextField
              v-model="query.userName"
              label="用户名称"
              placeholder="请输入用户名称"
              density="compact"
              variant="outlined"
              clearable
              hide-details="auto"
            />
            <VSelect
              v-model="query.status"
              label="登录状态"
              placeholder="请选择登录状态"
              :items="statusItems"
              density="compact"
              variant="outlined"
              clearable
              hide-details="auto"
            />
            <VTextField
              v-model="beginTime"
              label="登录时间（开始）"
              type="date"
              density="compact"
              variant="outlined"
              clearable
              hide-details="auto"
            />
            <VTextField
              v-model="endTime"
              label="登录时间（结束）"
              type="date"
              density="compact"
              variant="outlined"
              clearable
              hide-details="auto"
            />
            <div class="flex items-center justify-end gap-2 sm:col-span-2 lg:col-span-3">
              <VBtn variant="text" prepend-icon="mdi-refresh" @click="handleReset">重置</VBtn>
              <VBtn color="primary" variant="outlined" prepend-icon="mdi-magnify" @click="handleSearch">搜索</VBtn>
            </div>
          </div>
        </VForm>
      </VCardText>
    </VCard>

    <VCard class="card-wrapper flex min-h-0 flex-1 flex-col">
      <VCardTitle class="flex shrink-0 flex-wrap items-center justify-between gap-2">
        <span>登录日志（共 {{ pagination.total }} 条）</span>
        <TableHeaderOperation v-model:columns="columnChecks" :loading="loading" @refresh="getData">
          <template #default>
            <VBtn
              v-if="hasAuth('monitor:logininfo:remove')"
              size="small"
              variant="outlined"
              color="error"
              prepend-icon="mdi-delete"
              :disabled="checkedRowKeys.length === 0"
              @click="handleDelete"
            >
              删除
            </VBtn>
            <VBtn
              v-if="hasAuth('monitor:logininfo:remove')"
              size="small"
              variant="outlined"
              color="warning"
              prepend-icon="mdi-broom"
              @click="cleanVisible = true"
            >
              清空
            </VBtn>
            <VBtn
              v-if="hasAuth('monitor:logininfo:unlock')"
              size="small"
              variant="outlined"
              color="primary"
              prepend-icon="mdi-lock-open-variant"
              :disabled="checkedRowKeys.length === 0"
              @click="handleUnlock"
            >
              解锁
            </VBtn>
          </template>
          <template #prefix>
            <VBtn
              v-if="hasAuth('monitor:logininfo:export')"
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
          item-value="infoId"
          class="manage-data-table"
          fixed-header
        >
          <template #item.index="{ index }">{{ index + 1 }}</template>
          <template #item.status="{ item }">
            <DictTag :options="dict.sys_common_status" :value="item.status" />
          </template>
          <template #item.msg="{ item }">
            <span class="block truncate" style="max-width: 240px" :title="item.msg">{{ item.msg || '-' }}</span>
          </template>
          <template #item.loginTime="{ item }">
            {{ parseTime(item.loginTime) }}
          </template>
        </VDataTableServer>
      </div>
    </VCard>

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
        <VCardText>是否确认清空所有登录日志数据项？</VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn variant="text" @click="cleanVisible = false">取消</VBtn>
          <VBtn :loading="cleaning" color="error" variant="flat" @click="confirmClean">确定</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- 解锁确认 -->
    <VDialog v-model="unlockVisible" max-width="420">
      <VCard>
        <VCardTitle>系统提示</VCardTitle>
        <VCardText>{{ unlockTip }}</VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn variant="text" @click="unlockVisible = false">取消</VBtn>
          <VBtn :loading="unlocking" color="primary" variant="flat" @click="confirmUnlock">确定</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<style scoped></style>
