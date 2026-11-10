import type { RouteRecordRaw } from 'vue-router';
import ParentView from '@/layouts/parent-view/index.vue';
import InnerLink from '@/views/_builtin/iframe-page/index.vue';

/** The route object returned by `/system/menu/getRouters` (RuoYi `RouterVo`). */
export interface BackendRouter {
  name?: string;
  path: string;
  hidden?: boolean;
  redirect?: string;
  component?: string;
  query?: string;
  ext?: string;
  alwaysShow?: boolean;
  meta?: {
    title?: string;
    icon?: string;
    noCache?: boolean;
    link?: string;
    activeMenu?: string;
  };
  children?: BackendRouter[];
}

/** All vue pages, keyed by the ruoyi component path (e.g. `system/user/index`). */
const viewModules = import.meta.glob('../../views/**/*.vue');

const viewModuleMap = new Map<string, () => Promise<unknown>>();

for (const [path, loader] of Object.entries(viewModules)) {
  const viewsIndex = path.indexOf('/views/');

  if (viewsIndex === -1) continue;

  const dir = path.slice(viewsIndex + '/views/'.length, path.lastIndexOf('.vue'));
  viewModuleMap.set(dir, loader);
}

function resolveComponent(component?: string): RouteRecordRaw['component'] | undefined {
  if (!component) {
    return undefined;
  }

  if (component === 'Layout') {
    // the root layout is already rendered, top level menu routes only need a RouterView
    return ParentView;
  }

  if (component === 'ParentView') {
    return ParentView;
  }

  if (component === 'InnerLink') {
    return InnerLink;
  }

  // the backend component may omit the trailing /index (e.g. "system/role/authUser")
  const candidates = [component, `${component}/index`];

  if (component.endsWith('.vue')) {
    candidates.push(component.slice(0, -4));
  } else {
    candidates.push(`${component}.vue`);
  }

  for (const key of candidates) {
    const loader = viewModuleMap.get(key);

    if (loader) {
      return loader as RouteRecordRaw['component'];
    }
  }

  console.warn(`[route] the component "${component}" of the backend menu does not exist in src/views`);

  return undefined;
}

function joinPath(parentPath: string, path: string) {
  if (!parentPath || path.startsWith('/')) {
    return path;
  }

  return `${parentPath}/${path}`.replace(/\/+/g, '/');
}

function getFirstLeafPath(children: any[], parentPath: string): string {
  for (const child of children) {
    const fullPath = joinPath(parentPath, child.path);

    if (child.children?.length) {
      const childPath = getFirstLeafPath(child.children, fullPath);

      if (childPath) {
        return childPath;
      }
    }

    if (child.component) {
      return fullPath;
    }
  }

  return '';
}

/**
 * Transform the ruoyi backend routes into vue-router records.
 *
 * The returned routes are added as the children of the root layout route.
 */
export function buildRoutes(backendRoutes: BackendRouter[], parentPath = ''): RouteRecordRaw[] {
  const result: RouteRecordRaw[] = [];

  backendRoutes.forEach(backendRoute => {
    const fullPath = joinPath(parentPath, backendRoute.path);
    const children = backendRoute.children?.length ? buildRoutes(backendRoute.children, fullPath) : undefined;

    const route: any = {
      name: backendRoute.name || fullPath,
      // keep the absolute path so the menu / tab links work for nested routes
      path: fullPath,
      component: resolveComponent(backendRoute.component),
      meta: {
        title: backendRoute.meta?.title,
        icon: backendRoute.meta?.icon,
        hideInMenu: Boolean(backendRoute.hidden),
        keepAlive: backendRoute.meta?.noCache !== true,
        activeMenu: backendRoute.meta?.activeMenu,
        link: backendRoute.meta?.link,
        order: 0
      }
    };

    if (children && children.length === 0) {
      // every child page of this menu is missing in src/views, skip the empty menu group
      return;
    }

    if (children?.length) {
      route.children = children;

      if (backendRoute.redirect && backendRoute.redirect !== 'noRedirect') {
        route.redirect = backendRoute.redirect;
      } else {
        const firstLeafPath = getFirstLeafPath(children, fullPath);

        if (firstLeafPath) {
          route.redirect = firstLeafPath;
        }
      }
    } else if (!route.component) {
      // a route without a resolvable component is useless, skip it
      return;
    }

    result.push(route as RouteRecordRaw);
  });

  return result;
}
