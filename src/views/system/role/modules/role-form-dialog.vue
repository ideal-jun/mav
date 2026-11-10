<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { ValidationRule } from 'vuetify';
import { useDict } from '@/hooks/business/dict';
import { useVuetifyForm } from '@/hooks/common/form';
import { roleMenuTreeselect, treeselect } from '@/service/api/ruoyi/system/menu';
import type { MenuTreeOption } from '@/service/api/ruoyi/system/menu/types';
import {
  addRole,
  getRole,
  roleDeptTreeSelect,
  updateRole,
  updateRolePermission
} from '@/service/api/ruoyi/system/role';
import type { DeptTreeOption, RoleForm } from '@/service/api/ruoyi/system/role/types';

defineOptions({
  name: 'RoleFormDialog'
});

interface Props {
  /** the editing role id, null while adding a new role */
  roleId?: string | number | null;
  /** the tab opened by default */
  initialTab?: 'basic' | 'menu' | 'data';
}

const props = withDefaults(defineProps<Props>(), {
  roleId: null,
  initialTab: 'basic'
});

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const dict = useDict('sys_normal_disable');

const loading = ref(false);
const submitting = ref(false);
/** whether the menu / dept permission trees are loaded, the permission endpoint is skipped when they are not */
const permissionLoaded = ref(false);
const tab = ref('basic');

const { formRef, validate, restoreValidation } = useVuetifyForm();

function createDefaultForm(): RoleForm {
  return {
    roleId: undefined,
    roleName: '',
    roleKey: '',
    roleSort: 0,
    status: '0',
    remark: '',
    menuCheckStrictly: true,
    deptCheckStrictly: true,
    dataScope: '1',
    menuIds: [],
    deptIds: []
  };
}

const form = ref<RoleForm>(createDefaultForm());

const isEdit = computed(() => Boolean(form.value.roleId));

const dialogTitle = computed(() => (isEdit.value ? '修改角色' : '新增角色'));

const statusItems = computed(() => dict.sys_normal_disable.map(item => ({ title: item.label, value: item.value })));

/** the data scope options, the values are the same as the backend `dataScope` */
const dataScopeOptions = [
  { title: '全部数据权限', value: '1' },
  { title: '自定数据权限', value: '2' },
  { title: '本部门数据权限', value: '3' },
  { title: '本部门及以下数据权限', value: '4' },
  { title: '仅本人数据权限', value: '5' },
  { title: '部门及以下或本人数据权限', value: '6' }
];

function createRequiredRule(message: string): ValidationRule {
  return value => (value !== null && value !== undefined && String(value).trim() !== '') || message;
}

const rules: Record<'roleName' | 'roleKey' | 'roleSort', ValidationRule[]> = {
  roleName: [createRequiredRule('请输入角色名称')],
  roleKey: [createRequiredRule('请输入权限字符')],
  roleSort: [createRequiredRule('请输入显示顺序')]
};

/* ------------------------------ 菜单权限树 ------------------------------ */

const menuTree = ref<MenuTreeOption[]>([]);
const selectedMenuIds = ref<Array<string | number>>([]);
const openedMenuIds = ref<Array<string | number>>([]);

const menuStrategy = computed(() => (form.value.menuCheckStrictly ? 'branch' : 'independent'));

function collectMenuIds(nodes: MenuTreeOption[]): Array<string | number> {
  return nodes.reduce<Array<string | number>>((ids, node) => {
    ids.push(node.id);

    if (node.children?.length) {
      ids.push(...collectMenuIds(node.children));
    }

    return ids;
  }, []);
}

/** remove the empty children arrays so the treeview does not render leaf expand arrows */
function normalizeMenuTree(nodes: MenuTreeOption[]): MenuTreeOption[] {
  return nodes.map(node => ({
    ...node,
    children: node.children?.length ? normalizeMenuTree(node.children) : undefined
  }));
}

const allMenuIds = computed(() => collectMenuIds(menuTree.value));

