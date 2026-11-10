<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ValidationRule } from 'vuetify';
import TableHeaderOperation from '@/components/advanced/table-header-operation.vue';
import DictTag from '@/components/common/dict-tag.vue';
import { useAuth } from '@/hooks/business/auth';
import { useDict } from '@/hooks/business/dict';
import { useVuetifyForm } from '@/hooks/common/form';
import { useRuoYiTable } from '@/hooks/common/ruoyi-table';
import type { TableColumn } from '@/hooks/common/table';
import {
  addConfig,
  delConfig,
  getConfig,
  listConfig,
  refreshCache as refreshConfigCache,
  updateConfig
} from '@/service/api/ruoyi/system/config';
import type { ConfigForm, ConfigQuery, ConfigVO } from '@/service/api/ruoyi/system/config/types';
import { download } from '@/utils/download';
import { parseTime } from '@/utils/ruoyi';

defineOptions({
  name: 'SystemConfig'
});

const { hasAuth } = useAuth();

const dict = useDict('sys_yes_no');

/** 参数配置查询参数 */
const query = ref<ConfigQuery>({
  pageNum: 1,
  pageSize: 10,
  configName: '',
  configKey: '',
  configType: ''
});

const { data, loading, pagination, columns, columnChecks, checkedRowKeys, getData, handleQuery } = useRuoYiTable<
  ConfigVO,
  ConfigQuery
>({
  api: listConfig,
  query,
  showSelect: true,
  columns: (): TableColumn[] => [
    { key: 'index', title: '序号', align: 'center', width: 70, sortable: false },
    { key: 'configName', title: '参数名称', align: 'center', minWidth: 150 },
    { key: 'configKey', title: '参数键名', align: 'center', minWidth: 180 },
    { key: 'configValue', title: '参数键值', align: 'center', minWidth: 200 },
    { key: 'configType', title: '系统内置', align: 'center', width: 110 },
    { key: 'remark', title: '备注', align: 'center', minWidth: 150 },
    { key: 'createTime', title: '创建时间', align: 'center', width: 170, sortable: false },
    { key: 'actions', title: '操作', align: 'center', width: 160, sortable: false }
  ]
});

/** 系统内置筛选项 */
const configTypeOptions = [
  { title: '全部', value: '' },
  { title: '系统内置', value: 'Y' },
  { title: '自定义配置', value: 'N' }
];

async function handleConfigTypeChange(value: unknown) {
  query.value.configType = (value as string) ?? '';

  await handleQuery();
}

/* ------------------------------ 查询与重置 ------------------------------ */

async function handleSearch() {
  await handleQuery();
}

async function handleReset() {
  query.value.configName = '';
  query.value.configKey = '';
  query.value.configType = '';

  await handleSearch();
}

/* ------------------------------ 表单 ------------------------------ */

const formVisible = ref(false);
const formMode = ref<'add' | 'edit'>('add');
const { formRef, validate, restoreValidation } = useVuetifyForm();

function createDefaultForm(): ConfigForm {
  return {
    configId: undefined,
    configName: '',
    configKey: '',
    configValue: '',
    configType: 'Y',
    remark: ''
  };
}

const form = ref<ConfigForm>(createDefaultForm());

function createRequiredRule(message: string): ValidationRule {
  return value => (value !== null && value !== undefined && String(value).trim() !== '') || message;
}

const rules: Record<'configName' | 'configKey' | 'configValue', ValidationRule[]> = {
  configName: [createRequiredRule('请输入参数名称')],
  configKey: [createRequiredRule('请输入参数键名')],
  configValue: [createRequiredRule('请输入参数键值')]
};

const formTitle = computed(() => (formMode.value === 'add' ? '新增参数' : '修改参数'));

function handleAdd() {
  formMode.value = 'add';
  form.value = createDefaultForm();
  restoreValidation();
  formVisible.value = true;
}

async function handleEdit(row: ConfigVO) {
  formMode.value = 'edit';
  form.value = createDefaultForm();
  restoreValidation();

  const { data: detail, error } = await getConfig(row.configId);

  if (!error && detail) {
    Object.assign(form.value, detail);
  }

  formVisible.value = true;
}

async function handleSubmit() {
  if (!(await validate())) return;

  const { error } = form.value.configId ? await updateConfig(form.value) : await addConfig(form.value);

  if (!error) {
    window.$message?.success(form.value.configId ? '修改成功' : '新增成功');
    formVisible.value = false;
    await getData();
  }
}

/* ------------------------------ 删除 ------------------------------ */

const deleteVisible = ref(false);
const deleteIds = ref<Array<number | string>>([]);

const deleteTip = computed(() => `是否确认删除参数编号为"${deleteIds.value.join(',')}"的数据项？`);

