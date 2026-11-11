<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ValidationRule } from 'vuetify';
import TableHeaderOperation from '@/components/advanced/table-header-operation.vue';
import { useAuth } from '@/hooks/business/auth';
import { toSelectItems, useDict } from '@/hooks/business/dict';
import { useVuetifyForm } from '@/hooks/common/form';
import { useRuoYiTable } from '@/hooks/common/ruoyi-table';
import type { TableColumn } from '@/hooks/common/table';
import {
  addOssConfig,
  changeOssConfigStatus,
  delOssConfig,
  getOssConfig,
  listOssConfig,
  updateOssConfig
} from '@/service/api/ruoyi/system/ossConfig';
import type { OssConfigForm, OssConfigQuery, OssConfigVO } from '@/service/api/ruoyi/system/ossConfig/types';
import { parseTime } from '@/utils/ruoyi';

defineOptions({
  name: 'SystemOssConfig'
});

const { hasAuth } = useAuth();

const dict = useDict('sys_yes_no');

/** 对象存储配置查询参数 */
const query = ref<OssConfigQuery>({
  pageNum: 1,
  pageSize: 10,
  configKey: '',
  bucketName: '',
  status: undefined
});

const { data, loading, pagination, columnChecks, columns, checkedRowKeys, getData, handleQuery } = useRuoYiTable<
  OssConfigVO,
  OssConfigQuery
>({
  api: listOssConfig,
  query,
  showSelect: true,
  columns: (): TableColumn[] => [
    { key: 'index', title: '序号', align: 'center', width: 70, sortable: false },
    { key: 'configKey', title: '配置key', align: 'center', minWidth: 130, sortable: false },
    { key: 'endpoint', title: '访问站点', align: 'center', minWidth: 200, sortable: false },
    { key: 'domainUrl', title: '自定义域名', align: 'center', minWidth: 180, sortable: false },
    { key: 'bucketName', title: '桶名称', align: 'center', minWidth: 130, sortable: false },
    { key: 'prefix', title: '前缀', align: 'center', width: 120, sortable: false },
    { key: 'region', title: '域', align: 'center', width: 120, sortable: false },
    { key: 'accessPolicy', title: '桶权限类型', align: 'center', width: 120, sortable: false },
    { key: 'status', title: '是否默认', align: 'center', width: 110, sortable: false },
    { key: 'createTime', title: '创建时间', align: 'center', width: 170, sortable: false },
    { key: 'actions', title: '操作', align: 'center', width: 150, sortable: false, fixed: 'end' }
  ]
});

const statusItems = computed(() => toSelectItems(dict.sys_yes_no));

/** 桶权限类型选项 */
const accessPolicyOptions = [
  { title: 'private', value: '0', color: 'warning' },
  { title: 'public', value: '1', color: 'success' },
  { title: 'custom', value: '2', color: 'info' }
];

function getAccessPolicyLabel(value?: string) {
  return accessPolicyOptions.find(item => item.value === value)?.title ?? value ?? '-';
}

function getAccessPolicyColor(value?: string) {
  return accessPolicyOptions.find(item => item.value === value)?.color ?? 'default';
}

/* ------------------------------ 查询与重置 ------------------------------ */

async function handleSearch() {
  await handleQuery();
}

async function handleReset() {
  query.value.configKey = '';
  query.value.bucketName = '';
  query.value.status = undefined;
  checkedRowKeys.value = [];

  await handleSearch();
}

/* ------------------------------ 新增 / 修改 ------------------------------ */

const formVisible = ref(false);
const formMode = ref<'add' | 'edit'>('add');
const { formRef, validate, restoreValidation } = useVuetifyForm();

function createDefaultForm(): OssConfigForm {
  return {
    ossConfigId: undefined,
    configKey: '',
    accessKey: '',
    secretKey: '',
    bucketName: '',
    prefix: '',
    endpoint: '',
    domainUrl: '',
    isHttps: 'N',
    accessPolicy: '1',
    region: '',
    status: 'N',
    remark: ''
  };
}

const form = ref<OssConfigForm>(createDefaultForm());

