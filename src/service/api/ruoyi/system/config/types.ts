/** 参数配置返回对象（后端 SysConfigVo） */
export interface ConfigVO extends RuoYi.BaseEntity {
  configId: number | string;
  configName: string;
  configKey: string;
  configValue: string;
  configType: string;
  remark: string;
}

/** 参数配置表单 */
export interface ConfigForm {
  configId: number | string | undefined;
  configName: string;
  configKey: string;
  configValue: string;
  configType: string;
  remark: string;
}

/** 参数配置查询参数 */
export interface ConfigQuery extends RuoYi.PageQuery {
  configName: string;
  configKey: string;
  configType: string;
}
