<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ValidationRule } from 'vuetify';
import TableHeaderOperation from '@/components/advanced/table-header-operation.vue';
import { useAuth } from '@/hooks/business/auth';
import { useVuetifyForm } from '@/hooks/common/form';
import { useRuoYiTable } from '@/hooks/common/ruoyi-table';
import type { TableColumn } from '@/hooks/common/table';
import { addType, delType, getType, listType, refreshDictCache, updateType } from '@/service/api/ruoyi/system/dict';
import type { DictTypeForm, DictTypeQuery, DictTypeVO } from '@/service/api/ruoyi/system/dict/types';
import { useDictStore } from '@/store/modules/dict';
import { download } from '@/utils/download';
import { parseTime } from '@/utils/ruoyi';
import DictDataDrawer from './modules/dict-data-drawer.vue';

defineOptions({
  name: 'SystemDict'
});

const { hasAuth } = useAuth();

/** 字典类型查询参数 */
const query = ref<DictTypeQuery>({
  pageNum: 1,
  pageSize: 10,
  dictName: '',
  dictType: ''
});

const { data, loading, pagination, columns, columnChecks, checkedRowKeys, getData, handleQuery } = useRuoYiTable<
  DictTypeVO,
  DictTypeQuery
>({
  api: listType,
  query,
  showSelect: true,
  columns: (): TableColumn[] => [
    { key: 'index', title: '序号', align: 'center', width: 70, sortable: false },
    { key: 'dictName', title: '字典名称', align: 'center', minWidth: 130 },
    { key: 'dictType', title: '字典类型', align: 'center', minWidth: 180 },
    { key: 'remark', title: '备注', align: 'center', minWidth: 150 },
    { key: 'createTime', title: '创建时间', align: 'center', width: 170, sortable: false },
    { key: 'actions', title: '操作', align: 'center', width: 220, sortable: false }
  ]
});

/* ------------------------------ 查询与重置 ------------------------------ */

async function handleSearch() {
  await handleQuery();
}

async function handleReset() {
  query.value.dictName = '';
  query.value.dictType = '';

  await handleSearch();
}

/* ------------------------------ 表单 ------------------------------ */

const formVisible = ref(false);
const formMode = ref<'add' | 'edit'>('add');
const { formRef, validate, restoreValidation } = useVuetifyForm();

function createDefaultForm(): DictTypeForm {
  return {
    dictId: undefined,
    dictName: '',
    dictType: '',
    remark: ''
  };
}

const form = ref<DictTypeForm>(createDefaultForm());

function createRequiredRule(message: string): ValidationRule {
  return value => (value !== null && value !== undefined && String(value).trim() !== '') || message;
}

const rules: Record<'dictName' | 'dictType', ValidationRule[]> = {
  dictName: [createRequiredRule('请输入字典名称')],
  dictType: [createRequiredRule('请输入字典类型')]
};

const formTitle = computed(() => (formMode.value === 'add' ? '新增字典类型' : '修改字典类型'));

function handleAdd() {
  formMode.value = 'add';
  form.value = createDefaultForm();
  restoreValidation();
  formVisible.value = true;
}

async function handleEdit(row: DictTypeVO) {
  formMode.value = 'edit';
  form.value = createDefaultForm();
  restoreValidation();

  const { data: detail, error } = await getType(row.dictId);

  if (!error && detail) {
    Object.assign(form.value, detail);
  }

  formVisible.value = true;
}

async function handleSubmit() {
  if (!(await validate())) return;

  const { error } = form.value.dictId ? await updateType(form.value) : await addType(form.value);

  if (!error) {
    window.$message?.success(form.value.dictId ? '修改成功' : '新增成功');
    formVisible.value = false;
    useDictStore().resetDict();
    await getData();
  }
}

/* ------------------------------ 删除 ------------------------------ */

const deleteVisible = ref(false);
const deleteIds = ref<Array<number | string>>([]);

const deleteTip = computed(() => `是否确认删除字典编号为"${deleteIds.value.join(',')}"的数据项？`);

function handleDelete(row?: DictTypeVO) {
  deleteIds.value = row ? [row.dictId] : [...checkedRowKeys.value];

  if (!deleteIds.value.length) {
    window.$message?.warning('请选择要删除的字典类型');
    return;
  }

  deleteVisible.value = true;
}