const menuExpandAll = computed({
  get: () => allMenuIds.value.length > 0 && allMenuIds.value.every(id => openedMenuIds.value.includes(id)),
  set: (value: boolean) => {
    openedMenuIds.value = value ? [...allMenuIds.value] : [];
  }
});

const menuCheckedAll = computed({
  get: () => allMenuIds.value.length > 0 && allMenuIds.value.every(id => selectedMenuIds.value.includes(id)),
  set: (value: boolean) => {
    selectedMenuIds.value = value ? [...allMenuIds.value] : [];
  }
});

/** the extra list item props of a menu node, the disabled menus can not be assigned */
function menuItemProps(item: any) {
  return { disabled: item?.status === '1' };
}

/** cast the slot item to the menu tree option */
function menuNode(item: unknown) {
  return item as MenuTreeOption;
}

/* ------------------------------ 数据权限树 ------------------------------ */

const deptTree = ref<DeptTreeOption[]>([]);
const selectedDeptIds = ref<Array<string | number>>([]);
const openedDeptIds = ref<Array<string | number>>([]);

const deptStrategy = computed(() => (form.value.deptCheckStrictly ? 'branch' : 'independent'));

function collectDeptIds(nodes: DeptTreeOption[]): Array<string | number> {
  return nodes.reduce<Array<string | number>>((ids, node) => {
    ids.push(node.id);

    if (node.children?.length) {
      ids.push(...collectDeptIds(node.children));
    }

    return ids;
  }, []);
}

/** remove the empty children arrays so the treeview does not render leaf expand arrows */
function normalizeDeptTree(nodes: DeptTreeOption[]): DeptTreeOption[] {
  return nodes.map(node => ({
    ...node,
    children: node.children?.length ? normalizeDeptTree(node.children) : undefined
  }));
}

const allDeptIds = computed(() => collectDeptIds(deptTree.value));

const deptExpandAll = computed({
  get: () => allDeptIds.value.length > 0 && allDeptIds.value.every(id => openedDeptIds.value.includes(id)),
  set: (value: boolean) => {
    openedDeptIds.value = value ? [...allDeptIds.value] : [];
  }
});

const deptCheckedAll = computed({
  get: () => allDeptIds.value.length > 0 && allDeptIds.value.every(id => selectedDeptIds.value.includes(id)),
  set: (value: boolean) => {
    selectedDeptIds.value = value ? [...allDeptIds.value] : [];
  }
});

/* ------------------------------ 数据加载 ------------------------------ */

async function getMenuTree() {
  let success = false;

  if (props.roleId) {
    const { data, error } = await roleMenuTreeselect(props.roleId);

    if (!error && data) {
      menuTree.value = normalizeMenuTree(data.menus ?? []);
      selectedMenuIds.value = [...(data.checkedKeys ?? [])];
      success = true;
    }
  } else {
    const { data, error } = await treeselect();

    if (!error) {
      menuTree.value = normalizeMenuTree(data ?? []);
      selectedMenuIds.value = [];
      success = true;
    }
  }

  openedMenuIds.value = collectMenuIds(menuTree.value);

  return success;
}

async function getDeptTree() {
  if (!props.roleId) {
    deptTree.value = [];
    selectedDeptIds.value = [];

    return false;
  }

  const { data, error } = await roleDeptTreeSelect(props.roleId);

  if (!error && data) {
    deptTree.value = normalizeDeptTree(data.depts ?? []);
    selectedDeptIds.value = [...(data.checkedKeys ?? [])];
  }

  openedDeptIds.value = collectDeptIds(deptTree.value);

  return !error && Boolean(data);
}

