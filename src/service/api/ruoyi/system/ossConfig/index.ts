import { request } from '@/service/request';
import type { OssConfigForm, OssConfigQuery, OssConfigVO } from './types';

/** 查询对象存储配置列表 */
export function listOssConfig(query: OssConfigQuery) {
  return request<RuoYi.PageResult<OssConfigVO>>({
    url: '/resource/oss/config/list',
    method: 'get',
    params: query
  });
}

/** 查询对象存储配置详细 */
export function getOssConfig(ossConfigId: string | number) {
  return request<OssConfigVO>({
    url: '/resource/oss/config/' + ossConfigId,
    method: 'get'
  });
}

/** 新增对象存储配置 */
export function addOssConfig(data: OssConfigForm) {
  return request<null>({
    url: '/resource/oss/config',
    method: 'post',
    data
  });
}

/** 修改对象存储配置 */
export function updateOssConfig(data: OssConfigForm) {
  return request<null>({
    url: '/resource/oss/config',
    method: 'put',
    data
  });
}

/** 删除对象存储配置 */
export function delOssConfig(ossConfigId: string | number | Array<string | number>) {
  return request<null>({
    url: '/resource/oss/config/' + ossConfigId,
    method: 'delete'
  });
}

/**
 * 修改对象存储配置状态
 *
 * @param ossConfigId 配置 id
 * @param status 状态
 * @param configKey 配置 key
 */
export function changeOssConfigStatus(ossConfigId: string | number, status: string, configKey: string) {
  return request<null>({
    url: '/resource/oss/config/changeStatus',
    method: 'put',
    data: {
      ossConfigId,
      status,
      configKey
    }
  });
}

export type { OssConfigForm, OssConfigQuery, OssConfigVO };
