<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { ValidationRule } from 'vuetify';
import { enableStatusOptions, menuIconTypeOptions, menuTypeOptions } from '@/constants/business';
import { mdiIcons } from '@/constants/icon';
import { getLocalIcons } from '@/utils/icon';
import { fetchGetAllRoles } from '@/service/api';
import { $t } from '@/locales';
import { useVuetifyForm } from '@/hooks/common/form';
import type { TableOperateType } from '@/hooks/common/table';
import {
  getLayoutAndPage,
  getPathParamFromRoutePath,
  getRoutePathByRouteName,
  getRoutePathWithParam,
  transformLayoutAndPageToComponent
} from './shared';

defineOptions({
  name: 'MenuOperateModal'
});

export type OperateType = TableOperateType | 'addChild';

interface Props {
  /** the type of operation */
  operateType: OperateType;
  /** the edit menu data or the parent menu data when adding a child menu */
  rowData?: Api.SystemManage.Menu | null;
  /** all pages */
  allPages: string[];
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
  const titles: Record<OperateType, string> = {
    add: $t('page.manage.menu.addMenu'),
    addChild: $t('page.manage.menu.addChildMenu'),
    edit: $t('page.manage.menu.editMenu')
  };
  return titles[props.operateType];
});

type Model = Pick<
  Api.SystemManage.Menu,
  | 'menuType'
  | 'menuName'
  | 'routeName'
  | 'routePath'
  | 'component'
  | 'order'
  | 'i18nKey'
  | 'icon'
  | 'iconType'
  | 'status'
  | 'parentId'
  | 'keepAlive'
  | 'constant'
  | 'href'
  | 'hideInMenu'
  | 'activeMenu'
  | 'multiTab'
  | 'fixedIndexInTab'
> & {
  query: NonNullable<Api.SystemManage.Menu['query']>;
  buttons: NonNullable<Api.SystemManage.Menu['buttons']>;
  layout: string;
  page: string;
  pathParam: string;
};

const model = ref(createDefaultModel());

function createDefaultModel(): Model {
  return {
    menuType: '1',
    menuName: '',
    routeName: '',
    routePath: '',
    pathParam: '',
    component: '',
    layout: '',
    page: '',
    i18nKey: null,
    icon: '',
    iconType: '1',
    parentId: 0,
    status: '1',
    keepAlive: false,
    constant: false,
    order: 0,
    href: null,
    hideInMenu: false,
    activeMenu: null,
    multiTab: false,
    fixedIndexInTab: null,
    query: [],
    buttons: []
  };
}

type RuleKey = Extract<keyof Model, 'menuName' | 'status' | 'routeName' | 'routePath'>;

const rules: Record<RuleKey, ValidationRule[]> = {
  menuName: [createRequiredRule($t('form.required'))],
  status: [createRequiredRule($t('form.required'))],
  routeName: [createRequiredRule($t('form.required'))],
  routePath: [createRequiredRule($t('form.required'))]
};

const disabledMenuType = computed(() => props.operateType === 'edit');

const localIcons = getLocalIcons();

const localIconItems = localIcons.map(item => ({
  title: item,
  value: item
}));

const mdiIconItems = computed(() => mdiIcons.map(icon => ({ title: icon, value: icon })));

const menuIconTypeItems = computed(() =>
  menuIconTypeOptions.map(item => ({ title: $t(item.label), value: item.value }))
);

const showLayout = computed(() => model.value.parentId === 0);

const showPage = computed(() => model.value.menuType === '2');

const pageOptions = computed(() => {
  const allPages = [...props.allPages];

  if (model.value.routeName && !allPages.includes(model.value.routeName)) {
    allPages.unshift(model.value.routeName);
  }

  return allPages.map(page => ({
    title: page,
    value: page
  }));
});

const layoutOptions: { title: string; value: string }[] = [
  {
    title: 'base',
    value: 'base'
  },
  {
    title: 'blank',
    value: 'blank'
  }
];

const menuTypeItems = computed(() => menuTypeOptions.map(item => ({ title: $t(item.label), value: item.value })));

