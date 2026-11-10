<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { ValidationRule } from 'vuetify';
import CustomIconSelect from '@/components/custom/custom-icon-select.vue';
import { mdiIcons } from '@/constants/icon';
import { useDict } from '@/hooks/business/dict';
import { useVuetifyForm } from '@/hooks/common/form';
import { addMenu, getMenu, listMenu, updateMenu } from '@/service/api/ruoyi/system/menu';
import type { MenuForm, MenuTypeEnum, MenuVO } from '@/service/api/ruoyi/system/menu/types';
import { resolveMdiIcon } from '@/utils/icon';
import { handleTree } from '@/utils/ruoyi';
import MenuTreeSelect from './menu-tree-select.vue';
import type { MenuTreeSelectItem } from './menu-tree-select.vue';

defineOptions({
  name: 'MenuFormDialog'
});

interface Props {
  /** the editing menu id, null while adding a new menu */
  menuId?: string | number | null;
  /** the default parent menu id while adding a child menu */
  parentId?: string | number;
}

const props = withDefaults(defineProps<Props>(), {
  menuId: null,
  parentId: 0
});

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const dict = useDict('sys_normal_disable', 'sys_show_hide', 'sys_yes_no');

const { formRef, validate, restoreValidation } = useVuetifyForm();

const loading = ref(false);
const submitting = ref(false);

interface MenuFormModel {
  menuId?: string | number;
  parentId: string | number;
  menuName: string;
  orderNum: number;
  menuType: MenuTypeEnum;
  icon: string;
  path: string;
  component: string;
  perms: string;
  queryParam: string;
  isFrame: string;
  isCache: string;
  visible: string;
  status: string;
  activeMenu: string;
  remark: string;
}

function createDefaultForm(): MenuFormModel {
  return {
    menuId: undefined,
    parentId: 0,
    menuName: '',
    orderNum: 1,
    menuType: 'M',
    icon: '',
    path: '',
    component: '',
    perms: '',
    queryParam: '',
    isFrame: 'N',
    isCache: 'Y',
    visible: '0',
    status: '0',
    activeMenu: '',
    remark: ''
  };
}

const form = ref<MenuFormModel>(createDefaultForm());

const isEdit = computed(() => Boolean(form.value.menuId));

const dialogTitle = computed(() => (isEdit.value ? '修改菜单' : '添加菜单'));

const statusItems = computed(() => dict.sys_normal_disable.map(item => ({ title: item.label, value: item.value })));

const showHideItems = computed(() => dict.sys_show_hide.map(item => ({ title: item.label, value: item.value })));

const yesNoItems = computed(() => dict.sys_yes_no.map(item => ({ title: item.label, value: item.value })));

function createRequiredRule(message: string): ValidationRule {
  return value => (value !== null && value !== undefined && String(value).trim() !== '') || message;
}

const rules = computed<Record<'menuName' | 'orderNum' | 'path', ValidationRule[]>>(() => ({
  menuName: [createRequiredRule('请输入菜单名称')],
  orderNum: [createRequiredRule('请输入显示顺序')],
  path: form.value.menuType === 'F' ? [] : [createRequiredRule('请输入路由地址')]
}));

/* ------------------------------ 上级菜单树 ------------------------------ */

interface MenuOptionNode extends MenuTreeSelectItem {
  children?: MenuOptionNode[];
}

const menuOptions = ref<MenuOptionNode[]>([]);

/** remove the empty children arrays so the treeview does not render leaf expand arrows */
function normalizeTree(nodes: MenuOptionNode[]): MenuOptionNode[] {
  return nodes.map(node => ({
    ...node,
    children: node.children?.length ? normalizeTree(node.children) : undefined
  }));
}

function excludeSelf(nodes: MenuOptionNode[]): MenuOptionNode[] {
  return nodes
    .filter(node => String(node.menuId) !== String(props.menuId))
    .map(node => ({
      ...node,
      children: node.children?.length ? excludeSelf(node.children) : undefined
    }));
}

