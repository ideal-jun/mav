<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DictTag from '@/components/common/dict-tag.vue';
import { useAuth } from '@/hooks/business/auth';
import { useDict } from '@/hooks/business/dict';
import { useRuoYiTable } from '@/hooks/common/ruoyi-table';
import type { TableColumn } from '@/hooks/common/table';
import {
  allocatedUserList,
  authUserCancel,
  authUserCancelAll,
  authUserSelectAll,
  unallocatedUserList
} from '@/service/api/ruoyi/system/role';
import type { UserQuery, UserVO } from '@/service/api/ruoyi/system/user/types';
import { parseTime } from '@/utils/ruoyi';

defineOptions({
  name: 'SystemRoleAuthUser'
});

const route = useRoute();

const router = useRouter();

const { hasAuth } = useAuth();

const dict = useDict('sys_normal_disable');

/** the role id of the route params, e.g. /system/role-auth/user/:roleId */
const roleId = computed(() => String(route.params.roleId ?? ''));

const tab = ref('allocated');

function createQuery(): UserQuery {
  return {
    pageNum: 1,
    pageSize: 10,
    roleId: roleId.value,
    userName: '',
    phoneNumber: ''
  };
}

const allocatedQuery = ref<UserQuery>(createQuery());

const unallocatedQuery = ref<UserQuery>(createQuery());

function userColumns(): TableColumn[] {
  return [
    { key: 'index', title: '序号', align: 'center', width: 70, sortable: false },
    { key: 'userName', title: '用户名称', align: 'center', minWidth: 130 },
    { key: 'nickName', title: '用户昵称', align: 'center', minWidth: 130 },
    { key: 'email', title: '邮箱', align: 'center', minWidth: 180 },
    { key: 'phoneNumber', title: '手机', align: 'center', minWidth: 130 },
    { key: 'status', title: '状态', align: 'center', width: 100, sortable: false },
    { key: 'createTime', title: '创建时间', align: 'center', width: 170, sortable: false },
    { key: 'actions', title: '操作', align: 'center', width: 140, sortable: false }
  ];
}

const {
  data: allocatedData,
  loading: allocatedLoading,
  pagination: allocatedPagination,
  columns: allocatedColumns,
  checkedRowKeys: allocatedCheckedRowKeys,
  getData: getAllocatedData,
  handleQuery: handleAllocatedQuery
} = useRuoYiTable<UserVO, UserQuery>({
  api: allocatedUserList,
  query: allocatedQuery,
  showSelect: true,
  columns: userColumns
});

const {
  data: unallocatedData,
  loading: unallocatedLoading,
  pagination: unallocatedPagination,
  columns: unallocatedColumns,
  checkedRowKeys: unallocatedCheckedRowKeys,
  getData: getUnallocatedData,
  handleQuery: handleUnallocatedQuery
} = useRuoYiTable<UserVO, UserQuery>({
  api: unallocatedUserList,
  query: unallocatedQuery,
  showSelect: true,
  columns: userColumns
});

/** the query params of the active tab */
const activeQuery = computed(() => (tab.value === 'allocated' ? allocatedQuery.value : unallocatedQuery.value));

/* ------------------------------ 查询与重置 ------------------------------ */

async function handleSearch() {
  if (tab.value === 'allocated') {
    await handleAllocatedQuery();
  } else {
    await handleUnallocatedQuery();
  }
}

async function handleReset() {
  activeQuery.value.userName = '';
  activeQuery.value.phoneNumber = '';

  await handleSearch();
}

async function refreshTables() {
  await Promise.all([getAllocatedData(), getUnallocatedData()]);
}

/* ------------------------------ 授权操作 ------------------------------ */