const enableStatusItems = computed(() =>
  enableStatusOptions.map(item => ({ title: $t(item.label), value: item.value }))
);

/** the enabled role options */
const roleOptions = ref<{ title: string; value: string }[]>([]);

async function getRoleOptions() {
  const { error, data } = await fetchGetAllRoles();

  if (!error) {
    const options = data.map(item => ({
      title: item.roleName,
      value: item.roleCode
    }));

    roleOptions.value = [...options];
  }
}

function handleInitModel() {
  model.value = createDefaultModel();

  if (!props.rowData) return;

  if (props.operateType === 'addChild') {
    const { id } = props.rowData;

    Object.assign(model.value, { parentId: id });
  }

  if (props.operateType === 'edit') {
    const { component, ...rest } = props.rowData;

    const { layout, page } = getLayoutAndPage(component);
    const { path, param } = getPathParamFromRoutePath(rest.routePath);

    Object.assign(model.value, rest, { layout, page, routePath: path, pathParam: param });
  }

  if (!model.value.query) {
    model.value.query = [];
  }
  if (!model.value.buttons) {
    model.value.buttons = [];
  }
}

function closeDrawer() {
  visible.value = false;
}

function handleUpdateRoutePathByRouteName() {
  if (model.value.routeName) {
    model.value.routePath = getRoutePathByRouteName(model.value.routeName);
  } else {
    model.value.routePath = '';
  }
}

function handleUpdateI18nKeyByRouteName() {
  if (model.value.routeName) {
    model.value.i18nKey = `route.${model.value.routeName}` as App.I18n.I18nKey;
  } else {
    model.value.i18nKey = null;
  }
}

function handleCreateButton(): Api.SystemManage.MenuButton {
  return {
    code: '',
    desc: ''
  };
}

function addQueryItem(index?: number) {
  const insertIndex = index === undefined ? model.value.query.length : index + 1;

  model.value.query.splice(insertIndex, 0, { key: '', value: '' });
}

function removeQueryItem(index: number) {
  model.value.query.splice(index, 1);
}

function addButtonItem(index?: number) {
  const insertIndex = index === undefined ? model.value.buttons.length : index + 1;

  model.value.buttons.splice(insertIndex, 0, handleCreateButton());
}

function removeButtonItem(index: number) {
  model.value.buttons.splice(index, 1);
}

function getSubmitParams() {
  const { layout, page, pathParam, ...params } = model.value;

  const component = transformLayoutAndPageToComponent(layout, page);
  const routePath = getRoutePathWithParam(model.value.routePath, pathParam);

  params.component = component;
  params.routePath = routePath;

  return params;
}