async function confirmDelete() {
  const { error } = await delType(deleteIds.value);

  if (!error) {
    window.$message?.success('删除成功');
    deleteVisible.value = false;
    deleteIds.value = [];
    checkedRowKeys.value = [];
    useDictStore().resetDict();
    await getData();
  }
}

/* ------------------------------ 字典数据 ------------------------------ */

const dataDrawerVisible = ref(false);
const currentDict = ref<DictTypeVO | null>(null);

function handleOpenData(row: DictTypeVO) {
  currentDict.value = row;
  dataDrawerVisible.value = true;
}

/* ------------------------------ 刷新缓存 / 导出 ------------------------------ */

async function handleRefreshCache() {
  const { error } = await refreshDictCache();

  if (!error) {
    useDictStore().resetDict();
    window.$message?.success('刷新成功');
  }
}

function handleExport() {
  download('system/dict/type/export', { ...query.value }, `dict_${Date.now()}.xlsx`);
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col gap-4">
    <VCard class="card-wrapper shrink-0">
      <VCardText class="py-3">
        <VForm @submit.prevent="handleSearch">
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <VTextField
              v-model="query.dictName"
              label="字典名称"
              placeholder="请输入字典名称"
              density="compact"
              variant="outlined"
              clearable
              hide-details="auto"
              @keyup.enter="handleSearch"
            />
            <VTextField
              v-model="query.dictType"
              label="字典类型"
              placeholder="请输入字典类型"
              density="compact"
              variant="outlined"
              clearable
              hide-details="auto"
              @keyup.enter="handleSearch"
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
        <span>字典管理</span>
        <TableHeaderOperation v-model:columns="columnChecks" :loading="loading" @refresh="getData">
          <template #default>
            <VBtn
              v-if="hasAuth('system:dict:add')"
              size="small"
              variant="outlined"
              color="primary"
              prepend-icon="mdi-plus"
              @click="handleAdd"
            >
              新增
            </VBtn>
            <VBtn
              v-if="hasAuth('system:dict:remove')"
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
              v-if="hasAuth('system:dict:export')"
              size="small"
              variant="outlined"
              color="success"
              prepend-icon="mdi-export"
              @click="handleExport"
            >
              导出
            </VBtn>
            <VBtn
              v-if="hasAuth('system:dict:remove')"
              size="small"
              variant="outlined"
              color="warning"
              prepend-icon="mdi-cached"
              @click="handleRefreshCache"
            >
              刷新缓存
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
          item-value="dictId"
          class="manage-data-table"
          fixed-header
        >
          <template #item.index="{ index }">{{ index + 1 }}</template>
          <template #item.dictType="{ item }">
            <VBtn size="small" variant="text" color="primary" @click="handleOpenData(item)">
              {{ item.dictType }}
            </VBtn>
          </template>
          <template #item.createTime="{ item }">
            {{ parseTime(item.createTime) }}
          </template>
          <template #item.actions="{ item }">
            <div class="flex items-center justify-center whitespace-nowrap">
              <VBtn size="small" variant="text" color="primary" @click="handleOpenData(item)">字典数据</VBtn>
              <VBtn
                v-if="hasAuth('system:dict:edit')"
                size="small"
                variant="text"
                color="primary"
                @click="handleEdit(item)"
              >
                修改
              </VBtn>
              <VBtn
                v-if="hasAuth('system:dict:remove')"
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

    <!-- 字典数据抽屉 -->
    <DictDataDrawer v-model:visible="dataDrawerVisible" :dict="currentDict" />

    <!-- 新增 / 修改字典类型 -->
    <VDialog v-model="formVisible" max-width="560" persistent>
      <VCard>
        <VCardTitle>{{ formTitle }}</VCardTitle>
        <VCardText>
          <VForm ref="formRef" validate-on="input" @submit.prevent="handleSubmit">
            <div class="flex flex-col gap-3">
              <VTextField
                v-model="form.dictName"
                label="字典名称"
                placeholder="请输入字典名称"
                :rules="rules.dictName"
                density="compact"
                variant="outlined"
                hide-details="auto"
              />
              <VTextField
                v-model="form.dictType"
                label="字典类型"
                placeholder="请输入字典类型，如：sys_user_gender"
                :rules="rules.dictType"
                density="compact"
                variant="outlined"
                maxlength="100"
                hide-details="auto"
              />
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
