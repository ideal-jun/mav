import { useAuthStore } from '@/store/modules/auth';

/** the super administrator permission of the ruoyi backend */
const ALL_PERMISSION = '*:*:*';

export function useAuth() {
  const authStore = useAuthStore();

  const permissions = () => authStore.userInfo.buttons || [];

  /** whether the current user has the permission */
  function hasAuth(codes: string | string[]) {
    if (!authStore.isLogin) {
      return false;
    }

    const currentPermissions = permissions();

    if (currentPermissions.includes(ALL_PERMISSION)) {
      return true;
    }

    if (typeof codes === 'string') {
      return currentPermissions.includes(codes);
    }

    return codes.some(code => currentPermissions.includes(code));
  }

  /** whether the current user has any of the permissions */
  function hasPermiOr(codes: string[]) {
    return hasAuth(codes);
  }

  /** whether the current user has all the permissions */
  function hasPermiAnd(codes: string[]) {
    if (!authStore.isLogin) {
      return false;
    }

    const currentPermissions = permissions();

    if (currentPermissions.includes(ALL_PERMISSION)) {
      return true;
    }

    return codes.every(code => currentPermissions.includes(code));
  }

  return {
    hasAuth,
    hasPermiOr,
    hasPermiAnd
  };
}
