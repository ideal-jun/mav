import { request } from '@/service/request';
import type { NoticeForm, NoticeQuery, NoticeVO } from './notice/types';

/** 查询公告列表 */
export function listNotice(query: NoticeQuery) {
  return request<RuoYi.PageResult<NoticeVO>>({
    url: '/system/notice/list',
    method: 'get',
    params: query
  });
}

/** 查询公告详细 */
export function getNotice(noticeId: string | number) {
  return request<NoticeVO>({
    url: '/system/notice/' + noticeId,
    method: 'get'
  });
}

/** 新增公告 */
export function addNotice(data: NoticeForm) {
  return request<null>({
    url: '/system/notice',
    method: 'post',
    data
  });
}

/** 修改公告 */
export function updateNotice(data: NoticeForm) {
  return request<null>({
    url: '/system/notice',
    method: 'put',
    data
  });
}

/** 删除公告 */
export function delNotice(noticeId: string | number | Array<string | number>) {
  return request<null>({
    url: '/system/notice/' + noticeId,
    method: 'delete'
  });
}
