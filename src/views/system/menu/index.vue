<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { utils, writeFile } from 'xlsx';
import DictTag from '@/components/common/dict-tag.vue';
import { useAuth } from '@/hooks/business/auth';
import { useDict } from '@/hooks/business/dict';
import type { TableColumn } from '@/hooks/common/table';
import { cascadeDelMenu, delMenu, listMenu } from '@/service/api/ruoyi/system/menu';
import type { MenuQuery, MenuVO } from '@/service/api/ruoyi/system/menu/types';
import { resolveMdiIcon } from '@/utils/icon';
import { handleTree } from '@/utils/ruoyi';
import MenuFormDialog from './modules/menu-form-dialog.vue';

defineOptions({
  name: 'SystemMenu'
});

const { hasAuth } = useAuth();

const dict = useDict('sys_normal_disable', 'sys_show_hide');

const query = ref<MenuQuery>({
  menuName: '',
  status: undefined
});

const loading = ref(false);

/** the flat menu list returned by the backend */
const menus = ref<MenuVO[]>([]);

/** the menu tree built from the flat list */
const menuTree = ref<MenuVO[]>([]);

/** the expanded menu ids */
const expandedKeys = ref<string[]>([]);

const checkedRowKeys = ref<Array<string | number>>([]);

interface MenuTableRow extends MenuVO {
  /** the depth of the node, used by the name column indent */
  level: number;
  hasChildren: boolean;
  perms: string;
}

function getPerms(menu: MenuVO) {
  return (menu as unknown as { perms?: string }).perms ?? '';
}

const statusItems = computed(() => dict.sys_normal_disable.map(item => ({ title: item.label, value: item.value })));

const columns: TableColumn[] = [
  { key: 'menuName', title: '菜单名称', align: 'start', minWidth: 260, sortable: false },
  { key: 'icon', title: '图标', align: 'center', width: 80, sortable: false },
  { key: 'menuType', title: '类型', align: 'center', width: 90, sortable: false },
  { key: 'orderNum', title: '排序', align: 'center', width: 80, sortable: false },
  { key: 'perms', title: '权限标识', align: 'start', minWidth: 170, sortable: false },
  { key: 'component', title: '组件路径', align: 'start', minWidth: 180, sortable: false },
  { key: 'status', title: '状态', align: 'center', width: 90, sortable: false },
  { key: 'visible', title: '显示', align: 'center', width: 90, sortable: false },
  { key: 'actions', title: '操作', align: 'center', width: 200, sortable: false }
];

/* ------------------------------ 数据加载 ------------------------------ */

function collectParentIds(nodes: MenuVO[]): string[] {
  return nodes.reduce<string[]>((ids, node) => {
    if (node.children?.length) {
      ids.push(String(node.menuId), ...collectParentIds(node.children));
    }

    return ids;
  }, []);
}

async function getList() {
  loading.value = true;

  try {
    const { data, error } = await listMenu(query.value);

    if (error || !data) {
      menus.value = [];
      menuTree.value = [];
      expandedKeys.value = [];

      return;
    }

    menus.value = data;
    menuTree.value = handleTree<MenuVO>(data, 'menuId', 'parentId', 'children');
    // expand the whole tree by default
    expandedKeys.value = collectParentIds(menuTree.value);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  getList();
});

/* ------------------------------ 展开 / 折叠 ------------------------------ */

const allParentIds = computed(() => collectParentIds(menuTree.value));

const allExpanded = computed(
  () => allParentIds.value.length > 0 && allParentIds.value.every(id => expandedKeys.value.includes(id))
);

function isExpanded(menuId: string | number) {
  return expandedKeys.value.includes(String(menuId));
}

function toggleExpand(menuId: string | number) {
  const key = String(menuId);

  expandedKeys.value = isExpanded(key) ? expandedKeys.value.filter(item => item !== key) : [...expandedKeys.value, key];
}

function toggleExpandAll() {
  expandedKeys.value = allExpanded.value ? [] : [...allParentIds.value];
}

/* ------------------------------ 树形表格行 ------------------------------ */

const tableRows = computed<MenuTableRow[]>(() => {
  const rows: MenuTableRow[] = [];

  const walk = (nodes: MenuVO[], level: number) => {
    nodes.forEach(node => {
      const hasChildren = Boolean(node.children?.length);

      rows.push({ ...node, level, hasChildren, perms: getPerms(node) });

      if (hasChildren && isExpanded(node.menuId)) {
        walk(node.children, level + 1);
      }
    });
  };

  walk(menuTree.value, 0);

  return rows;
});

