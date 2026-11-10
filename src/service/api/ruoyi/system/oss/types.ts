/** OSS 对象存储返回对象（后端 SysOssVo） */
export interface OssVO extends RuoYi.BaseEntity {
  ossId: string | number;
  fileName: string;
  originalName: string;
  fileSuffix: string;
  url: string;
  createByName: string;
  service: string;
}

/** OSS 上传返回对象 */
export interface OssUploadVO {
  url: string;
  fileName: string;
  ossId: string;
}

/** OSS 查询参数 */
export interface OssQuery extends RuoYi.PageQuery {
  fileName: string;
  originalName: string;
  fileSuffix: string;
  createTime: string;
  service: string;
  orderByColumn: string;
  isAsc: string;
}

/** OSS 表单 */
export interface OssForm {
  file: undefined | string;
}

/** OSS 扩展信息 */
export interface SysOssExt {
  bizType?: string;
  fileSize?: number;
  contentType?: string;
  source?: string;
  uploadIp?: string;
  remark?: string;
  tags?: string[];
  refId?: string;
  refType?: string;
  isTemp?: boolean;
  md5?: string;
}
