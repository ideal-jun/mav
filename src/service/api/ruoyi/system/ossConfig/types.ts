/** OSS 配置返回对象（后端 SysOssConfigVo） */
export interface OssConfigVO extends RuoYi.BaseEntity {
  ossConfigId: number | string;
  configKey: string;
  accessKey: string;
  secretKey: string;
  bucketName: string;
  prefix: string;
  endpoint: string;
  domainUrl: string;
  isHttps: string;
  region: string;
  status: string;
  ext1: string;
  remark: string;
  accessPolicy: string;
}

/** OSS 配置查询参数 */
export interface OssConfigQuery extends RuoYi.PageQuery {
  configKey: string;
  bucketName: string;
  status: string;
}

/** OSS 配置表单 */
export interface OssConfigForm {
  ossConfigId: string | number | undefined;
  configKey: string;
  accessKey: string;
  secretKey: string;
  bucketName: string;
  prefix: string;
  endpoint: string;
  domainUrl: string;
  isHttps: string;
  accessPolicy: string;
  region: string;
  status: string;
  remark: string;
}
