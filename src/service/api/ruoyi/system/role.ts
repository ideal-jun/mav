import { request } from '@/service/request';
import type { UserQuery, UserVO } from './user/types';
import type {
  RoleAuthUserBatchParams,
  RoleAuthUserCancelParams,
  RoleDeptTree,
  RoleForm,
  RoleQuery,
  RoleVO
} from './role/types';

/** 查询角色列表 */
export function listRole(query: RoleQuery) {
  return request<RuoYi.PageResult<RoleVO>>({
    url: '/system/role/list',
    method: 'get',
    params: query
  });
}

/**
 * 通过 roleIds 查询角色
 *
 * @param roleIds 角色 id 串
 */
export function optionSelect(roleIds: Array<number | string>) {
  return request<RoleVO[]>({
    url: '/system/role/optionselect?roleIds=' + roleIds,
    method: 'get'
  });
}

/** optionSelect 的显式别名（用于 index.ts 平铺导出） */
export const optionSelectRole = optionSelect;

/** 查询角色详细 */
export function getRole(roleId: string | number) {
  return request<RoleVO>({
    url: '/system/role/' + roleId,
    method: 'get'
  });
}

/** 新增角色 */
export function addRole(data: RoleForm) {
  return request<null>({
    url: '/system/role',
    method: 'post',
    data
  });
}

/** 修改角色基础信息 */
export function updateRole(data: RoleForm) {
  return request<null>({
    url: '/system/role',
    method: 'put',
    data
  });
}

/** 修改角色权限（菜单权限 + 数据权限） */
export function updateRolePermission(data: RoleForm) {
  return request<null>({
    url: '/system/role/permission',
    method: 'put',
    data
  });
}

/**
 * 修改角色状态
 *
 * @param roleId 角色 id
 * @param status 状态
 */
export function changeRoleStatus(roleId: string | number, status: string) {
  return request<null>({
    url: '/system/role/changeStatus',
    method: 'put',
    data: {
      roleId,
      status
    }
  });
}

/**
 * 删除角色
 *
 * @param roleId 角色 id（可传 id 数组）
 */
export function delRole(roleId: Array<string | number> | string | number) {
  return request<null>({
    url: '/system/role/' + roleId,
    method: 'delete'
  });
}

/** 查询角色已授权用户列表 */
export function allocatedUserList(query: UserQuery) {
  return request<RuoYi.PageResult<UserVO>>({
    url: '/system/role/authUser/allocatedList',
    method: 'get',
    params: query
  });
}

/** 查询角色未授权用户列表 */
export function unallocatedUserList(query: UserQuery) {
  return request<RuoYi.PageResult<UserVO>>({
    url: '/system/role/authUser/unallocatedList',
    method: 'get',
    params: query
  });
}

/** 取消用户授权角色 */
export function authUserCancel(data: RoleAuthUserCancelParams) {
  return request<null>({
    url: '/system/role/authUser/cancel',
    method: 'put',
    data
  });
}

/** 批量取消用户授权角色 */
export function authUserCancelAll(data: RoleAuthUserBatchParams) {
  return request<null>({
    url: '/system/role/authUser/cancelAll',
    method: 'put',
    params: data
  });
}

/** 授权用户选择 */
export function authUserSelectAll(data: RoleAuthUserBatchParams) {
  return request<null>({
    url: '/system/role/authUser/selectAll',
    method: 'put',
    params: data
  });
}

/**
 * 根据角色 id 查询部门树结构
 *
 * @param roleId 角色 id
 */
export function deptTreeSelect(roleId: string | number) {
  return request<RoleDeptTree>({
    url: '/system/role/deptTree/' + roleId,
    method: 'get'
  });
}

/** deptTreeSelect 的显式别名（用于 index.ts 平铺导出） */
export const roleDeptTreeSelect = deptTreeSelect;

/** 与 plus-ui 一致的默认导出对象 */
export default {
  optionSelect,
  listRole
};