function handleDelete(row?: ConfigVO) {
  deleteIds.value = row ? [row.configId] : [...checkedRowKeys.value];

  if (!deleteIds.value.length) {
    window.$message?.warning('请选择要删除的参数');
    return;
  }

  deleteVisible.value = true;
}

async function confirmDelete() {
  const { error } = await delConfig(deleteIds.value);

  if (!error) {
    window.$message?.success('删除成功');
    deleteVisible.value = false;
    deleteIds.value = [];
    checkedRowKeys.value = [];
    await getData();
  }
}

/* ------------------------------ 刷新缓存 / 导出 ------------------------------ */

async function handleRefreshCache() {
  const { error } = await refreshConfigCache();

  if (!error) {
    window.$message?.success('刷新缓存成功');
  }
}

function handleExport() {
  download('system/config/export', { ...query.value }, `config_${Date.now()}.xlsx`);
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col gap-4">
    <VCard class="card-wrapper shrink-0">
      <VCardText class="py-3">
        <VForm @submit.prevent="handleSearch">
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <VTextField
              v-model="query.configName"
              label="参数名称"
              placeholder="请输入参数名称"
              density="compact"
              variant="outlined"
              clearable
              hide-details="auto"
              @keyup.enter="handleSearch"
            />
            <VTextField
              v-model="query.configKey"
              label="参数键名"
              placeholder="请输入参数键名"
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
        <div class="flex flex-wrap items-center gap-3">
          <span>参数配置</span>
          <div class="flex items-center gap-1">
            <VBtn
              v-for="item in configTypeOptions"
              :key="item.value"
              size="small"
              :variant="query.configType === item.value ? 'flat' : 'text'"
              :color="query.configType === item.value ? 'primary' : undefined"
              @click="handleConfigTypeChange(item.value)"
            >
              {{ item.title }}
            </VBtn>
          </div>
        </div>
        <TableHeaderOperation v-model:columns="columnChecks" :loading="loading" @refresh="getData">
          <template #default>
            <VBtn
              v-if="hasAuth('system:config:add')"
              size="small"
              variant="outlined"
              color="primary"
              prepend-icon="mdi-plus"
              @click="handleAdd"
            >
              新增
            </VBtn>
            <VBtn
              v-if="hasAuth('system:config:remove')"
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
              v-if="hasAuth('system:config:export')"
              size="small"
              variant="outlined"
              color="success"
              prepend-icon="mdi-export"
              @click="handleExport"
            >
              导出
            </VBtn>
            <VBtn
              v-if="hasAuth('system:config:remove')"
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
          item-value="configId"
          class="manage-data-table"
          fixed-header
        >
          <template #item.index="{ index }">{{ index + 1 }}</template>
          <template #item.configValue="{ item }">
            <span class="block truncate" style="max-width: 320px" :title="item.configValue">
              {{ item.configValue }}
            </span>
          </template>
          <template #item.configType="{ item }">
            <DictTag :options="dict.sys_yes_no" :value="item.configType" />
          </template>
          <template #item.remark="{ item }">{{ item.remark || '-' }}</template>
          <template #item.createTime="{ item }">
            {{ parseTime(item.createTime) }}
          </template>
          <template #item.actions="{ item }">
            <div class="flex items-center justify-center whitespace-nowrap">
              <VBtn
                v-if="hasAuth('system:config:edit')"
                size="small"
                variant="text"
                color="primary"
                @click="handleEdit(item)"
              >
                修改
              </VBtn>
              <VBtn
                v-if="hasAuth('system:config:remove')"
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

    <!-- 新增 / 修改参数 -->
    <VDialog v-model="formVisible" max-width="620" persistent>
      <VCard>
        <VCardTitle>{{ formTitle }}</VCardTitle>
        <VCardText>
          <VForm ref="formRef" validate-on="input" @submit.prevent="handleSubmit">
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <VTextField
                v-model="form.configName"
                label="参数名称"
                placeholder="请输入参数名称"
                :rules="rules.configName"
                density="compact"
                variant="outlined"
                hide-details="auto"
              />
              <VTextField
                v-model="form.configKey"
                label="参数键名"
                placeholder="请输入参数键名"
                :rules="rules.configKey"
                density="compact"
                variant="outlined"
                hide-details="auto"
              />
              <div class="sm:col-span-2">
                <VTextarea
                  v-model="form.configValue"
                  label="参数键值"
                  placeholder="请输入参数键值"
                  :rules="rules.configValue"
                  density="compact"
                  variant="outlined"
                  rows="3"
                  hide-details="auto"
                />
              </div>
              <div class="sm:col-span-2">
                <VRadioGroup v-model="form.configType" label="系统内置" inline hide-details>
                  <VRadio v-for="item in dict.sys_yes_no" :key="item.value" :value="item.value" :label="item.label" />
                </VRadioGroup>
              </div>
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
