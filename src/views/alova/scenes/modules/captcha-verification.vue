<script setup lang="ts">
import { computed } from 'vue';
import { actionDelegationMiddleware, useCaptcha, useForm } from '@sa/alova/client';
import { $t } from '@/locales';
import { useVuetifyForm, useVuetifyFormRules } from '@/hooks/common/form';
import { sendCaptcha, verifyCaptcha } from '@/service-alova/api';

defineOptions({
  name: 'CaptchaVerification'
});

const { loading, send, countdown } = useCaptcha(sendCaptcha, {
  middleware: actionDelegationMiddleware('captcha:send')
});
const label = computed(() => {
  return countdown.value > 0
    ? $t('page.login.codeLogin.reGetCode', { time: countdown.value })
    : $t('page.login.codeLogin.getCode');
});
const {
  form,
  loading: submiting,
  send: submit
} = useForm(formData => verifyCaptcha(formData.phone, formData.code), {
  initialForm: {
    phone: '',
    code: ''
  }
});

const { formRef, validate } = useVuetifyForm();
const { formRules } = useVuetifyFormRules();

async function handleSubmit() {
  const valid = await validate();

  if (!valid) {
    return;
  }

  await submit();
  window.$message?.success($t('page.login.common.validateSuccess'));
}
</script>

<template>
  <VForm ref="formRef" :model="form" @keyup.enter="handleSubmit">
    <div class="flex flex-col gap-4">
      <VTextField
        v-model="form.phone"
        :rules="formRules.phone"
        :placeholder="$t('page.login.common.phonePlaceholder')"
        :maxlength="11"
      />
      <div class="flex items-center gap-4">
        <VTextField
          v-model="form.code"
          class="flex-1"
          :rules="formRules.code"
          :placeholder="$t('page.login.common.codePlaceholder')"
        />
        <VBtn size="large" :disabled="countdown > 0" :loading="loading" @click="send(form.phone)">
          {{ label }}
        </VBtn>
      </div>
      <VBtn block rounded color="primary" size="large" variant="flat" :loading="submiting" @click="handleSubmit">
        {{ $t('common.confirm') }}
      </VBtn>
    </div>
  </VForm>
</template>

<style scoped></style>
