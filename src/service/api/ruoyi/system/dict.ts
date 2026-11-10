import { request } from '@/service/request';
import type { DictDataForm, DictDataQuery, DictDataVO, DictTypeForm, DictTypeQuery, DictTypeVO } from './dict/types';

/* ------------------------------ 字典类型 ------------------------------ */

/** 查询字典类型列表 */
export function listType(query: DictTypeQuery) {
  return request<RuoYi.PageResult<DictTypeVO>>({
    url: '/system/dict/type/list',
    method: 'get',
    params: query
  });
}

/** 查询字典类型详细 */
export function getType(dictId: number | string) {
  return request<DictTypeVO>({
    url: '/system/dict/type/' + dictId,
    method: 'get'
  });
}

/** 新增字典类型 */
export function addType(data: DictTypeForm) {
  return request<null>({
    url: '/system/dict/type',
    method: 'post',
    data
  });
}

/** 修改字典类型 */
export function updateType(data: DictTypeForm) {
  return request<null>({
    url: '/system/dict/type',
    method: 'put',
    data
  });
}

/** 删除字典类型 */
export function delType(dictId: string | number | Array<string | number>) {
  return request<null>({
    url: '/system/dict/type/' + dictId,
    method: 'delete'
  });
}

/** 刷新字典缓存 */
export function refreshCache() {
  return request<null>({
    url: '/system/dict/type/refreshCache',
    method: 'delete'
  });
}

/** refreshCache 的显式别名（用于 index.ts 平铺导出，避免与参数配置同名方法冲突） */
export const refreshDictCache = refreshCache;

/** 获取字典类型选择框列表 */
export function optionselect() {
  return request<DictTypeVO[]>({
    url: '/system/dict/type/optionselect',
    method: 'get'
  });
}

/** optionselect 的显式别名（用于 index.ts 平铺导出） */
export const optionselectDict = optionselect;

/* ------------------------------ 字典数据 ------------------------------ */

/**
 * 根据字典类型查询字典数据
 *
 * @param dictType 字典类型
 */
export function getDictDataByType(dictType: string) {
  return request<DictDataVO[]>({
    url: '/system/dict/data/type/' + dictType,
    method: 'get'
  });
}

/** plus-ui 中的同名方法别名（与 getDictDataByType 等价） */
export const getDicts = getDictDataByType;

/** 查询字典数据列表 */
export function listData(query: DictDataQuery) {
  return request<RuoYi.PageResult<DictDataVO>>({
    url: '/system/dict/data/list',
    method: 'get',
    params: query
  });
}

/** 查询字典数据详细 */
export function getData(dictCode: string | number) {
  return request<DictDataVO>({
    url: '/system/dict/data/' + dictCode,
    method: 'get'
  });
}

/** 新增字典数据 */
export function addData(data: DictDataForm) {
  return request<null>({
    url: '/system/dict/data',
    method: 'post',
    data
  });
}

/** 修改字典数据 */
export function updateData(data: DictDataForm) {
  return request<null>({
    url: '/system/dict/data',
    method: 'put',
    data
  });
}

/** 删除字典数据 */
export function delData(dictCode: string | number | Array<string | number>) {
  return request<null>({
    url: '/system/dict/data/' + dictCode,
    method: 'delete'
  });
}
