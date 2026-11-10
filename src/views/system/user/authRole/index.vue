<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { TableColumn } from '@/hooks/common/table';
import type { RoleVO } from '@/service/api/ruoyi/system/role/types';
import { getAuthRole, updateAuthRole } from '@/service/api/ruoyi/system/user';
import type { UserVO } from '@/service/api/ruoyi/system/user/types';
import { parseTime } from '@/utils/ruoyi';

defineOptions({
  name: 'SystemUserAuthRole'
});

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const submitting = ref(false);
const user = ref<UserVO | null>(null);
const roles = ref<RoleVO[]>([]);
const selectedIds = ref<Array<string | number>>([]);
const page = ref(1);
const pageSize = ref(10);

const userId = computed(() => {
  const value = route.params.userId;
  return Array.isArray(value) ? value[0] : value;
});

const pageCount = computed(() => Math.max(1, Math.ceil(roles.value.length / pageSize.value)));

const pagedRoles = computed(() => roles.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value));

const headers: TableColumn[] = [
  { key: 'index', title: '序号', align: 'center', width: 70, sortable: false },
  { key: 'roleId', title: '角色编号', align: 'center', width: 130, sortable: false },
  { key: 'roleName', title: '角色名称', align: 'center', minWidth: 140, sortable: false },
  { key: 'roleKey', title: '权限字符', align: 'center', minWidth: 140, sortable: false },
  { key: 'createTime', title: '创建时间', align: 'center', width: 170, sortable: false },
  { key: 'selected', title: '选择', align: 'center', width: 80, sortable: false }
];

function isSelected(role: RoleVO) {
  return selectedIds.value.some(id => String(id) === String(role.roleId));
}

function toggleRole(role: RoleVO) {
  if (role.status !== '0') return;

  const index = selectedIds.value.findIndex(id => String(id) === String(role.roleId));

  if (index >= 0) {
    selectedIds.value.splice(index, 1);
  } else {
    selectedIds.value.push(role.roleId);
  }
}

async function getList() {
  if (!userId.value) return;

  loading.value = true;

  const { data, error } = await getAuthRole(userId.value);

  loading.value = false;

  if (error || !data) return;

  user.value = data.user;
  roles.value = data.roles ?? [];
  selectedIds.value = roles.value.filter(role => role.flag).map(role => role.roleId);
  page.value = 1;
}

async function submit() {
  if (!userId.value) return;

  submitting.value = true;

  const { error } = await updateAuthRole({
    userId: String(userId.value),
    roleIds: selectedIds.value.map(id => String(id)).join(',')
  });

  submitting.value = false;

  if (!error) {
    window.$message?.success('授权成功');
    router.push('/system/user');
  }
}

function goBack() {
  router.push('/system/user');
}

onMounted(() => {
  getList();
});
</script>

<template>
  <div class="flex h-full min-h-0 flex-col gap-4">
    <VCard class="card-wrapper shrink-0">
      <VCardTitle>基本信息</VCardTitle>
      <VCardText class="pt-0">
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <VTextField
            label="用户昵称"
            :model-value="user?.nickName ?? ''"
            density="compact"
            variant="outlined"
            readonly
            disabled
            hide-details
          />
          <VTextField
            label="登录账号"
            :model-value="user?.userName ?? ''"
            density="compact"
            variant="outlined"
            readonly
            disabled
            hide-details
          />
        </div>
      </VCardText>
    </VCard>

    <VCard class="card-wrapper flex min-h-0 flex-1 flex-col">
      <VCardTitle class="flex shrink-0 flex-wrap items-center justify-between gap-2">
        <span>角色信息</span>
        <div class="flex flex-wrap items-center gap-2">
          <VBtn color="primary" variant="flat" prepend-icon="mdi-check" :loading="submitting" @click="submit">
            提交
          </VBtn>
          <VBtn variant="outlined" prepend-icon="mdi-arrow-left" @click="goBack">返回</VBtn>
        </div>
      </VCardTitle>
      <div class="min-h-0 flex-1">
        <VDataTable
          :headers="headers"
          :items="pagedRoles"
          :loading="loading"
          item-value="roleId"
          :items-per-page="-1"
          fixed-header
          hide-default-footer
          hover
        >
          <template #item.index="{ index }">
            {{ (page - 1) * pageSize + index + 1 }}
          </template>
          <template #item.createTime="{ item }">
            {{ parseTime(item.createTime) || '-' }}
          </template>
          <template #item.selected="{ item }">
            <VCheckbox
              :model-value="isSelected(item)"
              :disabled="item.status !== '0'"
              density="compact"
              hide-details
              @update:model-value="toggleRole(item)"
            />
          </template>
          <template #no-data>
            <div class="py-6 text-center text-medium-emphasis">暂无数据</div>
          </template>
        </VDataTable>
      </div>
      <VDivider />
      <div class="flex shrink-0 flex-wrap items-center justify-end gap-2 px-4 py-2">
        <span class="pr-2 text-body-2 text-medium-emphasis">共 {{ roles.length }} 条</span>
        <VPagination v-model="page" :length="pageCount" :total-visible="5" density="compact" />
      </div>
    </VCard>
  </div>
</template>

<style scoped></style>
