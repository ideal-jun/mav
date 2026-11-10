/**
 * 兼容 plus-ui 的字典类型模块路径：@/service/api/ruoyi/system/dict/type
 *
 * 实现在合并后的 `../dict` 中（plus-ui 里 type / data 分两个目录）。
 */
export { addType, delType, getType, listType, optionselect, refreshCache, updateType } from '../dict';
export type { DictTypeForm, DictTypeQuery, DictTypeVO } from './types';
