import { request } from '@/service/request';
import type { LoginInfoQuery, LoginInfoVO } from './types';

/** 查询登录日志列表 */
export function list(query: LoginInfoQuery) {
  return request<RuoYi.PageResult<LoginInfoVO>>({
    url: '/monitor/loginInfo/list',
    method: 'get',
    params: query
  });
}

/** list 的显式别名（用于 index.ts 平铺导出） */
export const listLoginInfo = list;

/** 删除登录日志 */
export function delLoginInfo(infoId: string | number | Array<string | number>) {
  return request<null>({
    url: '/monitor/loginInfo/' + infoId,
    method: 'delete'
  });
}

/** 解锁用户登录状态 */
export function unlockLoginInfo(userName: string | Array<string>) {
  return request<null>({
    url: '/monitor/loginInfo/unlock/' + userName,
    method: 'get'
  });
}

/** 清空登录日志 */
export function cleanLoginInfo() {
  return request<null>({
    url: '/monitor/loginInfo/clean',
    method: 'delete'
  });
}
