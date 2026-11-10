import { computed, nextTick, ref } from 'vue';
import { defineStore } from 'pinia';
import { useBoolean } from '@sa/hooks';
import { router } from '@/router';
import { buildRoutes } from '@/router/routes/dynamic';
import { layoutStaticRoutes } from '@/router/routes';
import { getRouters } from '@/service/api/ruoyi/menu';
import { SetupStoreId } from '@/enum';
import { useAuthStore } from '../auth';
import { useTabStore } from '../tab';
import {
  getBreadcrumbsByRoute,
  getCacheRouteNames,
  getGlobalMenusByAuthRoutes,
  getSelectedMenuKeyPathByKey,
  sortRoutesByOrder,
  transformMenuToSearchMenus,
  updateLocaleOfGlobalMenus
} from './shared';

export const useRouteStore = defineStore(SetupStoreId.Route, () => {
  const authStore = useAuthStore();
  const tabStore = useTabStore();
  const { bool: isInitAuthRoute, setBool: setIsInitAuthRoute } = useBoolean();

  /** Home route key */
  const routeHome = ref(import.meta.env.VITE_ROUTE_HOME);

  /** The names of the routes added from the ruoyi backend menu. */
  const dynamicRouteNames = ref<string[]>([]);

  /** Set route home */
  function setRouteHome(routeKey: string) {
    routeHome.value = routeKey;
  }

  /** Global menus */
  const menus = ref<App.Global.Menu[]>([]);
  const searchMenus = computed(() => transformMenuToSearchMenus(menus.value));

  /** Update global menus by locale */
  function updateGlobalMenusByLocale() {
    menus.value = updateLocaleOfGlobalMenus(menus.value);
  }

  /** Cache routes */
  const cacheRoutes = ref<string[]>([]);

  /**
   * Exclude cache routes
   *
   * for reset route cache
   */
  const excludeCacheRoutes = ref<string[]>([]);

  /**
   * Reset route cache
   *
   * @default router.currentRoute.value.name current route name
   * @param routeKey
   */
  async function resetRouteCache(routeKey?: string) {
    const routeName = routeKey || (router.currentRoute.value.name as string);

    excludeCacheRoutes.value.push(routeName);

    await nextTick();

    excludeCacheRoutes.value = [];
  }

  /** Global breadcrumbs */
  const breadcrumbs = computed(() => getBreadcrumbsByRoute(router.currentRoute.value, menus.value));

  /** Load the routes of the ruoyi backend and initialize the menus. */
  async function initAuthRoute() {
    if (isInitAuthRoute.value) return;

    if (!authStore.userInfo.userId) {
      await authStore.initUserInfo();
    }

    if (!authStore.userInfo.userId) return;

    const { data: backendRoutes, error } = await getRouters();

    const dynamicRoutes = error || !backendRoutes ? [] : buildRoutes(backendRoutes);

    const addedNames: string[] = [];

    dynamicRoutes.forEach(route => {
      router.addRoute('root', route);
      addedNames.push(route.name as string);
    });

    dynamicRouteNames.value = addedNames;

    const allRoutes = [...layoutStaticRoutes, ...dynamicRoutes];

    sortRoutesByOrder(allRoutes);
    menus.value = getGlobalMenusByAuthRoutes(allRoutes);
    cacheRoutes.value = getCacheRouteNames(allRoutes);
    setIsInitAuthRoute(true);
    tabStore.initHomeTab();
  }

  /** Reset store */
  function resetStore() {
    dynamicRouteNames.value.forEach(name => {
      if (name && router.hasRoute(name)) {
        router.removeRoute(name);
      }
    });

    dynamicRouteNames.value = [];
    menus.value = [];
    cacheRoutes.value = [];
    excludeCacheRoutes.value = [];
    setIsInitAuthRoute(false);
  }

  /**
   * Get selected menu key path
   *
   * @param selectedKey Selected menu key
   */
  function getSelectedMenuKeyPath(selectedKey: string) {
    return getSelectedMenuKeyPathByKey(selectedKey, menus.value);
  }

  async function onRouteSwitchWhenLoggedIn() {
    // some global init logic when logged in and switch route
  }

  async function onRouteSwitchWhenNotLoggedIn() {
    // some global init logic if it does not need to be logged in
  }

  return {
    resetStore,
    routeHome,
    setRouteHome,
    menus,
    searchMenus,
    updateGlobalMenusByLocale,
    cacheRoutes,
    excludeCacheRoutes,
    resetRouteCache,
    breadcrumbs,
    initAuthRoute,
    isInitAuthRoute,
    setIsInitAuthRoute,
    getSelectedMenuKeyPath,
    onRouteSwitchWhenLoggedIn,
    onRouteSwitchWhenNotLoggedIn
  };
});
