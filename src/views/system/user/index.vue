<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import TableHeaderOperation from '@/components/advanced/table-header-operation.vue';
import DictTag from '@/components/common/dict-tag.vue';
import { useAuth } from '@/hooks/business/auth';
import { toSelectItems, useDict } from '@/hooks/business/dict';
import { useRuoYiTable } from '@/hooks/common/ruoyi-table';
import type { TableColumn, TableOperateType } from '@/hooks/common/table';
import type { DeptTreeVO } from '@/service/api/ruoyi/system/dept/types';
import { changeUserStatus, delUser, deptTreeSelect, listUser } from '@/service/api/ruoyi/system/user';
import type { UserQuery, UserVO } from '@/service/api/ruoyi/system/user/types';
import { download } from '@/utils/download';
import { addDateRange, formatFilterDate, parseTime } from '@/utils/ruoyi';
import ResetPwdDialog from './modules/reset-pwd-dialog.vue';
import UserFormDialog from './modules/user-form-dialog.vue';
import UserImportDialog from './modules/user-import-dialog.vue';

defineOptions({
  name: 'SystemUser'
});

/** 超级管理员用户，禁止在页面上修改/删除/重置密码/分配角色 */
const superAdminId = '1761100000000000001';

const router = useRouter();
const { hasAuth } = useAuth();
const dict = useDict('sys_normal_disable');

const query = ref<UserQuery>({
  pageNum: 1,
  pageSize: 10,
  userName: '',
  nickName: '',
  phoneNumber: '',
  status: undefined,
  deptId: undefined
});

/** 创建时间范围 */
const beginTime = ref<Date | null>(null);
const endTime = ref<Date | null>(null);

function dateRangeParams() {
  const begin = formatFilterDate(beginTime.value);
  const end = formatFilterDate(endTime.value);

  return [begin ? `${begin} 00:00:00` : undefined, end ? `${end} 23:59:59` : undefined];
}

/** 附带创建时间范围的用户列表查询 */
function listUserWithRange(params: UserQuery) {
  const searchParams: any = { ...params };

  if (!searchParams.deptId) {
    delete searchParams.deptId;
  }

  addDateRange(searchParams, dateRangeParams());

  return listUser(searchParams);
}

const {
  data,
  loading,
  pagination,
  columnChecks,
  columns,
  checkedRowKeys,
  showSelect,
  getData,
  getDataByPage,
  handleQuery
} = useRuoYiTable<UserVO, UserQuery>({
  api: listUserWithRange,
  query,
  showSelect: true,
  columns: (): TableColumn[] => [
    { key: 'userId', title: '用户编号', align: 'center', minWidth: 180, sortable: false },
    { key: 'userName', title: '用户名称', align: 'center', minWidth: 90, sortable: false },
    { key: 'nickName', title: '用户昵称', align: 'center', minWidth: 90, sortable: false },
    { key: 'deptName', title: '部门', align: 'center', minWidth: 90, sortable: false },
    { key: 'phoneNumber', title: '手机号码', align: 'center', minWidth: 100, sortable: false },
    { key: 'status', title: '状态', align: 'center', width: 70, sortable: false },
    { key: 'createTime', title: '创建时间', align: 'center', width: 175, sortable: false },
    { key: 'actions', title: '操作', align: 'center', width: 140, sortable: false, fixed: 'end' }
  ]
});

const statusItems = computed(() => toSelectItems(dict.sys_normal_disable));

/* ------------------------------ 部门树 ------------------------------ */

interface DeptTreeItem {
  title: string;
  value: string | number;
  disabled?: boolean;
  children?: DeptTreeItem[];
}

const deptTree = ref<DeptTreeVO[]>([]);
const deptSearch = ref('');
const activatedDept = ref<Array<string | number>>([]);
const treeCollapsed = ref(false);

function mapDeptTree(nodes: DeptTreeVO[]): DeptTreeItem[] {
  return (nodes ?? []).map(node => ({
    title: node.label,
    value: node.id,
    disabled: Boolean(node.disabled),
    children: node.children?.length ? mapDeptTree(node.children) : undefined
  }));
}

