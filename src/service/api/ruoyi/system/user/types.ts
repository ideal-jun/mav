import type { PostVO } from '../post/types';
import type { RoleVO } from '../role/types';

/** 当前登录用户信息 */
export interface UserInfo {
  user: UserVO;
  roles: string[];
  permissions: string[];
}

/** 用户查询参数 */
export interface UserQuery extends RuoYi.PageQuery {
  userName?: string;
  nickName?: string;
  phoneNumber?: string;
  status?: string;
  deptId?: string | number;
  roleId?: string | number;
  userIds?: string | number | Array<string | number>;
}

/** 用户返回对象（后端 SysUserVo） */
export interface UserVO extends RuoYi.BaseEntity {
  userId: string | number;
  tenantId: string;
  deptId: number;
  userName: string;
  nickName: string;
  userType: string;
  email: string;
  phoneNumber: string;
  gender: string;
  avatar?: string | number;
  avatarUrl?: string;
  status: string;
  delFlag: string;
  loginIp: string;
  loginDate: string;
  remark: string;
  deptName: string;
  /** 详情接口可能返回嵌套部门 */
  dept?: { deptName?: string };
  roles: RoleVO[];
  roleIds: any;
  postIds: any;
  roleId: any;
  admin: boolean;
}

/** 用户表单（新增/修改） */
export interface UserForm {
  id?: string;
  userId?: string;
  deptId?: number;
  userName: string;
  nickName?: string;
  password: string;
  phoneNumber?: string;
  email?: string;
  gender?: string;
  status: string;
  remark?: string;
  avatar?: string | number;
  postIds: string[];
  roleIds: string[];
}

/** 个人资料表单 */
export interface UserProfileForm {
  nickName?: string;
  phoneNumber?: string;
  email?: string;
  gender?: string;
  avatar?: string | number;
}

/** 用户详情（/system/user/{userId}） */
export interface UserInfoVO {
  user: UserVO;
  roles: RoleVO[];
  roleIds: string[];
  posts: PostVO[];
  postIds: string[];
  roleGroup: string;
  postGroup: string;
}

/** 授权角色返回（/system/user/authRole/{userId}） */
export interface UserAuthRoleVO {
  user: UserVO;
  roles: RoleVO[];
  roleIds?: Array<string | number>;
  posts?: PostVO[];
  postIds?: Array<string | number>;
  roleGroup?: string;
  postGroup?: string;
}

/** 授权角色参数（/system/user/authRole） */
export interface UserAuthRoleParams {
  userId: string;
  roleIds: string | Array<string | number>;
}

/** 重置密码表单 */
export interface ResetPwdForm {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
