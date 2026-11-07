export {};

declare global {
  export interface Window {
    /** NProgress instance */
    NProgress?: import('nprogress').NProgress;
    /** Loading bar instance (Vuetify based) */
    $loadingBar?: typeof import('@/plugins/app-services').loadingBarApi;
    /** Dialog instance (Vuetify based) */
    $dialog?: typeof import('@/plugins/app-services').dialogApi;
    /** Message instance (Vuetify based) */
    $message?: typeof import('@/plugins/app-services').messageApi;
    /** Notification instance (Vuetify based) */
    $notification?: typeof import('@/plugins/app-services').notificationApi;
  }

  /** Build time of the project */
  export const BUILD_TIME: string;
}
