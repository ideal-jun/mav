/** 部门查询参数 */
export interface DeptQuery extends RuoYi.PageQuery {
  deptName?: string;
  deptCategory?: string;
  status?: number;
}

/** 部门返回对象（后端 SysDeptVo） */
export interface DeptVO extends RuoYi.BaseEntity {
  /** 前端树组件使用的 id */
  id: number | string;
  parentName: string;
  parentId: number | string;
  children: DeptVO[];
  deptId: number | string;
  deptName: string;
  deptCategory: string;
  orderNum: number;
  leader: string;
  phone: string;
  email: string;
  status: string;
  delFlag: string;
  ancestors: string;
  menuId: string | number;
}

/** 部门下拉树结构 */
export interface DeptTreeVO extends RuoYi.BaseEntity {
  /** 前端树组件使用的 id */
  id: number | string;
  label: string;
  parentId: number | string;
  weight: number;
  children: DeptTreeVO[];
  disabled: boolean;
}

/** 部门表单 */
export interface DeptForm {
  parentName?: string;
  parentId?: number | string;
  children?: DeptForm[];
  deptId?: number | string;
  deptName?: string;
  deptCategory?: string;
  orderNum?: number;
  leader?: string;
  phone?: string;
  email?: string;
  status?: string;
  delFlag?: string;
  ancestors?: string;
}
