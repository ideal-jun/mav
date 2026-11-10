<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { getCodeImg } from '@/service/api/ruoyi/auth';
import { useAuthStore } from '@/store/modules/auth';
import { useVuetifyForm, useVuetifyFormRules } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'PwdLogin'
});

const authStore = useAuthStore();
const { formRef, validate } = useVuetifyForm();

const rememberMe = ref(true);
const captchaEnabled = ref(true);
const codeUrl = ref('');

interface FormModel {
  userName: string;
  password: string;
  code: string;
  uuid: string;
}

const model: FormModel = reactive({
  userName: localStorage.getItem('loginUserName') || 'admin',
  password: 'admin123',
  code: '',
  uuid: ''
});

const rules = computed(() => {
  const { formRules } = useVuetifyFormRules();

  return {
    userName: formRules.userName,
    password: formRules.pwd,
    code: [
      (value: string) => {
        if (!captchaEnabled.value) return true;

        return Boolean(value) || '请输入验证码';
      }
    ]
  };
});

async function getCode() {
  const { data, error } = await getCodeImg();

  if (error || !data) {
    return;
  }

  captchaEnabled.value = data.captchaEnabled !== false;

  if (captchaEnabled.value) {
    model.code = '';
    model.uuid = data.uuid || '';
    codeUrl.value = `data:image/gif;base64,${data.img}`;
  }
}

async function handleSubmit() {
  if (!(await validate())) return;

  if (rememberMe.value) {
    localStorage.setItem('loginUserName', model.userName);
  } else {
    localStorage.removeItem('loginUserName');
  }

  await authStore.login(model.userName, model.password, model.code, model.uuid);

  // refresh the captcha after a login attempt
  if (captchaEnabled.value) {
    await getCode();
  }
}

onMounted(() => {
  getCode();
});
</script>

<template>
  <VForm ref="formRef" class="flex flex-col gap-4" @submit.prevent="handleSubmit">
    <VTextField
      v-model="model.userName"
      :rules="rules.userName"
      :placeholder="$t('page.login.common.userNamePlaceholder')"
      prepend-inner-icon="mdi-account-outline"
      autocomplete="username"
    />
    <VTextField
      v-model="model.password"
      :rules="rules.password"
      :placeholder="$t('page.login.common.passwordPlaceholder')"
      prepend-inner-icon="mdi-lock-outline"
      type="password"
      autocomplete="current-password"
    />
    <div v-if="captchaEnabled" class="flex items-stretch gap-3">
      <VTextField
        v-model="model.code"
        :rules="rules.code"
        placeholder="请输入验证码"
        prepend-inner-icon="mdi-shield-check-outline"
        autocomplete="off"
        class="flex-1"
        @keyup.enter="handleSubmit"
      />
      <VCard
        class="flex w-34 cursor-pointer items-center justify-center overflow-hidden"
        variant="outlined"
        height="40"
        @click="getCode"
      >
        <VImg v-if="codeUrl" :src="codeUrl" height="40" width="132" contain />
      </VCard>
    </div>
    <div class="flex items-center justify-between">
      <VCheckbox v-model="rememberMe" label="记住账号" density="compact" hide-details />
    </div>
    <VBtn type="submit" block color="primary" size="large" rounded="pill" :loading="authStore.loginLoading">
      {{ $t('common.confirm') }}
    </VBtn>
  </VForm>
</template>

<style scoped></style>
