<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import type { ValidationRule } from 'vuetify';
import TableHeaderOperation from '@/components/advanced/table-header-operation.vue';
import DictTag from '@/components/common/dict-tag.vue';
import { useAuth } from '@/hooks/business/auth';
import { useDict } from '@/hooks/business/dict';
import { useVuetifyForm } from '@/hooks/common/form';
import { useRuoYiTable } from '@/hooks/common/ruoyi-table';
import type { TableColumn } from '@/hooks/common/table';
import { addPost, delPost, deptTreeSelect, getPost, listPost, updatePost } from '@/service/api/ruoyi/system/post';
import type { PostForm, PostQuery, PostVO } from '@/service/api/ruoyi/system/post/types';
import type { DeptTreeVO } from '@/service/api/ruoyi/system/dept/types';
import { download } from '@/utils/download';
import { parseTime } from '@/utils/ruoyi';

defineOptions({
  name: 'SystemPost'
});

const { hasAuth } = useAuth();

const dict = useDict('sys_normal_disable');

/** 岗位查询参数 */
const query = ref<PostQuery>({
  pageNum: 1,
  pageSize: 10,
  deptId: '',
  belongDeptId: '',
  postCode: '',
  postName: '',
  postCategory: '',
  status: ''
});

const { data, loading, pagination, columns, columnChecks, checkedRowKeys, getData, handleQuery } = useRuoYiTable<
  PostVO,
  PostQuery
>({
  api: listPost,
  query,
  showSelect: true,
  columns: (): TableColumn[] => [
    { key: 'index', title: '序号', align: 'center', width: 70, sortable: false },
    { key: 'postCode', title: '岗位编码', align: 'center', minWidth: 130 },
    { key: 'postCategory', title: '类别编码', align: 'center', minWidth: 130 },
    { key: 'postName', title: '岗位名称', align: 'center', minWidth: 130 },
    { key: 'deptName', title: '归属部门', align: 'center', minWidth: 130 },
    { key: 'postSort', title: '排序', align: 'center', width: 90 },
    { key: 'status', title: '状态', align: 'center', width: 100 },
    { key: 'createTime', title: '创建时间', align: 'center', width: 170, sortable: false },
    { key: 'actions', title: '操作', align: 'center', width: 160, sortable: false }
  ]
});

/* ------------------------------ 部门树 ------------------------------ */

interface DeptOption {
  title: string;
  value: number | string;
}

const deptOptions = ref<DeptOption[]>([]);

function flattenDeptTree(nodes: DeptTreeVO[], depth = 0, result: DeptOption[] = []) {
  nodes.forEach(node => {
    result.push({ title: `${'　'.repeat(depth)}${node.label}`, value: node.id });

    if (node.children?.length) {
      flattenDeptTree(node.children, depth + 1, result);
    }
  });

  return result;
}

async function getDeptOptions() {
  const { data: treeData, error } = await deptTreeSelect();

  if (!error && treeData) {
    deptOptions.value = flattenDeptTree(treeData);
  }
}

/* ------------------------------ 查询与重置 ------------------------------ */

async function handleSearch() {
  await handleQuery();
}

async function handleReset() {
  query.value.deptId = '';
  query.value.belongDeptId = '';
  query.value.postCode = '';
  query.value.postName = '';
  query.value.postCategory = '';
  query.value.status = '';

  await handleSearch();
}

/* ------------------------------ 表单 ------------------------------ */

const formVisible = ref(false);
const formMode = ref<'add' | 'edit'>('add');
const { formRef, validate, restoreValidation } = useVuetifyForm();

function createDefaultForm(): PostForm {
  return {
    postId: undefined,
    deptId: undefined,
    postCode: '',
    postName: '',
    postCategory: '',
    postSort: 0,
    status: '0',
    remark: ''
  };
}

const form = ref<PostForm>(createDefaultForm());

function createRequiredRule(message: string): ValidationRule {
  return value => (value !== null && value !== undefined && String(value).trim() !== '') || message;
}

const rules: Record<'postName' | 'postCode' | 'deptId' | 'postSort', ValidationRule[]> = {
  postName: [createRequiredRule('请输入岗位名称')],
  postCode: [createRequiredRule('请输入岗位编码')],
  deptId: [createRequiredRule('请选择归属部门')],
  postSort: [createRequiredRule('请输入岗位顺序')]
};

const formTitle = computed(() => (formMode.value === 'add' ? '新增岗位' : '修改岗位'));

function handleAdd() {
  formMode.value = 'add';
  form.value = createDefaultForm();
  restoreValidation();
  formVisible.value = true;
}

async function handleEdit(row: PostVO) {
  formMode.value = 'edit';
  form.value = createDefaultForm();
  restoreValidation();

  const { data: detail, error } = await getPost(row.postId);

  if (!error && detail) {
    Object.assign(form.value, detail);
  }

  formVisible.value = true;
}

async function handleSubmit() {
  if (!(await validate())) return;

  const { error } = form.value.postId ? await updatePost(form.value) : await addPost(form.value);

  if (!error) {
    window.$message?.success(form.value.postId ? '修改成功' : '新增成功');
    formVisible.value = false;
    await getData();
  }
}

/* ------------------------------ 删除 ------------------------------ */

const deleteVisible = ref(false);
const deleteIds = ref<Array<number | string>>([]);

const deleteTip = computed(() => `是否确认删除岗位编号为"${deleteIds.value.join(',')}"的数据项？`);

function handleDelete(row?: PostVO) {
  deleteIds.value = row ? [row.postId] : [...checkedRowKeys.value];

  if (!deleteIds.value.length) {
    window.$message?.warning('请选择要删除的岗位');
    return;
  }

  deleteVisible.value = true;
}

