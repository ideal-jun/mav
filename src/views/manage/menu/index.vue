<script setup lang="ts">
import TableHeaderOperation from '@/components/advanced/table-header-operation.vue';
import SvgIcon from '@/components/custom/svg-icon.vue';
import { ref } from 'vue';
import type { Ref } from 'vue';
import { useBoolean } from '@sa/hooks';
import { enableStatusRecord, menuTypeRecord } from '@/constants/business';
import { yesOrNoRecord } from '@/constants/common';
import { fetchGetMenuList } from '@/service/api';
import { $t, hasI18nKey } from '@/locales';
import { resolveMdiIcon } from '@/utils/icon';
import { defaultTransform, useTableOperate, useVuetifyPaginatedTable } from '@/hooks/common/table';
import MenuOperateModal from './modules/menu-operate-modal.vue';
import type { OperateType } from './modules/menu-operate-modal.vue';

const { bool: visible, setTrue: openModal } = useBoolean();

const { columns, columnChecks, data, loading, pagination, getData, getDataByPage, showSelect } =
  useVuetifyPaginatedTable({
    api: () => fetchGetMenuList(),
    transform: response => defaultTransform(response),
    showSelect: true,
    columns: () => [
      {
        key: 'id',
        title: $t('page.manage.menu.id'),
        align: 'center',
        width: 64,
        minWidth: 64,
        sortable: false
      },
      {
        key: 'menuType',
        title: $t('page.manage.menu.menuType'),
        align: 'center',
        width: 96,
        minWidth: 96,
        sortable: false
      },
      {
        key: 'menuName',
        title: $t('page.manage.menu.menuName'),
        align: 'center',
        width: 100,
        minWidth: 100,
        sortable: false
      },
      {
        key: 'icon',
        title: $t('page.manage.menu.icon'),
        align: 'center',
        width: 64,
        minWidth: 64,
        sortable: false
      },
      {
        key: 'routeName',
        title: $t('page.manage.menu.routeName'),
        align: 'center',
        width: 100,
        minWidth: 100,
        sortable: false
      },
      {
        key: 'routePath',
        title: $t('page.manage.menu.routePath'),
        align: 'center',
        width: 100,
        minWidth: 100,
        sortable: false
      },
      {
        key: 'status',
        title: $t('page.manage.menu.menuStatus'),
        align: 'center',
        width: 96,
        minWidth: 96,
        sortable: false
      },
      {
        key: 'hideInMenu',
        title: $t('page.manage.menu.hideInMenu'),
        align: 'center',
        width: 96,
        minWidth: 96,
        sortable: false
      },
      {
        key: 'parentId',
        title: $t('page.manage.menu.parentId'),
        width: 120,
        minWidth: 120,
        align: 'center',
        sortable: false
      },
      {
        key: 'order',
        title: $t('page.manage.menu.order'),
        align: 'center',
        width: 80,
        minWidth: 80,
        sortable: false
      },
      {
        key: 'operate',
        title: $t('common.operate'),
        align: 'center',
        width: 200,
        minWidth: 200,
        sortable: false
      }
    ]
  });

const { checkedRowKeys, onBatchDeleted, onDeleted } = useTableOperate(data, 'id', getData);

const operateType = ref<OperateType>('add');

function handleAdd() {
  operateType.value = 'add';
  openModal();
}

const deleteVisible = ref(false);

const deletingId = ref<number | null>(null);

async function handleBatchDelete() {
  // request
  console.log(checkedRowKeys.value);

  onBatchDeleted();
}

function handleDelete(id: number) {
  deletingId.value = id;
  deleteVisible.value = true;
}

function confirmDelete() {
  deleteVisible.value = false;

  // request
  console.log(deletingId.value);

  deletingId.value = null;

  onDeleted();
}

/** the edit menu data or the parent menu data when adding a child menu */
const editingData: Ref<Api.SystemManage.Menu | null> = ref(null);

