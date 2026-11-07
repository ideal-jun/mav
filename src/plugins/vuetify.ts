import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { createVuetify } from 'vuetify';
import { createVueI18nAdapter } from 'vuetify/locale/adapters/vue-i18n';

import { forVuetify } from '../theme/breakpoints';
import i18n from '@/locales';

import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';

const vuetifyI18nAdapter = createVueI18nAdapter({ i18n, useI18n });

/**
 * Vuetify's vue-i18n adapter infers the numeric group separator with
 * `n(10000, { part: true }).find(...)`. With vue-i18n 11 that call returns a
 * string, so the inference throws the first time a component (VNumberInput)
 * reads it. Provide the separators explicitly instead.
 */
const localeAdapter = {
  ...vuetifyI18nAdapter,
  decimalSeparator: computed(() => '.'),
  numericGroupSeparator: computed(() => ',')
};

export default createVuetify({
  locale: {
    adapter: localeAdapter,
    fallback: 'en'
  },
  defaults: {
    VCard: {
      elevation: 1
    },
    VSheet: {
      elevation: 1
    },
    VTextField: {
      color: 'primary',
      density: 'compact',
      variant: 'outlined'
    },
    VCheckbox: {
      color: 'primary',
      density: 'compact',
      variant: 'outlined'
    },

    VCheckboxBtn: {
      color: 'primary',
      density: 'compact',
      variant: 'outlined'
    },
    VRadio: {
      color: 'primary',
      density: 'compact',
      variant: 'outlined'
    },
    VSelect: {
      color: 'primary',
      density: 'compact',
      variant: 'outlined'
    },
    VSwitch: {
      color: 'primary',
      density: 'compact'
    }
  },
  theme: {
    defaultTheme: 'system',
    themes: {
      light: {
        colors: {
          background: '#f5f9fb'
        },
        variables: {
          'high-emphasis-opacity': 0.82,
          'medium-emphasis-opacity': 0.6
        }
      },
      dark: {
        variables: {
          'high-emphasis-opacity': 0.82,
          'medium-emphasis-opacity': 0.6
        }
      }
    }
  },
  display: {
    mobileBreakpoint: 'md',
    thresholds: forVuetify
  }
});