async function getMenuOptions() {
  const { data, error } = await listMenu();

  if (error || !data) {
    menuOptions.value = [];

    return;
  }

  const tree = normalizeTree(handleTree<MenuOptionNode>(data, 'menuId', 'parentId', 'children'));
  const options = props.menuId ? excludeSelf(tree) : tree;

  menuOptions.value = [
    {
      menuId: 0,
      menuName: '主类目',
      children: options.length ? options : undefined
    }
  ];
}

/* ------------------------------ 数据加载 ------------------------------ */

async function init() {
  form.value = createDefaultForm();
  restoreValidation();
  loading.value = true;

  if (props.menuId) {
    form.value.menuId = props.menuId;
  }

  try {
    if (props.menuId) {
      const [detailResponse] = await Promise.all([getMenu(props.menuId), getMenuOptions()]);

      if (detailResponse.error || !detailResponse.data) {
        visible.value = false;

        return;
      }

      fillForm(detailResponse.data);
    } else {
      await getMenuOptions();
      form.value.parentId = props.parentId ?? 0;
    }
  } finally {
    loading.value = false;
  }
}

function fillForm(detail: MenuVO) {
  const perms = (detail as unknown as { perms?: string }).perms ?? '';
  // the mav project renders material design icons only, normalize the legacy icon name
  const icon = detail.icon && detail.icon !== '#' ? (resolveMdiIcon(detail.icon) ?? '') : '';

  form.value = {
    menuId: detail.menuId,
    parentId: detail.parentId ?? 0,
    menuName: detail.menuName ?? '',
    orderNum: Number(detail.orderNum ?? 0),
    menuType: detail.menuType ?? 'M',
    icon,
    path: detail.path ?? '',
    component: detail.component ?? '',
    perms,
    queryParam: detail.queryParam ?? '',
    isFrame: detail.isFrame ?? 'N',
    isCache: detail.isCache ?? 'Y',
    visible: detail.visible ?? '0',
    status: detail.status ?? '0',
    activeMenu: detail.activeMenu ?? '',
    remark: detail.remark ?? ''
  };
}

watch(visible, value => {
  if (value) {
    init();
  }
});

/* ------------------------------ 提交 ------------------------------ */

function createPayload(): MenuForm {
  const model = form.value;

  const payload: MenuForm = {
    menuId: model.menuId,
    parentId: model.parentId ?? 0,
    menuName: model.menuName.trim(),
    orderNum: Number(model.orderNum ?? 0),
    menuType: model.menuType,
    path: model.path ?? '',
    isFrame: model.isFrame || 'N',
    isCache: model.isCache || 'Y',
    visible: model.visible || '0',
    status: model.status || '0'
  };

  if (model.icon) {
    payload.icon = model.icon;
  }

  if (model.menuType !== 'F') {
    payload.component = model.menuType === 'C' ? model.component : '';
    payload.queryParam = model.queryParam;
    payload.activeMenu = model.activeMenu;
  }

  if (model.menuType !== 'M') {
    payload.perms = model.perms;
  }

  if (model.remark) {
    payload.remark = model.remark;
  }

  return payload;
}

