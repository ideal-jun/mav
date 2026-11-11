<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ValidationRule } from 'vuetify';
import domPurify from 'dompurify';
import TableHeaderOperation from '@/components/advanced/table-header-operation.vue';
import DictTag from '@/components/common/dict-tag.vue';
import { useAuth } from '@/hooks/business/auth';
import { useDict } from '@/hooks/business/dict';
import { useVuetifyForm } from '@/hooks/common/form';
import { useRuoYiTable } from '@/hooks/common/ruoyi-table';
import type { TableColumn } from '@/hooks/common/table';
import { addNotice, delNotice, getNotice, listNotice, updateNotice } from '@/service/api/ruoyi/system/notice';
import type { NoticeForm, NoticeQuery, NoticeVO } from '@/service/api/ruoyi/system/notice/types';
import { parseTime } from '@/utils/ruoyi';

defineOptions({
  name: 'SystemNotice'
});

const { hasAuth } = useAuth();

const dict = useDict('sys_notice_type', 'sys_notice_status');

/** 公告查询参数 */
const query = ref<NoticeQuery>({
  pageNum: 1,
  pageSize: 10,
  noticeTitle: '',
  createByName: '',
  status: '',
  noticeType: undefined
});

const { data, loading, pagination, columns, columnChecks, checkedRowKeys, getData, handleQuery } = useRuoYiTable<
  NoticeVO,
  NoticeQuery
>({
  api: listNotice,
  query,
  showSelect: true,
  columns: (): TableColumn[] => [
    { key: 'index', title: '序号', align: 'center', width: 70, sortable: false },
    { key: 'noticeTitle', title: '公告标题', align: 'start', minWidth: 220 },
    { key: 'noticeType', title: '公告类型', align: 'center', width: 110 },
    { key: 'status', title: '状态', align: 'center', width: 100 },
    { key: 'createByName', title: '创建者', align: 'center', width: 120 },
    { key: 'createTime', title: '创建时间', align: 'center', width: 130, sortable: false },
    { key: 'actions', title: '操作', align: 'center', width: 200, sortable: false }
  ]
});

/* ------------------------------ 查询与重置 ------------------------------ */

async function handleSearch() {
  await handleQuery();
}

async function handleReset() {
  query.value.noticeTitle = '';
  query.value.createByName = '';
  query.value.noticeType = undefined;
  query.value.status = undefined;

  await handleSearch();
}

/* ------------------------------ 详情 ------------------------------ */

const detailVisible = ref(false);
const detail = ref<NoticeVO | null>(null);

const safeNoticeContent = computed(() => {
  const content = detail.value?.noticeContent;

  if (!content) {
    return '<p>暂无公告内容</p>';
  }

  return domPurify.sanitize(content);
});

async function handleDetail(row: NoticeVO) {
  const { data: notice, error } = await getNotice(row.noticeId);

  if (!error && notice) {
    detail.value = notice;
    detailVisible.value = true;
  }
}

/* ------------------------------ 表单 ------------------------------ */

const formVisible = ref(false);
const formMode = ref<'add' | 'edit'>('add');
const { formRef, validate, restoreValidation } = useVuetifyForm();

function createDefaultForm(): NoticeForm {
  return {
    noticeId: undefined,
    noticeTitle: '',
    noticeType: '1',
    noticeContent: '',
    status: '0',
    remark: '',
    createByName: ''
  };
}

const form = ref<NoticeForm>(createDefaultForm());

function createRequiredRule(message: string): ValidationRule {
  return value => (value !== null && value !== undefined && String(value).trim() !== '') || message;
}

const rules: Record<'noticeTitle' | 'noticeType', ValidationRule[]> = {
  noticeTitle: [createRequiredRule('请输入公告标题')],
  noticeType: [createRequiredRule('请选择公告类型')]
};

const formTitle = computed(() => (formMode.value === 'add' ? '新增公告' : '修改公告'));

function handleAdd() {
  formMode.value = 'add';
  form.value = createDefaultForm();
  restoreValidation();
  formVisible.value = true;
}

async function handleEdit(row: NoticeVO) {
  formMode.value = 'edit';
  form.value = createDefaultForm();
  restoreValidation();

  const { data: notice, error } = await getNotice(row.noticeId);

  if (!error && notice) {
    Object.assign(form.value, notice);
  }

  formVisible.value = true;
}

async function handleSubmit() {
  if (!(await validate())) return;

  const { error } = form.value.noticeId ? await updateNotice(form.value) : await addNotice(form.value);

  if (!error) {
    window.$message?.success(form.value.noticeId ? '修改成功' : '新增成功');
    formVisible.value = false;
    await getData();
  }
}

/* ------------------------------ 删除 ------------------------------ */

const deleteVisible = ref(false);
const deleteIds = ref<Array<number | string>>([]);

const deleteTip = computed(() => `是否确认删除公告编号为"${deleteIds.value.join(',')}"的数据项？`);

function handleDelete(row?: NoticeVO) {
  deleteIds.value = row ? [row.noticeId] : [...checkedRowKeys.value];

  if (!deleteIds.value.length) {
    window.$message?.warning('请选择要删除的公告');
    return;
  }

  deleteVisible.value = true;
}

