import type { RouteRecordRaw } from 'vue-router';

import BaseLayout from '@/layouts/base-layout/index.vue';
import BlankLayout from '@/layouts/blank-layout/index.vue';

/**
 * Hand-written Vue Router route table.
 *
 * Add or remove pages directly in this file. Page components are lazy-loaded with
 * `() => import(...)`; there is no route generation or transform step.
 */

/** Routes accessible without login. */
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: BlankLayout,
    children: [
      {
        name: 'login',
        path: ':module(pwd-login|code-login|register|reset-pwd|bind-wechat)?',
        component: () => import('@/views/_builtin/login/index.vue'),
        props: true,
        meta: {
          title: 'login',
          i18nKey: 'route.login',
          constant: true,
          hideInMenu: true
        }
      }
    ]
  },
  {
    path: '/403',
    component: BlankLayout,
    meta: {
      title: '403'
    },
    children: [
      {
        name: '403',
        path: '',
        component: () => import('@/views/_builtin/403/index.vue'),
        meta: {
          title: '403',
          i18nKey: 'route.403',
          constant: true,
          hideInMenu: true
        }
      }
    ]
  },
  {
    path: '/404',
    component: BlankLayout,
    meta: {
      title: '404'
    },
    children: [
      {
        name: '404',
        path: '',
        component: () => import('@/views/_builtin/404/index.vue'),
        meta: {
          title: '404',
          i18nKey: 'route.404',
          constant: true,
          hideInMenu: true
        }
      }
    ]
  },
  {
    path: '/500',
    component: BlankLayout,
    meta: {
      title: '500'
    },
    children: [
      {
        name: '500',
        path: '',
        component: () => import('@/views/_builtin/500/index.vue'),
        meta: {
          title: '500',
          i18nKey: 'route.500',
          constant: true,
          hideInMenu: true
        }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    component: BlankLayout,
    meta: {
      title: 'not-found'
    },
    children: [
      {
        name: 'not-found',
        path: '',
        component: () => import('@/views/_builtin/404/index.vue'),
        meta: {
          title: 'not-found',
          constant: true
        }
      }
    ]
  }
];

/** Authenticated menu routes, rendered inside the base layout. */
export const menuRoutes: RouteRecordRaw[] = [
  {
    name: 'about',
    path: '/about',
    component: () => import('@/views/about/index.vue'),
    meta: {
      title: 'about',
      i18nKey: 'route.about',
      icon: 'mdi-information-outline'
    }
  },
  {
    name: 'alova',
    path: '/alova',
    meta: {
      title: 'alova',
      i18nKey: 'route.alova',
      icon: 'mdi-api'
    },
    children: [
      {
        name: 'alova_request',
        path: '/alova/request',
        component: () => import('@/views/alova/request/index.vue'),
        meta: {
          title: 'alova_request',
          i18nKey: 'route.alova_request',
          icon: 'mdi-send-outline'
        }
      },
      {
        name: 'alova_scenes',
        path: '/alova/scenes',
        component: () => import('@/views/alova/scenes/index.vue'),
        meta: {
          title: 'alova_scenes',
          i18nKey: 'route.alova_scenes',
          icon: 'mdi-sitemap-outline'
        }
      }
    ]
  },
  {
    name: 'function',
    path: '/function',
    meta: {
      title: 'function',
      i18nKey: 'route.function',
      icon: 'mdi-view-dashboard-outline'
    },
    children: [
      {
        name: 'function_hide-child',
        path: '/function/hide-child',
        meta: {
          title: 'function_hide-child',
          i18nKey: 'route.function_hide-child',
          icon: 'mdi-eye-off-outline'
        },
        children: [
          {
            name: 'function_hide-child_one',
            path: '/function/hide-child/one',
            component: () => import('@/views/function/hide-child/one/index.vue'),
            meta: {
              title: 'function_hide-child_one',
              i18nKey: 'route.function_hide-child_one',
              icon: 'mdi-numeric-1-circle-outline'
            }
          },
          {
            name: 'function_hide-child_three',
            path: '/function/hide-child/three',
            component: () => import('@/views/function/hide-child/three/index.vue'),
            meta: {
              title: 'function_hide-child_three',
              i18nKey: 'route.function_hide-child_three',
              icon: 'mdi-numeric-3-circle-outline'
            }
          },
          {
            name: 'function_hide-child_two',
            path: '/function/hide-child/two',
            component: () => import('@/views/function/hide-child/two/index.vue'),
            meta: {
              title: 'function_hide-child_two',
              i18nKey: 'route.function_hide-child_two',
              icon: 'mdi-numeric-2-circle-outline'
            }
          }
        ]
      },
      {
        name: 'function_multi-tab',
        path: '/function/multi-tab',
        component: () => import('@/views/function/multi-tab/index.vue'),
        meta: {
          title: 'function_multi-tab',
          i18nKey: 'route.function_multi-tab',
          icon: 'mdi-tab-plus'
        }
      },
      {
        name: 'function_request',
        path: '/function/request',
        component: () => import('@/views/function/request/index.vue'),
        meta: {
          title: 'function_request',
          i18nKey: 'route.function_request',
          icon: 'mdi-swap-horizontal'
        }
      },
      {
        name: 'function_super-page',
        path: '/function/super-page',
        component: () => import('@/views/function/super-page/index.vue'),
        meta: {
          title: 'function_super-page',
          i18nKey: 'route.function_super-page',
          icon: 'mdi-shield-account-outline'
        }
      },
      {
        name: 'function_tab',
        path: '/function/tab',
        component: () => import('@/views/function/tab/index.vue'),
        meta: {
          title: 'function_tab',
          i18nKey: 'route.function_tab',
          icon: 'mdi-tab'
        }
      },
      {
        name: 'function_toggle-auth',
        path: '/function/toggle-auth',
        component: () => import('@/views/function/toggle-auth/index.vue'),
        meta: {
          title: 'function_toggle-auth',
          i18nKey: 'route.function_toggle-auth',
          icon: 'mdi-account-switch-outline'
        }
      }
    ]
  },
  {
    name: 'home',
    path: '/home',
    component: () => import('@/views/home/index.vue'),
    meta: {
      title: 'home',
      i18nKey: 'route.home',
      icon: 'mdi-monitor-dashboard',
      order: 1
    }
  },
  {
    name: 'iframe-page',
    path: '/iframe-page/:url',
    component: () => import('@/views/_builtin/iframe-page/[url].vue'),
    props: true,
    meta: {
      title: 'iframe-page',
      i18nKey: 'route.iframe-page',
      constant: true,
      hideInMenu: true,
      keepAlive: true
    }
  },
  {
    name: 'manage',
    path: '/manage',
    meta: {
      title: 'manage',
      i18nKey: 'route.manage',
      icon: 'mdi-cog-outline'
    },
    children: [
      {
        name: 'manage_menu',
        path: '/manage/menu',
        component: () => import('@/views/manage/menu/index.vue'),
        meta: {
          title: 'manage_menu',
          i18nKey: 'route.manage_menu',
          icon: 'mdi-menu'
        }
      },
      {
        name: 'manage_role',
        path: '/manage/role',
        component: () => import('@/views/manage/role/index.vue'),
        meta: {
          title: 'manage_role',
          i18nKey: 'route.manage_role',
          icon: 'mdi-shield-account-outline'
        }
      },
      {
        name: 'manage_user',
        path: '/manage/user',
        component: () => import('@/views/manage/user/index.vue'),
        meta: {
          title: 'manage_user',
          i18nKey: 'route.manage_user',
          icon: 'mdi-account-multiple-outline'
        }
      },
      {
        name: 'manage_user-detail',
        path: '/manage/user-detail/:id',
        component: () => import('@/views/manage/user-detail/[id].vue'),
        meta: {
          title: 'manage_user-detail',
          i18nKey: 'route.manage_user-detail'
        }
      }
    ]
  },
  {
    name: 'multi-menu',
    path: '/multi-menu',
    meta: {
      title: 'multi-menu',
      i18nKey: 'route.multi-menu',
      icon: 'mdi-file-tree-outline'
    },
    children: [
      {
        name: 'multi-menu_first',
        path: '/multi-menu/first',
        meta: {
          title: 'multi-menu_first',
          i18nKey: 'route.multi-menu_first',
          icon: 'mdi-numeric-1-box-outline'
        },
        children: [
          {
            name: 'multi-menu_first_child',
            path: '/multi-menu/first/child',
            component: () => import('@/views/multi-menu/first_child/index.vue'),
            meta: {
              title: 'multi-menu_first_child',
              i18nKey: 'route.multi-menu_first_child',
              icon: 'mdi-file-document-outline'
            }
          }
        ]
      },
      {
        name: 'multi-menu_second',
        path: '/multi-menu/second',
        meta: {
          title: 'multi-menu_second',
          i18nKey: 'route.multi-menu_second',
          icon: 'mdi-numeric-2-box-outline'
        },
        children: [
          {
            name: 'multi-menu_second_child',
            path: '/multi-menu/second/child',
            meta: {
              title: 'multi-menu_second_child',
              i18nKey: 'route.multi-menu_second_child',
              icon: 'mdi-folder-outline'
            },
            children: [
              {
                name: 'multi-menu_second_child_home',
                path: '/multi-menu/second/child/home',
                component: () => import('@/views/multi-menu/second_child_home/index.vue'),
                meta: {
                  title: 'multi-menu_second_child_home',
                  i18nKey: 'route.multi-menu_second_child_home',
                  icon: 'mdi-home-outline'
                }
              }
            ]
          }
        ]
      }
    ]
  },
  {
    name: 'plugin',
    path: '/plugin',
    meta: {
      title: 'plugin',
      i18nKey: 'route.plugin',
      icon: 'mdi-puzzle-outline'
    },
    children: [
      {
        name: 'plugin_barcode',
        path: '/plugin/barcode',
        component: () => import('@/views/plugin/barcode/index.vue'),
        meta: {
          title: 'plugin_barcode',
          i18nKey: 'route.plugin_barcode',
          icon: 'mdi-barcode'
        }
      },
      {
        name: 'plugin_charts',
        path: '/plugin/charts',
        meta: {
          title: 'plugin_charts',
          i18nKey: 'route.plugin_charts',
          icon: 'mdi-chart-box-outline'
        },
        children: [
          {
            name: 'plugin_charts_antv',
            path: '/plugin/charts/antv',
            component: () => import('@/views/plugin/charts/antv/index.vue'),
            meta: {
              title: 'plugin_charts_antv',
              i18nKey: 'route.plugin_charts_antv',
              icon: 'mdi-chart-line'
            }
          },
          {
            name: 'plugin_charts_echarts',
            path: '/plugin/charts/echarts',
            component: () => import('@/views/plugin/charts/echarts/index.vue'),
            meta: {
              title: 'plugin_charts_echarts',
              i18nKey: 'route.plugin_charts_echarts',
              icon: 'mdi-chart-areaspline'
            }
          },
          {
            name: 'plugin_charts_vchart',
            path: '/plugin/charts/vchart',
            component: () => import('@/views/plugin/charts/vchart/index.vue'),
            meta: {
              title: 'plugin_charts_vchart',
              i18nKey: 'route.plugin_charts_vchart',
              icon: 'mdi-chart-donut'
            }
          }
        ]
      },
      {
        name: 'plugin_copy',
        path: '/plugin/copy',
        component: () => import('@/views/plugin/copy/index.vue'),
        meta: {
          title: 'plugin_copy',
          i18nKey: 'route.plugin_copy',
          icon: 'mdi-content-copy'
        }
      },
      {
        name: 'plugin_editor',
        path: '/plugin/editor',
        meta: {
          title: 'plugin_editor',
          i18nKey: 'route.plugin_editor',
          icon: 'mdi-pencil-outline'
        },
        children: [
          {
            name: 'plugin_editor_markdown',
            path: '/plugin/editor/markdown',
            component: () => import('@/views/plugin/editor/markdown/index.vue'),
            meta: {
              title: 'plugin_editor_markdown',
              i18nKey: 'route.plugin_editor_markdown',
              icon: 'mdi-language-markdown'
            }
          },
          {
            name: 'plugin_editor_quill',
            path: '/plugin/editor/quill',
            component: () => import('@/views/plugin/editor/quill/index.vue'),
            meta: {
              title: 'plugin_editor_quill',
              i18nKey: 'route.plugin_editor_quill',
              icon: 'mdi-text-box-edit-outline'
            }
          }
        ]
      },
      {
        name: 'plugin_excel',
        path: '/plugin/excel',
        component: () => import('@/views/plugin/excel/index.vue'),
        meta: {
          title: 'plugin_excel',
          i18nKey: 'route.plugin_excel',
          icon: 'mdi-file-excel-outline'
        }
      },
      {
        name: 'plugin_gantt',
        path: '/plugin/gantt',
        meta: {
          title: 'plugin_gantt',
          i18nKey: 'route.plugin_gantt',
          icon: 'mdi-chart-gantt'
        },
        children: [
          {
            name: 'plugin_gantt_dhtmlx',
            path: '/plugin/gantt/dhtmlx',
            component: () => import('@/views/plugin/gantt/dhtmlx/index.vue'),
            meta: {
              title: 'plugin_gantt_dhtmlx',
              i18nKey: 'route.plugin_gantt_dhtmlx',
              icon: 'mdi-chart-timeline-variant'
            }
          },
          {
            name: 'plugin_gantt_vtable',
            path: '/plugin/gantt/vtable',
            component: () => import('@/views/plugin/gantt/vtable/index.vue'),
            meta: {
              title: 'plugin_gantt_vtable',
              i18nKey: 'route.plugin_gantt_vtable',
              icon: 'mdi-table-large'
            }
          }
        ]
      },
      {
        name: 'plugin_icon',
        path: '/plugin/icon',
        component: () => import('@/views/plugin/icon/index.vue'),
        meta: {
          title: 'plugin_icon',
          i18nKey: 'route.plugin_icon',
          icon: 'mdi-shape-outline'
        }
      },
      {
        name: 'plugin_map',
        path: '/plugin/map',
        component: () => import('@/views/plugin/map/index.vue'),
        meta: {
          title: 'plugin_map',
          i18nKey: 'route.plugin_map',
          icon: 'mdi-map-outline'
        }
      },
      {
        name: 'plugin_pdf',
        path: '/plugin/pdf',
        component: () => import('@/views/plugin/pdf/index.vue'),
        meta: {
          title: 'plugin_pdf',
          i18nKey: 'route.plugin_pdf',
          icon: 'mdi-file-pdf-box'
        }
      },
      {
        name: 'plugin_pinyin',
        path: '/plugin/pinyin',
        component: () => import('@/views/plugin/pinyin/index.vue'),
        meta: {
          title: 'plugin_pinyin',
          i18nKey: 'route.plugin_pinyin',
          icon: 'mdi-translate'
        }
      },
      {
        name: 'plugin_print',
        path: '/plugin/print',
        component: () => import('@/views/plugin/print/index.vue'),
        meta: {
          title: 'plugin_print',
          i18nKey: 'route.plugin_print',
          icon: 'mdi-printer-outline'
        }
      },
      {
        name: 'plugin_swiper',
        path: '/plugin/swiper',
        component: () => import('@/views/plugin/swiper/index.vue'),
        meta: {
          title: 'plugin_swiper',
          i18nKey: 'route.plugin_swiper',
          icon: 'mdi-view-carousel-outline'
        }
      },
      {
        name: 'plugin_tables',
        path: '/plugin/tables',
        meta: {
          title: 'plugin_tables',
          i18nKey: 'route.plugin_tables',
          icon: 'mdi-table'
        },
        children: [
          {
            name: 'plugin_tables_vtable',
            path: '/plugin/tables/vtable',
            component: () => import('@/views/plugin/tables/vtable/index.vue'),
            meta: {
              title: 'plugin_tables_vtable',
              i18nKey: 'route.plugin_tables_vtable',
              icon: 'mdi-table-large'
            }
          }
        ]
      },
      {
        name: 'plugin_typeit',
        path: '/plugin/typeit',
        component: () => import('@/views/plugin/typeit/index.vue'),
        meta: {
          title: 'plugin_typeit',
          i18nKey: 'route.plugin_typeit',
          icon: 'mdi-keyboard-outline'
        }
      },
      {
        name: 'plugin_video',
        path: '/plugin/video',
        component: () => import('@/views/plugin/video/index.vue'),
        meta: {
          title: 'plugin_video',
          i18nKey: 'route.plugin_video',
          icon: 'mdi-play-circle-outline'
        }
      }
    ]
  },
  {
    name: 'user-center',
    path: '/user-center',
    component: () => import('@/views/user-center/index.vue'),
    meta: {
      title: 'user-center',
      i18nKey: 'route.user-center',
      icon: 'mdi-account-circle-outline'
    }
  }
];

/** Root layout route containing all authenticated pages. */
export const baseLayoutRoute: RouteRecordRaw = {
  name: 'root',
  path: '/',
  component: BaseLayout,
  // Keep in sync with VITE_ROUTE_HOME.
  redirect: '/home',
  meta: {
    title: 'root'
  },
  children: menuRoutes
};

/** All application routes. */
export const routes: RouteRecordRaw[] = [...constantRoutes, baseLayoutRoute];