function menuTypeLabel(type?: string) {
  if (type === 'M') {
    return '目录';
  }

  if (type === 'C') {
    return '菜单';
  }

  if (type === 'F') {
    return '按钮';
  }

  return '-';
}

function menuTypeColor(type?: string) {
  if (type === 'M') {
    return 'primary';
  }

  if (type === 'C') {
    return 'success';
  }

  return 'info';
}

/* ------------------------------ 查询与重置 ------------------------------ */

async function handleSearch() {
  await getList();
}

async function handleReset() {
  query.value.menuName = '';
  query.value.status = undefined;

  await handleSearch();
}

/* ------------------------------ 新增 / 修改 ------------------------------ */

const formVisible = ref(false);
const formMenuId = ref<string | number | null>(null);
const formParentId = ref<string | number>(0);

function handleAdd() {
  formMenuId.value = null;
  formParentId.value = 0;
  formVisible.value = true;
}

function handleAddChild(row: MenuVO) {
  formMenuId.value = null;
  formParentId.value = row.menuId;
  formVisible.value = true;
}

function handleEdit(row: MenuVO) {
  formMenuId.value = row.menuId;
  formVisible.value = true;
}

async function handleSubmitted() {
  await getList();
}

/* ------------------------------ 删除 ------------------------------ */

async function handleDelete(row: MenuVO) {
  const confirmed = await window.$dialog?.warning({
    title: '系统提示',
    positiveText: '确定',
    negativeText: '取消',
    maskClosable: false,
    content: `是否确认删除名称为"${row.menuName}"的数据项？`
  });

  if (!confirmed) {
    return;
  }

  const { error } = await delMenu(row.menuId);

  if (!error) {
    window.$message?.success('删除成功');
    await getList();
  }
}

async function handleBatchDelete() {
  if (!checkedRowKeys.value.length) {
    window.$message?.warning('请选择要删除的菜单');
    return;
  }

  const confirmed = await window.$dialog?.warning({
    title: '系统提示',
    positiveText: '确定',
    negativeText: '取消',
    maskClosable: false,
    content: `是否确认级联删除选中的 ${checkedRowKeys.value.length} 个菜单及其子菜单？`
  });

  if (!confirmed) {
    return;
  }

  const { error } = await cascadeDelMenu(checkedRowKeys.value);

  if (!error) {
    window.$message?.success('删除成功');
    checkedRowKeys.value = [];
    await getList();
  }
}

/* ------------------------------ 导出 ------------------------------ */

