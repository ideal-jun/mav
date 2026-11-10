import { request } from '@/service/request';
import type { MenuForm, MenuQuery, MenuTreeOption, MenuVO, RoleMenuTree } from './menu/types';

/** 查询菜单列表 */
export function listMenu(query?: MenuQuery) {
  return request<MenuVO[]>({
    url: '/system/menu/list',
    method: 'get',
    params: query
  });
}

/** 查询菜单详细 */
export function getMenu(menuId: string | number) {
  return request<MenuVO>({
    url: '/system/menu/' + menuId,
    method: 'get'
  });
}

/** 查询菜单下拉树结构 */
export function treeselect() {
  return request<MenuTreeOption[]>({
    url: '/system/menu/treeselect',
    method: 'get'
  });
}

/** 根据角色 id 查询菜单下拉树结构 */
export function roleMenuTreeselect(roleId: string | number) {
  return request<RoleMenuTree>({
    url: '/system/menu/roleMenuTreeselect/' + roleId,
    method: 'get'
  });
}

/** roleMenuTreeselect 的别名（页面约定使用 roleMenuTreeSelect 命名） */
export const roleMenuTreeSelect = roleMenuTreeselect;

/**
 * 查询菜单树表数据（页面约定的命名）
 *
 * 后端 /system/menu/list 返回扁平菜单列表，页面用 handleTree 组树。
 */
export const treetableMenu = listMenu;

/** 新增菜单 */
export function addMenu(data: MenuForm) {
  return request<null>({
    url: '/system/menu',
    method: 'post',
    data
  });
}

/** 修改菜单 */
export function updateMenu(data: MenuForm) {
  return request<null>({
    url: '/system/menu',
    method: 'put',
    data
  });
}

/** 删除菜单 */
export function delMenu(menuId: string | number) {
  return request<null>({
    url: '/system/menu/' + menuId,
    method: 'delete'
  });
}

/** 级联删除菜单 */
export function cascadeDelMenu(menuIds: Array<string | number>) {
  return request<null>({
    url: '/system/menu/cascade/' + menuIds,
    method: 'delete'
  });
}
