import { ref, toValue } from 'vue';
import type { ComputedRef, Ref } from 'vue';
import type { FormInst } from 'naive-ui';
import type { ValidationRule } from 'vuetify';
import { REG_CODE_SIX, REG_EMAIL, REG_PHONE, REG_PWD, REG_USER_NAME } from '@/constants/reg';
import { $t } from '@/locales';

export function useFormRules() {
  const patternRules = {
    userName: {
      pattern: REG_USER_NAME,
      message: $t('form.userName.invalid'),
      trigger: 'change'
    },
    phone: {
      pattern: REG_PHONE,
      message: $t('form.phone.invalid'),
      trigger: 'change'
    },
    pwd: {
      pattern: REG_PWD,
      message: $t('form.pwd.invalid'),
      trigger: 'change'
    },
    code: {
      pattern: REG_CODE_SIX,
      message: $t('form.code.invalid'),
      trigger: 'change'
    },
    email: {
      pattern: REG_EMAIL,
      message: $t('form.email.invalid'),
      trigger: 'change'
    }
  } satisfies Record<string, App.Global.FormRule>;

  const formRules = {
    userName: [createRequiredRule($t('form.userName.required')), patternRules.userName],
    phone: [createRequiredRule($t('form.phone.required')), patternRules.phone],
    pwd: [createRequiredRule($t('form.pwd.required')), patternRules.pwd],
    code: [createRequiredRule($t('form.code.required')), patternRules.code],
    email: [createRequiredRule($t('form.email.required')), patternRules.email]
  } satisfies Record<string, App.Global.FormRule[]>;

  /** the default required rule */
  const defaultRequiredRule = createRequiredRule($t('form.required'));

  function createRequiredRule(message: string): App.Global.FormRule {
    return {
      required: true,
      message
    };
  }

  /** create a rule for confirming the password */
  function createConfirmPwdRule(pwd: string | Ref<string> | ComputedRef<string>) {
    const confirmPwdRule: App.Global.FormRule[] = [
      { required: true, message: $t('form.confirmPwd.required') },
      {
        asyncValidator: (rule, value) => {
          if (value.trim() !== '' && value !== toValue(pwd)) {
            return Promise.reject(rule.message);
          }
          return Promise.resolve();
        },
        message: $t('form.confirmPwd.invalid'),
        trigger: 'input'
      }
    ];
    return confirmPwdRule;
  }

  return {
    patternRules,
    formRules,
    defaultRequiredRule,
    createRequiredRule,
    createConfirmPwdRule
  };
}

export function useNaiveForm() {
  const formRef = ref<FormInst | null>(null);

  async function validate() {
    await formRef.value?.validate();
  }

  async function restoreValidation() {
    formRef.value?.restoreValidation();
  }

  return {
    formRef,
    validate,
    restoreValidation
  };
}
interface VuetifyFormInstance {
  validate: () => Promise<{ valid: boolean; errors: unknown[] }>;
  resetValidation: () => void;
}

/** Vuetify form ref/validation adapter, mirroring the Naive helper API. */
export function useVuetifyForm() {
  const formRef = ref<VuetifyFormInstance | null>(null);

  async function validate() {
    const result = await formRef.value?.validate();
    return result?.valid ?? false;
  }

  function restoreValidation() {
    formRef.value?.resetValidation();
  }

  return {
    formRef,
    validate,
    restoreValidation
  };
}

/** Vuetify-native validation rules for the login forms. */
export function useVuetifyFormRules() {
  function required(message: string): ValidationRule {
    return value => (value !== null && value !== undefined && String(value).trim() !== '') || message;
  }

  function pattern(regexp: RegExp, message: string): ValidationRule {
    return value => !value || regexp.test(String(value)) || message;
  }

  const formRules = {
    userName: [required($t('form.userName.required')), pattern(REG_USER_NAME, $t('form.userName.invalid'))],
    phone: [required($t('form.phone.required')), pattern(REG_PHONE, $t('form.phone.invalid'))],
    pwd: [required($t('form.pwd.required')), pattern(REG_PWD, $t('form.pwd.invalid'))],
    code: [required($t('form.code.required')), pattern(REG_CODE_SIX, $t('form.code.invalid'))]
  } satisfies Record<string, ValidationRule[]>;

  function createConfirmPwdRule(pwd: string | Ref<string> | ComputedRef<string>): ValidationRule[] {
    return [
      required($t('form.confirmPwd.required')),
      value => !value || value === toValue(pwd) || $t('form.confirmPwd.invalid')
    ];
  }

  return {
    formRules,
    createConfirmPwdRule
  };
}