const deptTreeItems = computed(() => mapDeptTree(deptTree.value));

function deptItemProps(item: Record<string, any>) {
  return { disabled: Boolean(item.disabled) };
}

async function getDeptTree() {
  const { data: tree, error } = await deptTreeSelect();

  if (!error && tree) {
    deptTree.value = tree;
  }
}

function handleDeptActivated(value: unknown) {
  const ids = Array.isArray(value) ? (value as Array<string | number>) : [];

  query.value.deptId = ids.length ? ids[ids.length - 1] : undefined;

  handleQuery();
}

function clearDeptFilter() {
  activatedDept.value = [];
  query.value.deptId = undefined;
  handleQuery();
}

/* ------------------------------ 搜索 / 重置 ------------------------------ */

async function resetQuery() {
  query.value.userName = '';
  query.value.nickName = '';
  query.value.phoneNumber = '';
  query.value.status = undefined;
  query.value.deptId = undefined;
  beginTime.value = null;
  endTime.value = null;
  activatedDept.value = [];
  checkedRowKeys.value = [];

  await handleQuery();
}

/* ------------------------------ 新增 / 修改 ------------------------------ */

const formVisible = ref(false);
const formOperateType = ref<TableOperateType>('add');
const editingRow = ref<UserVO | null>(null);

function handleAdd() {
  formOperateType.value = 'add';
  editingRow.value = null;
  formVisible.value = true;
}

function handleEdit(row: UserVO) {
  formOperateType.value = 'edit';
  editingRow.value = row;
  formVisible.value = true;
}

/* ------------------------------ 删除 ------------------------------ */

const deleteVisible = ref(false);
const deleteIds = ref<Array<string | number>>([]);
const deleteTip = ref('');
const deleting = ref(false);

function askDelete(ids: Array<string | number>, tip: string) {
  deleteIds.value = ids;
  deleteTip.value = tip;
  deleteVisible.value = true;
}

function handleDelete(row: UserVO) {
  askDelete([row.userId], `用户编号为"${row.userId}"的数据项`);
}

function handleBatchDelete() {
  if (!checkedRowKeys.value.length) return;

  askDelete([...checkedRowKeys.value], `选中的 ${checkedRowKeys.value.length} 条用户数据`);
}

async function confirmDelete() {
  deleting.value = true;

  const { error } = await delUser(deleteIds.value);

  deleting.value = false;

  if (!error) {
    window.$message?.success('删除成功');
    deleteVisible.value = false;
    checkedRowKeys.value = [];
    await handleQuery();
  }
}

/* ------------------------------ 状态切换 ------------------------------ */

async function handleStatusChange(row: UserVO, value: unknown) {
  const enabled = Boolean(value);
  const nextStatus = enabled ? '0' : '1';
  const text = enabled ? '启用' : '停用';

  const confirmed = await window.$dialog?.warning({
    title: '系统提示',
    content: `确认要"${text}"${row.userName}用户吗?`,
    positiveText: '确定',
    negativeText: '取消'
  });

  if (!confirmed) return;

  const { error } = await changeUserStatus(row.userId, nextStatus);

  if (!error) {
    row.status = nextStatus;
    window.$message?.success(`${text}成功`);
    await getData();
  }
}

/* ------------------------------ 重置密码 / 分配角色 ------------------------------ */

const resetPwdVisible = ref(false);
const resetPwdRow = ref<UserVO | null>(null);

function handleResetPwd(row: UserVO) {
  resetPwdRow.value = row;
  resetPwdVisible.value = true;
}

function handleAuthRole(row: UserVO) {
  router.push(`/system/user-auth/role/${row.userId}`);
}

/* ------------------------------ 导入 / 导出 ------------------------------ */

const importVisible = ref(false);

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

  download('/system/user/export', searchParams, `user_${Date.now()}.xlsx`);
}

function handleDownloadTemplate() {
  download('/system/user/importTemplate', {}, `user_template_${Date.now()}.xlsx`);
}

onMounted(() => {
  getDeptTree();
});
</script>

