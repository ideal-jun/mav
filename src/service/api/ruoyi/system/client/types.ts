/** 客户端管理返回对象（后端 SysClientVo） */
export interface ClientVO {
  /** 主键 id */
  id: string | number;
  /** 客户端 id */
  clientId: string;
  /** 客户端 key */
  clientKey: string;
  /** 客户端秘钥 */
  clientSecret: string;
  /** 授权类型 */
  grantTypeList: string[];
  /** 设备类型 */
  deviceType: string;
  /** 允许访问路径 */
  accessPath?: string;
  /** 允许访问路径列表 */
  accessPathList?: string[];
  /** IP 白名单 */
  ipWhitelist?: string;
  /** IP 白名单列表 */
  ipWhitelistList?: string[];
  /** token 活跃超时时间 */
  activeTimeout: number;
  /** token 固定超时 */
  timeout: number;
  /** 状态（0 正常 1 停用） */
  status: string;
}

/** 客户端管理表单 */
export interface ClientForm extends RuoYi.BaseEntity {
  /** 主键 id */
  id?: string | number;
  /** 客户端 id */
  clientId?: string | number;
  /** 客户端 key */
  clientKey?: string;
  /** 客户端秘钥 */
  clientSecret?: string;
  /** 授权类型 */
  grantTypeList?: string[];
  /** 设备类型 */
  deviceType?: string;
  /** 允许访问路径 */
  accessPath?: string;
  /** 允许访问路径列表 */
  accessPathList?: string[];
  /** IP 白名单 */
  ipWhitelist?: string;
  /** IP 白名单列表 */
  ipWhitelistList?: string[];
  /** token 活跃超时时间 */
  activeTimeout?: number;
  /** token 固定超时 */
  timeout?: number;
  /** 状态（0 正常 1 停用） */
  status?: string;
}

/** 客户端管理查询参数 */
export interface ClientQuery extends RuoYi.PageQuery {
  /** 客户端 id */
  clientId?: string | number;
  /** 客户端 key */
  clientKey?: string;
  /** 客户端秘钥 */
  clientSecret?: string;
  /** 授权类型 */
  grantType?: string;
  /** 设备类型 */
  deviceType?: string;
  /** 允许访问路径 */
  accessPath?: string;
  /** IP 白名单 */
  ipWhitelist?: string;
  /** token 活跃超时时间 */
  activeTimeout?: number;
  /** token 固定超时 */
  timeout?: number;
  /** 状态（0 正常 1 停用） */
  status?: string;
}
