<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import type { ValidationRule } from 'vuetify';
import TableHeaderOperation from '@/components/advanced/table-header-operation.vue';
import { useAuth } from '@/hooks/business/auth';
import { useVuetifyForm } from '@/hooks/common/form';
import { useRuoYiTable } from '@/hooks/common/ruoyi-table';
import type { TableColumn } from '@/hooks/common/table';
import { addData, delData, getData as getDictData, listData, updateData } from '@/service/api/ruoyi/system/dict';
import type { DictDataForm, DictDataQuery, DictDataVO, DictTypeVO } from '@/service/api/ruoyi/system/dict/types';
import { useDictStore } from '@/store/modules/dict';
import { download } from '@/utils/download';
import { parseTime } from '@/utils/ruoyi';

defineOptions({
  name: 'DictDataDrawer'
});

interface Props {
  /** 当前选中的字典类型 */
  dict: DictTypeVO | null;
}

const props = defineProps<Props>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { hasAuth } = useAuth();

const dictStore = useDictStore();

/** 字典数据查询参数 */
const query = ref<DictDataQuery>({
  pageNum: 1,
  pageSize: 10,
  dictName: '',
  dictType: '',
  dictLabel: ''
});

const { data, loading, pagination, columns, columnChecks, checkedRowKeys, getData, handleQuery } = useRuoYiTable<
  DictDataVO,
  DictDataQuery
>({
  api: async params => {
    if (!props.dict) {
      return { data: { rows: [], total: 0 }, error: null } as any;
    }

    return listData(params);
  },
  query,
  showSelect: true,
  columns: (): TableColumn[] => [
    { key: 'index', title: '序号', align: 'center', width: 70, sortable: false },
    { key: 'dictLabel', title: '字典标签', align: 'center', minWidth: 120 },
    { key: 'dictValue', title: '字典键值', align: 'center', minWidth: 110 },
    { key: 'dictSort', title: '字典排序', align: 'center', width: 100 },
    { key: 'remark', title: '备注', align: 'center', minWidth: 130 },
    { key: 'createTime', title: '创建时间', align: 'center', width: 170, sortable: false },
    { key: 'actions', title: '操作', align: 'center', width: 150, sortable: false }
  ]
});

/** 打开抽屉或切换字典类型时刷新数据 */
watch(
  () => [visible.value, props.dict?.dictType] as const,
  async ([isVisible, dictType]) => {
    if (!isVisible || !dictType) return;

    query.value.dictType = dictType;
    query.value.dictLabel = '';
    checkedRowKeys.value = [];

    await nextTick();
    await handleQuery();
  }
);

/* ------------------------------ 查询与重置 ------------------------------ */

async function handleSearch() {
  await handleQuery();
}

async function handleReset() {
  query.value.dictLabel = '';

  await handleSearch();
}

/* ------------------------------ 表单 ------------------------------ */

const formVisible = ref(false);
const formMode = ref<'add' | 'edit'>('add');
const { formRef, validate, restoreValidation } = useVuetifyForm();

const listClassOptions = [
  { title: '默认(default)', value: 'default' },
  { title: '主要(primary)', value: 'primary' },
  { title: '成功(success)', value: 'success' },
  { title: '信息(info)', value: 'info' },
  { title: '警告(warning)', value: 'warning' },
  { title: '危险(danger)', value: 'danger' }
];

function createDefaultForm(): DictDataForm {
  return {
    dictType: props.dict?.dictType ?? '',
    dictCode: undefined,
    dictLabel: '',
    dictValue: '',
    cssClass: '',
    listClass: 'primary',
    dictSort: 0,
    remark: ''
  };
}

const form = ref<DictDataForm>(createDefaultForm());

function createRequiredRule(message: string): ValidationRule {
  return value => (value !== null && value !== undefined && String(value).trim() !== '') || message;
}

const rules: Record<'dictLabel' | 'dictValue' | 'dictSort', ValidationRule[]> = {
  dictLabel: [createRequiredRule('请输入数据标签')],
  dictValue: [createRequiredRule('请输入数据键值')],
  dictSort: [createRequiredRule('请输入显示排序')]
};

const formTitle = computed(() => (formMode.value === 'add' ? '新增字典数据' : '修改字典数据'));

function handleAdd() {
  if (!props.dict) {
    window.$message?.warning('请先选择字典类型');
    return;
  }

  formMode.value = 'add';
  form.value = createDefaultForm();
  restoreValidation();
  formVisible.value = true;
}

async function handleEdit(row: DictDataVO) {
  formMode.value = 'edit';
  form.value = createDefaultForm();
  restoreValidation();

  const { data: detail, error } = await getDictData(row.dictCode);

  if (!error && detail) {
    Object.assign(form.value, detail);
  }

  formVisible.value = true;
}

async function handleSubmit() {
  if (!(await validate())) return;

  const { error } = form.value.dictCode ? await updateData(form.value) : await addData(form.value);

  if (!error) {
    window.$message?.success(form.value.dictCode ? '修改成功' : '新增成功');
    formVisible.value = false;
    // 字典数据变更后清理前端字典缓存，保证下拉/标签回显及时刷新
    dictStore.resetDict();
    await getData();
  }
}

/* ------------------------------ 删除 ------------------------------ */

const deleteVisible = ref(false);
const deleteIds = ref<Array<number | string>>([]);

const deleteTip = computed(() => `是否确认删除字典编码为"${deleteIds.value.join(',')}"的数据项？`);

