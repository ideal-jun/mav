<script setup lang="ts">
import TableHeaderOperation from '@/components/advanced/table-header-operation.vue';
import { ref } from 'vue';
import { enableStatusRecord } from '@/constants/business';
import { fetchGetRoleList } from '@/service/api';
import { $t } from '@/locales';
import { defaultTransform, useTableOperate, useVuetifyPaginatedTable } from '@/hooks/common/table';
import RoleOperateDrawer from './modules/role-operate-drawer.vue';
import RoleSearch from './modules/role-search.vue';

const searchParams = ref<Api.SystemManage.RoleSearchParams>({
  current: 1,
  size: 10,
  roleName: null,
  roleCode: null,
  status: null
});

const { columns, columnChecks, data, loading, getData, getDataByPage, pagination, showSelect } =
  useVuetifyPaginatedTable({
    api: () => fetchGetRoleList(searchParams.value),
    transform: response => defaultTransform(response),
    showSelect: true,
    onPaginationParamsChange: params => {
      searchParams.value.current = params.page;
      searchParams.value.size = params.pageSize;
    },
    columns: () => [
      {
        key: 'index',
        title: $t('common.index'),
        width: 64,
        align: 'center'
      },
      {
        key: 'roleName',
        title: $t('page.manage.role.roleName'),
        align: 'center',
        minWidth: 120
      },
      {
        key: 'roleCode',
        title: $t('page.manage.role.roleCode'),
        align: 'center',
        minWidth: 120
      },
      {
        key: 'roleDesc',
        title: $t('page.manage.role.roleDesc'),
        minWidth: 120
      },
      {
        key: 'status',
        title: $t('page.manage.role.roleStatus'),
        align: 'center',
        width: 100
      },
      {
        key: 'operate',
        title: $t('common.operate'),
        align: 'center',
        width: 150,
        sortable: false
      }
    ]
  });

const {
  drawerVisible,
  operateType,
  editingData,
  handleAdd,
  handleEdit,
  checkedRowKeys,
  onBatchDeleted,
  onDeleted
  // closeDrawer
} = useTableOperate(data, 'id', getData);

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

function edit(id: number) {
  handleEdit(id);
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-4 overflow-hidden lt-sm:overflow-auto">
    <RoleSearch v-model:model="searchParams" @search="getDataByPage" />
    <VCard class="card-wrapper flex-col sm:flex-1-hidden">
      <VCardTitle class="flex flex-wrap items-center justify-between gap-2">
        <span>{{ $t('page.manage.role.title') }}</span>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          @add="handleAdd"
          @delete="handleBatchDelete"
          @refresh="getData"
        />
      </VCardTitle>
      <div class="min-h-0 flex-1 overflow-y-auto">
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
          fixed-header
        >
          <template #item.index="{ index }">
            {{ index + 1 }}
          </template>
          <template #item.status="{ item }">
            <VChip
              v-if="item.status !== null"
              :color="item.status === '1' ? 'success' : 'warning'"
              size="small"
              variant="tonal"
            >
              {{ $t(enableStatusRecord[item.status]) }}
            </VChip>
          </template>
          <template #item.operate="{ item }">
            <div class="flex-center gap-2">
              <VBtn size="small" variant="outlined" color="primary" @click="edit(item.id)">
                {{ $t('common.edit') }}
              </VBtn>
              <VBtn size="small" variant="outlined" color="error" @click="handleDelete(item.id)">
                {{ $t('common.delete') }}
              </VBtn>
            </div>
          </template>
        </VDataTableServer>
      </div>
    </VCard>
    <RoleOperateDrawer
      v-model:visible="drawerVisible"
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
