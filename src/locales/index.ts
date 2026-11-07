import type { App } from 'vue';
import { createI18n } from 'vue-i18n';
import { en, zhHans } from 'vuetify/locale';
import { localStg } from '@/utils/storage';
import messages from './locale';

// Widen the locale to string so vue-i18n's composer stays compatible with Vuetify's adapter.
const initialLocale: string = localStg.get('lang') || 'zh-CN';

const i18n = createI18n({
  locale: initialLocale,
  fallbackLocale: 'en-US',
  messages,
  legacy: false
});

// Vuetify components read their own messages from the `$vuetify` namespace.
i18n.global.mergeLocaleMessage('zh-CN', { $vuetify: zhHans });
i18n.global.mergeLocaleMessage('en-US', { $vuetify: en });

/**
 * Setup plugin i18n
 *
 * @param app
 */
export function setupI18n(app: App) {
  app.use(i18n);
}

export const $t = i18n.global.t as App.I18n.$T;

/** whether the key exists in the current locale messages (data-driven keys may not) */
export function hasI18nKey(key: string) {
  return i18n.global.te(key);
}

export function setLocale(locale: App.I18n.LangType) {
  i18n.global.locale.value = locale;

  document?.querySelector('html')?.setAttribute('lang', locale);
}

export function getLocale(): App.I18n.LangType {
  return i18n.global.locale.value as App.I18n.LangType;
}

export default i18n;
