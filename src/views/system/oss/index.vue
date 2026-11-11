<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import TableHeaderOperation from '@/components/advanced/table-header-operation.vue';
import { useAuth } from '@/hooks/business/auth';
import { useRuoYiTable } from '@/hooks/common/ruoyi-table';
import type { TableColumn } from '@/hooks/common/table';
import { delOss, listOss, uploadOss } from '@/service/api/ruoyi/system/oss';
import type { OssQuery, OssVO } from '@/service/api/ruoyi/system/oss/types';
import { downloadOss } from '@/utils/download';
import { addDateRange, formatFilterDate, parseTime } from '@/utils/ruoyi';

defineOptions({
  name: 'SystemOss'
});

/** 后端 SysOssVo 扩展字段，ext1 中保存了文件大小等扩展信息 */
interface OssRow extends OssVO {
  ext1?: string;
}

const { hasAuth } = useAuth();
const router = useRouter();

/** OSS 对象存储查询参数 */
const query = ref<OssQuery>({
  pageNum: 1,
  pageSize: 10,
  fileName: '',
  originalName: '',
  fileSuffix: '',
  createTime: '',
  service: '',
  orderByColumn: 'createTime',
  isAsc: 'ascending'
});

/** 上传时间范围 */
const beginTime = ref<Date | null>(null);
const endTime = ref<Date | null>(null);

function dateRangeParams() {
  const begin = formatFilterDate(beginTime.value);
  const end = formatFilterDate(endTime.value);

  return [begin ? `${begin} 00:00:00` : undefined, end ? `${end} 23:59:59` : undefined];
}

/** 附带上传时间范围的 OSS 列表查询（后端时间字段为 createTime） */
function listOssWithRange(params: OssQuery) {
  const searchParams: Record<string, any> = { ...params };

  addDateRange(searchParams, dateRangeParams(), 'CreateTime');

  return listOss(searchParams as OssQuery);
}

const { data, loading, pagination, columnChecks, columns, checkedRowKeys, getData, handleQuery } = useRuoYiTable<
  OssRow,
  OssQuery
>({
  api: listOssWithRange,
  query,
  showSelect: true,
  columns: (): TableColumn[] => [
    { key: 'index', title: '序号', align: 'center', width: 70, sortable: false },
    { key: 'fileName', title: '文件名', align: 'center', minWidth: 200, sortable: false },
    { key: 'originalName', title: '原名', align: 'center', minWidth: 180, sortable: false },
    { key: 'fileSuffix', title: '文件后缀', align: 'center', width: 100, sortable: false },
    { key: 'service', title: '服务商', align: 'center', width: 110, sortable: false },
    { key: 'fileSize', title: '文件大小', align: 'center', width: 110, sortable: false },
    { key: 'createByName', title: '上传人', align: 'center', width: 110, sortable: false },
    { key: 'createTime', title: '上传时间', align: 'center', width: 170, sortable: false },
    { key: 'actions', title: '操作', align: 'center', width: 150, sortable: false, fixed: 'end' }
  ]
});

