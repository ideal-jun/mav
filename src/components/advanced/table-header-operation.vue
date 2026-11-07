<script setup lang="ts">
import { computed, ref } from 'vue';
import type { TableColumnCheck } from '@sa/hooks';
import { $t } from '@/locales';

defineOptions({
  name: 'TableHeaderOperation'
});

interface Props {
  itemAlign?: 'start' | 'center' | 'end';
  disabledDelete?: boolean;
  loading?: boolean;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'add'): void;
  (e: 'delete'): void;
  (e: 'refresh'): void;
}

const emit = defineEmits<Emits>();

const columns = defineModel<TableColumnCheck[]>('columns', {
  default: () => []
});

const confirmDeleteVisible = ref(false);

const alignClass = computed(() => {
  if (props.itemAlign === 'start') return 'justify-start';

  if (props.itemAlign === 'center') return 'justify-center';

  return 'justify-end';
});

function add() {
  emit('add');
}

function batchDelete() {
  confirmDeleteVisible.value = false;
  emit('delete');
}

function refresh() {
  emit('refresh');
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-2 lt-sm:w-200px" :class="alignClass">
    <slot name="prefix"></slot>
    <slot name="default">
      <VBtn size="small" variant="outlined" color="primary" prepend-icon="mdi-plus" @click="add">
        {{ $t('common.add') }}
      </VBtn>
      <VBtn
        size="small"
        variant="outlined"
        color="error"
        prepend-icon="mdi-delete"
        :disabled="disabledDelete"
        @click="confirmDeleteVisible = true"
      >
        {{ $t('common.batchDelete') }}
      </VBtn>
    </slot>
    <VBtn size="small" variant="text" @click="refresh">
      <template #prepend>
        <VIcon icon="mdi-refresh" :class="{ 'animate-spin': loading }" />
      </template>
      {{ $t('common.refresh') }}
    </VBtn>
    <TableColumnSetting v-model:columns="columns" />
    <slot name="suffix"></slot>
  </div>

  <VDialog v-model="confirmDeleteVisible" max-width="400">
    <VCard>
      <VCardTitle>{{ $t('common.tip') }}</VCardTitle>
      <VCardText>{{ $t('common.confirmDelete') }}</VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="confirmDeleteVisible = false">{{ $t('common.cancel') }}</VBtn>
        <VBtn color="error" variant="flat" @click="batchDelete">{{ $t('common.confirm') }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped></style>