async function confirmDelete() {
  const { error } = await delNotice(deleteIds.value);

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
              v-model="query.noticeTitle"
              label="公告标题"
              placeholder="请输入公告标题"
              density="compact"
              variant="outlined"
              clearable
              hide-details="auto"
              @keyup.enter="handleSearch"
            />
            <VTextField
              v-model="query.createByName"
              label="操作人员"
              placeholder="请输入操作人员"
              density="compact"
              variant="outlined"
              clearable
              hide-details="auto"
              @keyup.enter="handleSearch"
            />
            <VSelect
              persistent-placeholder
              v-model="query.noticeType"
              :items="dict.sys_notice_type.map(item => ({ title: item.label, value: item.value }))"
              label="公告类型"
              placeholder="请选择公告类型"
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
        <span>通知公告</span>
        <TableHeaderOperation v-model:columns="columnChecks" :loading="loading" @refresh="getData">
          <template #default>
            <VBtn
              v-if="hasAuth('system:notice:add')"
              size="small"
              variant="outlined"
              color="primary"
              prepend-icon="mdi-plus"
              @click="handleAdd"
            >
              新增
            </VBtn>
            <VBtn
              v-if="hasAuth('system:notice:remove')"
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
          item-value="noticeId"
          class="manage-data-table"
          fixed-header
        >
          <template #item.index="{ index }">{{ index + 1 }}</template>
          <template #item.noticeTitle="{ item }">
            <VBtn variant="text" color="primary" class="justify-start px-0 text-left" @click="handleDetail(item)">
              {{ item.noticeTitle }}
            </VBtn>
          </template>
          <template #item.noticeType="{ item }">
            <DictTag :options="dict.sys_notice_type" :value="item.noticeType" />
          </template>
          <template #item.status="{ item }">
            <DictTag :options="dict.sys_notice_status" :value="item.status" />
          </template>
          <template #item.createTime="{ item }">
            {{ parseTime(item.createTime, '{y}-{m}-{d}') }}
          </template>
          <template #item.actions="{ item }">
            <div class="flex items-center justify-center whitespace-nowrap">
              <VBtn size="small" variant="text" color="primary" @click="handleDetail(item)">详情</VBtn>
              <VBtn
                v-if="hasAuth('system:notice:edit')"
                size="small"
                variant="text"
                color="primary"
                @click="handleEdit(item)"
              >
                修改
              </VBtn>
              <VBtn
                v-if="hasAuth('system:notice:remove')"
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

    <!-- 新增 / 修改公告 -->
    <VDialog v-model="formVisible" max-width="820" persistent scrollable>
      <VCard>
        <VCardTitle>{{ formTitle }}</VCardTitle>
        <VCardText>
          <VForm ref="formRef" validate-on="input" @submit.prevent="handleSubmit">
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <VTextField
                v-model="form.noticeTitle"
                label="公告标题"
                placeholder="请输入公告标题"
                :rules="rules.noticeTitle"
                density="compact"
                variant="outlined"
                hide-details="auto"
              />
              <VSelect
                v-model="form.noticeType"
                :items="dict.sys_notice_type.map(item => ({ title: item.label, value: item.value }))"
                label="公告类型"
                placeholder="请选择公告类型"
                :rules="rules.noticeType"
                density="compact"
                variant="outlined"
                hide-details="auto"
              />
              <div class="sm:col-span-2">
                <VRadioGroup v-model="form.status" label="状态" inline hide-details>
                  <VRadio
                    v-for="item in dict.sys_notice_status"
                    :key="item.value"
                    :value="item.value"
                    :label="item.label"
                  />
                </VRadioGroup>
              </div>
              <div class="sm:col-span-2">
                <VTextarea
                  v-model="form.noticeContent"
                  label="公告内容"
                  placeholder="请输入公告内容，支持 HTML 标签"
                  density="compact"
                  variant="outlined"
                  rows="8"
                  hide-details="auto"
                />
              </div>
              <div class="sm:col-span-2">
                <VTextarea
                  v-model="form.remark"
                  label="备注"
                  placeholder="请输入内容"
                  density="compact"
                  variant="outlined"
                  rows="2"
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

    <!-- 公告详情 -->
    <VDialog v-model="detailVisible" max-width="820" scrollable>
      <VCard>
        <VCardTitle class="flex items-center justify-between gap-2">
          <span>{{ detail?.noticeTitle || '公告详情' }}</span>
          <VBtn icon="mdi-close" variant="text" density="comfortable" @click="detailVisible = false" />
        </VCardTitle>
        <VCardText>
          <div class="mb-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-medium-emphasis">
            <span class="flex items-center gap-1">
              类型：
              <DictTag :options="dict.sys_notice_type" :value="detail?.noticeType" />
            </span>
            <span class="flex items-center gap-1">
              状态：
              <DictTag :options="dict.sys_notice_status" :value="detail?.status" />
            </span>
            <span>创建者：{{ detail?.createByName || '-' }}</span>
            <span>创建时间：{{ parseTime(detail?.createTime) || '-' }}</span>
          </div>
          <VDivider class="mb-4" />
          <div class="notice-detail-content text-body-1 leading-relaxed" v-html="safeNoticeContent"></div>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn variant="text" @click="detailVisible = false">关闭</VBtn>
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

<style scoped>
.notice-detail-content :deep(img) {
  max-width: 100%;
}
</style>