function handleEdit(item: Api.SystemManage.Menu) {
  operateType.value = 'edit';
  editingData.value = { ...item };

  openModal();
}

function handleAddChildMenu(item: Api.SystemManage.Menu) {
  operateType.value = 'addChild';

  editingData.value = { ...item };

  openModal();
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col gap-4">
    <VAlert type="info" variant="tonal" density="compact" class="shrink-0">
      {{ $t('page.manage.menu.mockNotice') }}
    </VAlert>
    <VCard class="card-wrapper flex min-h-0 flex-1 flex-col">
      <VCardTitle class="flex shrink-0 flex-wrap items-center justify-between gap-2">
        <span>{{ $t('page.manage.menu.title') }}</span>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          @add="handleAdd"
          @delete="handleBatchDelete"
          @refresh="getData"
        />
      </VCardTitle>
      <div class="min-h-0 flex-1">
        <VDataTableServer
          v-model:page="pagination.page"
          v-model:items-per-page="pagination.pageSize"
          v-model="checkedRowKeys"
          :headers="columns"
          :items="data"
          :items-length="pagination.total"
          :items-per-page-options="[10, 15, 20, 25, 30]"
          :loading="loading"
          :show-select="showSelect"
          item-value="id"
          class="manage-data-table"
          fixed-header
        >
          <template #item.menuType="{ item }">
            <VChip :color="item.menuType === '2' ? 'primary' : undefined" size="x-small" variant="tonal">
              {{ $t(menuTypeRecord[item.menuType]) }}
            </VChip>
          </template>
          <template #item.menuName="{ item }">
            <span>{{ item.i18nKey && hasI18nKey(item.i18nKey) ? $t(item.i18nKey) : item.menuName }}</span>
          </template>
          <template #item.icon="{ item }">
            <div class="flex-center">
              <SvgIcon v-if="item.iconType === '2'" :local-icon="item.icon" size="20" />
              <VIcon v-else :icon="resolveMdiIcon(item.icon)" size="20" />
            </div>
          </template>
          <template #item.status="{ item }">
            <VChip
              v-if="item.status !== null"
              :color="item.status === '1' ? 'success' : 'warning'"
              size="x-small"
              variant="tonal"
            >
              {{ $t(enableStatusRecord[item.status]) }}
            </VChip>
          </template>
          <template #item.hideInMenu="{ item }">
            <VChip :color="item.hideInMenu ? 'error' : undefined" size="x-small" variant="tonal">
              {{ $t(yesOrNoRecord[item.hideInMenu ? 'Y' : 'N']) }}
            </VChip>
          </template>
          <template #item.operate="{ item }">
            <div class="flex items-center justify-end whitespace-nowrap">
              <VBtn
                v-if="item.menuType === '1'"
                size="x-small"
                variant="text"
                color="primary"
                @click="handleAddChildMenu(item)"
              >
                {{ $t('page.manage.menu.addChildMenu') }}
              </VBtn>
              <VBtn size="x-small" variant="text" color="primary" @click="handleEdit(item)">
                {{ $t('common.edit') }}
              </VBtn>
              <VBtn size="x-small" variant="text" color="error" @click="handleDelete(item.id)">
                {{ $t('common.delete') }}
              </VBtn>
            </div>
          </template>
        </VDataTableServer>
      </div>
    </VCard>
    <MenuOperateModal
      v-model:visible="visible"
      :operate-type="operateType"
      :row-data="editingData"
      @submitted="getDataByPage"
    />

    <VDialog v-model="deleteVisible" max-width="400">
      <VCard>
        <VCardTitle>{{ $t('common.tip') }}</VCardTitle>
        <VCardText>{{ $t('common.confirmDelete') }}</VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn variant="text" @click="deleteVisible = false">{{ $t('common.cancel') }}</VBtn>
          <VBtn color="error" variant="flat" @click="confirmDelete">{{ $t('common.confirm') }}</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<style scoped></style>