function handleExport() {
  const rows = menus.value.map(menu => {
    return {
      菜单名称: menu.menuName,
      菜单类型: menuTypeLabel(menu.menuType),
      显示排序: menu.orderNum,
      权限标识: getPerms(menu),
      路由地址: menu.path ?? '',
      组件路径: menu.component ?? '',
      显示状态: menu.visible === '0' ? '显示' : '隐藏',
      菜单状态: menu.status === '0' ? '正常' : '停用',
      创建时间: menu.createTime ?? ''
    };
  });

  if (!rows.length) {
    window.$message?.warning('暂无可导出的菜单数据');
    return;
  }

  const worksheet = utils.json_to_sheet(rows);
  const workbook = utils.book_new();

  utils.book_append_sheet(workbook, worksheet, '菜单数据');
  writeFile(workbook, `menu_${Date.now()}.xlsx`);
  window.$message?.success('导出成功');
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col gap-4">
    <VCard class="card-wrapper shrink-0">
      <VCardText class="py-3">
        <VForm @submit.prevent="handleSearch">
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <VTextField
              v-model="query.menuName"
              label="菜单名称"
              placeholder="请输入菜单名称"
              density="compact"
              variant="outlined"
              clearable
              hide-details="auto"
            />
            <VSelect
              v-model="query.status"
              :items="statusItems"
              label="状态"
              density="compact"
              variant="outlined"
              clearable
              hide-details="auto"
            />
          </div>
          <div class="flex justify-end gap-2 pt-3">
            <VBtn variant="text" prepend-icon="mdi-refresh" @click="handleReset">重置</VBtn>
            <VBtn color="primary" variant="outlined" prepend-icon="mdi-magnify" @click="handleSearch">搜索</VBtn>
          </div>
        </VForm>
      </VCardText>
    </VCard>

    <VCard class="card-wrapper flex min-h-0 flex-1 flex-col">
      <VCardTitle class="flex shrink-0 flex-wrap items-center justify-between gap-2">
        <div class="flex flex-wrap items-baseline gap-2">
          <span>菜单管理</span>
          <span class="text-caption text-medium-emphasis">共 {{ menus.length }} 条记录</span>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <VBtn
            v-if="hasAuth('system:menu:add')"
            size="small"
            variant="outlined"
            color="primary"
            prepend-icon="mdi-plus"
            @click="handleAdd"
          >
            新增
          </VBtn>
          <VBtn
            v-if="hasAuth('system:menu:remove')"
            size="small"
            variant="outlined"
            color="error"
            prepend-icon="mdi-delete"
            :disabled="checkedRowKeys.length === 0"
            @click="handleBatchDelete"
          >
            删除
          </VBtn>
          <VBtn size="small" variant="outlined" color="info" prepend-icon="mdi-file-tree" @click="toggleExpandAll">
            {{ allExpanded ? '全部折叠' : '全部展开' }}
          </VBtn>
          <VBtn size="small" variant="outlined" color="success" prepend-icon="mdi-export" @click="handleExport">
            导出
          </VBtn>
          <VBtn size="small" variant="text" @click="getList">
            <template #prepend>
              <VIcon icon="mdi-refresh" :class="{ 'animate-spin': loading }" />
            </template>
            刷新
          </VBtn>
        </div>
      </VCardTitle>
      <div class="min-h-0 flex-1">
        <VDataTable
          v-model="checkedRowKeys"
          :headers="columns"
          :items="tableRows"
          :loading="loading"
          item-value="menuId"
          :show-select="true"
          :items-per-page="-1"
          disable-pagination
          hide-default-footer
          class="manage-data-table"
          fixed-header
        >
          <template #item.menuName="{ item }">
            <div class="flex items-center" :style="{ paddingLeft: `${item.level * 20}px` }">
              <VBtn
                v-if="item.hasChildren"
                :icon="isExpanded(item.menuId) ? 'mdi-chevron-down' : 'mdi-chevron-right'"
                size="x-small"
                variant="text"
                density="comfortable"
                class="mr-1"
                @click="toggleExpand(item.menuId)"
              />
              <span v-else class="inline-block w-7 shrink-0" />
              <span class="whitespace-nowrap">{{ item.menuName }}</span>
            </div>
          </template>
          <template #item.icon="{ item }">
            <VIcon v-if="item.icon && item.icon !== '#'" :icon="resolveMdiIcon(item.icon)" size="20" />
            <span v-else class="text-medium-emphasis">-</span>
          </template>
          <template #item.menuType="{ item }">
            <VChip :color="menuTypeColor(item.menuType)" size="small" variant="tonal">
              {{ menuTypeLabel(item.menuType) }}
            </VChip>
          </template>
          <template #item.perms="{ item }">
            <span class="whitespace-nowrap">{{ item.perms || '-' }}</span>
          </template>
          <template #item.component="{ item }">
            <span class="whitespace-nowrap">{{ item.component || '-' }}</span>
          </template>
          <template #item.status="{ item }">
            <DictTag :options="dict.sys_normal_disable" :value="item.status" />
          </template>
          <template #item.visible="{ item }">
            <DictTag :options="dict.sys_show_hide" :value="item.visible" />
          </template>
          <template #item.actions="{ item }">
            <div class="flex items-center justify-center whitespace-nowrap">
              <VBtn
                v-if="hasAuth('system:menu:edit')"
                size="small"
                variant="text"
                color="primary"
                @click="handleEdit(item)"
              >
                修改
              </VBtn>
              <VBtn
                v-if="hasAuth('system:menu:add')"
                size="small"
                variant="text"
                color="primary"
                @click="handleAddChild(item)"
              >
                新增
              </VBtn>
              <VBtn
                v-if="hasAuth('system:menu:remove')"
                size="small"
                variant="text"
                color="error"
                @click="handleDelete(item)"
              >
                删除
              </VBtn>
            </div>
          </template>
        </VDataTable>
      </div>
    </VCard>

    <MenuFormDialog
      v-model:visible="formVisible"
      :menu-id="formMenuId"
      :parent-id="formParentId"
      @submitted="handleSubmitted"
    />
  </div>
</template>

<style scoped></style>
