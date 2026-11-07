import { ref, toValue } from 'vue';
import type { ComputedRef, Ref } from 'vue';
import type { ValidationRule } from 'vuetify';
import { REG_CODE_SIX, REG_PHONE, REG_PWD, REG_USER_NAME } from '@/constants/reg';
import { $t } from '@/locales';

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
