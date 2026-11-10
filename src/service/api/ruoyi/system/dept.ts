import { request } from '@/service/request';
import type { DeptForm, DeptQuery, DeptVO } from './dept/types';

/** 查询部门列表 */
export function listDept(query?: DeptQuery) {
  return request<DeptVO[]>({
    url: '/system/dept/list',
    method: 'get',
    params: query
  });
}

/**
 * 通过 deptIds 查询部门
 *
 * @param deptIds 部门 id 串
 */
export function optionSelect(deptIds: Array<number | string>) {
  return request<DeptVO[]>({
    url: '/system/dept/optionselect?deptIds=' + deptIds,
    method: 'get'
  });
}

/** optionSelect 的显式别名（用于 index.ts 平铺导出） */
export const optionSelectDept = optionSelect;

/** 查询部门列表（排除节点） */
export function listDeptExcludeChild(deptId: string | number) {
  return request<DeptVO[]>({
    url: '/system/dept/list/exclude/' + deptId,
    method: 'get'
  });
}

/** 查询部门详细 */
export function getDept(deptId: string | number) {
  return request<DeptVO>({
    url: '/system/dept/' + deptId,
    method: 'get'
  });
}

/** 新增部门 */
export function addDept(data: DeptForm) {
  return request<null>({
    url: '/system/dept',
    method: 'post',
    data
  });
}

/** 修改部门 */
export function updateDept(data: DeptForm) {
  return request<null>({
    url: '/system/dept',
    method: 'put',
    data
  });
}

/** 删除部门 */
export function delDept(deptId: number | string) {
  return request<null>({
    url: '/system/dept/' + deptId,
    method: 'delete'
  });
}