/** 格式化文件大小 */
function formatFileSize(size?: number) {
  if (size === undefined || Number.isNaN(size) || size < 0) {
    return '-';
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = size;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
}

/** 从 ext1 扩展字段中读取文件大小 */
function getFileSize(row: OssRow) {
  if (!row.ext1) {
    return '-';
  }

  try {
    const ext = JSON.parse(row.ext1);

    return formatFileSize(Number(ext.fileSize));
  } catch {
    return '-';
  }
}

/* ------------------------------ 查询与重置 ------------------------------ */

async function handleSearch() {
  await handleQuery();
}

async function handleReset() {
  query.value.fileName = '';
  query.value.originalName = '';
  query.value.service = '';
  beginTime.value = null;
  endTime.value = null;
  checkedRowKeys.value = [];

  await handleSearch();
}

/* ------------------------------ 上传 ------------------------------ */

const uploadVisible = ref(false);
const uploading = ref(false);
const uploadFile = ref<File | null>(null);

function handleUpload() {
  uploadFile.value = null;
  uploadVisible.value = true;
}

async function submitUpload() {
  if (!uploadFile.value) {
    window.$message?.warning('请选择要上传的文件');
    return;
  }

  const formData = new FormData();
  formData.append('file', uploadFile.value);

  uploading.value = true;

  const { error } = await uploadOss(formData);

  uploading.value = false;

  if (!error) {
    window.$message?.success('上传成功');
    uploadVisible.value = false;
    uploadFile.value = null;
    await getData();
  }
}

/* ------------------------------ 配置管理跳转 ------------------------------ */

function handleOssConfig() {
  router.push('/system/oss-config/index');
}

/* ------------------------------ 下载 ------------------------------ */

async function handleDownload(row: OssRow) {
  await downloadOss(row.ossId);
}

/* ------------------------------ 删除 ------------------------------ */

const deleteVisible = ref(false);
const deleteIds = ref<Array<string | number>>([]);
const deleting = ref(false);

const deleteTip = computed(() => `是否确认删除OSS对象存储编号为"${deleteIds.value.join(',')}"的数据项？`);

function handleDelete(row?: OssRow) {
  deleteIds.value = row ? [row.ossId] : [...checkedRowKeys.value];

  if (!deleteIds.value.length) {
    window.$message?.warning('请选择要删除的文件');
    return;
  }

  deleteVisible.value = true;
}

async function confirmDelete() {
  deleting.value = true;

  const { error } = await delOss(deleteIds.value);

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
              v-model="query.fileName"
              label="文件名"
              placeholder="请输入文件名"
              density="compact"
              variant="outlined"
              clearable
              hide-details="auto"
            />
            <VTextField
              v-model="query.originalName"
              label="原名"
              placeholder="请输入原名"
              density="compact"
              variant="outlined"
              clearable
              hide-details="auto"
            />
            <VTextField
              v-model="query.service"
              label="服务商"
              placeholder="请输入服务商"
              density="compact"
              variant="outlined"
              clearable
              hide-details="auto"
            />
            <VDateInput
              v-model="beginTime"
              label="上传时间（开始）"
              density="compact"
              variant="outlined"
              clearable
              hide-details="auto"
            />
            <VDateInput
              v-model="endTime"
              label="上传时间（结束）"
              density="compact"
              variant="outlined"
              clearable
              hide-details="auto"
            />
            <div class="flex items-center justify-end gap-2 sm:col-span-2 lg:col-span-3">
              <VBtn variant="text" prepend-icon="mdi-refresh" @click="handleReset">重置</VBtn>
              <VBtn color="primary" variant="outlined" prepend-icon="mdi-magnify" @click="handleSearch">搜索</VBtn>
            </div>
          </div>
        </VForm>
      </VCardText>
    </VCard>

    <VCard class="card-wrapper flex min-h-0 flex-1 flex-col">
      <VCardTitle class="flex shrink-0 flex-wrap items-center justify-between gap-2">
        <span>文件列表（共 {{ pagination.total }} 条）</span>
        <TableHeaderOperation v-model:columns="columnChecks" :loading="loading" @refresh="getData">
          <template #default>
            <VBtn
              v-if="hasAuth('system:oss:upload')"
              size="small"
              variant="outlined"
              color="primary"
              prepend-icon="mdi-upload"
              @click="handleUpload"
            >
              上传文件
            </VBtn>
            <VBtn
              v-if="hasAuth('system:oss:remove')"
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
              v-if="hasAuth('system:ossConfig:list')"
              size="small"
              variant="outlined"
              color="info"
              prepend-icon="mdi-cog"
              @click="handleOssConfig"
            >
              配置管理
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
          item-value="ossId"
          class="manage-data-table"
          fixed-header
        >
          <template #item.index="{ index }">{{ index + 1 }}</template>
          <template #item.fileName="{ item }">
            <a
              v-if="item.url"
              :href="item.url"
              target="_blank"
              rel="noopener noreferrer"
              class="block truncate text-primary"
              style="max-width: 260px"
              :title="item.fileName"
            >
              {{ item.fileName }}
            </a>
            <span v-else>{{ item.fileName }}</span>
          </template>
          <template #item.originalName="{ item }">
            <span class="block truncate" style="max-width: 220px" :title="item.originalName">
              {{ item.originalName }}
            </span>
          </template>
          <template #item.fileSize="{ item }">{{ getFileSize(item) }}</template>
          <template #item.createByName="{ item }">{{ item.createByName || '-' }}</template>
          <template #item.createTime="{ item }">
            {{ parseTime(item.createTime) }}
          </template>
          <template #item.actions="{ item }">
            <div class="flex items-center justify-center whitespace-nowrap">
              <VBtn
                v-if="hasAuth('system:oss:download')"
                size="small"
                variant="text"
                color="primary"
                @click="handleDownload(item)"
              >
                下载
              </VBtn>
              <VBtn
                v-if="hasAuth('system:oss:remove')"
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

    <!-- 上传文件 -->
    <VDialog v-model="uploadVisible" max-width="560">
      <VCard>
        <VCardTitle>上传文件</VCardTitle>
        <VCardText>
          <VFileInput
            v-model="uploadFile"
            label="选择文件"
            variant="outlined"
            density="compact"
            prepend-icon="mdi-paperclip"
            show-size
            clearable
          />
          <div class="mt-2 text-xs text-medium-emphasis">
            文件将保存到当前启用的对象存储配置，上传成功后可在列表中查看。
          </div>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn variant="text" @click="uploadVisible = false">取消</VBtn>
          <VBtn :loading="uploading" color="primary" variant="flat" @click="submitUpload">确定</VBtn>
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
