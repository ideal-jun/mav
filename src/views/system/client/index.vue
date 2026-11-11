<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ValidationRule } from 'vuetify';
import TableHeaderOperation from '@/components/advanced/table-header-operation.vue';
import DictTag from '@/components/common/dict-tag.vue';
import { useAuth } from '@/hooks/business/auth';
import { getDictLabel, toSelectItems, useDict } from '@/hooks/business/dict';
import { useVuetifyForm } from '@/hooks/common/form';
import { useRuoYiTable } from '@/hooks/common/ruoyi-table';
import type { TableColumn } from '@/hooks/common/table';
import {
  addClient,
  changeClientStatus,
  delClient,
  getClient,
  listClient,
  updateClient
} from '@/service/api/ruoyi/system/client';
import type { ClientForm, ClientQuery, ClientVO } from '@/service/api/ruoyi/system/client/types';
import { download } from '@/utils/download';

defineOptions({
  name: 'SystemClient'
});

const { hasAuth } = useAuth();

const dict = useDict('sys_normal_disable', 'sys_grant_type', 'sys_device_type');

/** 客户端管理查询参数 */
const query = ref<ClientQuery>({
  pageNum: 1,
  pageSize: 10,
  clientKey: '',
  clientSecret: '',
  status: undefined
});

const { data, loading, pagination, columnChecks, columns, checkedRowKeys, getData, handleQuery } = useRuoYiTable<
  ClientVO,
  ClientQuery
>({
  api: listClient,
  query,
  showSelect: true,
  columns: (): TableColumn[] => [
    { key: 'index', title: '序号', align: 'center', width: 70, sortable: false },
    { key: 'clientId', title: '客户端标识', align: 'center', minWidth: 230, sortable: false },
    { key: 'clientKey', title: '客户端Key', align: 'center', minWidth: 150, sortable: false },
    { key: 'clientSecret', title: '客户端秘钥', align: 'center', minWidth: 200, sortable: false },
    { key: 'grantTypeList', title: '授权类型', align: 'center', minWidth: 180, sortable: false },
    { key: 'deviceType', title: '设备类型', align: 'center', width: 120, sortable: false },
    { key: 'status', title: '状态', align: 'center', width: 100, sortable: false },
    { key: 'actions', title: '操作', align: 'center', width: 150, sortable: false, fixed: 'end' }
  ]
});

const statusItems = computed(() => toSelectItems(dict.sys_normal_disable));
const grantTypeItems = computed(() => toSelectItems(dict.sys_grant_type));
const deviceTypeItems = computed(() => toSelectItems(dict.sys_device_type));

/* ------------------------------ 秘钥显示/隐藏 ------------------------------ */

const secretVisible = ref<Record<string, boolean>>({});

function toggleSecret(id: string | number) {
  const key = String(id);

  secretVisible.value[key] = !secretVisible.value[key];
}

function maskSecret(secret?: string) {
  if (!secret) {
    return '-';
  }

  return '••••••••••••';
}

/* ------------------------------ 查询与重置 ------------------------------ */

async function handleSearch() {
  await handleQuery();
}

async function handleReset() {
  query.value.clientKey = '';
  query.value.clientSecret = '';
  query.value.status = undefined;
  checkedRowKeys.value = [];

  await handleSearch();
}

/* ------------------------------ 新增 / 修改 ------------------------------ */

interface ClientFormModel extends ClientForm {
  activeTimeout: number;
  timeout: number;
}

const formVisible = ref(false);
const formMode = ref<'add' | 'edit'>('add');
const { formRef, validate, restoreValidation } = useVuetifyForm();

function createDefaultForm(): ClientFormModel {
  return {
    id: undefined,
    clientId: undefined,
    clientKey: '',
    clientSecret: '',
    grantTypeList: [],
    deviceType: 'pc',
    accessPath: '',
    ipWhitelist: '',
    activeTimeout: 1800,
    timeout: 604800,
    status: '0'
  };
}

const form = ref<ClientFormModel>(createDefaultForm());

const isEdit = computed(() => form.value.id !== undefined && form.value.id !== null);

function createRequiredRule(message: string): ValidationRule {
  return value => (value !== null && value !== undefined && String(value).trim() !== '') || message;
}

function createRequiredArrayRule(message: string): ValidationRule {
  return value => (Array.isArray(value) && value.length > 0) || message;
}

const rules: Record<'clientKey' | 'clientSecret' | 'grantTypeList', ValidationRule[]> = {
  clientKey: [createRequiredRule('请输入客户端key')],
  clientSecret: [createRequiredRule('请输入客户端秘钥')],
  grantTypeList: [createRequiredArrayRule('请选择授权类型')]
};

