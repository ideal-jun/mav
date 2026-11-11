<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import TableHeaderOperation from '@/components/advanced/table-header-operation.vue';
import { useAuth } from '@/hooks/business/auth';
import { useDict } from '@/hooks/business/dict';
import { useRuoYiTable } from '@/hooks/common/ruoyi-table';
import type { TableColumn } from '@/hooks/common/table';
import { changeRoleStatus, delRole, listRole } from '@/service/api/ruoyi/system/role';
import type { RoleQuery, RoleVO } from '@/service/api/ruoyi/system/role/types';
import { download } from '@/utils/download';
import { parseTime } from '@/utils/ruoyi';
import RoleFormDialog from './modules/role-form-dialog.vue';

defineOptions({
  name: 'SystemRole'
});

/** the super admin role id of the ruoyi backend, it can not be modified or deleted */
const SUPER_ADMIN_ROLE_ID = '1761300000000000001';

const router = useRouter();

const { hasAuth } = useAuth();

const dict = useDict('sys_normal_disable');

const query = ref<RoleQuery>({
  pageNum: 1,
  pageSize: 10,
  roleName: '',
  roleKey: '',
  status: undefined
});

const { data, loading, pagination, columns, columnChecks, checkedRowKeys, getData, handleQuery } = useRuoYiTable<
  RoleVO,
  RoleQuery
>({
  api: listRole,
  query,
  showSelect: true,
  columns: (): TableColumn[] => [
    { key: 'index', title: '序号', align: 'center', width: 70, sortable: false },
    { key: 'roleId', title: '角色编号', align: 'center', minWidth: 170, sortable: false },
    { key: 'roleName', title: '角色名称', align: 'center', minWidth: 140 },
    { key: 'roleKey', title: '权限字符', align: 'center', minWidth: 160 },
    { key: 'roleSort', title: '显示顺序', align: 'center', width: 100 },
    { key: 'status', title: '状态', align: 'center', width: 100, sortable: false },
    { key: 'createTime', title: '创建时间', align: 'center', width: 170, sortable: false },
    { key: 'actions', title: '操作', align: 'center', width: 320, sortable: false }
  ]
});

const statusItems = computed(() => dict.sys_normal_disable.map(item => ({ title: item.label, value: item.value })));

/* ------------------------------ 查询与重置 ------------------------------ */

async function handleSearch() {
  await handleQuery();
}

async function handleReset() {
  query.value.roleName = '';
  query.value.roleKey = '';
  query.value.status = undefined;

  await handleSearch();
}

/* ------------------------------ 新增 / 修改 / 分配权限 ------------------------------ */

const formVisible = ref(false);
const formRoleId = ref<string | number | null>(null);
const formTab = ref<'basic' | 'menu' | 'data'>('basic');

function handleAdd() {
  formRoleId.value = null;
  formTab.value = 'basic';
  formVisible.value = true;
}

function handleEdit(row: RoleVO) {
  formRoleId.value = row.roleId;
  formTab.value = 'basic';
  formVisible.value = true;
}

function handlePermission(row: RoleVO) {
  formRoleId.value = row.roleId;
  formTab.value = 'menu';
  formVisible.value = true;
}

function handleAuthUser(row: RoleVO) {
  router.push(`/system/role-auth/user/${row.roleId}`);
}

function isSuperAdminRole(row: RoleVO) {
  return String(row.roleId) === SUPER_ADMIN_ROLE_ID || Boolean(row.admin);
}

async function handleSubmitted() {
  await getData();
}

/* ------------------------------ 状态 ------------------------------ */

async function handleStatusChange(row: RoleVO, status: string) {
  const text = status === '0' ? '启用' : '停用';
  const confirmed = await window.$dialog?.warning({
    title: '系统提示',
    positiveText: '确定',
    negativeText: '取消',
    maskClosable: false,
    content: `确认要"${text}""${row.roleName}"角色吗？`
  });

  if (!confirmed) {
    return;
  }

  const { error } = await changeRoleStatus(row.roleId, status);

  if (!error) {
    window.$message?.success(`${text}成功`);
    await getData();
  }
}

/* ------------------------------ 删除 ------------------------------ */

async function handleDelete(row: RoleVO) {
  const confirmed = await window.$dialog?.warning({
    title: '系统提示',
    positiveText: '确定',
    negativeText: '取消',
    maskClosable: false,
    content: `是否确认删除角色编号为"${row.roleId}"的数据项？`
  });

  if (!confirmed) {
    return;
  }

  const { error } = await delRole(row.roleId);

  if (!error) {
    window.$message?.success('删除成功');
    await getData();
  }
}