function handleDelete(row?: DictDataVO) {
  deleteIds.value = row ? [row.dictCode] : [...checkedRowKeys.value];

  if (!deleteIds.value.length) {
    window.$message?.warning('请选择要删除的字典数据');
    return;
  }

  deleteVisible.value = true;
}

async function confirmDelete() {
  const { error } = await delData(deleteIds.value);

  if (!error) {
    window.$message?.success('删除成功');
    deleteVisible.value = false;
    deleteIds.value = [];
    checkedRowKeys.value = [];
    dictStore.resetDict();
    await getData();
  }
}

/* ------------------------------ 导出 ------------------------------ */

function handleExport() {
  download('system/dict/data/export', { ...query.value }, `dict_data_${Date.now()}.xlsx`);
}

/* ------------------------------ 展示 ------------------------------ */

const listClassColorMap: Record<string, string> = {
  default: 'default',
  primary: 'primary',
  success: 'success',
  info: 'info',
  warning: 'warning',
  danger: 'error'
};

function getListClassColor(listClass?: string) {
  return listClassColorMap[listClass || 'default'] ?? 'default';
}
</script>

<template>
  <Teleport to="body">
    <VNavigationDrawer v-model="visible" temporary location="right" :width="1000" order="-1">
      <div class="flex h-full flex-col">
        <div class="flex shrink-0 items-center justify-between gap-2 px-4 py-3">
          <div class="min-w-0">
            <h2 class="text-lg font-medium">字典数据</h2>
            <div class="truncate text-sm text-medium-emphasis">
              <template v-if="dict">{{ dict.dictName }} / {{ dict.dictType }}</template>
              <template v-else>请先选择字典类型</template>
            </div>
          </div>
          <VBtn icon="mdi-close" variant="text" density="comfortable" @click="visible = false" />
        </div>
        <VDivider />

        <div class="shrink-0 px-4 py-3">
          <VForm @submit.prevent="handleSearch">
            <div class="flex flex-wrap items-end gap-2">
              <VTextField
                v-model="query.dictLabel"
                label="字典标签"
                placeholder="请输入字典标签"
                density="compact"
                variant="outlined"
                clearable
                hide-details="auto"
                style="min-width: 240px"
                @keyup.enter="handleSearch"
              />
              <VBtn variant="text" prepend-icon="mdi-refresh" @click="handleReset">重置</VBtn>
              <VBtn color="primary" variant="outlined" prepend-icon="mdi-magnify" @click="handleSearch">搜索</VBtn>
            </div>
          </VForm>

          <div class="mt-3 flex flex-wrap items-center justify-between gap-2">
            <span class="text-sm text-medium-emphasis">共 {{ pagination.total }} 条</span>
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
              </template>
            </TableHeaderOperation>
          </div>
        </div>

        <div class="min-h-0 flex-1 px-4 pb-4">
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
            item-value="dictCode"
            class="manage-data-table"
            fixed-header
          >
            <template #item.index="{ index }">{{ index + 1 }}</template>
            <template #item.dictLabel="{ item }">
              <VChip
                v-if="item.listClass && item.listClass !== 'default'"
                :color="getListClassColor(item.listClass)"
                size="small"
                variant="tonal"
              >
                {{ item.dictLabel }}
              </VChip>
              <span v-else>{{ item.dictLabel }}</span>
            </template>
            <template #item.remark="{ item }">{{ item.remark || '-' }}</template>
            <template #item.createTime="{ item }">
              {{ parseTime(item.createTime) }}
            </template>
            <template #item.actions="{ item }">
              <div class="flex items-center justify-center whitespace-nowrap">
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
      </div>

      <!-- 新增 / 修改字典数据 -->
      <VDialog v-model="formVisible" max-width="620" persistent>
        <VCard>
          <VCardTitle>{{ formTitle }}</VCardTitle>
          <VCardText>
            <VForm ref="formRef" validate-on="input" @submit.prevent="handleSubmit">
              <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div class="sm:col-span-2">
                  <VTextField
                    v-model="form.dictType"
                    label="字典类型"
                    disabled
                    density="compact"
                    variant="outlined"
                    hide-details="auto"
                  />
                </div>
                <VTextField
                  v-model="form.dictLabel"
                  label="数据标签"
                  placeholder="请输入数据标签"
                  :rules="rules.dictLabel"
                  density="compact"
                  variant="outlined"
                  hide-details="auto"
                />
                <VTextField
                  v-model="form.dictValue"
                  label="数据键值"
                  placeholder="请输入数据键值"
                  :rules="rules.dictValue"
                  density="compact"
                  variant="outlined"
                  hide-details="auto"
                />
                <VTextField
                  v-model="form.cssClass"
                  label="样式属性"
                  placeholder="请输入样式属性"
                  density="compact"
                  variant="outlined"
                  hide-details="auto"
                />
                <VNumberInput
                  v-model="form.dictSort"
                  label="显示排序"
                  :min="0"
                  :step="1"
                  :rules="rules.dictSort"
                  density="compact"
                  variant="outlined"
                  control-variant="stacked"
                  hide-details="auto"
                />
                <div class="sm:col-span-2">
                  <VSelect
                    v-model="form.listClass"
                    :items="listClassOptions"
                    label="回显样式"
                    density="compact"
                    variant="outlined"
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
    </VNavigationDrawer>
  </Teleport>
</template>

<style scoped></style>
