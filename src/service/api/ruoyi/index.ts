/**
 * RuoYi-Cloud-Plus API 层统一出口
 *
 * 使用方式：
 * ```ts
 * import { listUser, getRouters, getDictDataByType } from '@/service/api/ruoyi';
 * const { data, error } = await listUser(query);
 * ```
 *
 * 说明：plus-ui 中 user / role / dept / post / dict / monitor 存在同名方法
 * （optionSelect、deptTreeSelect、refreshCache、optionselect、list），
 * 这里对冲突方法给出显式别名后平铺导出，模块文件内仍保留 plus-ui 原名，
 * 需要原名时可直接从对应模块路径 import。
 */

// 基础类型
export * from './types';

// 认证 / 动态路由
export * from './auth';
export * from './menu';

// 系统管理（无同名冲突的模块）
export * from './system/user';
export * from './system/user/types';
export * from './system/menu';
export * from './system/menu/types';
export * from './system/config';
export * from './system/config/types';
export * from './system/notice';
export * from './system/notice/types';
export * from './system/client';
export * from './system/client/types';
export * from './system/oss';
export * from './system/oss/types';
export * from './system/ossConfig';

// 系统管理类型
export * from './system/dept/types';
export * from './system/role/types';
export * from './system/post/types';
export * from './system/dict/types';

// 系统管理（与 user 模块存在同名方法，显式导出并别名）
export { addDept, delDept, getDept, listDept, listDeptExcludeChild, optionSelectDept, updateDept } from './system/dept';
export {
  addRole,
  allocatedUserList,
  authUserCancel,
  authUserCancelAll,
  authUserSelectAll,
  changeRoleStatus,
  delRole,
  getRole,
  listRole,
  optionSelectRole,
  roleDeptTreeSelect,
  unallocatedUserList,
  updateRole,
  updateRolePermission
} from './system/role';
export { addPost, delPost, getPost, listPost, optionselectPost, postDeptTreeSelect, updatePost } from './system/post';
export {
  addData,
  addType,
  delData,
  delType,
  getData,
  getDictDataByType,
  getDicts,
  getType,
  listData,
  listType,
  optionselectDict,
  refreshDictCache,
  updateData,
  updateType
} from './system/dict';

// 监控
export * from './monitor/types';
export * from './monitor/cache';
export { cleanOperlog, delOperlog, listOperLog } from './monitor/operlog';
export { cleanLoginInfo, delLoginInfo, listLoginInfo, unlockLoginInfo } from './monitor/logininfo';
export { delOnline, forceLogout, getOnline, listOnline } from './monitor/online';
