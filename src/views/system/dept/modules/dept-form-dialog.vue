<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { ValidationRule } from 'vuetify';
import { useAuth } from '@/hooks/business/auth';
import { toSelectItems, useDict } from '@/hooks/business/dict';
import { useVuetifyForm } from '@/hooks/common/form';
import type { DeptForm, DeptVO } from '@/service/api/ruoyi/system/dept/types';
import { addDept, getDept, listDept, listDeptExcludeChild, updateDept } from '@/service/api/ruoyi/system/dept';
import { listUserByDeptId } from '@/service/api/ruoyi/system/user';
import { REG_EMAIL, REG_PHONE } from '@/constants/reg';
import { handleTree } from '@/utils/ruoyi';

defineOptions({
  name: 'DeptFormDialog'
});

interface Props {
  /** 操作类型 */
  mode: 'add' | 'edit';
  /** 编辑时的行数据 */
  rowData?: DeptVO | null;
  /** 新增子部门时预设的上级部门 */
  parentId?: string | number;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', { default: false });

const { hasAuth } = useAuth();
const dict = useDict('sys_normal_disable');
const { formRef, validate, restoreValidation } = useVuetifyForm();

const statusItems = computed(() => toSelectItems(dict.sys_normal_disable));

const title = computed(() => (props.mode === 'add' ? '添加部门' : '修改部门'));

interface DeptEditForm {
  deptId?: string | number;
  parentId?: string | number;
  deptName: string;
  deptCategory: string;
  orderNum: number;
  leader?: string | number;
  phone: string;
  email: string;
  status: string;
}

function createDefaultForm(): DeptEditForm {
  return {
    deptId: undefined,
    parentId: undefined,
    deptName: '',
    deptCategory: '',
    orderNum: 0,
    leader: undefined,
    phone: '',
    email: '',
    status: '0'
  };
}

const form = ref<DeptEditForm>(createDefaultForm());
const parentOptions = ref<Array<{ title: string; value: string | number }>>([]);
const leaderOptions = ref<Array<{ title: string; value: string | number }>>([]);
const submitting = ref(false);

function createRequiredRule(message: string): ValidationRule {
  return value => (value !== null && value !== undefined && String(value).trim() !== '') || message;
}

function createPatternRule(regexp: RegExp, message: string): ValidationRule {
  return value => !value || regexp.test(String(value)) || message;
}

const rules = {
  parentId: [createRequiredRule('上级部门不能为空')],
  deptName: [createRequiredRule('部门名称不能为空')],
  orderNum: [createRequiredRule('显示排序不能为空')],
  phone: [createPatternRule(REG_PHONE, '请输入正确的手机号码')],
  email: [createPatternRule(REG_EMAIL, '请输入正确的邮箱地址')]
};

function flattenOptions(nodes: DeptVO[], depth = 0): Array<{ title: string; value: string | number }> {
  const result: Array<{ title: string; value: string | number }> = [];

  (nodes ?? []).forEach(node => {
    result.push({ title: `${'— '.repeat(depth)}${node.deptName}`, value: node.deptId });

    if (node.children?.length) {
      result.push(...flattenOptions(node.children, depth + 1));
    }
  });

  return result;
}

async function loadLeaderOptions(deptId?: string | number) {
  if (!deptId || !hasAuth('system:user:list')) {
    leaderOptions.value = [];
    return;
  }

  const { data, error } = await listUserByDeptId(deptId);

  if (!error && data) {
    leaderOptions.value = data.map(user => ({ title: user.userName, value: user.userId }));
  }
}

function handleParentChange(parentId: unknown) {
  form.value.leader = undefined;
  loadLeaderOptions(parentId as string | number | undefined);
}

async function initAdd() {
  form.value = createDefaultForm();
  form.value.parentId = props.parentId;
  parentOptions.value = [];

  const { data, error } = await listDept();

  if (!error && data) {
    parentOptions.value = flattenOptions(handleTree<DeptVO>(data, 'deptId'));
  }

  await loadLeaderOptions(props.parentId);
}

async function initEdit() {
  form.value = createDefaultForm();

  if (!props.rowData?.deptId) return;

  const { data, error } = await getDept(props.rowData.deptId);

  if (error || !data) return;

  form.value = {
    deptId: data.deptId,
    parentId: data.parentId,
    deptName: data.deptName,
    deptCategory: data.deptCategory,
    orderNum: data.orderNum ?? 0,
    leader: data.leader,
    phone: data.phone,
    email: data.email,
    status: data.status ?? '0'
  };

  const { data: list, error: listError } = await listDeptExcludeChild(data.deptId);

  if (!listError && list) {
    parentOptions.value = flattenOptions(handleTree<DeptVO>(list, 'deptId'));

    if (!parentOptions.value.length) {
      parentOptions.value = [{ title: data.parentName || String(data.parentId), value: data.parentId }];
    }
  }

  await loadLeaderOptions(data.deptId);
}

async function initForm() {
  await restoreValidation();

  if (props.mode === 'edit') {
    await initEdit();
  } else {
    await initAdd();
  }
}

async function submit() {
  if (!(await validate())) return;

  submitting.value = true;

  const payload: DeptForm = {
    deptId: form.value.deptId,
    parentId: form.value.parentId,
    deptName: form.value.deptName,
    deptCategory: form.value.deptCategory,
    orderNum: form.value.orderNum,
    leader: form.value.leader ? String(form.value.leader) : undefined,
    phone: form.value.phone,
    email: form.value.email,
    status: form.value.status
  };

  const { error } = form.value.deptId ? await updateDept(payload) : await addDept(payload);

  submitting.value = false;

  if (!error) {
    window.$message?.success(form.value.deptId ? '修改成功' : '新增成功');
    visible.value = false;
    emit('submitted');
  }
}

watch(visible, value => {
  if (value) {
    initForm();
  }
});
</script>

<template>
  <VDialog v-model="visible" max-width="720" scrollable>
    <VCard>
      <VCardTitle class="text-h6">{{ title }}</VCardTitle>
      <VDivider />
      <VCardText class="pa-4">
        <VForm ref="formRef" @submit.prevent="submit">
          <div class="grid grid-cols-1 items-start gap-3 sm:grid-cols-2">
            <VSelect
              v-model="form.parentId"
              label="上级部门"
              placeholder="请选择上级部门"
              :items="parentOptions"
              :rules="rules.parentId"
              hide-details="auto"
              @update:model-value="handleParentChange"
            />
            <VTextField
              v-model="form.deptName"
              label="部门名称"
              placeholder="请输入部门名称"
              maxlength="30"
              :rules="rules.deptName"
              hide-details="auto"
            />
            <VTextField
              v-model="form.deptCategory"
              label="类别编码"
              placeholder="请输入类别编码"
              maxlength="100"
              hide-details="auto"
            />
            <VNumberInput
              v-model="form.orderNum"
              label="显示排序"
              :min="0"
              :rules="rules.orderNum"
              density="compact"
              variant="outlined"
              hide-details="auto"
            />
            <VSelect
              v-model="form.leader"
              label="负责人"
              placeholder="请选择负责人"
              :items="leaderOptions"
              :no-data-text="hasAuth('system:user:list') ? '暂无可选用户' : '无用户查询权限'"
              clearable
              hide-details="auto"
            />
            <VTextField
              v-model="form.phone"
              label="联系电话"
              placeholder="请输入联系电话"
              maxlength="11"
              :rules="rules.phone"
              hide-details="auto"
            />
            <VTextField
              v-model="form.email"
              label="邮箱"
              placeholder="请输入邮箱"
              maxlength="50"
              :rules="rules.email"
              hide-details="auto"
            />
            <div class="flex items-center">
              <VRadioGroup v-model="form.status" label="部门状态" inline hide-details>
                <VRadio v-for="item in statusItems" :key="item.value" :value="item.value" :label="item.title" />
              </VRadioGroup>
            </div>
          </div>
        </VForm>
      </VCardText>
      <VDivider />
      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="visible = false">取消</VBtn>
        <VBtn color="primary" variant="flat" :loading="submitting" @click="submit">确定</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped></style>