async function cancelAuthUser(row: UserVO) {
  const confirmed = await window.$dialog?.warning({
    title: '系统提示',
    positiveText: '确定',
    negativeText: '取消',
    maskClosable: false,
    content: `确认要取消该用户"${row.userName}"的角色授权吗？`
  });

  if (!confirmed) {
    return;
  }

  const { error } = await authUserCancel({ roleId: roleId.value, userId: row.userId });

  if (!error) {
    window.$message?.success('取消授权成功');
    await refreshTables();
  }
}

async function cancelAuthUserAll() {
  const userIds = [...allocatedCheckedRowKeys.value];

  if (!userIds.length) {
    window.$message?.warning('请选择要取消授权的用户');
    return;
  }

  const confirmed = await window.$dialog?.warning({
    title: '系统提示',
    positiveText: '确定',
    negativeText: '取消',
    maskClosable: false,
    content: '是否取消选中用户的授权数据项？'
  });

  if (!confirmed) {
    return;
  }

  const { error } = await authUserCancelAll({ roleId: roleId.value, userIds: userIds.join(',') });

  if (!error) {
    window.$message?.success('取消授权成功');
    allocatedCheckedRowKeys.value = [];
    await refreshTables();
  }
}

async function selectAuthUser(row: UserVO) {
  const confirmed = await window.$dialog?.warning({
    title: '系统提示',
    positiveText: '确定',
    negativeText: '取消',
    maskClosable: false,
    content: `确认要分配用户"${row.userName}"的角色吗？`
  });

  if (!confirmed) {
    return;
  }

  const { error } = await authUserSelectAll({ roleId: roleId.value, userIds: String(row.userId) });

  if (!error) {
    window.$message?.success('分配成功');
    await refreshTables();
  }
}

async function selectAuthUserAll() {
  const userIds = [...unallocatedCheckedRowKeys.value];

  if (!userIds.length) {
    window.$message?.warning('请选择要分配的用户');
    return;
  }

  const confirmed = await window.$dialog?.warning({
    title: '系统提示',
    positiveText: '确定',
    negativeText: '取消',
    maskClosable: false,
    content: '是否分配选中用户的数据项？'
  });

  if (!confirmed) {
    return;
  }

  const { error } = await authUserSelectAll({ roleId: roleId.value, userIds: userIds.join(',') });

  if (!error) {
    window.$message?.success('分配成功');
    unallocatedCheckedRowKeys.value = [];
    await refreshTables();
  }
}

/* ------------------------------ 返回 ------------------------------ */

