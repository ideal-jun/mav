import type { RouteLocationNormalized, Router } from 'vue-router';
import { useAuthStore } from '@/store/modules/auth';
import { useRouteStore } from '@/store/modules/route';
import { localStg } from '@/utils/storage';

/**
 * create route guard
 *
 * @param router router instance
 */
export function createRouteGuard(router: Router) {
  router.beforeEach(async (to, from) => {
    const authStore = useAuthStore();
    const routeStore = useRouteStore();

    let isLogin = Boolean(localStg.get('token'));

    if (isLogin && !routeStore.isInitAuthRoute) {
      await routeStore.initAuthRoute();

      isLogin = Boolean(localStg.get('token'));
    }

    const rootRoute = 'root';
    const loginRoute = 'login';
    const noAuthorizationRoute = '403';

    const needLogin = !to.meta.constant;
    const routeRoles = to.meta.roles || [];

    const hasRole = authStore.userInfo.roles.some(role => routeRoles.includes(role));
    const hasAuth = !routeRoles.length || hasRole;

    // if it is login route when logged in, then switch to the root page
    if (to.name === loginRoute && isLogin) {
      return { name: rootRoute };
    }

    // if the route does not need login, then it is allowed to access directly
    if (!needLogin) {
      routeStore.onRouteSwitchWhenNotLoggedIn();

      return handleRouteSwitch(to, from);
    }

    // the route need login but the user is not logged in, then switch to the login page
    if (!isLogin) {
      return { name: loginRoute, query: { redirect: to.fullPath } };
    }

    // if the user is logged in but does not have authorization, then switch to the 403 page
    if (!hasAuth) {
      return { name: noAuthorizationRoute };
    }

    routeStore.onRouteSwitchWhenLoggedIn();

    // switch route normally
    return handleRouteSwitch(to, from);
  });
}

function handleRouteSwitch(to: RouteLocationNormalized, from: RouteLocationNormalized) {
  // route with href
  if (to.meta.href) {
    window.open(to.meta.href, '_blank');

    return { path: from.fullPath, replace: true, query: from.query, hash: to.hash };
  }
}
