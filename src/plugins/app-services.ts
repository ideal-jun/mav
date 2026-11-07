import { reactive } from 'vue';
import type { VNode } from 'vue';

/** App-level UI service types (Vuetify based global providers). */
export type AppServiceType = 'success' | 'error' | 'warning' | 'info';

export interface MessageOptions {
  duration?: number;
  onLeave?: () => void;
}

export interface MessageItem {
  id: number;
  type: AppServiceType;
  content: string;
  duration: number;
  onLeave?: () => void;
}

export interface DialogOptions {
  title?: string;
  content?: string;
  positiveText?: string;
  negativeText?: string;
  maskClosable?: boolean;
  closeOnEsc?: boolean;
  onPositiveClick?: () => void | Promise<void>;
  onNegativeClick?: () => void;
  onClose?: () => void;
}

export interface DialogState {
  open: boolean;
  type: AppServiceType;
  options: DialogOptions;
}

export interface NotificationOptions {
  title?: string;
  content?: string;
  duration?: number;
  action?: () => VNode;
  onClose?: () => void;
}

export interface NotificationItem {
  id: number;
  type: AppServiceType;
  duration: number;
  options: NotificationOptions;
}

export interface LoadingBarState {
  active: boolean;
  error: boolean;
}

const state = reactive({
  messages: [] as MessageItem[],
  notifications: [] as NotificationItem[],
  dialog: { open: false, type: 'error', options: {} } as DialogState,
  loadingBar: { active: false, error: false } as LoadingBarState
});

let seed = 0;

const timers = new Map<string, ReturnType<typeof setTimeout>>();

function nextId() {
  seed += 1;

  return seed;
}

function setTimer(key: string, fn: () => void, delay: number) {
  clearTimer(key);
  timers.set(key, setTimeout(fn, delay));
}

function clearTimer(key: string) {
  const timer = timers.get(key);

  if (timer) {
    clearTimeout(timer);
    timers.delete(key);
  }
}

/** Remove and clean up a message */
export function removeMessage(id: number, triggerOnLeave = true) {
  const index = state.messages.findIndex(item => item.id === id);

  if (index === -1) {
    return;
  }

  clearTimer(`message-${id}`);

  const [item] = state.messages.splice(index, 1);

  if (triggerOnLeave) {
    item.onLeave?.();
  }
}

function pushMessage(type: AppServiceType, content: string, options: MessageOptions = {}) {
  if (!content) {
    return;
  }

  const id = nextId();
  const duration = options.duration ?? 3000;

  state.messages.push({ id, type, content, duration, onLeave: options.onLeave });

  // Keep the toast stack short.
  while (state.messages.length > 5) {
    removeMessage(state.messages[0].id, false);
  }

  if (duration > 0) {
    setTimer(`message-${id}`, () => removeMessage(id), duration);
  }
}

function clearMessages() {
  state.messages.forEach(item => clearTimer(`message-${item.id}`));
  state.messages.splice(0, state.messages.length);
}

let dialogResolver: ((value: boolean) => void) | null = null;

function openDialog(type: AppServiceType, options: DialogOptions = {}) {
  // A new dialog closes the previous one without resolving it twice.
  finishDialog(false);

  state.dialog.open = true;
  state.dialog.type = type;
  state.dialog.options = options;

  return new Promise<boolean>(resolve => {
    dialogResolver = resolve;
  });
}

/** Close the current dialog and resolve its promise. */
export function finishDialog(positive: boolean) {
  if (!state.dialog.open) {
    return;
  }

  const { options } = state.dialog;

  state.dialog.open = false;

  const resolver = dialogResolver;
  dialogResolver = null;

  if (positive) {
    options.onPositiveClick?.();
  } else {
    options.onNegativeClick?.();
  }

  options.onClose?.();

  resolver?.(positive);

  // Clear the options after the closing transition starts.
  setTimeout(() => {
    if (!state.dialog.open) {
      state.dialog.options = {};
      state.dialog.type = 'error';
    }
  }, 300);
}

export function removeNotification(id: number, triggerOnClose = true) {
  const index = state.notifications.findIndex(item => item.id === id);

  if (index === -1) {
    return;
  }

  clearTimer(`notification-${id}`);

  const [item] = state.notifications.splice(index, 1);

  if (triggerOnClose) {
    item.options.onClose?.();
  }
}

function pushNotification(options: NotificationOptions = {}, type: AppServiceType = 'info') {
  const id = nextId();
  const duration = options.duration ?? 4500;

  state.notifications.push({ id, type, duration, options });

  if (duration > 0) {
    setTimer(`notification-${id}`, () => removeNotification(id), duration);
  }

  return {
    destroy: () => removeNotification(id)
  };
}

function clearNotifications() {
  state.notifications.forEach(item => clearTimer(`notification-${item.id}`));
  state.notifications.splice(0, state.notifications.length);
}

/** App UI state consumed by AppProvider */
export const appServiceState = state;

export const messageApi = {
  success: (content: string, options?: MessageOptions) => pushMessage('success', content, options),
  error: (content: string, options?: MessageOptions) => pushMessage('error', content, options),
  warning: (content: string, options?: MessageOptions) => pushMessage('warning', content, options),
  info: (content: string, options?: MessageOptions) => pushMessage('info', content, options),
  destroyAll: clearMessages
};

export const dialogApi = {
  error: (options?: DialogOptions) => openDialog('error', options),
  warning: (options?: DialogOptions) => openDialog('warning', options),
  info: (options?: DialogOptions) => openDialog('info', options),
  success: (options?: DialogOptions) => openDialog('success', options),
  destroyAll: () => finishDialog(false)
};

export const notificationApi = {
  create: (options?: NotificationOptions) => pushNotification(options),
  success: (options?: NotificationOptions) => pushNotification(options, 'success'),
  error: (options?: NotificationOptions) => pushNotification(options, 'error'),
  warning: (options?: NotificationOptions) => pushNotification(options, 'warning'),
  info: (options?: NotificationOptions) => pushNotification(options, 'info'),
  destroyAll: clearNotifications
};

export const loadingBarApi = {
  start() {
    state.loadingBar.active = true;
    state.loadingBar.error = false;
  },
  finish() {
    state.loadingBar.active = false;
  },
  error() {
    state.loadingBar.error = true;
    setTimeout(() => {
      state.loadingBar.active = false;
    }, 600);
  }
};

/** Register the Vuetify based services on window before the app is mounted. */
export function setupAppServices() {
  if (typeof window === 'undefined') {
    return;
  }

  window.$message = messageApi;
  window.$dialog = dialogApi;
  window.$notification = notificationApi;
  window.$loadingBar = loadingBarApi;
}
