/**
 * RuoYi-Cloud-Plus 通用类型
 *
 * 权威定义在 `src/typings/ruoyi.d.ts` 的全局 `RuoYi` 命名空间中，
 * 这里提供可显式 import 的入口，模块内也可以用 `RuoYi.PageResult<T>`。
 */

/** 后端统一响应结构：{ code, msg, data } */
export interface R<T = any> {
  /** 响应码：200 成功 */
  code: number;
  /** 响应消息 */
  msg: string;
  /** 响应数据 */
  data: T;
}

/** 分页查询基础参数 */
export type PageQuery = RuoYi.PageQuery;

/** 分页返回结构 */
export type PageResult<T = any> = RuoYi.PageResult<T>;

/** 实体基础字段 */
export type BaseEntity = RuoYi.BaseEntity;
