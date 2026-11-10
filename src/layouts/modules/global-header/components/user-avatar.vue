<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/store/modules/auth';
import { useRouterPush } from '@/hooks/common/router';
import { $t } from '@/locales';

defineOptions({
  name: 'UserAvatar'
});

const authStore = useAuthStore();
const { toLogin, routerPush } = useRouterPush();
const logoutDialog = ref(false);

function loginOrRegister() {
  toLogin();
}

function toUserProfile() {
  routerPush({ name: 'Profile' });
}

function logout() {
  logoutDialog.value = true;
}

async function confirmLogout() {
  logoutDialog.value = false;
  await authStore.logout();
}
</script>

<template>
  <VBtn v-if="!authStore.isLogin" variant="text" @click="loginOrRegister">
    {{ $t('page.login.common.loginOrRegister') }}
  </VBtn>
  <template v-else>
    <VMenu location="bottom end">
      <template #activator="{ props }">
        <VBtn v-bind="props" class="h-9 px-2" variant="text">
          <VAvatar v-if="authStore.userInfo.avatar" :image="authStore.userInfo.avatar" size="28" />
          <VIcon v-else icon="mdi-account-circle-outline" size="24" />
          <span class="ml-2 text-base font-medium">
            {{ authStore.userInfo.nickName || authStore.userInfo.userName }}
          </span>
        </VBtn>
      </template>
      <VList density="compact">
        <VListItem prepend-icon="mdi-account-circle-outline" title="个人中心" @click="toUserProfile" />
        <VListItem prepend-icon="mdi-logout" :title="$t('common.logout')" @click="logout" />
      </VList>
    </VMenu>

    <VDialog v-model="logoutDialog" max-width="400">
      <VCard>
        <VCardTitle>{{ $t('common.tip') }}</VCardTitle>
        <VCardText>{{ $t('common.logoutConfirm') }}</VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn variant="text" @click="logoutDialog = false">{{ $t('common.cancel') }}</VBtn>
          <VBtn color="primary" variant="flat" @click="confirmLogout">{{ $t('common.confirm') }}</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </template>
</template>

<style scoped></style>
