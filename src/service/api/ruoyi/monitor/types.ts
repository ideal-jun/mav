/* ------------------------------ 操作日志 ------------------------------ */

/** 操作日志查询参数 */
export interface OperLogQuery extends RuoYi.PageQuery {
  operIp: string;
  title: string;
  operName: string;
  userId: string;
  deptId: string;
  clientKey: string;
  deviceType: string;
  browser: string;
  os: string;
  businessType?: string;
  status?: string;
  orderByColumn: string;
  isAsc: string;
}

/** 操作日志返回对象（后端 SysOperLogVo） */
export interface OperLogVO extends RuoYi.BaseEntity {
  operId: string | number;
  tenantId: string;
  title: string;
  businessType: number;
  businessTypes: number[] | undefined;
  method: string;
  requestMethod: string;
  operatorType: number;
  operName: string;
  userId: string | number;
  deptId: string | number;
  deptName: string;
  clientKey: string;
  deviceType: string;
  browser: string;
  os: string;
  operUrl: string;
  operIp: string;
  operLocation: string;
  operParam: string;
  jsonResult: string;
  status: number;
  errorMsg: string;
  operTime: string;
  costTime: number;
}

/** 操作日志表单 */
export interface OperLogForm {
  operId: number | string | undefined;
  tenantId: string | number | undefined;
  title: string;
  businessType: number;
  businessTypes: number[] | undefined;
  method: string;
  requestMethod: string;
  operatorType: number;
  operName: string;
  userId: string | number | undefined;
  deptId: string | number | undefined;
  deptName: string;
  clientKey: string;
  deviceType: string;
  browser: string;
  os: string;
  operUrl: string;
  operIp: string;
  operLocation: string;
  operParam: string;
  jsonResult: string;
  status: number;
  errorMsg: string;
  operTime: string;
  costTime: number;
}

/* ------------------------------ 登录日志 ------------------------------ */

/** 登录日志返回对象（后端 SysLoginInfoVo） */
export interface LoginInfoVO {
  infoId: string | number;
  tenantId: string | number;
  userName: string;
  status: string;
  ipaddr: string;
  loginLocation: string;
  browser: string;
  os: string;
  msg: string;
  loginTime: string;
}

/** 登录日志查询参数 */
export interface LoginInfoQuery extends RuoYi.PageQuery {
  ipaddr: string;
  userName: string;
  status?: string;
  orderByColumn: string;
  isAsc: string;
}

/* ------------------------------ 在线用户 ------------------------------ */

/** 在线用户查询参数 */
export interface OnlineQuery extends RuoYi.PageQuery {
  ipaddr: string;
  userName: string;
}

/** 在线用户返回对象（后端 SysUserOnlineVo） */
export interface OnlineVO extends RuoYi.BaseEntity {
  tokenId: string;
  deptName: string;
  userName: string;
  /** 客户端 key */
  clientKey?: string;
  /** 设备类型 */
  deviceType?: string;
  ipaddr: string;
  loginLocation: string;
  browser: string;
  os: string;
  loginTime: number;
}

/* ------------------------------- 缓存 -------------------------------- */

/** 缓存监控返回对象 */
export interface CacheVO {
  commandStats: Array<{ name: string; value: string }>;
  dbSize: number;
  info: { [key: string]: string };
}
