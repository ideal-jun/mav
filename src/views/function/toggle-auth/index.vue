<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useLoading } from '@sa/hooks';
import { $t } from '@/locales';
import { useAppStore } from '@/store/modules/app';
import { useAuthStore } from '@/store/modules/auth';
import { useTabStore } from '@/store/modules/tab';
import { useAuth } from '@/hooks/business/auth';

const route = useRoute();
const appStore = useAppStore();
const authStore = useAuthStore();
const tabStore = useTabStore();
const { hasAuth } = useAuth();
const { loading, startLoading, endLoading } = useLoading();

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

const loginAccount = ref<AccountKey>('super');

async function handleToggleAccount(account: Account) {
  loginAccount.value = account.key;

  startLoading();
  await authStore.login(account.userName, account.password);
  tabStore.initTabStore(route);
  endLoading();
  appStore.reloadPage();
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <VCard class="card-wrapper">
      <VCardTitle>{{ $t('route.function_toggle-auth') }}</VCardTitle>
      <VCardText>
        <div class="flex flex-col divide-y divide-gray-200">
          <div class="flex items-start gap-4 py-3">
            <span class="w-40 shrink-0 text-medium-emphasis">{{ $t('page.manage.user.userRole') }}</span>
            <div class="flex flex-wrap gap-2">
              <VChip v-for="role in authStore.userInfo.roles" :key="role" color="primary" size="small" variant="tonal">
                {{ role }}
              </VChip>
            </div>
          </div>
          <div class="flex items-start gap-4 py-3">
            <span class="w-40 shrink-0 text-medium-emphasis">{{ $t('page.function.toggleAuth.toggleAccount') }}</span>
            <div class="flex flex-wrap gap-2">
              <VBtn
                v-for="account in accounts"
                :key="account.key"
                color="primary"
                variant="flat"
                :loading="loading && loginAccount === account.key"
                :disabled="loading && loginAccount !== account.key"
                @click="handleToggleAccount(account)"
              >
                {{ account.label }}
              </VBtn>
            </div>
          </div>
        </div>
      </VCardText>
    </VCard>

    <VCard class="card-wrapper">
      <VCardTitle>{{ $t('page.function.toggleAuth.authHook') }}</VCardTitle>
      <VCardText>
        <div class="flex flex-wrap gap-3">
          <VBtn v-if="hasAuth('B_CODE1')" color="primary" variant="flat">
            {{ $t('page.function.toggleAuth.superAdminVisible') }}
          </VBtn>
          <VBtn v-if="hasAuth('B_CODE2')" color="primary" variant="flat">
            {{ $t('page.function.toggleAuth.adminVisible') }}
          </VBtn>
          <VBtn v-if="hasAuth('B_CODE3')" color="primary" variant="flat">
            {{ $t('page.function.toggleAuth.adminOrUserVisible') }}
          </VBtn>
        </div>
      </VCardText>
    </VCard>
  </div>
</template>

<style scoped></style>
