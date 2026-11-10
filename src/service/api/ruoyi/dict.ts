/**
 * 字典 API 的顶层出口
 *
 * 字典类型 + 字典数据的实现在 `./system/dict`，这里仅做路径兼容：
 * store / 页面可直接从 `@/service/api/ruoyi/dict` 引入，
 * 与 `@/service/api/ruoyi/system/dict` 完全等价。
 */
export * from './system/dict';
