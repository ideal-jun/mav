<script setup lang="ts">
import TableHeaderOperation from '@/components/advanced/table-header-operation.vue';
import { ref } from 'vue';
import { enableStatusRecord, userGenderRecord } from '@/constants/business';
import { fetchGetUserList } from '@/service/api';
import { $t } from '@/locales';
import { defaultTransform, useTableOperate, useVuetifyPaginatedTable } from '@/hooks/common/table';
import UserOperateDrawer from './modules/user-operate-drawer.vue';
import UserSearch from './modules/user-search.vue';

const searchParams = ref<Api.SystemManage.UserSearchParams>({
  current: 1,
  size: 10,
  status: null,
  userName: null,
  userGender: null,
  nickName: null,
  userPhone: null,
  userEmail: null
});

const { columns, columnChecks, data, getData, getDataByPage, loading, pagination, showSelect } =
  useVuetifyPaginatedTable({
    api: () => fetchGetUserList(searchParams.value),
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
        align: 'center',
        width: 80,
        sortable: false
      },
      {
        key: 'userName',
        title: $t('page.manage.user.userName'),
        align: 'center',
        minWidth: 100
      },
      {
        key: 'userGender',
        title: $t('page.manage.user.userGender'),
        align: 'center',
        width: 100
      },
      {
        key: 'nickName',
        title: $t('page.manage.user.nickName'),
        align: 'center',
        minWidth: 100
      },
      {
        key: 'userPhone',
        title: $t('page.manage.user.userPhone'),
        align: 'center',
        width: 120
      },
      {
        key: 'userEmail',
        title: $t('page.manage.user.userEmail'),
        align: 'center',
        minWidth: 200
      },
      {
        key: 'status',
        title: $t('page.manage.user.userStatus'),
        align: 'center',
        width: 112
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
  <div class="flex h-full min-h-0 flex-col gap-4">
    <UserSearch v-model:model="searchParams" class="shrink-0" @search="getDataByPage" />
    <VCard class="card-wrapper flex min-h-0 flex-1 flex-col">
      <VCardTitle class="flex shrink-0 flex-wrap items-center justify-between gap-2">
        <span>{{ $t('page.manage.user.title') }}</span>
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
          <template #item.index="{ index }">
            {{ index + 1 }}
          </template>
          <template #item.userGender="{ item }">
            <VChip
              v-if="item.userGender !== null"
              :color="item.userGender === '1' ? 'primary' : 'error'"
              size="small"
              variant="tonal"
            >
              {{ $t(userGenderRecord[item.userGender]) }}
            </VChip>
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
            <div class="flex items-center justify-end whitespace-nowrap">
              <VBtn size="small" variant="text" color="primary" @click="edit(item.id)">
                {{ $t('common.edit') }}
              </VBtn>
              <VBtn size="small" variant="text" color="error" @click="handleDelete(item.id)">
                {{ $t('common.delete') }}
              </VBtn>
            </div>
          </template>
        </VDataTableServer>
      </div>
    </VCard>
    <UserOperateDrawer
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
