import { request } from '@/service/request';
import type { OnlineQuery, OnlineVO } from './types';

/** 查询在线用户列表 */
export function list(query: OnlineQuery) {
  return request<RuoYi.PageResult<OnlineVO>>({
    url: '/monitor/online/list',
    method: 'get',
    params: query
  });
}

/** list 的显式别名（用于 index.ts 平铺导出） */
export const listOnline = list;

/** 强制退出用户 */
export function forceLogout(tokenId: string) {
  return request<null>({
    url: '/monitor/online/' + tokenId,
    method: 'delete'
  });
}

/** 获取当前用户登录在线设备 */
export function getOnline() {
  return request<RuoYi.PageResult<OnlineVO>>({
    url: '/monitor/online',
    method: 'get'
  });
}

/** 删除当前在线设备 */
export function delOnline(tokenId: string) {
  return request<null>({
    url: '/monitor/online/myself/' + tokenId,
    method: 'delete'
  });
}