const isEdit = computed(() => form.value.ossConfigId !== undefined && form.value.ossConfigId !== null);

function createRequiredRule(message: string): ValidationRule {
  return value => (value !== null && value !== undefined && String(value).trim() !== '') || message;
}

const rules: Record<'configKey' | 'accessKey' | 'secretKey' | 'bucketName' | 'endpoint', ValidationRule[]> = {
  configKey: [createRequiredRule('请输入配置key')],
  accessKey: [createRequiredRule('请输入accessKey')],
  secretKey: [createRequiredRule('请输入秘钥')],
  bucketName: [createRequiredRule('请输入桶名称')],
  endpoint: [createRequiredRule('请输入访问站点')]
};

const formTitle = computed(() => (formMode.value === 'add' ? '新增对象存储配置' : '修改对象存储配置'));
const protocol = computed(() => (form.value.isHttps === 'Y' ? 'https://' : 'http://'));

function handleAdd() {
  formMode.value = 'add';
  form.value = createDefaultForm();
  restoreValidation();
  formVisible.value = true;
}

async function handleEdit(row: OssConfigVO) {
  formMode.value = 'edit';
  form.value = createDefaultForm();
  restoreValidation();

  const { data: detail, error } = await getOssConfig(row.ossConfigId);

  if (!error && detail) {
    Object.assign(form.value, detail);
  }

  formVisible.value = true;
}

async function handleSubmit() {
  if (!(await validate())) return;

  const { error } = isEdit.value ? await updateOssConfig(form.value) : await addOssConfig(form.value);

  if (!error) {
    window.$message?.success(isEdit.value ? '修改成功' : '新增成功');
    formVisible.value = false;
    await getData();
  }
}

/* ------------------------------ 状态切换（是否默认） ------------------------------ */

