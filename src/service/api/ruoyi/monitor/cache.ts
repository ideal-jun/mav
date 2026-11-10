import { request } from '@/service/request';
import type { CacheVO } from './types';

/** 查询缓存详细 */
export function getCache() {
  return request<CacheVO>({
    url: '/monitor/cache',
    method: 'get'
  });
}
