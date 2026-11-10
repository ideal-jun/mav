<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import type { ValidationRule } from 'vuetify';
import { getDictLabel, toSelectItems, useDict } from '@/hooks/business/dict';
import { useVuetifyForm } from '@/hooks/common/form';
import { getUserProfile, updateUserPwd, updateUserProfile } from '@/service/api/ruoyi/system/user';
import type { ResetPwdForm, UserInfoVO, UserProfileForm } from '@/service/api/ruoyi/system/user/types';
import { REG_EMAIL, REG_PHONE } from '@/constants/reg';
import { parseTime } from '@/utils/ruoyi';

defineOptions({
  name: 'SystemUserProfile'
});

const dict = useDict('sys_user_gender');

const profile = ref<UserInfoVO | null>(null);
const loading = ref(false);
const tab = ref('info');

const { formRef: infoFormRef, validate: validateInfo, restoreValidation: restoreInfoValidation } = useVuetifyForm();
const { formRef: pwdFormRef, validate: validatePwd, restoreValidation: restorePwdValidation } = useVuetifyForm();

const infoForm = ref<UserProfileForm>({
  nickName: '',
  phoneNumber: '',
  email: '',
  gender: undefined
});

const pwdForm = ref<ResetPwdForm>({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const genderItems = computed(() => toSelectItems(dict.sys_user_gender));

function createRequiredRule(message: string): ValidationRule {
  return value => (value !== null && value !== undefined && String(value).trim() !== '') || message;
}

function createPatternRule(regexp: RegExp, message: string): ValidationRule {
  return value => !value || regexp.test(String(value)) || message;
}

const infoRules: Record<'nickName' | 'phoneNumber' | 'email', ValidationRule[]> = {
  nickName: [createRequiredRule('用户昵称不能为空')],
  phoneNumber: [createRequiredRule('手机号码不能为空'), createPatternRule(REG_PHONE, '请输入正确的手机号码')],
  email: [createRequiredRule('邮箱地址不能为空'), createPatternRule(REG_EMAIL, '请输入正确的邮箱地址')]
};

const pwdRules: Record<'oldPassword' | 'newPassword' | 'confirmPassword', ValidationRule[]> = {
  oldPassword: [createRequiredRule('旧密码不能为空')],
  newPassword: [
    createRequiredRule('新密码不能为空'),
    value => {
      const length = String(value ?? '').length;
      return (length >= 6 && length <= 20) || '长度在 6 到 20 个字符';
    },
    value => !value || !/[<>"'|\\]/.test(String(value)) || '不能包含非法字符：< > " \' \\ |'
  ],
  confirmPassword: [
    createRequiredRule('确认密码不能为空'),
    value => !value || value === pwdForm.value.newPassword || '两次输入的密码不一致'
  ]
};

const avatarUrl = computed(() => profile.value?.user?.avatarUrl ?? '');

const summaryItems = computed(() => {
  const info = profile.value;

  return [
    { label: '用户名称', value: info?.user?.userName || '-' },
    { label: '手机号码', value: info?.user?.phoneNumber || '-' },
    { label: '用户邮箱', value: info?.user?.email || '-' },
    { label: '用户性别', value: getDictLabel(dict.sys_user_gender, info?.user?.gender) || '-' },
    { label: '所属部门', value: info?.user?.deptName ? `${info.user.deptName} / ${info.postGroup || '-'}` : '-' },
    { label: '所属角色', value: info?.roleGroup || '-' },
    { label: '创建日期', value: parseTime(info?.user?.createTime) || '-' }
  ];
});

async function getProfile() {
  loading.value = true;

  const { data, error } = await getUserProfile();

  loading.value = false;

  if (error || !data) return;

  profile.value = data;

  infoForm.value = {
    nickName: data.user?.nickName ?? '',
    phoneNumber: data.user?.phoneNumber ?? '',
    email: data.user?.email ?? '',
    gender: data.user?.gender
  };
}

async function submitInfo() {
  if (!(await validateInfo())) return;

  const { error } = await updateUserProfile({
    nickName: infoForm.value.nickName,
    phoneNumber: infoForm.value.phoneNumber,
    email: infoForm.value.email,
    gender: infoForm.value.gender
  });

  if (!error) {
    window.$message?.success('修改成功');
    await getProfile();
  }
}

async function submitPwd() {
  if (!(await validatePwd())) return;

  const { error } = await updateUserPwd(pwdForm.value.oldPassword, pwdForm.value.newPassword);

  if (!error) {
    window.$message?.success('修改成功');
    pwdForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' };
    restorePwdValidation();
  }
}

async function resetInfo() {
  await restoreInfoValidation();
  await getProfile();
}

onMounted(() => {
  getProfile();
});
</script>

<template>
  <div class="flex h-full min-h-0 flex-col gap-4">
    <div class="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-3">
      <!-- 个人信息 -->
      <VCard class="card-wrapper flex flex-col lg:col-span-1" :loading="loading">
        <VCardTitle>个人信息</VCardTitle>
        <VCardText class="flex flex-none flex-col items-center gap-2">
          <VAvatar size="80" color="primary" variant="tonal">
            <VImg v-if="avatarUrl" :src="avatarUrl" alt="头像" />
            <VIcon v-else icon="mdi-account" size="44" />
          </VAvatar>
          <div class="text-h6">{{ profile?.user?.nickName || '-' }}</div>
          <div class="text-body-2 text-medium-emphasis">{{ profile?.user?.userName || '-' }}</div>
        </VCardText>
        <VDivider />
        <VCardText class="min-h-0 flex-1 overflow-y-auto pt-0">
          <div
            v-for="item in summaryItems"
            :key="item.label"
            class="flex items-center justify-between gap-3 border-b border-dashed py-3"
          >
            <span class="font-weight-medium">{{ item.label }}</span>
            <span class="max-w-60% break-all text-right text-medium-emphasis">{{ item.value }}</span>
          </div>
        </VCardText>
      </VCard>

      <!-- 个人设置 -->
      <VCard class="card-wrapper flex min-h-0 flex-col lg:col-span-2" :loading="loading">
        <VCardTitle>个人设置</VCardTitle>
        <VTabs v-model="tab" color="primary" density="compact">
          <VTab value="info">基本资料</VTab>
          <VTab value="pwd">修改密码</VTab>
        </VTabs>
        <VDivider />
        <div class="min-h-0 flex-1 overflow-y-auto pa-4">
          <VForm v-if="tab === 'info'" ref="infoFormRef" class="max-w-560px" @submit.prevent="submitInfo">
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <VTextField
                v-model="infoForm.nickName"
                label="用户昵称"
                placeholder="请输入用户昵称"
                maxlength="30"
                :rules="infoRules.nickName"
                hide-details="auto"
              />
              <VTextField
                v-model="infoForm.phoneNumber"
                label="手机号码"
                placeholder="请输入手机号码"
                maxlength="11"
                :rules="infoRules.phoneNumber"
                hide-details="auto"
              />
              <VTextField
                v-model="infoForm.email"
                label="邮箱"
                placeholder="请输入邮箱"
                maxlength="50"
                :rules="infoRules.email"
                hide-details="auto"
              />
              <VSelect
                v-model="infoForm.gender"
                label="性别"
                placeholder="请选择"
                :items="genderItems"
                clearable
                hide-details="auto"
              />
            </div>
            <div class="flex justify-end gap-2 pt-4">
              <VBtn variant="text" prepend-icon="mdi-refresh" @click="resetInfo">重置</VBtn>
              <VBtn color="primary" variant="flat" prepend-icon="mdi-content-save" @click="submitInfo">保存</VBtn>
            </div>
          </VForm>

          <VForm v-else ref="pwdFormRef" class="max-w-560px" @submit.prevent="submitPwd">
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <VTextField
                v-model="pwdForm.oldPassword"
                label="旧密码"
                placeholder="请输入旧密码"
                type="password"
                :rules="pwdRules.oldPassword"
                hide-details="auto"
              />
              <div></div>
              <VTextField
                v-model="pwdForm.newPassword"
                label="新密码"
                placeholder="请输入新密码"
                type="password"
                :rules="pwdRules.newPassword"
                hide-details="auto"
              />
              <VTextField
                v-model="pwdForm.confirmPassword"
                label="确认密码"
                placeholder="请确认新密码"
                type="password"
                :rules="pwdRules.confirmPassword"
                hide-details="auto"
              />
            </div>
            <div class="flex justify-end gap-2 pt-4">
              <VBtn color="primary" variant="flat" prepend-icon="mdi-content-save" @click="submitPwd">保存</VBtn>
            </div>
          </VForm>
        </div>
      </VCard>
    </div>
  </div>
</template>

<style scoped></style>
