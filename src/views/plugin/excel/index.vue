<script setup lang="ts">
import { ref } from 'vue';
import { utils, writeFile } from 'xlsx';
import { enableStatusRecord, userGenderRecord } from '@/constants/business';
import { fetchGetUserList } from '@/service/api';
import { $t } from '@/locales';
import { useVuetifyTable } from '@/hooks/common/table';
import type { TableColumn } from '@/hooks/common/table';

const searchParams = ref<Api.SystemManage.UserSearchParams>({
  current: 1,
  size: 999,
  status: null,
  userName: null,
  userGender: null,
  nickName: null,
  userPhone: null,
  userEmail: null
});

const { columns, data, loading, showSelect } = useVuetifyTable({
  api: () => fetchGetUserList(searchParams.value),
  transform: response => {
    const { data: list, error } = response;

    if (!error) {
      return list.records;
    }

    return [];
  },
  showSelect: true,
  columns: () => [
    {
      key: 'index',
      title: $t('common.index'),
      align: 'center',
      width: 64
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
      width: 100
    }
  ]
});

/** the selected rows of the table, it is only used to keep the selection column available */
const selected = ref<number[]>([]);

function exportExcel() {
  const exportColumns = columns.value.filter(column => column.key !== 'index');

  const excelList = data.value.map(item => exportColumns.map(col => getTableValue(col, item)));

  const titleList = exportColumns.map(col => col.title ?? null);

  excelList.unshift(titleList);

  const workBook = utils.book_new();

  const workSheet = utils.aoa_to_sheet(excelList);

  workSheet['!cols'] = exportColumns.map(item => ({
    width: Math.round(Number(item.width) / 10 || 20)
  }));

  utils.book_append_sheet(workBook, workSheet, '用户列表');

  writeFile(workBook, '用户数据.xlsx');
}

function getTableValue(col: TableColumn, item: Api.SystemManage.User) {
  const { key } = col;

  if (key === 'userRoles') {
    return item.userRoles.map(role => role).join(',');
  }

  if (key === 'status') {
    return (item.status && $t(enableStatusRecord[item.status])) || null;
  }

  if (key === 'userGender') {
    return (item.userGender && $t(userGenderRecord[item.userGender])) || null;
  }

  // @ts-expect-error the key is not in the type of Api.SystemManage.User
  return item[key] || null;
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-4 overflow-hidden lt-sm:overflow-auto">
    <VCard class="card-wrapper flex-col sm:flex-1-hidden">
      <VCardTitle class="flex flex-wrap items-center justify-between gap-2">
        <span>Excel导出</span>
        <VBtn size="small" variant="outlined" color="primary" prepend-icon="mdi-file-excel" @click="exportExcel">
          导出excel
        </VBtn>
      </VCardTitle>
      <div class="min-h-0 flex-1 overflow-y-auto">
        <VDataTable
          v-model="selected"
          :headers="columns"
          :items="data"
          :loading="loading"
          :show-select="showSelect"
          :items-per-page="-1"
          item-value="id"
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
        </VDataTable>
      </div>
    </VCard>
  </div>
</template>

<style scoped></style>