async function handleSubmit() {
  if (!(await validate())) {
    return;
  }

  const payload = createPayload();

  submitting.value = true;

  try {
    const { error } = payload.menuId ? await updateMenu(payload) : await addMenu(payload);

    if (!error) {
      window.$message?.success(payload.menuId ? '修改成功' : '新增成功');
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
  <VDialog v-model="visible" max-width="760" scrollable>
    <VCard :loading="loading">
      <VCardTitle class="flex flex-wrap items-center gap-2 pb-2">
        <span>{{ dialogTitle }}</span>
        <span v-if="isEdit" class="text-caption text-medium-emphasis">菜单编号：{{ form.menuId }}</span>
      </VCardTitle>
      <VCardText>
        <VForm ref="formRef" validate-on="input" @submit.prevent="handleSubmit">
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <MenuTreeSelect v-model="form.parentId" :items="menuOptions" label="上级菜单" />
            </div>
            <div class="sm:col-span-2">
              <VRadioGroup v-model="form.menuType" label="菜单类型" inline hide-details>
                <VRadio label="目录" value="M" />
                <VRadio label="菜单" value="C" />
                <VRadio label="按钮" value="F" />
              </VRadioGroup>
            </div>
            <div v-if="form.menuType !== 'F'" class="sm:col-span-2">
              <div class="mb-1 text-body-2 font-weight-medium">菜单图标</div>
              <CustomIconSelect v-model:value="form.icon" :icons="mdiIcons" placeholder="请选择图标" />
            </div>
            <VTextField
              v-model="form.menuName"
              label="菜单名称"
              placeholder="请输入菜单名称"
              maxlength="50"
              :rules="rules.menuName"
              hide-details="auto"
            />
            <VNumberInput
              v-model="form.orderNum"
              label="显示排序"
              :min="0"
              :step="1"
              control-variant="stacked"
              :rules="rules.orderNum"
              hide-details="auto"
            />
            <VRadioGroup
              v-if="form.menuType !== 'F'"
              v-model="form.isFrame"
              label="是否外链"
              hint="选择是则路由地址需要以 http(s):// 开头"
              inline
              hide-details="auto"
            >
              <VRadio v-for="item in yesNoItems" :key="item.value" :label="item.title" :value="item.value" />
            </VRadioGroup>
            <VTextField
              v-if="form.menuType !== 'F'"
              v-model="form.path"
              label="路由地址"
              placeholder="请输入路由地址"
              hint="访问的路由地址，如：user"
              :rules="rules.path"
              hide-details="auto"
            />
            <VTextField
              v-if="form.menuType === 'C'"
              v-model="form.component"
              label="组件路径"
              placeholder="请输入组件路径"
              hint="访问的组件路径，如：system/user/index，默认在 views 目录下"
              hide-details="auto"
            />
            <VTextField
              v-if="form.menuType !== 'M'"
              v-model="form.perms"
              label="权限字符"
              placeholder="请输入权限标识"
              maxlength="100"
              hint="控制器中定义的权限字符，如：system:user:list"
              hide-details="auto"
            />
            <VTextField
              v-if="form.menuType === 'C'"
              v-model="form.queryParam"
              label="路由参数"
              placeholder='如：{"id": 1, "name": "ry"}'
              maxlength="255"
              hint="访问路由的默认传递参数，必须是合法的 JSON 对象"
              hide-details="auto"
            />
            <VRadioGroup
              v-if="form.menuType === 'C'"
              v-model="form.isCache"
              label="是否缓存"
              inline
              hide-details="auto"
            >
              <VRadio label="缓存" value="Y" />
              <VRadio label="不缓存" value="N" />
            </VRadioGroup>
            <VRadioGroup
              v-if="form.menuType !== 'F'"
              v-model="form.visible"
              label="显示状态"
              inline
              hide-details="auto"
            >
              <VRadio v-for="item in showHideItems" :key="item.value" :label="item.title" :value="item.value" />
            </VRadioGroup>
            <VRadioGroup v-model="form.status" label="菜单状态" inline hide-details="auto">
              <VRadio v-for="item in statusItems" :key="item.value" :label="item.title" :value="item.value" />
            </VRadioGroup>
            <VTextField
              v-if="form.visible !== '0'"
              v-model="form.activeMenu"
              label="激活路由"
              placeholder="请输入激活路径"
              hint="隐藏菜单填写默认激活路由，比如激活父菜单的路由 /system/user"
              hide-details="auto"
            />
            <VTextField
              v-model="form.remark"
              label="备注"
              placeholder="请输入备注"
              maxlength="500"
              hide-details="auto"
            />
          </div>
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
