import { request } from '@/service/request';
import type { DeptTreeVO } from './dept/types';
import type { PostForm, PostQuery, PostVO } from './post/types';

/** 查询岗位列表 */
export function listPost(query: PostQuery) {
  return request<RuoYi.PageResult<PostVO>>({
    url: '/system/post/list',
    method: 'get',
    params: query
  });
}

/** 查询岗位详细 */
export function getPost(postId: string | number) {
  return request<PostVO>({
    url: '/system/post/' + postId,
    method: 'get'
  });
}

/**
 * 获取岗位选择框列表
 *
 * @param deptId 部门 id
 * @param postIds 岗位 id 串
 */
export function optionselect(deptId?: number | string, postIds?: Array<number | string>) {
  return request<PostVO[]>({
    url: '/system/post/optionselect',
    method: 'get',
    params: {
      postIds,
      deptId
    }
  });
}

/** optionselect 的显式别名（用于 index.ts 平铺导出） */
export const optionselectPost = optionselect;

/** 新增岗位 */
export function addPost(data: PostForm) {
  return request<null>({
    url: '/system/post',
    method: 'post',
    data
  });
}

/** 修改岗位 */
export function updatePost(data: PostForm) {
  return request<null>({
    url: '/system/post',
    method: 'put',
    data
  });
}

/** 删除岗位 */
export function delPost(postId: string | number | Array<string | number>) {
  return request<null>({
    url: '/system/post/' + postId,
    method: 'delete'
  });
}

/** 查询部门下拉树结构（岗位管理使用） */
export function deptTreeSelect() {
  return request<DeptTreeVO[]>({
    url: '/system/post/deptTree',
    method: 'get'
  });
}

/** deptTreeSelect 的显式别名（用于 index.ts 平铺导出） */
export const postDeptTreeSelect = deptTreeSelect;