function handleClose() {
  router.push('/system/role');
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col gap-4">
    <VCard class="card-wrapper shrink-0">
      <VCardText class="py-3">
        <VForm @submit.prevent="handleSearch">
          <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
            <VTabs v-model="tab" density="compact">
              <VTab value="allocated">已授权用户</VTab>
              <VTab value="unallocated">未授权用户</VTab>
            </VTabs>
            <div class="flex flex-wrap items-center gap-2">
              <VBtn
                v-if="tab === 'allocated' && hasAuth('system:role:edit')"
                size="small"
                variant="outlined"
                color="primary"
                prepend-icon="mdi-account-plus"
                @click="tab = 'unallocated'"
              >
                添加用户
              </VBtn>
              <VBtn
                v-if="tab === 'allocated' && hasAuth('system:role:edit')"
                size="small"
                variant="outlined"
                color="error"
                prepend-icon="mdi-account-cancel"
                :disabled="allocatedCheckedRowKeys.length === 0"
                @click="cancelAuthUserAll"
              >
                批量取消授权
              </VBtn>
              <VBtn
                v-if="tab === 'unallocated' && hasAuth('system:role:edit')"
                size="small"
                variant="outlined"
                color="primary"
                prepend-icon="mdi-account-check"
                :disabled="unallocatedCheckedRowKeys.length === 0"
                @click="selectAuthUserAll"
              >
                批量分配
              </VBtn>
              <VBtn size="small" variant="text" prepend-icon="mdi-arrow-left" @click="handleClose">关闭</VBtn>
            </div>
          </div>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <VTextField
              v-model="activeQuery.userName"
              label="用户名称"
              placeholder="请输入用户名称"
              density="compact"
              variant="outlined"
              clearable
              hide-details="auto"
            />
            <VTextField
              v-model="activeQuery.phoneNumber"
              label="手机号码"
              placeholder="请输入手机号码"
              density="compact"
              variant="outlined"
              clearable
              hide-details="auto"
            />
          </div>
          <div class="flex justify-end gap-2 pt-3">
            <VBtn variant="text" prepend-icon="mdi-refresh" @click="handleReset">重置</VBtn>
            <VBtn color="primary" variant="outlined" prepend-icon="mdi-magnify" @click="handleSearch">搜索</VBtn>
          </div>
        </VForm>
      </VCardText>
    </VCard>

    <VCard v-if="tab === 'allocated'" class="card-wrapper flex min-h-0 flex-1 flex-col">
      <VCardTitle class="flex shrink-0 flex-wrap items-center justify-between gap-2">
        <div class="flex flex-wrap items-baseline gap-2">
          <span>已授权用户</span>
          <span class="text-caption text-medium-emphasis">共 {{ allocatedPagination.total }} 条记录</span>
        </div>
      </VCardTitle>
      <div class="min-h-0 flex-1">
        <VDataTableServer
          v-model:page="allocatedPagination.page"
          v-model:items-per-page="allocatedPagination.pageSize"
          v-model="allocatedCheckedRowKeys"
          :headers="allocatedColumns"
          :items="allocatedData"
          :items-length="allocatedPagination.total"
          :items-per-page-options="[10, 20, 50, 100]"
          :loading="allocatedLoading"
          :show-select="true"
          item-value="userId"
          class="manage-data-table"
          fixed-header
        >
          <template #item.index="{ index }">{{ index + 1 }}</template>
          <template #item.status="{ item }">
            <DictTag :options="dict.sys_normal_disable" :value="item.status" />
          </template>
          <template #item.createTime="{ item }">
            {{ parseTime(item.createTime) }}
          </template>
          <template #item.actions="{ item }">
            <VBtn
              v-if="hasAuth('system:role:edit')"
              size="small"
              variant="text"
              color="error"
              @click="cancelAuthUser(item)"
            >
              取消授权
            </VBtn>
          </template>
        </VDataTableServer>
      </div>
    </VCard>

    <VCard v-else class="card-wrapper flex min-h-0 flex-1 flex-col">
      <VCardTitle class="flex shrink-0 flex-wrap items-center justify-between gap-2">
        <div class="flex flex-wrap items-baseline gap-2">
          <span>未授权用户</span>
          <span class="text-caption text-medium-emphasis">共 {{ unallocatedPagination.total }} 条记录</span>
        </div>
      </VCardTitle>
      <div class="min-h-0 flex-1">
        <VDataTableServer
          v-model:page="unallocatedPagination.page"
          v-model:items-per-page="unallocatedPagination.pageSize"
          v-model="unallocatedCheckedRowKeys"
          :headers="unallocatedColumns"
          :items="unallocatedData"
          :items-length="unallocatedPagination.total"
          :items-per-page-options="[10, 20, 50, 100]"
          :loading="unallocatedLoading"
          :show-select="true"
          item-value="userId"
          class="manage-data-table"
          fixed-header
        >
          <template #item.index="{ index }">{{ index + 1 }}</template>
          <template #item.status="{ item }">
            <DictTag :options="dict.sys_normal_disable" :value="item.status" />
          </template>
          <template #item.createTime="{ item }">
            {{ parseTime(item.createTime) }}
          </template>
          <template #item.actions="{ item }">
            <VBtn
              v-if="hasAuth('system:role:edit')"
              size="small"
              variant="text"
              color="primary"
              @click="selectAuthUser(item)"
            >
              分配
            </VBtn>
          </template>
        </VDataTableServer>
      </div>
    </VCard>
  </div>
</template>

<style scoped></style>