async function init() {
  form.value = createDefaultForm();

  if (props.roleId) {
    form.value.roleId = String(props.roleId);
  }

  menuTree.value = [];
  selectedMenuIds.value = [];
  openedMenuIds.value = [];
  deptTree.value = [];
  selectedDeptIds.value = [];
  openedDeptIds.value = [];
  permissionLoaded.value = false;
  tab.value = props.initialTab;
  restoreValidation();
  loading.value = true;

  try {
    if (props.roleId) {
      const [roleResponse, menuLoaded, deptLoaded] = await Promise.all([
        getRole(props.roleId),
        getMenuTree(),
        getDeptTree()
      ]);

      permissionLoaded.value = menuLoaded && deptLoaded;

      if (roleResponse.error || !roleResponse.data) {
        visible.value = false;

        return;
      }

      Object.assign(form.value, roleResponse.data);
      form.value.roleId = String(props.roleId);
      form.value.roleSort = Number(form.value.roleSort ?? 0);
      form.value.menuIds = [];
      form.value.deptIds = [];

      if (form.value.dataScope !== '2') {
        selectedDeptIds.value = [];
      }
    } else {
      await getMenuTree();
    }
  } finally {
    loading.value = false;
  }
}

watch(visible, value => {
  if (value) {
    init();
  }
});

/* ------------------------------ 交互 ------------------------------ */

function handleDataScopeChange(value: unknown) {
  if (String(value) !== '2') {
    selectedDeptIds.value = [];
  }
}

/** the department ids of the data scope, only the custom data scope keeps them */
function getDeptIds() {
  if (form.value.dataScope !== '2') {
    return [];
  }

  return [...selectedDeptIds.value];
}

async function handleSubmit() {
  if (!(await validate())) {
    tab.value = 'basic';

    return;
  }

  const payload: RoleForm = {
    roleId: form.value.roleId,
    roleName: form.value.roleName.trim(),
    roleKey: form.value.roleKey.trim(),
    roleSort: Number(form.value.roleSort ?? 0),
    status: form.value.status || '0',
    remark: form.value.remark ?? '',
    menuCheckStrictly: form.value.menuCheckStrictly,
    deptCheckStrictly: form.value.deptCheckStrictly,
    dataScope: form.value.dataScope || '1',
    menuIds: [...selectedMenuIds.value],
    deptIds: getDeptIds()
  };

  submitting.value = true;

  try {
    let error: any = null;

    if (payload.roleId) {
      // the backend splits the base info and the permission config into two endpoints
      ({ error } = await updateRole(payload));

      // the permission trees failed to load, keep the role permissions untouched
      if (!error && permissionLoaded.value) {
        ({ error } = await updateRolePermission(payload));
      }
    } else {
      ({ error } = await addRole(payload));
    }

    if (!error) {
      window.$message?.success(payload.roleId ? '修改成功' : '新增成功');
      visible.value = false;
      emit('submitted');
    }
  } finally {
    submitting.value = false;
  }
}

function handleClose() {
  visible.value = false;
}
</script>

