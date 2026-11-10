import { request } from '@/service/request';
import type { ConfigForm, ConfigQuery, ConfigVO } from './config/types';

/** 查询参数列表 */
export function listConfig(query: ConfigQuery) {
  return request<RuoYi.PageResult<ConfigVO>>({
    url: '/system/config/list',
    method: 'get',
    params: query
  });
}

/** 查询参数详细 */
export function getConfig(configId: string | number) {
  return request<ConfigVO>({
    url: '/system/config/' + configId,
    method: 'get'
  });
}

/** 根据参数键名查询参数值 */
export function getConfigKey(configKey: string) {
  return request<string>({
    url: '/system/config/configKey/' + configKey,
    method: 'get'
  });
}

/** 新增参数配置 */
export function addConfig(data: ConfigForm) {
  return request<null>({
    url: '/system/config',
    method: 'post',
    data
  });
}

/** 修改参数配置 */
export function updateConfig(data: ConfigForm) {
  return request<null>({
    url: '/system/config',
    method: 'put',
    data
  });
}

/** 根据参数键名修改参数值 */
export function updateConfigByKey(key: string, value: any) {
  return request<null>({
    url: '/system/config/updateByKey',
    method: 'put',
    data: {
      configKey: key,
      configValue: value
    }
  });
}

/** 删除参数配置 */
export function delConfig(configId: string | number | Array<string | number>) {
  return request<null>({
    url: '/system/config/' + configId,
    method: 'delete'
  });
}

/** 刷新参数缓存 */
export function refreshCache() {
  return request<null>({
    url: '/system/config/refreshCache',
    method: 'delete'
  });
}

/** refreshCache 的别名（页面约定使用 refreshConfigCache 命名） */
export const refreshConfigCache = refreshCache;
