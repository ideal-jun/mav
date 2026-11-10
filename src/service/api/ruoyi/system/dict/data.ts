/**
 * 兼容 plus-ui 的字典数据模块路径：@/service/api/ruoyi/system/dict/data
 *
 * 实现在合并后的 `../dict` 中（plus-ui 里 type / data 分两个目录）。
 */
export { addData, delData, getData, getDictDataByType, getDicts, listData, updateData } from '../dict';
export type { DictDataForm, DictDataQuery, DictDataVO } from './types';
