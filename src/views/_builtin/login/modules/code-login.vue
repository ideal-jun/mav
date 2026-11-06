<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRouterPush } from '@/hooks/common/router';
import { useVuetifyForm, useVuetifyFormRules } from '@/hooks/common/form';
import { useCaptcha } from '@/hooks/business/captcha';
import { $t } from '@/locales';

defineOptions({
  name: 'CodeLogin'
});

const { toggleLoginModule } = useRouterPush();
const { formRef, validate } = useVuetifyForm();
const { label, isCounting, loading, getCaptcha } = useCaptcha();

interface FormModel {
  phone: string;
  code: string;
}

const model: FormModel = reactive({
  phone: '',
  code: ''
});

const rules = computed(() => {
  const { formRules } = useVuetifyFormRules();

  return {
    phone: formRules.phone,
    code: formRules.code
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