async function confirmDelete() {
  const { error } = await delPost(deleteIds.value);

  if (!error) {
    window.$message?.success('删除成功');
    deleteVisible.value = false;
    deleteIds.value = [];
    checkedRowKeys.value = [];
    await getData();
  }
}

/* ------------------------------ 导出 ------------------------------ */

function handleExport() {
  download('system/post/export', { ...query.value }, `post_${Date.now()}.xlsx`);
}

onMounted(() => {
  getDeptOptions();
});
</script>

<template>
  <div class="flex h-full min-h-0 flex-col gap-4">
    <VCard class="card-wrapper shrink-0">
      <VCardText class="py-3">
        <VForm @submit.prevent="handleSearch">
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <VTextField
              v-model="query.postCode"
              label="岗位编码"
              placeholder="请输入岗位编码"
              density="compact"
              variant="outlined"
              clearable
              hide-details="auto"
              @keyup.enter="handleSearch"
            />
            <VTextField
              v-model="query.postName"
              label="岗位名称"
              placeholder="请输入岗位名称"
              density="compact"
              variant="outlined"
              clearable
              hide-details="auto"
              @keyup.enter="handleSearch"
            />
            <VTextField
              v-model="query.postCategory"
              label="类别编码"
              placeholder="请输入类别编码"
              density="compact"
              variant="outlined"
              clearable
              hide-details="auto"
              @keyup.enter="handleSearch"
            />
            <VSelect
              v-model="query.belongDeptId"
              :items="deptOptions"
              label="归属部门"
              placeholder="请选择部门"
              density="compact"
              variant="outlined"
              clearable
              hide-details="auto"
            />
            <VSelect
              v-model="query.status"
              :items="dict.sys_normal_disable.map(item => ({ title: item.label, value: item.value }))"
              label="状态"
              placeholder="请选择状态"
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
        <span>岗位管理</span>
        <TableHeaderOperation v-model:columns="columnChecks" :loading="loading" @refresh="getData">
          <template #default>
            <VBtn
              v-if="hasAuth('system:post:add')"
              size="small"
              variant="outlined"
              color="primary"
              prepend-icon="mdi-plus"
              @click="handleAdd"
            >
              新增
            </VBtn>
            <VBtn
              v-if="hasAuth('system:post:remove')"
              size="small"
              variant="outlined"
              color="error"
              prepend-icon="mdi-delete"
              :disabled="checkedRowKeys.length === 0"
              @click="handleDelete()"
            >
              批量删除
            </VBtn>
          </template>
          <template #prefix>
            <VBtn
              v-if="hasAuth('system:post:export')"
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
          item-value="postId"
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
            <div class="flex items-center justify-center whitespace-nowrap">
              <VBtn
                v-if="hasAuth('system:post:edit')"
                size="small"
                variant="text"
                color="primary"
                @click="handleEdit(item)"
              >
                修改
              </VBtn>
              <VBtn
                v-if="hasAuth('system:post:remove')"
                size="small"
                variant="text"
                color="error"
                @click="handleDelete(item)"
              >
                删除
              </VBtn>
            </div>
          </template>
        </VDataTableServer>
      </div>
    </VCard>

    <!-- 新增 / 修改岗位 -->
    <VDialog v-model="formVisible" max-width="620" persistent>
      <VCard>
        <VCardTitle>{{ formTitle }}</VCardTitle>
        <VCardText>
          <VForm ref="formRef" validate-on="input" @submit.prevent="handleSubmit">
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <VTextField
                v-model="form.postName"
                label="岗位名称"
                placeholder="请输入岗位名称"
                :rules="rules.postName"
                density="compact"
                variant="outlined"
                hide-details="auto"
              />
              <VTextField
                v-model="form.postCode"
                label="岗位编码"
                placeholder="请输入岗位编码"
                :rules="rules.postCode"
                density="compact"
                variant="outlined"
                hide-details="auto"
              />
              <VSelect
                v-model="form.deptId"
                :items="deptOptions"
                label="归属部门"
                placeholder="请选择部门"
                :rules="rules.deptId"
                density="compact"
                variant="outlined"
                hide-details="auto"
              />
              <VTextField
                v-model="form.postCategory"
                label="类别编码"
                placeholder="请输入类别编码"
                density="compact"
                variant="outlined"
                hide-details="auto"
              />
              <VNumberInput
                v-model="form.postSort"
                label="岗位顺序"
                :min="0"
                :step="1"
                :rules="rules.postSort"
                density="compact"
                variant="outlined"
                control-variant="stacked"
                hide-details="auto"
              />
              <VSelect
                v-model="form.status"
                :items="dict.sys_normal_disable.map(item => ({ title: item.label, value: item.value }))"
                label="岗位状态"
                density="compact"
                variant="outlined"
                hide-details="auto"
              />
              <div class="sm:col-span-2">
                <VTextarea
                  v-model="form.remark"
                  label="备注"
                  placeholder="请输入内容"
                  density="compact"
                  variant="outlined"
                  rows="3"
                  hide-details="auto"
                />
              </div>
            </div>
          </VForm>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn variant="text" @click="formVisible = false">取消</VBtn>
          <VBtn color="primary" variant="flat" @click="handleSubmit">确定</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- 删除确认 -->
    <VDialog v-model="deleteVisible" max-width="420">
      <VCard>
        <VCardTitle>系统提示</VCardTitle>
        <VCardText>{{ deleteTip }}</VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn variant="text" @click="deleteVisible = false">取消</VBtn>
          <VBtn color="error" variant="flat" @click="confirmDelete">确定</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<style scoped></style>
