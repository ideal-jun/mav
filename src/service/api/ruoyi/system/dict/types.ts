/** 字典类型返回对象（后端 SysDictTypeVo） */
export interface DictTypeVO extends RuoYi.BaseEntity {
  dictId: number | string;
  dictName: string;
  dictType: string;
  remark: string;
}

/** 字典类型表单 */
export interface DictTypeForm {
  dictId: number | string | undefined;
  dictName: string;
  dictType: string;
  remark: string;
}

/** 字典类型查询参数 */
export interface DictTypeQuery extends RuoYi.PageQuery {
  dictName: string;
  dictType: string;
}

/** 字典数据查询参数 */
export interface DictDataQuery extends RuoYi.PageQuery {
  dictName: string;
  dictType: string;
  dictLabel: string;
}

/** 字典数据返回对象（后端 SysDictDataVo） */
export interface DictDataVO extends RuoYi.BaseEntity {
  dictCode: string;
  dictLabel: string;
  dictValue: string;
  cssClass: string;
  /** 标签样式（plus-ui 中为 ElTagType，mav 使用 string） */
  listClass: string;
  dictSort: number;
  remark: string;
}

/** 字典数据表单 */
export interface DictDataForm {
  dictType?: string;
  dictCode: string | undefined;
  dictLabel: string;
  dictValue: string;
  cssClass: string;
  listClass: string;
  dictSort: number;
  remark: string;
}
