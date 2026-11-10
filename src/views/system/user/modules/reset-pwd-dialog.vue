<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { ValidationRule } from 'vuetify';
import { useVuetifyForm } from '@/hooks/common/form';
import { resetUserPwd } from '@/service/api/ruoyi/system/user';
import type { UserVO } from '@/service/api/ruoyi/system/user/types';

defineOptions({
  name: 'ResetPwdDialog'
});

interface Props {
  /** 待重置密码的用户 */
  rowData?: UserVO | null;
}

const props = defineProps<Props>();

const visible = defineModel<boolean>('visible', { default: false });

const { formRef, validate, restoreValidation } = useVuetifyForm();

const password = ref('');
const submitting = ref(false);

const title = computed(() => `重置密码 - ${props.rowData?.userName ?? ''}`);

const rules: ValidationRule[] = [
  value => Boolean(value) || '请输入新密码',
  value => {
    const length = String(value ?? '').length;
    return (length >= 5 && length <= 20) || '用户密码长度必须介于 5 和 20 之间';
  },
  value => !value || !/[<>"'|\\]/.test(String(value)) || '不能包含非法字符：< > " \' \\ |'
];

async function submit() {
  if (!(await validate())) return;

  if (!props.rowData?.userId) return;

  submitting.value = true;

  const { error } = await resetUserPwd(props.rowData.userId, password.value);

  submitting.value = false;

  if (!error) {
    window.$message?.success(`修改成功，新密码是：${password.value}`);
    visible.value = false;
  }
}

watch(visible, value => {
  if (value) {
    password.value = '';
    restoreValidation();
  }
});
</script>

<template>
  <VDialog v-model="visible" max-width="480">
    <VCard>
      <VCardTitle class="text-h6">{{ title }}</VCardTitle>
      <VDivider />
      <VCardText class="pa-4">
        <VForm ref="formRef" @submit.prevent="submit">
          <VTextField
            v-model="password"
            label="新密码"
            placeholder="请输入新密码"
            type="password"
            maxlength="20"
            prepend-inner-icon="mdi-key"
            :rules="rules"
            hide-details="auto"
            autofocus
          />
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
