<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRouterPush } from '@/hooks/common/router';
import { useVuetifyForm, useVuetifyFormRules } from '@/hooks/common/form';
import { useCaptcha } from '@/hooks/business/captcha';
import { $t } from '@/locales';

defineOptions({
  name: 'Register'
});

const { toggleLoginModule } = useRouterPush();
const { formRef, validate } = useVuetifyForm();
const { label, isCounting, loading, getCaptcha } = useCaptcha();

interface FormModel {
  phone: string;
  code: string;
  password: string;
  confirmPassword: string;
}

const model: FormModel = reactive({
  phone: '',
  code: '',
  password: '',
  confirmPassword: ''
});

const rules = computed(() => {
  const { formRules, createConfirmPwdRule } = useVuetifyFormRules();

  return {
    phone: formRules.phone,
    code: formRules.code,
    password: formRules.pwd,
    confirmPassword: createConfirmPwdRule(model.password)
  };
});

async function handleSubmit() {
  if (!(await validate())) return;

  window.$message?.success($t('page.login.common.validateSuccess'));
}
</script>

<template>
  <VForm ref="formRef" class="flex flex-col gap-4" @submit.prevent="handleSubmit">
    <VTextField
      v-model="model.phone"
      :rules="rules.phone"
      :placeholder="$t('page.login.common.phonePlaceholder')"
      prepend-inner-icon="mdi-cellphone"
      autocomplete="tel"
    />
    <div class="flex items-start gap-3">
      <VTextField
        v-model="model.code"
        :rules="rules.code"
        :placeholder="$t('page.login.common.codePlaceholder')"
        prepend-inner-icon="mdi-shield-key-outline"
        autocomplete="one-time-code"
      />
      <VBtn
        class="mt-1"
        color="primary"
        variant="tonal"
        :disabled="isCounting"
        :loading="loading"
        @click="getCaptcha(model.phone)"
      >
        {{ label }}
      </VBtn>
    </div>
    <VTextField
      v-model="model.password"
      :rules="rules.password"
      :placeholder="$t('page.login.common.passwordPlaceholder')"
      prepend-inner-icon="mdi-lock-outline"
      type="password"
      autocomplete="new-password"
    />
    <VTextField
      v-model="model.confirmPassword"
      :rules="rules.confirmPassword"
      :placeholder="$t('page.login.common.confirmPasswordPlaceholder')"
      prepend-inner-icon="mdi-lock-check-outline"
      type="password"
      autocomplete="new-password"
    />
    <div class="flex flex-col gap-3">
      <VBtn type="submit" block color="primary" size="large" rounded="pill">
        {{ $t('common.confirm') }}
      </VBtn>
      <VBtn block variant="outlined" size="large" rounded="pill" @click="toggleLoginModule('pwd-login')">
        {{ $t('page.login.common.back') }}
      </VBtn>
    </div>
  </VForm>
</template>

<style scoped></style>