async function handleSubmit() {
  if (!(await validate())) return;

  const params = getSubmitParams();

  console.log('params: ', params);

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

watch(
  () => model.value.routeName,
  () => {
    handleUpdateRoutePathByRouteName();
    handleUpdateI18nKeyByRouteName();
  }
);
</script>

<template>
  <VDialog v-model="visible" max-width="800" scrollable>
    <VCard>
      <VCardTitle>{{ title }}</VCardTitle>
      <VCardText>
        <VForm ref="formRef" validate-on="input">
          <VRow>
            <VCol cols="12" md="6">
              <VRadioGroup
                v-model="model.menuType"
                :label="$t('page.manage.menu.menuType')"
                :disabled="disabledMenuType"
                inline
              >
                <VRadio v-for="item in menuTypeItems" :key="item.value" :value="item.value" :label="item.title" />
              </VRadioGroup>
            </VCol>
            <VCol cols="12" md="6">
              <VTextField
                v-model="model.menuName"
                :label="$t('page.manage.menu.menuName')"
                :placeholder="$t('page.manage.menu.form.menuName')"
                :rules="rules.menuName"
              />
            </VCol>
            <VCol cols="12" md="6">
              <VTextField
                v-model="model.routeName"
                :label="$t('page.manage.menu.routeName')"
                :placeholder="$t('page.manage.menu.form.routeName')"
                :rules="rules.routeName"
              />
            </VCol>
            <VCol cols="12" md="6">
              <VTextField
                v-model="model.routePath"
                :label="$t('page.manage.menu.routePath')"
                :placeholder="$t('page.manage.menu.form.routePath')"
                disabled
                :rules="rules.routePath"
              />
            </VCol>
            <VCol cols="12" md="6">
              <VTextField
                v-model="model.pathParam"
                :label="$t('page.manage.menu.pathParam')"
                :placeholder="$t('page.manage.menu.form.pathParam')"
              />
            </VCol>
            <VCol v-if="showLayout" cols="12" md="6">
              <VSelect
                v-model="model.layout"
                :label="$t('page.manage.menu.layout')"
                :placeholder="$t('page.manage.menu.form.layout')"
                :items="layoutOptions"
              />
            </VCol>
            <VCol v-if="showPage" cols="12" md="6">
              <VSelect
                v-model="model.page"
                :label="$t('page.manage.menu.page')"
                :placeholder="$t('page.manage.menu.form.page')"
                :items="pageOptions"
              />
            </VCol>
            <VCol cols="12" md="6">
              <VTextField
                v-model="model.i18nKey"
                :label="$t('page.manage.menu.i18nKey')"
                :placeholder="$t('page.manage.menu.form.i18nKey')"
              />
            </VCol>
            <VCol cols="12" md="6">
              <VNumberInput
                v-model="model.order"
                :label="$t('page.manage.menu.order')"
                :placeholder="$t('page.manage.menu.form.order')"
                class="w-full"
              />
            </VCol>
            <VCol cols="12" md="6">
              <VRadioGroup v-model="model.iconType" :label="$t('page.manage.menu.iconTypeTitle')" inline>
                <VRadio v-for="item in menuIconTypeItems" :key="item.value" :value="item.value" :label="item.title" />
              </VRadioGroup>
            </VCol>
            <VCol cols="12" md="6">
              <VSelect
                v-if="model.iconType === '1'"
                v-model="model.icon"
                :label="$t('page.manage.menu.icon')"
                :placeholder="$t('page.manage.menu.form.icon')"
                :items="mdiIconItems"
                clearable
              >
                <template #item="{ props: itemProps, item }">
                  <VListItem v-bind="itemProps">
                    <template #prepend>
                      <VIcon :icon="item.value" size="20" />
                    </template>
                    <template #title>{{ item.title }}</template>
                  </VListItem>
                </template>
                <template #selection="{ item }">
                  <div class="flex items-center gap-2">
                    <VIcon :icon="item.value" size="20" />
                    <span>{{ item.title }}</span>
                  </div>
                </template>
              </VSelect>
              <VSelect
                v-else
                v-model="model.icon"
                :label="$t('page.manage.menu.icon')"
                :placeholder="$t('page.manage.menu.form.localIcon')"
                :items="localIconItems"
                clearable
              >
                <template #item="{ props: itemProps, item }">
                  <VListItem v-bind="itemProps">
                    <template #prepend>
                      <SvgIcon :local-icon="item.value" size="20" />
                    </template>
                    <template #title>{{ item.title }}</template>
                  </VListItem>
                </template>
                <template #selection="{ item }">
                  <div class="flex items-center gap-2">
                    <SvgIcon :local-icon="item.value" size="20" />
                    <span>{{ item.title }}</span>
                  </div>
                </template>
              </VSelect>
              <div v-if="model.icon" class="mt-2 flex justify-center">
                <SvgIcon v-if="model.iconType === '2'" :local-icon="model.icon" :size="40" class="text-primary" />
                <VIcon v-else :icon="model.icon" :size="40" class="text-primary" />
              </div>
            </VCol>
            <VCol cols="12" md="6">
              <VRadioGroup
                v-model="model.status"
                :label="$t('page.manage.menu.menuStatus')"
                :rules="rules.status"
                inline
              >
                <VRadio v-for="item in enableStatusItems" :key="item.value" :value="item.value" :label="item.title" />
              </VRadioGroup>
            </VCol>
            <VCol cols="12" md="6">
              <VRadioGroup v-model="model.keepAlive" :label="$t('page.manage.menu.keepAlive')" inline>
                <VRadio :value="true" :label="$t('common.yesOrNo.yes')" />
                <VRadio :value="false" :label="$t('common.yesOrNo.no')" />
              </VRadioGroup>
            </VCol>
            <VCol cols="12" md="6">
              <VRadioGroup v-model="model.constant" :label="$t('page.manage.menu.constant')" inline>
                <VRadio :value="true" :label="$t('common.yesOrNo.yes')" />
                <VRadio :value="false" :label="$t('common.yesOrNo.no')" />
              </VRadioGroup>
            </VCol>
            <VCol cols="12" md="6">
              <VTextField
                v-model="model.href"
                :label="$t('page.manage.menu.href')"
                :placeholder="$t('page.manage.menu.form.href')"
              />
            </VCol>
            <VCol cols="12" md="6">
              <VRadioGroup v-model="model.hideInMenu" :label="$t('page.manage.menu.hideInMenu')" inline>
                <VRadio :value="true" :label="$t('common.yesOrNo.yes')" />
                <VRadio :value="false" :label="$t('common.yesOrNo.no')" />
              </VRadioGroup>
            </VCol>
            <VCol v-if="model.hideInMenu" cols="12" md="6">
              <VSelect
                v-model="model.activeMenu"
                :label="$t('page.manage.menu.activeMenu')"
                :placeholder="$t('page.manage.menu.form.activeMenu')"
                :items="pageOptions"
                clearable
              />
            </VCol>
            <VCol cols="12" md="6">
              <VRadioGroup v-model="model.multiTab" :label="$t('page.manage.menu.multiTab')" inline>
                <VRadio :value="true" :label="$t('common.yesOrNo.yes')" />
                <VRadio :value="false" :label="$t('common.yesOrNo.no')" />
              </VRadioGroup>
            </VCol>
            <VCol cols="12" md="6">
              <VNumberInput
                v-model="model.fixedIndexInTab"
                :label="$t('page.manage.menu.fixedIndexInTab')"
                :placeholder="$t('page.manage.menu.form.fixedIndexInTab')"
                clearable
                class="w-full"
              />
            </VCol>
            <VCol cols="12">
              <div class="mb-2 flex items-center justify-between">
                <span class="text-sm text-medium-emphasis">{{ $t('page.manage.menu.query') }}</span>
                <VBtn size="small" variant="text" prepend-icon="mdi-plus" @click="addQueryItem()">
                  {{ $t('common.add') }}
                </VBtn>
              </div>
              <div v-for="(item, index) in model.query" :key="index" class="mb-2 flex items-start gap-2">
                <VTextField v-model="item.key" :placeholder="$t('page.manage.menu.form.queryKey')" hide-details />
                <VTextField v-model="item.value" :placeholder="$t('page.manage.menu.form.queryValue')" hide-details />
                <VBtn icon="mdi-plus" variant="text" density="comfortable" @click="addQueryItem(index)" />
                <VBtn icon="mdi-minus" variant="text" density="comfortable" @click="removeQueryItem(index)" />
              </div>
            </VCol>
            <VCol cols="12">
              <div class="mb-2 flex items-center justify-between">
                <span class="text-sm text-medium-emphasis">{{ $t('page.manage.menu.button') }}</span>
                <VBtn size="small" variant="text" prepend-icon="mdi-plus" @click="addButtonItem()">
                  {{ $t('common.add') }}
                </VBtn>
              </div>
              <div v-for="(item, index) in model.buttons" :key="index" class="mb-2 flex items-start gap-2">
                <VTextField v-model="item.code" :placeholder="$t('page.manage.menu.form.buttonCode')" hide-details />
                <VTextField v-model="item.desc" :placeholder="$t('page.manage.menu.form.buttonDesc')" hide-details />
                <VBtn icon="mdi-plus" variant="text" density="comfortable" @click="addButtonItem(index)" />
                <VBtn icon="mdi-minus" variant="text" density="comfortable" @click="removeButtonItem(index)" />
              </div>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="closeDrawer">{{ $t('common.cancel') }}</VBtn>
        <VBtn color="primary" variant="flat" @click="handleSubmit">{{ $t('common.confirm') }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped></style>
