<script setup lang="ts">
import { ref } from 'vue';
import TableHeaderOperation from '@/components/advanced/table-header-operation.vue';
import { useAuth } from '@/hooks/business/auth';
import { useRuoYiTable } from '@/hooks/common/ruoyi-table';
import type { TableColumn } from '@/hooks/common/table';
import { forceLogout, listOnline } from '@/service/api/ruoyi/monitor/online';
import type { OnlineQuery, OnlineVO } from '@/service/api/ruoyi/monitor/types';
import { parseTime } from '@/utils/ruoyi';

defineOptions({
  name: 'MonitorOnline'
});

const { hasAuth } = useAuth();

/** 在线用户查询参数 */
const query = ref<OnlineQuery>({
  pageNum: 1,
  pageSize: 10,
  ipaddr: '',
  userName: ''
});

/**
 * 在线用户列表接口一次性返回全部在线会话（后端未做分页），
 * 这里按当前分页参数在客户端切片，保证分页展示与总数正确。
 */
async function listOnlinePaged(params: OnlineQuery) {
  const { data: page, error } = await listOnline({ ...params });

  const rows = page?.rows ?? [];
  const start = (params.pageNum - 1) * params.pageSize;

  return {
    data: {
      rows: rows.slice(start, start + params.pageSize),
      total: rows.length
    },
    error
  };
}

const { data, loading, pagination, columnChecks, columns, checkedRowKeys, getData, handleQuery } = useRuoYiTable<
  OnlineVO,
  OnlineQuery
>({
  api: listOnlinePaged,
  query,
  showSelect: true,
  columns: (): TableColumn[] => [
    { key: 'index', title: '序号', align: 'center', width: 70, sortable: false },
    { key: 'tokenId', title: '会话编号', align: 'center', minWidth: 260, sortable: false },
    { key: 'userName', title: '登录名称', align: 'center', minWidth: 110, sortable: false },
    { key: 'deptName', title: '部门名称', align: 'center', minWidth: 130, sortable: false },
    { key: 'ipaddr', title: '主机', align: 'center', minWidth: 130, sortable: false },
    { key: 'loginLocation', title: '登录地点', align: 'center', minWidth: 120, sortable: false },
    { key: 'browser', title: '浏览器', align: 'center', minWidth: 110, sortable: false },
    { key: 'os', title: '操作系统', align: 'center', minWidth: 110, sortable: false },
    { key: 'loginTime', title: '登录时间', align: 'center', width: 170, sortable: false },
    { key: 'actions', title: '操作', align: 'center', width: 100, sortable: false, fixed: 'end' }
  ]
});

/* ------------------------------ 查询与重置 ------------------------------ */

async function handleSearch() {
  await handleQuery();
}

async function handleReset() {
  query.value.ipaddr = '';
  query.value.userName = '';
  checkedRowKeys.value = [];

  await handleSearch();
}

/* ------------------------------ 强退 ------------------------------ */

const logoutVisible = ref(false);
const logoutTokenIds = ref<string[]>([]);
const loggingOut = ref(false);

function handleForceLogout(row: OnlineVO) {
  logoutTokenIds.value = [row.tokenId];
  logoutVisible.value = true;
}

function handleBatchForceLogout() {
  logoutTokenIds.value = checkedRowKeys.value.map(tokenId => String(tokenId));

  if (!logoutTokenIds.value.length) {
    window.$message?.warning('请选择要强退的在线用户');
    return;
  }

  logoutVisible.value = true;
}

async function confirmForceLogout() {
  loggingOut.value = true;

  const results = await Promise.all(logoutTokenIds.value.map(tokenId => forceLogout(tokenId)));

  loggingOut.value = false;

  if (results.some(result => result.error)) {
    return;
  }

  window.$message?.success('强退成功');
  logoutVisible.value = false;
  logoutTokenIds.value = [];
  checkedRowKeys.value = [];
  await getData();
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
            <div class="flex items-center justify-end gap-2 sm:col-span-2 lg:col-span-2">
              <VBtn variant="text" prepend-icon="mdi-refresh" @click="handleReset">重置</VBtn>
              <VBtn color="primary" variant="outlined" prepend-icon="mdi-magnify" @click="handleSearch">搜索</VBtn>
            </div>
          </div>
        </VForm>
      </VCardText>
    </VCard>

    <VCard class="card-wrapper flex min-h-0 flex-1 flex-col">
      <VCardTitle class="flex shrink-0 flex-wrap items-center justify-between gap-2">
        <span>在线用户（共 {{ pagination.total }} 个会话）</span>
        <TableHeaderOperation v-model:columns="columnChecks" :loading="loading" @refresh="getData">
          <template #default>
            <VBtn
              v-if="hasAuth('monitor:online:batchLogout')"
              size="small"
              variant="outlined"
              color="error"
              prepend-icon="mdi-logout"
              :disabled="checkedRowKeys.length === 0"
              @click="handleBatchForceLogout"
            >
              批量强退
            </VBtn>
          </template>
          <template #prefix></template>
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
          item-value="tokenId"
          class="manage-data-table"
          fixed-header
        >
          <template #item.index="{ index }">{{ index + 1 }}</template>
          <template #item.tokenId="{ item }">
            <span class="block truncate" style="max-width: 320px" :title="item.tokenId">{{ item.tokenId }}</span>
          </template>
          <template #item.loginTime="{ item }">
            {{ parseTime(item.loginTime) }}
          </template>
          <template #item.actions="{ item }">
            <div class="flex items-center justify-center whitespace-nowrap">
              <VBtn
                v-if="hasAuth('monitor:online:forceLogout')"
                size="small"
                variant="text"
                color="error"
                @click="handleForceLogout(item)"
              >
                强退
              </VBtn>
            </div>
          </template>
        </VDataTableServer>
      </div>
    </VCard>

    <!-- 强退确认 -->
    <VDialog v-model="logoutVisible" max-width="440">
      <VCard>
        <VCardTitle>系统提示</VCardTitle>
        <VCardText>是否确认强退选中的 {{ logoutTokenIds.length }} 个在线会话？</VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn variant="text" @click="logoutVisible = false">取消</VBtn>
          <VBtn :loading="loggingOut" color="error" variant="flat" @click="confirmForceLogout">确定</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<style scoped></style>
