/** 菜单/部门树形结构选项 */
export interface DeptTreeOption {
  id: string;
  label: string;
  parentId: string;
  weight: number;
  children?: DeptTreeOption[];
}

/** 角色部门树 */
export interface RoleDeptTree {
  checkedKeys: string[];
  depts: DeptTreeOption[];
}

/** 角色返回对象（后端 SysRoleVo） */
export interface RoleVO extends RuoYi.BaseEntity {
  roleId: string | number;
  roleName: string;
  roleKey: string;
  roleSort: number;
  dataScope: string;
  menuCheckStrictly: boolean;
  deptCheckStrictly: boolean;
  status: string;
  delFlag: string;
  remark?: any;
  flag: boolean;
  menuIds?: Array<string | number>;
  deptIds?: Array<string | number>;
  admin: boolean;
}

/** 角色查询参数 */
export interface RoleQuery extends RuoYi.PageQuery {
  roleName: string;
  roleKey: string;
  status?: string;
}

/** 角色表单（新增/修改/权限分配） */
export interface RoleForm {
  roleName: string;
  roleKey: string;
  roleSort: number;
  status: string;
  menuCheckStrictly: boolean;
  deptCheckStrictly: boolean;
  remark: string;
  dataScope?: string;
  roleId: string | undefined;
  menuIds: Array<string | number>;
  deptIds: Array<string | number>;
}

/** 取消单个用户授权角色参数 */
export interface RoleAuthUserCancelParams {
  roleId: string | number;
  userId: string | number;
}

/** 批量授权/取消授权用户参数 */
export interface RoleAuthUserBatchParams {
  roleId: string | number;
  userIds: Array<string | number> | string;
}