async function handleStatusChange(row: OssConfigVO, value: unknown) {
  const enabled = Boolean(value);
  const nextStatus = enabled ? 'Y' : 'N';
  const text = enabled ? '设为默认' : '取消默认';

  const confirmed = await window.$dialog?.warning({
    title: '系统提示',
    content: `确认要"${text}""${row.configKey}"配置吗？`,
    positiveText: '确定',
    negativeText: '取消'
  });

  if (!confirmed) {
    return;
  }

  const { error } = await changeOssConfigStatus(row.ossConfigId, nextStatus, row.configKey);

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

const deleteTip = computed(() => `是否确认删除OSS配置编号为"${deleteIds.value.join(',')}"的数据项？`);

function handleDelete(row?: OssConfigVO) {
  deleteIds.value = row ? [row.ossConfigId] : [...checkedRowKeys.value];

  if (!deleteIds.value.length) {
    window.$message?.warning('请选择要删除的配置');
    return;
  }

  deleteVisible.value = true;
}

async function confirmDelete() {
  deleting.value = true;

  const { error } = await delOssConfig(deleteIds.value);

  deleting.value = false;

  if (!error) {
    window.$message?.success('删除成功');
    deleteVisible.value = false;
    deleteIds.value = [];
    checkedRowKeys.value = [];
    await getData();
  }
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col gap-4">
    <VCard class="card-wrapper shrink-0">
      <VCardText class="py-3">
        <VForm @submit.prevent="handleSearch">
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <VTextField
              v-model="query.configKey"
              label="配置key"
              placeholder="请输入配置key"
              density="compact"
              variant="outlined"
              clearable
              hide-details="auto"
            />
            <VTextField
              v-model="query.bucketName"
              label="桶名称"
              placeholder="请输入桶名称"
              density="compact"
              variant="outlined"
              clearable
              hide-details="auto"
            />
            <VSelect
              persistent-placeholder
              v-model="query.status"
              label="是否默认"
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
        <span>OSS 配置（共 {{ pagination.total }} 条）</span>
        <TableHeaderOperation v-model:columns="columnChecks" :loading="loading" @refresh="getData">
          <template #default>
            <VBtn
              v-if="hasAuth('system:ossConfig:add')"
              size="small"
              variant="outlined"
              color="primary"
              prepend-icon="mdi-plus"
              @click="handleAdd"
            >
              新增
            </VBtn>
            <VBtn
              v-if="hasAuth('system:ossConfig:remove')"
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
          item-value="ossConfigId"
          class="manage-data-table"
          fixed-header
        >
          <template #item.index="{ index }">{{ index + 1 }}</template>
          <template #item.accessPolicy="{ item }">
            <VChip :color="getAccessPolicyColor(item.accessPolicy)" size="small" variant="tonal">
              {{ getAccessPolicyLabel(item.accessPolicy) }}
            </VChip>
          </template>
          <template #item.status="{ item }">
            <VSwitch
              :model-value="item.status === 'Y'"
              color="primary"
              density="compact"
              hide-details
              :disabled="!hasAuth('system:ossConfig:edit')"
              @update:model-value="value => handleStatusChange(item, value)"
            />
          </template>
          <template #item.createTime="{ item }">
            {{ parseTime(item.createTime) }}
          </template>
          <template #item.actions="{ item }">
            <div class="flex items-center justify-center whitespace-nowrap">
              <VBtn
                v-if="hasAuth('system:ossConfig:edit')"
                size="small"
                variant="text"
                color="primary"
                @click="handleEdit(item)"
              >
                修改
              </VBtn>
              <VBtn
                v-if="hasAuth('system:ossConfig:remove')"
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

    <!-- 新增 / 修改对象存储配置 -->
    <VDialog v-model="formVisible" max-width="760" persistent scrollable>
      <VCard>
        <VCardTitle>{{ formTitle }}</VCardTitle>
        <VCardText>
          <VForm ref="formRef" validate-on="input" @submit.prevent="handleSubmit">
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <VTextField
                v-model="form.configKey"
                label="配置key"
                placeholder="请输入配置key"
                :rules="rules.configKey"
                density="compact"
                variant="outlined"
                hide-details="auto"
              />
              <VTextField
                v-model="form.accessKey"
                label="accessKey"
                placeholder="请输入accessKey"
                :rules="rules.accessKey"
                density="compact"
                variant="outlined"
                hide-details="auto"
              />
              <VTextField
                v-model="form.endpoint"
                label="访问站点"
                placeholder="请输入访问站点，如 127.0.0.1:9000"
                :prefix="protocol"
                :rules="rules.endpoint"
                density="compact"
                variant="outlined"
                hide-details="auto"
              />
              <VTextField
                v-model="form.domainUrl"
                label="自定义域名"
                placeholder="请输入自定义域名"
                :prefix="protocol"
                density="compact"
                variant="outlined"
                hide-details="auto"
              />
              <VTextField
                v-model="form.secretKey"
                label="secretKey"
                placeholder="请输入秘钥"
                :rules="rules.secretKey"
                type="password"
                density="compact"
                variant="outlined"
                hide-details="auto"
              />
              <VTextField
                v-model="form.bucketName"
                label="桶名称"
                placeholder="请输入桶名称"
                :rules="rules.bucketName"
                density="compact"
                variant="outlined"
                hide-details="auto"
              />
              <VTextField
                v-model="form.prefix"
                label="前缀"
                placeholder="请输入前缀"
                density="compact"
                variant="outlined"
                hide-details="auto"
              />
              <VTextField
                v-model="form.region"
                label="域"
                placeholder="请输入域"
                density="compact"
                variant="outlined"
                hide-details="auto"
              />
              <div class="sm:col-span-2">
                <VRadioGroup v-model="form.isHttps" label="是否HTTPS" inline hide-details>
                  <VRadio v-for="item in dict.sys_yes_no" :key="item.value" :value="item.value" :label="item.label" />
                </VRadioGroup>
              </div>
              <div class="sm:col-span-2">
                <VRadioGroup v-model="form.accessPolicy" label="桶权限类型" inline hide-details>
                  <VRadio
                    v-for="item in accessPolicyOptions"
                    :key="item.value"
                    :value="item.value"
                    :label="item.title"
                  />
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
          <VBtn :loading="deleting" color="error" variant="flat" @click="confirmDelete">确定</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<style scoped></style>
