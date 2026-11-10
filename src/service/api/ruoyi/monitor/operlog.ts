import { request } from '@/service/request';
import type { OperLogQuery, OperLogVO } from './types';

/** 查询操作日志列表 */
export function list(query: OperLogQuery) {
  return request<RuoYi.PageResult<OperLogVO>>({
    url: '/monitor/operlog/list',
    method: 'get',
    params: query
  });
}

/** list 的显式别名（用于 index.ts 平铺导出，避免与登录/在线日志同名方法冲突） */
export const listOperLog = list;

/** 删除操作日志 */
export function delOperlog(operId: string | number | Array<string | number>) {
  return request<null>({
    url: '/monitor/operlog/' + operId,
    method: 'delete'
  });
}

/** 清空操作日志 */
export function cleanOperlog() {
  return request<null>({
    url: '/monitor/operlog/clean',
    method: 'delete'
  });
}
