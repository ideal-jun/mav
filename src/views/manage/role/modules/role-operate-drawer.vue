<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { ValidationRule } from 'vuetify';
import { useBoolean } from '@sa/hooks';
import { jsonClone } from '@sa/utils';
import { enableStatusOptions } from '@/constants/business';
import { $t } from '@/locales';
import { useVuetifyForm } from '@/hooks/common/form';
import type { TableOperateType } from '@/hooks/common/table';
import ButtonAuthModal from './button-auth-modal.vue';
import MenuAuthModal from './menu-auth-modal.vue';

defineOptions({
  name: 'RoleOperateDrawer'
});

interface Props {
  /** the type of operation */
  operateType: TableOperateType;
  /** the edit row data */
  rowData?: Api.SystemManage.Role | null;
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
const { bool: menuAuthVisible, setTrue: openMenuAuthModal } = useBoolean();
const { bool: buttonAuthVisible, setTrue: openButtonAuthModal } = useBoolean();

function createRequiredRule(message: string): ValidationRule {
  return value => (value !== null && value !== undefined && String(value).trim() !== '') || message;
}

const title = computed(() => {
  const titles: Record<TableOperateType, string> = {
    add: $t('page.manage.role.addRole'),
    edit: $t('page.manage.role.editRole')
  };
  return titles[props.operateType];
});

type Model = Pick<Api.SystemManage.Role, 'roleName' | 'roleCode' | 'roleDesc' | 'status'>;

const model = ref(createDefaultModel());

function createDefaultModel(): Model {
  return {
    roleName: '',
    roleCode: '',
    roleDesc: '',
    status: null
  };
}

type RuleKey = Exclude<keyof Model, 'roleDesc'>;

const rules: Record<RuleKey, ValidationRule[]> = {
  roleName: [createRequiredRule($t('form.required'))],
  roleCode: [createRequiredRule($t('form.required'))],
  status: [createRequiredRule($t('form.required'))]
};

const roleId = computed(() => props.rowData?.id || -1);

const isEdit = computed(() => props.operateType === 'edit');

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
              v-model="model.roleName"
              :label="$t('page.manage.role.roleName')"
              :placeholder="$t('page.manage.role.form.roleName')"
              :rules="rules.roleName"
              class="mb-2"
            />
            <VTextField
              v-model="model.roleCode"
              :label="$t('page.manage.role.roleCode')"
              :placeholder="$t('page.manage.role.form.roleCode')"
              :rules="rules.roleCode"
              class="mb-2"
            />
            <VRadioGroup
              v-model="model.status"
              :label="$t('page.manage.role.roleStatus')"
              :rules="rules.status"
              inline
              class="mb-2"
            >
              <VRadio
                v-for="item in enableStatusOptions"
                :key="item.value"
                :value="item.value"
                :label="$t(item.label)"
              />
            </VRadioGroup>
            <VTextField
              v-model="model.roleDesc"
              :label="$t('page.manage.role.roleDesc')"
              :placeholder="$t('page.manage.role.form.roleDesc')"
            />
          </VForm>
          <div v-if="isEdit" class="mt-4 flex flex-wrap gap-2">
            <VBtn variant="outlined" @click="openMenuAuthModal">{{ $t('page.manage.role.menuAuth') }}</VBtn>
            <MenuAuthModal v-model:visible="menuAuthVisible" :role-id="roleId" />
            <VBtn variant="outlined" @click="openButtonAuthModal">{{ $t('page.manage.role.buttonAuth') }}</VBtn>
            <ButtonAuthModal v-model:visible="buttonAuthVisible" :role-id="roleId" />
          </div>
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
