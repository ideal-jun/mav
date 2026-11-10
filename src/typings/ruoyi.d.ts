/**
 * RuoYi-Cloud-Plus 后端通用类型（全局命名空间）
 *
 * 业务代码无需 import 即可使用 `RuoYi.xxx`；需要显式 import 的别名见
 * `src/service/api/ruoyi/types.ts`。
 */
declare namespace RuoYi {
  /** 后端统一响应结构：{ code, msg, data } */
  interface R<T = any> {
    /** 响应码：200 成功 */
    code: number;
    /** 响应消息 */
    msg: string;
    /** 响应数据 */
    data: T;
  }

  /** 分页查询基础参数 */
  interface PageQuery {
    /** 当前页码，从 1 开始 */
    pageNum: number;
    /** 每页条数 */
    pageSize: number;
  }

  /** 分页返回结构 */
  interface PageResult<T = any> {
    /** 总记录数 */
    total: number;
    /** 当前页数据 */
    rows: T[];
  }

  /** 实体基础字段 */
  interface BaseEntity {
    /** 创建者 */
    createBy?: string | number;
    /** 创建部门 */
    createDept?: string | number;
    /** 创建时间 */
    createTime?: string;
    /** 更新者 */
    updateBy?: string | number;
    /** 更新时间 */
    updateTime?: string;
  }
}