const formTitle = computed(() => (formMode.value === 'add' ? '新增客户端' : '修改客户端'));

function handleAdd() {
  formMode.value = 'add';
  form.value = createDefaultForm();
  restoreValidation();
  formVisible.value = true;
}

async function handleEdit(row: ClientVO) {
  formMode.value = 'edit';
  form.value = createDefaultForm();
  restoreValidation();

  const { data: detail, error } = await getClient(row.id);

  if (!error && detail) {
    Object.assign(form.value, detail);

    if (!form.value.activeTimeout) {
      form.value.activeTimeout = 1800;
    }

    if (!form.value.timeout) {
      form.value.timeout = 604800;
    }
  }

  formVisible.value = true;
}

async function handleSubmit() {
  if (!(await validate())) return;

  const { error } = isEdit.value ? await updateClient(form.value) : await addClient(form.value);

  if (!error) {
    window.$message?.success(isEdit.value ? '修改成功' : '新增成功');
    formVisible.value = false;
    await getData();
  }
}

/* ------------------------------ 状态切换 ------------------------------ */

async function handleStatusChange(row: ClientVO, value: unknown) {
  const enabled = Boolean(value);
  const nextStatus = enabled ? '0' : '1';
  const text = enabled ? '启用' : '停用';

  const confirmed = await window.$dialog?.warning({
    title: '系统提示',
    content: `确认要"${text}"客户端"${row.clientKey}"吗？`,
    positiveText: '确定',
    negativeText: '取消'
  });

  if (!confirmed) {
    return;
  }

  const { error } = await changeClientStatus(String(row.clientId), nextStatus);

  if (!error) {
    row.status = nextStatus;
    window.$message?.success(`${text}成功`);
    await getData();
  }
}

/* ------------------------------ 删除 ------------------------------ */

const deleteVisible = ref(false);
const deleteIds = ref<Array<string | number>>([]);
const deleting = ref(false);

const deleteTip = computed(() => `是否确认删除客户端管理编号为"${deleteIds.value.join(',')}"的数据项？`);

function handleDelete(row?: ClientVO) {
  deleteIds.value = row ? [row.id] : [...checkedRowKeys.value];

  if (!deleteIds.value.length) {
    window.$message?.warning('请选择要删除的客户端');
    return;
  }

  deleteVisible.value = true;
}

