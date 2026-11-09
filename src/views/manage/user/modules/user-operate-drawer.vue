<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { ValidationRule } from 'vuetify';
import { jsonClone } from '@sa/utils';
import { enableStatusOptions, userGenderOptions } from '@/constants/business';
import { fetchGetAllRoles } from '@/service/api';
import { $t } from '@/locales';
import { useVuetifyForm } from '@/hooks/common/form';
import type { TableOperateType } from '@/hooks/common/table';

defineOptions({
  name: 'UserOperateDrawer'
});

interface Props {
  /** the type of operation */
  operateType: TableOperateType;
  /** the edit row data */
  rowData?: Api.SystemManage.User | null;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useVuetifyForm();

function createRequiredRule(message: string): ValidationRule {
  return value => (value !== null && value !== undefined && String(value).trim() !== '') || message;
}

const title = computed(() => {
  const titles: Record<TableOperateType, string> = {
    add: $t('page.manage.user.addUser'),
    edit: $t('page.manage.user.editUser')
  };
  return titles[props.operateType];
});

type Model = Pick<
  Api.SystemManage.User,
  'userName' | 'userGender' | 'nickName' | 'userPhone' | 'userEmail' | 'userRoles' | 'status'
>;

const model = ref(createDefaultModel());

function createDefaultModel(): Model {
  return {
    userName: '',
    userGender: null,
    nickName: '',
    userPhone: '',
    userEmail: '',
    userRoles: [],
    status: null
  };
}

type RuleKey = Extract<keyof Model, 'userName' | 'status'>;

const rules: Record<RuleKey, ValidationRule[]> = {
  userName: [createRequiredRule($t('form.required'))],
  status: [createRequiredRule($t('form.required'))]
};

/** the enabled role options */
const roleOptions = ref<{ title: string; value: string }[]>([]);

async function getRoleOptions() {
  const { error, data } = await fetchGetAllRoles();

  if (!error) {
    const options = data.map(item => ({
      title: item.roleName,
      value: item.roleCode
    }));

    // the mock data does not have the roleCode, so fill it
    // if the real request, remove the following code
    const userRoleOptions = model.value.userRoles.map(item => ({
      title: item,
      value: item
    }));
    // end

    roleOptions.value = [...userRoleOptions, ...options];
  }
}

function handleInitModel() {
  model.value = createDefaultModel();

  if (props.operateType === 'edit' && props.rowData) {
    Object.assign(model.value, jsonClone(props.rowData));
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  if (!(await validate())) return;

  // request
  window.$message?.success($t('common.updateSuccess'));
  closeDrawer();
  emit('submitted');
}

watch(visible, () => {
  if (visible.value) {
    handleInitModel();
    restoreValidation();
    getRoleOptions();
  }
});
</script>

<template>
  <Teleport to="body">
    <VNavigationDrawer v-model="visible" temporary location="right" :width="360" order="-1">
      <div class="flex h-full flex-col">
        <div class="flex items-center justify-between px-4 py-3">
          <h2 class="text-lg font-medium">{{ title }}</h2>
          <VBtn icon="mdi-close" variant="text" density="comfortable" @click="closeDrawer" />
        </div>
        <VDivider />
        <div class="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <VForm ref="formRef" validate-on="input">
            <VTextField
              v-model="model.userName"
              :label="$t('page.manage.user.userName')"
              :placeholder="$t('page.manage.user.form.userName')"
              :rules="rules.userName"
              class="mb-2"
            />
            <VRadioGroup v-model="model.userGender" :label="$t('page.manage.user.userGender')" inline class="mb-2">
              <VRadio v-for="item in userGenderOptions" :key="item.value" :value="item.value" :label="$t(item.label)" />
            </VRadioGroup>
            <VTextField
              v-model="model.nickName"
              :label="$t('page.manage.user.nickName')"
              :placeholder="$t('page.manage.user.form.nickName')"
              class="mb-2"
            />
            <VTextField
              v-model="model.userPhone"
              :label="$t('page.manage.user.userPhone')"
              :placeholder="$t('page.manage.user.form.userPhone')"
              class="mb-2"
            />
            <VTextField
              v-model="model.userEmail"
              :label="$t('page.manage.user.userEmail')"
              :placeholder="$t('page.manage.user.form.userEmail')"
              class="mb-2"
            />
            <VRadioGroup v-model="model.status" :label="$t('page.manage.user.userStatus')" inline class="mb-2">
              <VRadio
                v-for="item in enableStatusOptions"
                :key="item.value"
                :value="item.value"
                :label="$t(item.label)"
              />
            </VRadioGroup>
            <VSelect
              v-model="model.userRoles"
              :label="$t('page.manage.user.userRole')"
              :placeholder="$t('page.manage.user.form.userRole')"
              :items="roleOptions"
              multiple
              chips
              closable-chips
            />
          </VForm>
        </div>
        <VDivider />
        <div class="flex justify-end gap-4 px-4 py-3">
          <VBtn variant="text" @click="closeDrawer">{{ $t('common.cancel') }}</VBtn>
          <VBtn color="primary" variant="flat" @click="handleSubmit">{{ $t('common.confirm') }}</VBtn>
        </div>
      </div>
    </VNavigationDrawer>
  </Teleport>
</template>

<style scoped></style>