<template>
  <VDialog v-model="visible" max-width="800" scrollable>
    <VCard :loading="loading">
      <VCardTitle class="flex flex-wrap items-center gap-2 pb-2">
        <span>{{ dialogTitle }}</span>
        <span v-if="isEdit" class="text-caption text-medium-emphasis">角色编号：{{ form.roleId }}</span>
      </VCardTitle>
      <VTabs v-model="tab" density="compact" class="px-4">
        <VTab value="basic">基本信息</VTab>
        <VTab value="menu">菜单权限</VTab>
        <VTab v-if="isEdit" value="data">数据权限</VTab>
      </VTabs>
      <VDivider />
      <VCardText class="pt-4">
        <VForm ref="formRef" validate-on="input" @submit.prevent="handleSubmit">
          <VWindow v-model="tab" class="pt-4">
            <VWindowItem value="basic" eager>
              <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <VTextField
                  v-model="form.roleName"
                  label="角色名称"
                  placeholder="请输入角色名称"
                  maxlength="30"
                  counter
                  :rules="rules.roleName"
                  hide-details="auto"
                />
                <VTextField
                  v-model="form.roleKey"
                  label="权限字符"
                  placeholder="请输入权限字符"
                  hint="控制器中定义的权限字符，如：@SaCheckRole('admin')"
                  maxlength="100"
                  persistent-hint
                  :rules="rules.roleKey"
                  hide-details="auto"
                />
                <VNumberInput
                  v-model="form.roleSort"
                  label="显示顺序"
                  :min="0"
                  :step="1"
                  control-variant="stacked"
                  :rules="rules.roleSort"
                  hide-details="auto"
                />
                <VSelect v-model="form.status" :items="statusItems" label="状态" hide-details="auto" />
                <div class="sm:col-span-2">
                  <VTextarea v-model="form.remark" label="备注" placeholder="请输入内容" rows="3" hide-details="auto" />
                </div>
              </div>
            </VWindowItem>

            <VWindowItem value="menu" eager>
              <div class="mb-3 flex flex-wrap items-center gap-4">
                <VCheckbox v-model="menuExpandAll" label="展开/折叠" hide-details />
                <VCheckbox v-model="menuCheckedAll" label="全选/全不选" hide-details />
                <VCheckbox v-model="form.menuCheckStrictly" label="父子联动" hide-details />
              </div>
              <div v-if="!loading" class="max-h-360 overflow-y-auto rounded border pa-2">
                <VTreeview
                  v-model:selected="selectedMenuIds"
                  v-model:opened="openedMenuIds"
                  :items="menuTree"
                  item-title="label"
                  item-value="id"
                  item-children="children"
                  :item-props="menuItemProps"
                  :select-strategy="menuStrategy"
                  selectable
                  open-on-click
                  density="compact"
                  no-data-text="暂无菜单数据"
                >
                  <template #title="{ item }">
                    <div class="flex flex-wrap items-center gap-2">
                      <span>{{ menuNode(item).label }}</span>
                      <VChip v-if="menuNode(item).menuType === 'F'" size="x-small" color="info" variant="tonal">
                        按钮
                      </VChip>
                      <VChip v-if="menuNode(item).visible === '1'" size="x-small" color="warning" variant="tonal">
                        隐藏
                      </VChip>
                      <VChip v-if="menuNode(item).status === '1'" size="x-small" color="error" variant="tonal">
                        停用
                      </VChip>
                    </div>
                  </template>
                </VTreeview>
              </div>
              <div class="mt-2 text-caption text-medium-emphasis">
                已选择 {{ selectedMenuIds.length }} 项，保存时会把父级与半选节点一并提交为 menuIds。
              </div>
            </VWindowItem>

            <VWindowItem v-if="isEdit" value="data" eager>
              <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <VSelect
                  v-model="form.dataScope"
                  :items="dataScopeOptions"
                  label="权限范围"
                  hide-details="auto"
                  @update:model-value="handleDataScopeChange"
                />
              </div>
              <template v-if="form.dataScope === '2'">
                <div class="mt-4 mb-3 flex flex-wrap items-center gap-4">
                  <VCheckbox v-model="deptExpandAll" label="展开/折叠" hide-details />
                  <VCheckbox v-model="deptCheckedAll" label="全选/全不选" hide-details />
                  <VCheckbox v-model="form.deptCheckStrictly" label="父子联动" hide-details />
                </div>
                <div v-if="!loading" class="max-h-320 overflow-y-auto rounded border pa-2">
                  <VTreeview
                    v-model:selected="selectedDeptIds"
                    v-model:opened="openedDeptIds"
                    :items="deptTree"
                    item-title="label"
                    item-value="id"
                    item-children="children"
                    :select-strategy="deptStrategy"
                    selectable
                    open-on-click
                    density="compact"
                    no-data-text="暂无部门数据"
                  />
                </div>
              </template>
              <VAlert v-else type="info" variant="tonal" density="compact" class="mt-4">
                当前数据权限范围不需要选择部门，选择“自定数据权限”后可勾选部门树。
              </VAlert>
            </VWindowItem>
          </VWindow>
        </VForm>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="handleClose">取消</VBtn>
        <VBtn color="primary" variant="flat" :loading="submitting" @click="handleSubmit">确定</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped></style>