async function confirmDelete() {
  deleting.value = true;

  const { error } = await delClient(deleteIds.value);

  deleting.value = false;

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
  download('system/client/export', { ...query.value }, `client_${Date.now()}.xlsx`);
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col gap-4">
    <VCard class="card-wrapper shrink-0">
      <VCardText class="py-3">
        <VForm @submit.prevent="handleSearch">
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <VTextField
              v-model="query.clientKey"
              label="客户端key"
              placeholder="请输入客户端key"
              density="compact"
              variant="outlined"
              clearable
              hide-details="auto"
            />
            <VTextField
              v-model="query.clientSecret"
              label="客户端秘钥"
              placeholder="请输入客户端秘钥"
              density="compact"
              variant="outlined"
              clearable
              hide-details="auto"
            />
            <VSelect
              persistent-placeholder
              v-model="query.status"
              label="状态"
              placeholder="请选择状态"
              :items="statusItems"
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
        <span>客户端管理（共 {{ pagination.total }} 条）</span>
        <TableHeaderOperation v-model:columns="columnChecks" :loading="loading" @refresh="getData">
          <template #default>
            <VBtn
              v-if="hasAuth('system:client:add')"
              size="small"
              variant="outlined"
              color="primary"
              prepend-icon="mdi-plus"
              @click="handleAdd"
            >
              新增
            </VBtn>
            <VBtn
              v-if="hasAuth('system:client:remove')"
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
              v-if="hasAuth('system:client:export')"
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
          item-value="id"
          class="manage-data-table"
          fixed-header
        >
          <template #item.index="{ index }">{{ index + 1 }}</template>
          <template #item.clientId="{ item }">
            <span class="block truncate font-mono" style="max-width: 240px" :title="item.clientId">
              {{ item.clientId || '-' }}
            </span>
          </template>
          <template #item.clientSecret="{ item }">
            <div class="flex items-center justify-center gap-1">
              <span class="font-mono">
                {{ secretVisible[String(item.id)] ? item.clientSecret || '-' : maskSecret(item.clientSecret) }}
              </span>
              <VBtn
                :icon="secretVisible[String(item.id)] ? 'mdi-eye-off' : 'mdi-eye'"
                size="x-small"
                variant="text"
                :title="secretVisible[String(item.id)] ? '隐藏秘钥' : '显示秘钥'"
                @click="toggleSecret(item.id)"
              />
            </div>
          </template>
          <template #item.grantTypeList="{ item }">
            <div class="flex flex-wrap justify-center gap-1">
              <VChip v-for="grantType in item.grantTypeList ?? []" :key="grantType" size="x-small" variant="tonal">
                {{ getDictLabel(dict.sys_grant_type, grantType) }}
              </VChip>
              <span v-if="!item.grantTypeList?.length">-</span>
            </div>
          </template>
          <template #item.deviceType="{ item }">
            <DictTag :options="dict.sys_device_type" :value="item.deviceType" />
          </template>
          <template #item.status="{ item }">
            <VSwitch
              :model-value="item.status === '0'"
              color="primary"
              density="compact"
              hide-details
              :disabled="!hasAuth('system:client:edit')"
              @update:model-value="value => handleStatusChange(item, value)"
            />
          </template>
          <template #item.actions="{ item }">
            <div class="flex items-center justify-center whitespace-nowrap">
              <VBtn
                v-if="hasAuth('system:client:edit')"
                size="small"
                variant="text"
                color="primary"
                @click="handleEdit(item)"
              >
                修改
              </VBtn>
              <VBtn
                v-if="hasAuth('system:client:remove')"
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

    <!-- 新增 / 修改客户端 -->
    <VDialog v-model="formVisible" max-width="760" persistent scrollable>
      <VCard>
        <VCardTitle>{{ formTitle }}</VCardTitle>
        <VCardText>
          <VForm ref="formRef" validate-on="input" @submit.prevent="handleSubmit">
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <VTextField
                v-model="form.clientKey"
                label="客户端key"
                placeholder="请输入客户端key"
                :rules="rules.clientKey"
                :disabled="isEdit"
                density="compact"
                variant="outlined"
                hide-details="auto"
              />
              <VTextField
                v-model="form.clientSecret"
                label="客户端秘钥"
                placeholder="请输入客户端秘钥"
                :rules="rules.clientSecret"
                :disabled="isEdit"
                density="compact"
                variant="outlined"
                hide-details="auto"
              />
              <VSelect
                v-model="form.grantTypeList"
                label="授权类型"
                placeholder="请选择授权类型"
                :items="grantTypeItems"
                :rules="rules.grantTypeList"
                multiple
                chips
                closable-chips
                density="compact"
                variant="outlined"
                hide-details="auto"
              />
              <VSelect
                v-model="form.deviceType"
                label="设备类型"
                placeholder="请选择设备类型"
                :items="deviceTypeItems"
                density="compact"
                variant="outlined"
                hide-details="auto"
              />
              <div class="sm:col-span-2">
                <VTextarea
                  v-model="form.accessPath"
                  label="允许访问路径"
                  placeholder="示例：/app/**"
                  messages="多个路径可按换行、逗号或分号分隔；为空表示允许访问所有接口路径"
                  density="compact"
                  variant="outlined"
                  rows="3"
                  hide-details="auto"
                />
              </div>
              <div class="sm:col-span-2">
                <VTextarea
                  v-model="form.ipWhitelist"
                  label="IP白名单"
                  placeholder="示例：127.0.0.1&#10;192.168.*.*&#10;10.0.0.0/24"
                  messages="支持精确IP、通配符和CIDR；多个规则可按换行、逗号或分号分隔；为空表示允许所有IP"
                  density="compact"
                  variant="outlined"
                  rows="3"
                  hide-details="auto"
                />
              </div>
              <VNumberInput
                v-model="form.activeTimeout"
                label="Token活跃超时时间"
                messages="指定时间无操作则过期（单位：秒），默认30分钟（1800秒）"
                :min="1"
                :step="1"
                density="compact"
                variant="outlined"
                control-variant="stacked"
                hide-details="auto"
              />
              <VNumberInput
                v-model="form.timeout"
                label="Token固定超时时间"
                messages="指定时间必定过期（单位：秒），默认七天（604800秒）"
                :min="1"
                :step="1"
                density="compact"
                variant="outlined"
                control-variant="stacked"
                hide-details="auto"
              />
              <div class="sm:col-span-2">
                <VRadioGroup v-model="form.status" label="状态" inline hide-details>
                  <VRadio
                    v-for="item in dict.sys_normal_disable"
                    :key="item.value"
                    :value="item.value"
                    :label="item.label"
                  />
                </VRadioGroup>
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
          <VBtn :loading="deleting" color="error" variant="flat" @click="confirmDelete">确定</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<style scoped></style>
