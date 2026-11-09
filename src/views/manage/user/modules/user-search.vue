<script setup lang="ts">
import { computed, toRaw } from 'vue';
import type { ValidationRule } from 'vuetify';
import { jsonClone } from '@sa/utils';
import { enableStatusOptions, userGenderOptions } from '@/constants/business';
import { REG_EMAIL, REG_PHONE } from '@/constants/reg';
import { translateOptions } from '@/utils/common';
import { $t } from '@/locales';
import { useVuetifyForm } from '@/hooks/common/form';

defineOptions({
  name: 'UserSearch'
});

interface Emits {
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const { formRef, validate, restoreValidation } = useVuetifyForm();

const model = defineModel<Api.SystemManage.UserSearchParams>('model', { required: true });

type RuleKey = Extract<keyof Api.SystemManage.UserSearchParams, 'userEmail' | 'userPhone'>;

function createPatternRule(regexp: RegExp, message: string): ValidationRule {
  return value => !value || regexp.test(String(value)) || message;
}

const rules = computed<Record<RuleKey, ValidationRule[]>>(() => {
  return {
    userEmail: [createPatternRule(REG_EMAIL, $t('form.email.invalid'))],
    userPhone: [createPatternRule(REG_PHONE, $t('form.phone.invalid'))]
  };
});

const userGenderItems = computed(() =>
  translateOptions(userGenderOptions).map(item => ({ title: item.label, value: item.value }))
);

const enableStatusItems = computed(() =>
  translateOptions(enableStatusOptions).map(item => ({ title: item.label, value: item.value }))
);

const defaultModel = jsonClone(toRaw(model.value));

function resetModel() {
  Object.assign(model.value, defaultModel);
}

async function reset() {
  await restoreValidation();
  resetModel();
}

async function search() {
  if (!(await validate())) return;

  emit('search');
}
</script>

<template>
  <VCard class="card-wrapper">
    <VExpansionPanels variant="accordion">
      <VExpansionPanel :title="$t('common.search')">
        <VExpansionPanelText>
          <VForm ref="formRef" @submit.prevent="search">
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
              <VTextField
                v-model="model.userName"
                :label="$t('page.manage.user.userName')"
                :placeholder="$t('page.manage.user.form.userName')"
                density="compact"
                hide-details="auto"
              />
              <VSelect
                v-model="model.userGender"
                :label="$t('page.manage.user.userGender')"
                :placeholder="$t('page.manage.user.form.userGender')"
                :items="userGenderItems"
                clearable
                density="compact"
                hide-details="auto"
              />
              <VTextField
                v-model="model.nickName"
                :label="$t('page.manage.user.nickName')"
                :placeholder="$t('page.manage.user.form.nickName')"
                density="compact"
                hide-details="auto"
              />
              <VTextField
                v-model="model.userPhone"
                :label="$t('page.manage.user.userPhone')"
                :placeholder="$t('page.manage.user.form.userPhone')"
                :rules="rules.userPhone"
                density="compact"
                hide-details="auto"
              />
              <VTextField
                v-model="model.userEmail"
                :label="$t('page.manage.user.userEmail')"
                :placeholder="$t('page.manage.user.form.userEmail')"
                :rules="rules.userEmail"
                density="compact"
                hide-details="auto"
              />
              <VSelect
                v-model="model.status"
                :label="$t('page.manage.user.userStatus')"
                :placeholder="$t('page.manage.user.form.userStatus')"
                :items="enableStatusItems"
                clearable
                density="compact"
                hide-details="auto"
              />
            </div>
            <div class="flex justify-end gap-2 pt-3">
              <VBtn variant="text" prepend-icon="mdi-refresh" @click="reset">{{ $t('common.reset') }}</VBtn>
              <VBtn color="primary" variant="outlined" prepend-icon="mdi-magnify" @click="search">
                {{ $t('common.search') }}
              </VBtn>
            </div>
          </VForm>
        </VExpansionPanelText>
      </VExpansionPanel>
    </VExpansionPanels>
  </VCard>
</template>

<style scoped></style>
