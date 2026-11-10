import { request } from '@/service/request';
import type { DeptTreeVO } from './dept/types';
import type {
  UserAuthRoleParams,
  UserAuthRoleVO,
  UserForm,
  UserInfoVO,
  UserProfileForm,
  UserQuery,
  UserVO
} from './user/types';

/**
 * 查询用户列表
 *
 * @param query 查询参数
 */
export function listUser(query: UserQuery) {
  return request<RuoYi.PageResult<UserVO>>({
    url: '/system/user/list',
    method: 'get',
    params: query
  });
}

/**
 * 通过用户 ids 查询用户
 *
 * @param userIds 用户 id 串
 */
export function optionSelect(userIds: Array<number | string>) {
  return request<UserVO[]>({
    url: '/system/user/optionselect?userIds=' + userIds,
    method: 'get'
  });
}

/** optionSelect 的显式别名（用于 index.ts 平铺导出，避免与角色/部门同名方法冲突） */
export const optionSelectUser = optionSelect;

/**
 * 获取用户详情
 *
 * @param userId 用户 id，不传时查询新增页面所需的空表单
 */
export function getUser(userId?: string | number) {
  return request<UserInfoVO>({
    url: '/system/user/' + (userId ?? ''),
    method: 'get'
  });
}

/** 新增用户 */
export function addUser(data: UserForm) {
  return request<null>({
    url: '/system/user',
    method: 'post',
    data
  });
}

/** 修改用户 */
export function updateUser(data: UserForm) {
  return request<null>({
    url: '/system/user',
    method: 'put',
    data
  });
}

/**
 * 删除用户
 *
 * @param userId 用户 id（可传 id 数组）
 */
export function delUser(userId: Array<string | number> | string | number) {
  return request<null>({
    url: '/system/user/' + userId,
    method: 'delete'
  });
}

/**
 * 重置用户密码
 *
 * @param userId 用户 id
 * @param password 新密码
 */
export function resetUserPwd(userId: string | number, password: string) {
  return request<null>({
    url: '/system/user/resetPwd',
    method: 'put',
    headers: {
      isEncrypt: true,
      repeatSubmit: false
    },
    data: {
      userId,
      password
    }
  });
}

/**
 * 修改用户状态
 *
 * @param userId 用户 id
 * @param status 状态
 */
export function changeUserStatus(userId: number | string, status: string) {
  return request<null>({
    url: '/system/user/changeStatus',
    method: 'put',
    data: {
      userId,
      status
    }
  });
}

/**
 * 解锁用户
 *
 * @param userId 用户 id
 */
export function unlockUser(userId: number | string) {
  return request<null>({
    url: '/system/user/unlock/' + userId,
    method: 'get'
  });
}

/** 查询用户个人信息 */
export function getUserProfile() {
  return request<UserInfoVO>({
    url: '/system/user/profile',
    method: 'get'
  });
}

/**
 * 修改用户个人信息
 *
 * @param data 用户信息
 */
export function updateUserProfile(data: UserProfileForm) {
  return request<null>({
    url: '/system/user/profile',
    method: 'put',
    data
  });
}

/**
 * 修改个人密码
 *
 * @param oldPassword 旧密码
 * @param newPassword 新密码
 */
export function updateUserPwd(oldPassword: string, newPassword: string) {
  return request<null>({
    url: '/system/user/profile/updatePwd',
    method: 'put',
    headers: {
      isEncrypt: true,
      repeatSubmit: false
    },
    data: {
      oldPassword,
      newPassword
    }
  });
}

/**
 * 查询用户授权角色
 *
 * @param userId 用户 id
 */
export function getAuthRole(userId: string | number) {
  return request<UserAuthRoleVO>({
    url: '/system/user/authRole/' + userId,
    method: 'get'
  });
}

/**
 * 保存用户授权角色
 *
 * @param data 用户 id + 角色 id 串
 */
export function updateAuthRole(data: UserAuthRoleParams) {
  return request<null>({
    url: '/system/user/authRole',
    method: 'put',
    params: data
  });
}

/**
 * 查询当前部门的所有用户
 *
 * @param deptId 部门 id
 */
export function listUserByDeptId(deptId: string | number) {
  return request<UserVO[]>({
    url: '/system/user/list/dept/' + deptId,
    method: 'get'
  });
}

/** 查询部门下拉树结构（用户管理使用） */
export function deptTreeSelect() {
  return request<DeptTreeVO[]>({
    url: '/system/user/deptTree',
    method: 'get'
  });
}

/** deptTreeSelect 的显式别名（用于 index.ts 平铺导出） */
export const userDeptTreeSelect = deptTreeSelect;

/** 与 plus-ui 一致的默认导出对象（页面可直接 `import api from '@/service/api/ruoyi/system/user'`） */
export default {
  listUser,
  getUser,
  optionSelect,
  addUser,
  updateUser,
  delUser,
  resetUserPwd,
  changeUserStatus,
  unlockUser,
  getUserProfile,
  updateUserProfile,
  updateUserPwd,
  getAuthRole,
  updateAuthRole,
  deptTreeSelect,
  listUserByDeptId
};
