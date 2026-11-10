import { request } from '@/service/request';
import type { OssQuery, OssUploadVO, OssVO } from './oss/types';

/** 查询 OSS 对象存储列表 */
export function listOss(query: OssQuery) {
  return request<RuoYi.PageResult<OssVO>>({
    url: '/resource/oss/list',
    method: 'get',
    params: query
  });
}

/** 查询 OSS 对象（基于 id 串） */
export function listByIds(ossId: string | number) {
  return request<OssVO[]>({
    url: '/resource/oss/listByIds/' + ossId,
    method: 'get'
  });
}

/** 上传 OSS 对象存储 */
export function uploadOss(data: FormData) {
  return request<OssUploadVO>({
    url: '/resource/oss/upload',
    method: 'post',
    data
  });
}

/** 删除 OSS 对象存储 */
export function delOss(ossId: string | number | Array<string | number>) {
  return request<null>({
    url: '/resource/oss/' + ossId,
    method: 'delete'
  });
}
