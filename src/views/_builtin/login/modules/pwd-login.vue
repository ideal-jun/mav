<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { loginModuleRecord } from '@/constants/app';
import { useAuthStore } from '@/store/modules/auth';
import { useRouterPush } from '@/hooks/common/router';
import { useVuetifyForm, useVuetifyFormRules } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'PwdLogin'
});

const authStore = useAuthStore();
const { toggleLoginModule } = useRouterPush();
const { formRef, validate } = useVuetifyForm();
const rememberMe = ref(true);

interface FormModel {
  userName: string;
  password: string;
}

const model: FormModel = reactive({
  userName: 'Soybean',
  password: '123456'
});

const rules = computed(() => {
  const { formRules } = useVuetifyFormRules();

  return {
    userName: formRules.userName,
    password: formRules.pwd
  };
});

async function handleSubmit() {
  if (!(await validate())) return;

  await authStore.login(model.userName, model.password);
}

type AccountKey = 'super' | 'admin' | 'user';

interface Account {
  key: AccountKey;
  label: string;
  userName: string;
  password: string;
}

const accounts = computed<Account[]>(() => [
  {
    key: 'super',
    label: $t('page.login.pwdLogin.superAdmin'),
    userName: 'Super',
    password: '123456'
  },
  {
    key: 'admin',
    label: $t('page.login.pwdLogin.admin'),
    userName: 'Admin',
    password: '123456'
  },
  {
    key: 'user',
    label: $t('page.login.pwdLogin.user'),
    userName: 'User',
    password: '123456'
  }
]);

async function handleAccountLogin(account: Account) {
  await authStore.login(account.userName, account.password);
}
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
    <div class="flex items-center justify-between">
      <VCheckbox v-model="rememberMe" :label="$t('page.login.pwdLogin.rememberMe')" density="compact" hide-details />
      <VBtn variant="text" color="primary" class="px-2" @click="toggleLoginModule('reset-pwd')">
        {{ $t('page.login.pwdLogin.forgetPassword') }}
      </VBtn>
    </div>
    <VBtn type="submit" block color="primary" size="large" rounded="pill" :loading="authStore.loginLoading">
      {{ $t('common.confirm') }}
    </VBtn>
    <div class="flex items-center gap-3">
      <VBtn class="flex-1" variant="outlined" @click="toggleLoginModule('code-login')">
        {{ $t(loginModuleRecord['code-login']) }}
      </VBtn>
      <VBtn class="flex-1" variant="outlined" @click="toggleLoginModule('register')">
        {{ $t(loginModuleRecord.register) }}
      </VBtn>
    </div>
    <div class="flex items-center gap-3 text-caption text-medium-emphasis">
      <VDivider class="flex-1" />
      <span>{{ $t('page.login.pwdLogin.otherAccountLogin') }}</span>
      <VDivider class="flex-1" />
    </div>
    <div class="flex flex-wrap items-center justify-center gap-3">
      <VBtn v-for="item in accounts" :key="item.key" color="primary" variant="flat" @click="handleAccountLogin(item)">
        {{ item.label }}
      </VBtn>
    </div>
  </VForm>
</template>

<style scoped></style>
