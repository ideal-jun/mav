<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { ValidationRule } from 'vuetify';
import { useAuth } from '@/hooks/business/auth';
import { toSelectItems, useDict } from '@/hooks/business/dict';
import { useVuetifyForm } from '@/hooks/common/form';
import type { TableOperateType } from '@/hooks/common/table';
import { getConfigKey } from '@/service/api/ruoyi/system/config';
import { optionselectPost } from '@/service/api/ruoyi/system/post';
import type { DeptTreeVO } from '@/service/api/ruoyi/system/dept/types';
import { addUser, getUser, updateUser } from '@/service/api/ruoyi/system/user';
import type { UserForm, UserVO } from '@/service/api/ruoyi/system/user/types';
import { useAuthStore } from '@/store/modules/auth';
import { REG_EMAIL, REG_PHONE } from '@/constants/reg';

defineOptions({
  name: 'UserFormDialog'
});

interface Props {
  /** 操作类型 */
  operateType: TableOperateType;
  /** 编辑时的行数据 */
  rowData?: UserVO | null;
  /** 部门树数据 */
  deptOptions: DeptTreeVO[];
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', { default: false });

const { hasAuth } = useAuth();
const authStore = useAuthStore();
const dict = useDict('sys_normal_disable', 'sys_user_gender');
const { formRef, validate, restoreValidation } = useVuetifyForm();

const title = computed(() => (props.operateType === 'add' ? '新增用户' : '修改用户'));

const isSelf = computed(() => {
  if (props.operateType !== 'edit' || !props.rowData?.userId) return false;
  return String(props.rowData.userId) === String(authStore.userInfo.userId);
});

const genderItems = computed(() => toSelectItems(dict.sys_user_gender));
const statusItems = computed(() => toSelectItems(dict.sys_normal_disable));

const deptItems = computed(() => flattenDeptOptions(props.deptOptions));

const postOptions = ref<Array<{ title: string; value: string }>>([]);
const roleOptions = ref<Array<{ title: string; value: string; disabled?: boolean }>>([]);

const submitting = ref(false);

/** 表单模型：后端 Long 主键统一以字符串返回，避免精度丢失 */
type UserFormModel = Omit<UserForm, 'deptId'> & {
  deptId?: string | number;
};

function createDefaultForm(): UserFormModel {
  return {
    userId: undefined,
    deptId: undefined,
    userName: '',
    nickName: '',
    password: '',
    phoneNumber: '',
    email: '',
    gender: undefined,
    status: '0',
    remark: '',
    postIds: [],
    roleIds: []
  };
}

const form = ref<UserFormModel>(createDefaultForm());

function createRequiredRule(message: string): ValidationRule {
  return value => (value !== null && value !== undefined && String(value).trim() !== '') || message;
}

function createLengthRule(min: number, max: number, message: string): ValidationRule {
  return value => {
    const length = String(value ?? '').length;
    return (length >= min && length <= max) || message;
  };
}

function createPatternRule(regexp: RegExp, message: string): ValidationRule {
  return value => !value || regexp.test(String(value)) || message;
}

const passwordRules: ValidationRule[] = [
  value => props.operateType !== 'add' || Boolean(value) || '用户密码不能为空',
  value => {
    const length = String(value ?? '').length;
    return props.operateType !== 'add' || (length >= 5 && length <= 20) || '用户密码长度必须介于 5 和 20 之间';
  },
  value => !value || !/[<>"'|\\]/.test(String(value)) || '不能包含非法字符：< > " \' \\ |'
];

const rules: Record<'userName' | 'nickName' | 'password' | 'phoneNumber' | 'email' | 'roleIds', ValidationRule[]> = {
  userName: [createRequiredRule('请输入用户名称'), createLengthRule(2, 30, '用户名称长度必须介于 2 和 30 之间')],
  nickName: [createRequiredRule('请输入用户昵称')],
  password: passwordRules,
  phoneNumber: [createPatternRule(REG_PHONE, '请输入正确的手机号码')],
  email: [createPatternRule(REG_EMAIL, '请输入正确的邮箱地址')],
  roleIds: [value => (Array.isArray(value) && value.length > 0) || '用户角色不能为空']
};

interface DeptOption {
  title: string;
  value: string | number;
}

function flattenDeptOptions(nodes: DeptTreeVO[], depth = 0): DeptOption[] {
  const result: DeptOption[] = [];

  (nodes ?? []).forEach(node => {
    result.push({ title: `${'— '.repeat(depth)}${node.label}`, value: node.id });

    if (node.children?.length) {
      result.push(...flattenDeptOptions(node.children, depth + 1));
    }
  });

  return result;
}

function toPostOptions(posts: Array<{ postId: string | number; postName: string; status: string }> | undefined) {
  return (posts ?? []).map(post => ({
    title: post.postName,
    value: String(post.postId),
    disabled: post.status === '1'
  }));
}

function toRoleOptions(roles: Array<{ roleId: string | number; roleName: string; status: string }> | undefined) {
  return (roles ?? []).map(role => ({
    title: role.roleName,
    value: String(role.roleId),
    disabled: role.status === '1'
  }));
}

function mergeRoleOptions(
  a: Array<{ roleId: string | number; roleName: string; status: string }> | undefined,
  b: Array<{ roleId: string | number; roleName: string; status: string }> | undefined
) {
  const map = new Map<string, { title: string; value: string; disabled?: boolean }>();

  [...(a ?? []), ...(b ?? [])].forEach(role => {
    map.set(String(role.roleId), {
      title: role.roleName,
      value: String(role.roleId),
      disabled: role.status === '1'
    });
  });

  return [...map.values()];
}

async function initAdd() {
  const { data } = await getUser();

  if (data) {
    roleOptions.value = toRoleOptions(data.roles);
  }

  const { data: initPassword } = await getConfigKey('sys.user.initPassword');

  if (initPassword) {
    form.value.password = String(initPassword);
  }
}

async function initEdit() {
  if (!props.rowData?.userId) return;

  const { data } = await getUser(props.rowData.userId);

  if (!data?.user) return;

  const user = data.user;

  form.value = {
    userId: String(user.userId),
    deptId: user.deptId ? String(user.deptId) : undefined,
    userName: user.userName ?? '',
    nickName: user.nickName ?? '',
    password: '',
    phoneNumber: user.phoneNumber ?? '',
    email: user.email ?? '',
    gender: user.gender ?? undefined,
    status: user.status ?? '0',
    remark: user.remark ?? '',
    avatar: user.avatar,
    postIds: (data.postIds ?? []).map(id => String(id)),
    roleIds: (data.roleIds ?? []).map(id => String(id))
  };

  postOptions.value = toPostOptions(data.posts);
  roleOptions.value = mergeRoleOptions(data.roles, user.roles);
}

async function initForm() {
  form.value = createDefaultForm();
  postOptions.value = [];
  roleOptions.value = [];
  await restoreValidation();

  if (props.operateType === 'edit') {
    await initEdit();
  } else {
    await initAdd();
  }
}

async function handleDeptChange(deptId: unknown) {
  if (!deptId) {
    postOptions.value = [];
    form.value.postIds = [];
    return;
  }

  if (!hasAuth('system:post:query')) {
    return;
  }

  const { data, error } = await optionselectPost(deptId as string | number);

  if (!error) {
    postOptions.value = toPostOptions(data);
    form.value.postIds = [];
  }
}

async function submit() {
  if (!(await validate())) return;

  submitting.value = true;

  // 后端 SysUserBo 对手机号使用 @Pattern 校验，空字符串会校验失败，可选项统一转为 undefined
  const payload = {
    ...form.value,
    deptId: form.value.deptId || undefined,
    phoneNumber: form.value.phoneNumber?.trim() || undefined,
    email: form.value.email?.trim() || undefined,
    gender: form.value.gender || undefined,
    remark: form.value.remark?.trim() || undefined,
    postIds: [...form.value.postIds],
    roleIds: [...form.value.roleIds]
  } as UserForm;

  const { error } =
    props.operateType === 'add' ? await addUser(payload) : await updateUser({ ...payload, password: '' });

  submitting.value = false;

  if (!error) {
    window.$message?.success(props.operateType === 'add' ? '新增成功' : '修改成功');
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
  <VDialog v-model="visible" max-width="780" scrollable>
    <VCard>
      <VCardTitle class="text-h6">{{ title }}</VCardTitle>
      <VDivider />
      <VCardText class="pa-4">
        <VForm ref="formRef" @submit.prevent="submit">
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <VTextField
              v-model="form.nickName"
              label="用户昵称"
              placeholder="请输入用户昵称"
              maxlength="30"
              :rules="rules.nickName"
              hide-details="auto"
            />
            <VSelect
              v-if="!isSelf"
              v-model="form.deptId"
              label="归属部门"
              placeholder="请选择归属部门"
              :items="deptItems"
              clearable
              hide-details="auto"
              @update:model-value="handleDeptChange"
            />
            <VTextField
              v-if="operateType === 'add'"
              v-model="form.userName"
              label="用户名称"
              placeholder="请输入用户名称"
              maxlength="30"
              :rules="rules.userName"
              hide-details="auto"
            />
            <VTextField
              v-if="operateType === 'add'"
              v-model="form.password"
              label="用户密码"
              placeholder="请输入用户密码"
              type="password"
              maxlength="20"
              :rules="rules.password"
              hide-details="auto"
            />
            <VTextField
              v-model="form.phoneNumber"
              label="手机号码"
              placeholder="请输入手机号码"
              maxlength="11"
              :rules="rules.phoneNumber"
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
            <VSelect
              v-model="form.gender"
              label="用户性别"
              placeholder="请选择"
              :items="genderItems"
              clearable
              hide-details="auto"
            />
            <div class="flex items-center">
              <VRadioGroup v-model="form.status" label="状态" inline hide-details>
                <VRadio v-for="item in statusItems" :key="item.value" :value="item.value" :label="item.title" />
              </VRadioGroup>
            </div>
            <VSelect
              v-if="!isSelf"
              v-model="form.postIds"
              label="岗位"
              placeholder="请选择岗位"
              :items="postOptions"
              multiple
              chips
              closable-chips
              hide-details="auto"
            />
            <VSelect
              v-if="!isSelf"
              v-model="form.roleIds"
              label="角色"
              placeholder="请选择角色"
              :items="roleOptions"
              multiple
              chips
              closable-chips
              :rules="rules.roleIds"
              hide-details="auto"
            />
            <div class="sm:col-span-2">
              <VTextarea
                v-model="form.remark"
                label="备注"
                placeholder="请输入内容"
                rows="2"
                maxlength="500"
                hide-details="auto"
              />
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
