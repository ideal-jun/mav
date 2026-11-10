import { request } from '@/service/request';

/** 动态路由 meta 信息（后端 MetaVo） */
export interface RouterMeta {
  /** 路由标题 */
  title?: string;
  /** 路由图标 */
  icon?: string;
  /** 是否禁用 keep-alive 缓存 */
  noCache?: boolean;
  /** 内链地址 */
  link?: string;
  /** 激活的菜单 */
  activeMenu?: string;
}

/** 动态路由结构（后端 RouterVo） */
export interface RouterVO {
  /** 路由名字 */
  name?: string;
  /** 路由地址 */
  path: string;
  /** 是否在侧边栏隐藏 */
  hidden?: boolean;
  /** 重定向地址 */
  redirect?: string;
  /** 组件地址 */
  component?: string;
  /** 路由参数，如 {"id": 1} */
  query?: string;
  /** 扩展字段 */
  ext?: string;
  /** children 多于 1 个时是否自动嵌套 */
  alwaysShow?: boolean;
  /** 其他元素 */
  meta?: RouterMeta;
  /** 子路由 */
  children?: RouterVO[];
}

/** 获取动态路由（后端 /system/menu/getRouters，返回 R<RouterVo[]>） */
export function getRouters() {
  return request<RouterVO[]>({
    url: '/system/menu/getRouters',
    method: 'get'
  });
}
