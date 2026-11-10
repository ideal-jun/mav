/** 菜单类型：目录 M / 菜单 C / 按钮 F */
export type MenuTypeEnum = 'M' | 'C' | 'F';

/** 菜单树形结构 */
export interface MenuTreeOption {
  id: string | number;
  label: string;
  parentId: string | number;
  weight: number;
  menuType?: MenuTypeEnum;
  visible?: string;
  status?: string;
  disabled?: boolean;
  children?: MenuTreeOption[];
}

/** 角色菜单树 */
export interface RoleMenuTree {
  menus: MenuTreeOption[];
  checkedKeys: Array<string | number>;
}

/** 角色菜单分配中的按钮节点 */
export interface RoleMenuButtonOption {
  menuId: string | number;
  menuName: string;
  parentId: string | number;
  perms?: string;
  status?: string;
  disabled?: boolean;
}

/** 菜单查询参数 */
export interface MenuQuery {
  keywords?: string;
  menuName?: string;
  status?: string;
}

/** 菜单返回对象（后端 SysMenuVo） */
export interface MenuVO extends RuoYi.BaseEntity {
  parentName: string;
  parentId: string | number;
  children: MenuVO[];
  menuId: string | number;
  menuName: string;
  orderNum: number;
  path: string;
  component: string;
  queryParam: string;
  isFrame: string;
  isCache: string;
  menuType: MenuTypeEnum;
  visible: string;
  status: string;
  icon: string;
  activeMenu: string;
  ext: string;
  remark: string;
}

/** 菜单表单 */
export interface MenuForm {
  parentName?: string;
  parentId?: string | number;
  children?: MenuForm[];
  menuId?: string | number;
  menuName: string;
  orderNum: number;
  path: string;
  component?: string;
  queryParam?: string;
  isFrame?: string;
  isCache?: string;
  menuType?: MenuTypeEnum;
  visible?: string;
  status?: string;
  icon?: string;
  activeMenu?: string;
  ext?: string;
  remark?: string;
  query?: string;
  perms?: string;
}
