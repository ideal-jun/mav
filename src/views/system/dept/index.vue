<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import type { TableColumnCheck } from '@sa/hooks';
import TableHeaderOperation from '@/components/advanced/table-header-operation.vue';
import DictTag from '@/components/common/dict-tag.vue';
import { useAuth } from '@/hooks/business/auth';
import { toSelectItems, useDict } from '@/hooks/business/dict';
import type { TableColumn } from '@/hooks/common/table';
import { delDept, listDept } from '@/service/api/ruoyi/system/dept';
import type { DeptQuery, DeptVO } from '@/service/api/ruoyi/system/dept/types';
import { handleTree, parseTime } from '@/utils/ruoyi';
import DeptFormDialog from './modules/dept-form-dialog.vue';

defineOptions({
  name: 'SystemDept'
});

const { hasAuth } = useAuth();
const dict = useDict('sys_normal_disable');

const searchForm = ref({
  deptName: '',
  deptCategory: '',
  status: undefined
});

const statusItems = computed(() => toSelectItems(dict.sys_normal_disable));

const deptTree = ref<DeptVO[]>([]);
const collapsedIds = ref<Set<string | number>>(new Set());
const loading = ref(false);

type FlatDeptRow = Omit<DeptVO, 'children'> & {
  __depth: number;
  __hasChildren: boolean;
};

const visibleRows = computed<FlatDeptRow[]>(() => {
  function walk(nodes: DeptVO[], depth: number): FlatDeptRow[] {
    const rows: FlatDeptRow[] = [];

    (nodes ?? []).forEach(node => {
      const { children, ...rest } = node;
      const hasChildren = Boolean(children?.length);

      rows.push({ ...rest, __depth: depth, __hasChildren: hasChildren });

      if (hasChildren && !collapsedIds.value.has(node.deptId)) {
        rows.push(...walk(children, depth + 1));
      }
    });

    return rows;
  }

  return walk(deptTree.value, 0);
});

const allExpanded = computed(() => collapsedIds.value.size === 0);

function toggleExpand(row: FlatDeptRow) {
  const next = new Set(collapsedIds.value);

  if (next.has(row.deptId)) {
    next.delete(row.deptId);
  } else {
    next.add(row.deptId);
  }

  collapsedIds.value = next;
}

function toggleExpandAll() {
  if (collapsedIds.value.size) {
    collapsedIds.value = new Set();

    return;
  }

  const ids = new Set<string | number>();

  function collect(nodes: DeptVO[]) {
    (nodes ?? []).forEach(node => {
      if (node.children?.length) {
        ids.add(node.deptId);
        collect(node.children);
      }
    });
  }

  collect(deptTree.value);
  collapsedIds.value = ids;
}

const baseColumns: TableColumn[] = [
  { key: 'deptName', title: '部门名称', align: 'start', minWidth: 260, sortable: false },
  { key: 'deptCategory', title: '类别编码', align: 'center', width: 160, sortable: false },
  { key: 'orderNum', title: '排序', align: 'center', width: 90, sortable: false },
  { key: 'status', title: '状态', align: 'center', width: 100, sortable: false },
  { key: 'createTime', title: '创建时间', align: 'center', width: 180, sortable: false },
  { key: 'actions', title: '操作', align: 'center', width: 160, sortable: false }
];

const columnChecks = ref<TableColumnCheck[]>(
  baseColumns.map(column => ({
    key: column.key,
    title: column.title ?? column.key,
    checked: true,
    fixed: 'unFixed' as const,
    visible: true
  }))
);

const columns = computed<TableColumn[]>(() =>
  columnChecks.value
    .filter(check => check.checked)
    .map(check => baseColumns.find(column => column.key === check.key))
    .filter((column): column is TableColumn => Boolean(column))
);

async function getList() {
  loading.value = true;

  const params: DeptQuery = {
    pageNum: 1,
    pageSize: 1000,
    deptName: searchForm.value.deptName || undefined,
    deptCategory: searchForm.value.deptCategory || undefined,
    status: searchForm.value.status ? Number(searchForm.value.status) : undefined
  };

  const { data, error } = await listDept(params);

  loading.value = false;

  if (!error && data) {
    deptTree.value = handleTree<DeptVO>(data, 'deptId');
  }
}

async function handleQuery() {
  await getList();
}

async function handleReset() {
  searchForm.value.deptName = '';
  searchForm.value.deptCategory = '';
  searchForm.value.status = undefined;
  collapsedIds.value = new Set();

  await getList();
}

/* ------------------------------ 新增 / 修改 ------------------------------ */

const formVisible = ref(false);
const formMode = ref<'add' | 'edit'>('add');
const editingRow = ref<DeptVO | null>(null);
const presetParentId = ref<string | number | undefined>(undefined);

function handleAdd(parent?: FlatDeptRow) {
  formMode.value = 'add';
  editingRow.value = null;
  presetParentId.value = parent?.deptId;
  formVisible.value = true;
}

function handleEdit(row: FlatDeptRow) {
  formMode.value = 'edit';
  editingRow.value = { ...row, children: [] } as DeptVO;
  presetParentId.value = undefined;
  formVisible.value = true;
}

/* ------------------------------ 删除 ------------------------------ */

const deleteVisible = ref(false);
const deletingRow = ref<DeptVO | null>(null);
const deleting = ref(false);

