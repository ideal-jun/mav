import { request } from '@/service/request';
import type { ClientForm, ClientQuery, ClientVO } from './client/types';

/** 查询客户端管理列表 */
export function listClient(query?: ClientQuery) {
  return request<RuoYi.PageResult<ClientVO>>({
    url: '/system/client/list',
    method: 'get',
    params: query
  });
}

/** 查询客户端管理详细 */
export function getClient(id: string | number) {
  return request<ClientVO>({
    url: '/system/client/' + id,
    method: 'get'
  });
}

/** 新增客户端管理 */
export function addClient(data: ClientForm) {
  return request<null>({
    url: '/system/client',
    method: 'post',
    data
  });
}

/** 修改客户端管理 */
export function updateClient(data: ClientForm) {
  return request<null>({
    url: '/system/client',
    method: 'put',
    data
  });
}

/** 删除客户端管理 */
export function delClient(id: string | number | Array<string | number>) {
  return request<null>({
    url: '/system/client/' + id,
    method: 'delete'
  });
}

/**
 * 修改客户端状态
 *
 * @param clientId 客户端 id
 * @param status 状态
 */
export function changeStatus(clientId: string, status: string) {
  return request<null>({
    url: '/system/client/changeStatus',
    method: 'put',
    data: {
      clientId,
      status
    }
  });
}

/** changeStatus 的别名（页面约定使用 changeClientStatus 命名） */
export const changeClientStatus = changeStatus;