<template>
  <div class="flex h-full min-h-0 flex-col gap-4">
    <div class="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
      <!-- 部门树 -->
      <VCard
        v-if="!treeCollapsed"
        class="card-wrapper flex max-h-280px w-full shrink-0 flex-col lg:max-h-none lg:w-260px"
      >
        <VCardTitle class="flex shrink-0 items-center justify-between gap-2">
          <span>部门结构</span>
          <VBtn
            icon="mdi-chevron-left"
            size="x-small"
            variant="text"
            title="收起部门树"
            @click="treeCollapsed = true"
          />
        </VCardTitle>
        <VCardText class="flex min-h-0 flex-1 flex-col gap-2 pt-0">
          <div class="flex items-center gap-1">
            <VTextField
              v-model="deptSearch"
              placeholder="请输入部门名称"
              density="compact"
              variant="outlined"
              prepend-inner-icon="mdi-magnify"
              hide-details
              clearable
            />
            <VBtn icon="mdi-filter-off" size="small" variant="text" title="清除部门筛选" @click="clearDeptFilter" />
          </div>
          <div class="min-h-0 flex-1 overflow-y-auto">
            <VTreeview
              v-model:activated="activatedDept"
              :items="deptTreeItems"
              :search="deptSearch"
              :item-props="deptItemProps"
              item-title="title"
              item-value="value"
              item-children="children"
              activatable
              open-on-click
              density="compact"
              @update:activated="handleDeptActivated"
            />
          </div>
        </VCardText>
      </VCard>
      <VCard v-else class="card-wrapper flex w-full shrink-0 items-center justify-center p-2 lg:w-14">
        <VBtn icon="mdi-chevron-right" size="small" variant="text" title="展开部门树" @click="treeCollapsed = false" />
      </VCard>

      <div class="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
        <!-- 搜索区 -->
        <VCard class="card-wrapper shrink-0">
          <VCardText class="pa-4">
            <VForm @submit.prevent="handleQuery">
              <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <VTextField
                  v-model="query.userName"
                  label="用户名称"
                  placeholder="请输入用户名称"
                  density="compact"
                  variant="outlined"
                  hide-details
                  @keyup.enter="handleQuery"
                />
                <VTextField
                  v-model="query.nickName"
                  label="用户昵称"
                  placeholder="请输入用户昵称"
                  density="compact"
                  variant="outlined"
                  hide-details
                  @keyup.enter="handleQuery"
                />
                <VTextField
                  v-model="query.phoneNumber"
                  label="手机号码"
                  placeholder="请输入手机号码"
                  density="compact"
                  variant="outlined"
                  hide-details
                  @keyup.enter="handleQuery"
                />
                <VSelect
                  persistent-placeholder
                  v-model="query.status"
                  label="状态"
                  placeholder="用户状态"
                  :items="statusItems"
                  density="compact"
                  variant="outlined"
                  clearable
                  hide-details
                />
                <VDateInput
                  v-model="beginTime"
                  prepend-inner-icon="mdi-calendar"
                  prepend-icon=""
                  label="创建时间（开始）"
                  density="compact"
                  variant="outlined"
                  hide-details
                  clearable
                />
                <VDateInput
                  v-model="endTime"
                  prepend-inner-icon="mdi-calendar"
                  prepend-icon=""
                  label="创建时间（结束）"
                  density="compact"
                  variant="outlined"
                  hide-details
                  clearable
                  menu
                />
                <div class="flex items-center justify-end gap-2 sm:col-span-2 lg:col-span-2">
                  <VBtn variant="text" prepend-icon="mdi-refresh" @click="resetQuery">重置</VBtn>
                  <VBtn color="primary" variant="outlined" prepend-icon="mdi-magnify" @click="handleQuery">搜索</VBtn>
                </div>
              </div>
            </VForm>
          </VCardText>
        </VCard>

        <!-- 表格区 -->
        <VCard class="card-wrapper flex min-h-0 flex-1 flex-col">
          <VCardTitle class="flex shrink-0 flex-wrap items-center justify-between gap-2">
            <span>用户列表（共 {{ pagination.total }} 条）</span>
            <TableHeaderOperation v-model:columns="columnChecks" :loading="loading" @refresh="handleQuery">
              <template #default>
                <VBtn
                  v-if="hasAuth('system:user:add')"
                  size="small"
                  variant="outlined"
                  color="primary"
                  prepend-icon="mdi-plus"
                  @click="handleAdd"
                >
                  新增
                </VBtn>
                <VBtn
                  v-if="hasAuth('system:user:remove')"
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
                  v-if="hasAuth('system:user:export')"
                  size="small"
                  variant="outlined"
                  color="success"
                  prepend-icon="mdi-export"
                  @click="handleExport"
                >
                  导出
                </VBtn>
                <VBtn
                  v-if="hasAuth('system:user:import')"
                  size="small"
                  variant="outlined"
                  color="info"
                  prepend-icon="mdi-upload"
                  @click="importVisible = true"
                >
                  导入
                </VBtn>
                <VBtn
                  v-if="hasAuth('system:user:import')"
                  size="small"
                  variant="outlined"
                  prepend-icon="mdi-download"
                  @click="handleDownloadTemplate"
                >
                  下载模板
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
              :show-select="showSelect"
              item-value="userId"
              fixed-header
              hover
            >
              <template #item.userName="{ item }">
                <span class="font-weight-medium">{{ item.userName }}</span>
              </template>
              <template #item.phoneNumber="{ item }">
                <span class="whitespace-nowrap">{{ item.phoneNumber || '-' }}</span>
              </template>
              <template #item.createTime="{ item }">
                <span class="whitespace-nowrap">{{ parseTime(item.createTime) || '-' }}</span>
              </template>
              <template #item.status="{ item }">
                <div class="flex justify-center">
                  <VSwitch
                    v-if="hasAuth('system:user:edit') && String(item.userId) !== superAdminId"
                    :model-value="item.status === '0'"
                    color="primary"
                    density="compact"
                    hide-details
                    inset
                    @update:model-value="(value: any) => handleStatusChange(item, value)"
                  />
                  <DictTag v-else :options="dict.sys_normal_disable" :value="item.status" />
                </div>
              </template>
              <template #item.actions="{ item }">
                <div class="flex items-center justify-center whitespace-nowrap">
                  <template v-if="String(item.userId) !== superAdminId">
                    <VBtn
                      v-if="hasAuth('system:user:edit') && hasAuth('system:user:query')"
                      icon="mdi-pencil"
                      size="x-small"
                      variant="text"
                      color="primary"
                      title="修改"
                      @click="handleEdit(item)"
                    />
                    <VBtn
                      v-if="hasAuth('system:user:remove')"
                      icon="mdi-delete"
                      size="x-small"
                      variant="text"
                      color="error"
                      title="删除"
                      @click="handleDelete(item)"
                    />
                    <VBtn
                      v-if="hasAuth('system:user:resetPwd')"
                      icon="mdi-key"
                      size="x-small"
                      variant="text"
                      color="primary"
                      title="重置密码"
                      @click="handleResetPwd(item)"
                    />
                    <VBtn
                      v-if="hasAuth('system:user:edit') && hasAuth('system:user:query')"
                      icon="mdi-account-key"
                      size="x-small"
                      variant="text"
                      color="primary"
                      title="分配角色"
                      @click="handleAuthRole(item)"
                    />
                  </template>
                  <span v-else class="text-medium-emphasis">-</span>
                </div>
              </template>
            </VDataTableServer>
          </div>
        </VCard>
      </div>
    </div>

    <UserFormDialog
      v-model:visible="formVisible"
      :operate-type="formOperateType"
      :row-data="editingRow"
      :dept-options="deptTree"
      @submitted="getDataByPage"
    />

    <ResetPwdDialog v-model:visible="resetPwdVisible" :row-data="resetPwdRow" />

    <UserImportDialog v-model:visible="importVisible" @submitted="getDataByPage" />

    <!-- 删除确认 -->
    <VDialog v-model="deleteVisible" max-width="420">
      <VCard>
        <VCardTitle>系统提示</VCardTitle>
        <VCardText>是否确认删除{{ deleteTip }}?</VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn variant="text" @click="deleteVisible = false">取消</VBtn>
          <VBtn color="error" variant="flat" :loading="deleting" @click="confirmDelete">确定</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<style scoped></style>