async function handleBatchDelete() {
  const roleIds = [...checkedRowKeys.value];

  if (!roleIds.length) {
    window.$message?.warning('请选择要删除的角色');
    return;
  }

  const confirmed = await window.$dialog?.warning({
    title: '系统提示',
    positiveText: '确定',
    negativeText: '取消',
    maskClosable: false,
    content: `是否确认删除角色编号为"${roleIds.join(',')}"的数据项？`
  });

  if (!confirmed) {
    return;
  }

  const { error } = await delRole(roleIds);

  if (!error) {
    window.$message?.success('删除成功');
    checkedRowKeys.value = [];
    await getData();
  }
}

/* ------------------------------ 导出 ------------------------------ */

function handleExport() {
  download('/system/role/export', { ...query.value }, `role_${Date.now()}.xlsx`);
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col gap-4">
    <VCard class="card-wrapper shrink-0">
      <VCardText class="py-3">
        <VForm @submit.prevent="handleSearch">
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <VTextField
              v-model="query.roleName"
              label="角色名称"
              placeholder="请输入角色名称"
              density="compact"
              variant="outlined"
              clearable
              hide-details="auto"
            />
            <VTextField
              v-model="query.roleKey"
              label="权限字符"
              placeholder="请输入权限字符"
              density="compact"
              variant="outlined"
              clearable
              hide-details="auto"
            />
            <VSelect
              v-model="query.status"
              :items="statusItems"
              label="状态"
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

    <VCard class="card-wrapper flex min-h-0 flex-1 flex-col">
      <VCardTitle class="flex shrink-0 flex-wrap items-center justify-between gap-2">
        <div class="flex flex-wrap items-baseline gap-2">
          <span>角色管理</span>
          <span class="text-caption text-medium-emphasis">共 {{ pagination.total }} 条记录</span>
        </div>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          @refresh="getData"
        >
          <template #default>
            <VBtn
              v-if="hasAuth('system:role:add')"
              size="small"
              variant="outlined"
              color="primary"
              prepend-icon="mdi-plus"
              @click="handleAdd"
            >
              新增
            </VBtn>
            <VBtn
              v-if="hasAuth('system:role:remove')"
              size="small"
              variant="outlined"
              color="error"
              prepend-icon="mdi-delete"
              :disabled="checkedRowKeys.length === 0"
              @click="handleBatchDelete"
            >
              批量删除
            </VBtn>
          </template>
          <template #prefix>
            <VBtn
              v-if="hasAuth('system:role:export')"
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
          item-value="roleId"
          class="manage-data-table"
          fixed-header
        >
          <template #item.index="{ index }">{{ index + 1 }}</template>
          <template #item.status="{ item }">
            <div class="flex justify-center">
              <VSwitch
                :model-value="item.status === '0'"
                hide-details
                :disabled="isSuperAdminRole(item) || !hasAuth('system:role:edit')"
                @update:model-value="value => handleStatusChange(item, value ? '0' : '1')"
              />
            </div>
          </template>
          <template #item.createTime="{ item }">
            {{ parseTime(item.createTime) }}
          </template>
          <template #item.actions="{ item }">
            <div class="flex items-center justify-center whitespace-nowrap">
              <VBtn
                v-if="hasAuth('system:role:edit')"
                size="small"
                variant="text"
                color="primary"
                :disabled="isSuperAdminRole(item)"
                @click="handleEdit(item)"
              >
                修改
              </VBtn>
              <VBtn
                v-if="hasAuth('system:role:edit')"
                size="small"
                variant="text"
                color="primary"
                :disabled="isSuperAdminRole(item)"
                @click="handlePermission(item)"
              >
                分配权限
              </VBtn>
              <VBtn
                v-if="hasAuth('system:role:edit')"
                size="small"
                variant="text"
                color="primary"
                :disabled="isSuperAdminRole(item)"
                @click="handleAuthUser(item)"
              >
                分配用户
              </VBtn>
              <VBtn
                v-if="hasAuth('system:role:remove')"
                size="small"
                variant="text"
                color="error"
                :disabled="isSuperAdminRole(item)"
                @click="handleDelete(item)"
              >
                删除
              </VBtn>
            </div>
          </template>
        </VDataTableServer>
      </div>
    </VCard>

    <RoleFormDialog
      v-model:visible="formVisible"
      :role-id="formRoleId"
      :initial-tab="formTab"
      @submitted="handleSubmitted"
    />
  </div>
</template>

<style scoped></style>
