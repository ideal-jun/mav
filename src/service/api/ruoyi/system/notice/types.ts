/** 公告返回对象（后端 SysNoticeVo） */
export interface NoticeVO extends RuoYi.BaseEntity {
  noticeId: number;
  noticeTitle: string;
  noticeType: string;
  noticeContent: string;
  status: string;
  remark: string;
  createByName: string;
}

/** 公告查询参数 */
export interface NoticeQuery extends RuoYi.PageQuery {
  noticeTitle: string;
  createByName: string;
  status: string;
  noticeType: string;
}

/** 公告表单 */
export interface NoticeForm {
  noticeId: number | string | undefined;
  noticeTitle: string;
  noticeType: string;
  noticeContent: string;
  status: string;
  remark: string;
  createByName: string;
}
