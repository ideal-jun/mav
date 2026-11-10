/** 岗位返回对象（后端 SysPostVo） */
export interface PostVO extends RuoYi.BaseEntity {
  postId: number | string;
  deptId: number | string;
  postCode: string;
  postName: string;
  postCategory: string;
  deptName: string;
  postSort: number;
  status: string;
  remark: string;
}

/** 岗位表单 */
export interface PostForm {
  postId: number | string | undefined;
  deptId: number | string | undefined;
  postCode: string;
  postName: string;
  postCategory: string;
  postSort: number;
  status: string;
  remark: string;
}

/** 岗位查询参数 */
export interface PostQuery extends RuoYi.PageQuery {
  deptId: number | string;
  belongDeptId: number | string;
  postCode: string;
  postName: string;
  postCategory: string;
  status: string;
}