function handleDelete(row: FlatDeptRow) {
  deletingRow.value = { ...row, children: [] } as DeptVO;
  deleteVisible.value = true;
}

async function confirmDelete() {
  if (!deletingRow.value?.deptId) return;

  deleting.value = true;

  const { error } = await delDept(deletingRow.value.deptId);

  deleting.value = false;

  if (!error) {
    window.$message?.success('删除成功');
    deleteVisible.value = false;
    await getList();
  }
}

onMounted(() => {
  getList();
});
</script>

<template>
  <div class="flex h-full min-h-0 flex-col gap-4">
    <!-- 搜索区 -->
    <VCard class="card-wrapper shrink-0">
      <VCardText class="pa-4">
        <VForm @submit.prevent="handleQuery">
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <VTextField
              v-model="searchForm.deptName"
              label="部门名称"
              placeholder="请输入部门名称"
              density="compact"
              variant="outlined"
              hide-details
              clearable
              @keyup.enter="handleQuery"
            />
            <VTextField
              v-model="searchForm.deptCategory"
              label="类别编码"
              placeholder="请输入类别编码"
              density="compact"
              variant="outlined"
              hide-details
              clearable
              @keyup.enter="handleQuery"
            />
            <VSelect
              v-model="searchForm.status"
              label="状态"
              :items="statusItems"
              density="compact"
              variant="outlined"
              clearable
              hide-details
            />
            <div class="flex items-center justify-end gap-2">
              <VBtn variant="text" prepend-icon="mdi-refresh" @click="handleReset">重置</VBtn>
              <VBtn color="primary" variant="outlined" prepend-icon="mdi-magnify" @click="handleQuery">搜索</VBtn>
            </div>
          </div>
        </VForm>
      </VCardText>
    </VCard>

    <!-- 表格区 -->
    <VCard class="card-wrapper flex min-h-0 flex-1 flex-col">
      <VCardTitle class="flex shrink-0 flex-wrap items-center justify-between gap-2">
        <span>部门列表（共 {{ visibleRows.length }} 条）</span>
        <TableHeaderOperation v-model:columns="columnChecks" :loading="loading" @refresh="getList">
          <template #default>
            <VBtn
              v-if="hasAuth('system:dept:add')"
              size="small"
              variant="outlined"
              color="primary"
              prepend-icon="mdi-plus"
              @click="handleAdd()"
            >
              新增
            </VBtn>
            <VBtn
              size="small"
              variant="outlined"
              color="info"
              :prepend-icon="allExpanded ? 'mdi-unfold-less-horizontal' : 'mdi-unfold-more-horizontal'"
              @click="toggleExpandAll"
            >
              {{ allExpanded ? '折叠' : '展开' }}
            </VBtn>
          </template>
        </TableHeaderOperation>
      </VCardTitle>
      <div class="min-h-0 flex-1">
        <VDataTable
          :headers="columns"
          :items="visibleRows"
          :loading="loading"
          item-value="deptId"
          :items-per-page="-1"
          fixed-header
          hide-default-footer
          hover
        >
          <template #item.deptName="{ item }">
            <div class="flex items-center" :style="{ paddingLeft: `${item.__depth * 20}px` }">
              <VBtn
                v-if="item.__hasChildren"
                :icon="collapsedIds.has(item.deptId) ? 'mdi-chevron-right' : 'mdi-chevron-down'"
                size="x-small"
                variant="text"
                density="comfortable"
                @click="toggleExpand(item)"
              />
              <span v-else class="inline-block w-28px shrink-0" />
              <span class="font-weight-medium">{{ item.deptName }}</span>
            </div>
          </template>
          <template #item.deptCategory="{ item }">
            {{ item.deptCategory || '-' }}
          </template>
          <template #item.status="{ item }">
            <DictTag :options="dict.sys_normal_disable" :value="item.status" />
          </template>
          <template #item.createTime="{ item }">
            {{ parseTime(item.createTime) || '-' }}
          </template>
          <template #item.actions="{ item }">
            <div class="flex items-center justify-center whitespace-nowrap">
              <VBtn
                v-if="hasAuth('system:dept:edit')"
                icon="mdi-pencil"
                size="x-small"
                variant="text"
                color="primary"
                title="修改"
                @click="handleEdit(item)"
              />
              <VBtn
                v-if="hasAuth('system:dept:add')"
                icon="mdi-plus"
                size="x-small"
                variant="text"
                color="primary"
                title="新增子部门"
                @click="handleAdd(item)"
              />
              <VBtn
                v-if="hasAuth('system:dept:remove')"
                icon="mdi-delete"
                size="x-small"
                variant="text"
                color="error"
                title="删除"
                @click="handleDelete(item)"
              />
            </div>
          </template>
          <template #no-data>
            <div class="py-6 text-center text-medium-emphasis">暂无数据</div>
          </template>
        </VDataTable>
      </div>
    </VCard>

    <DeptFormDialog
      v-model:visible="formVisible"
      :mode="formMode"
      :row-data="editingRow"
      :parent-id="presetParentId"
      @submitted="getList"
    />

    <!-- 删除确认 -->
    <VDialog v-model="deleteVisible" max-width="420">
      <VCard>
        <VCardTitle>系统提示</VCardTitle>
        <VCardText>是否确认删除名称为"{{ deletingRow?.deptName }}"的部门?存在下级部门或用户时将无法删除。</VCardText>
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
