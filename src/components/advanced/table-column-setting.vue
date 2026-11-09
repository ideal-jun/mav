<script setup lang="ts" generic="T extends Record<string, unknown>, K = never">
import ButtonIcon from '@/components/custom/button-icon.vue';
import { computed } from 'vue';
import type { TableColumnCheck } from '@sa/hooks';
import { VueDraggable } from 'vue-draggable-plus';
import { $t } from '@/locales';

defineOptions({
  name: 'TableColumnSetting'
});

const columns = defineModel<TableColumnCheck[]>('columns', {
  required: true
});

const tooltipRecord: Record<TableColumnCheck['fixed'], App.I18n.I18nKey> = {
  left: 'datatable.fixed.right',
  right: 'datatable.fixed.unFixed',
  unFixed: 'datatable.fixed.left'
};

function handleFixed(column: TableColumnCheck) {
  const fixedOptions: TableColumnCheck['fixed'][] = ['left', 'right', 'unFixed'];
  const index = fixedOptions.findIndex(item => item === column.fixed);
  const nextIndex = index === fixedOptions.length - 1 ? 0 : index + 1;
  column.fixed = fixedOptions[nextIndex];
}

const visibleStats = computed(() => {
  let total = 0;
  let checked = 0;

  columns.value.forEach(column => {
    if (!column.visible) return;

    total += 1;
    if (column.checked) checked += 1;
  });

  return { total, checked };
});

const selectAllChecked = computed(() => {
  const { total, checked } = visibleStats.value;

  return total > 0 && checked === total;
});

const selectAllIndeterminate = computed(() => {
  const { total, checked } = visibleStats.value;

  return checked > 0 && checked < total;
});

function toggleSelectAll(checked: boolean) {
  columns.value.forEach(column => {
    if (!column.visible) return;

    column.checked = checked;
  });
}

function toggleColumn(column: TableColumnCheck) {
  column.checked = !column.checked;
}
</script>

<template>
  <VMenu location="bottom end" :close-on-content-click="false">
    <template #activator="{ props: activatorProps }">
      <VBtn v-bind="activatorProps" size="small" variant="text" prepend-icon="mdi-cog-outline">
        {{ $t('common.columnSetting') }}
      </VBtn>
    </template>
    <VList class="min-w-[240px]" density="compact" nav prepend-gap="10">
      <VListItem class="none_draggable" min-height="32">
        <template #prepend>
          <VCheckbox
            :model-value="selectAllChecked"
            :indeterminate="selectAllIndeterminate"
            :disabled="visibleStats.total === 0"
            hide-details
            density="compact"
            @update:model-value="value => toggleSelectAll(Boolean(value))"
          />
        </template>
        <VListItemTitle>{{ $t('common.selectAll') }}</VListItemTitle>
      </VListItem>
      <VDivider />
      <VueDraggable v-model="columns" :animation="150" filter=".none_draggable" class="max-h-[320px] overflow-y-auto">
        <VListItem
          v-for="item in columns"
          :key="item.key"
          class="justify-between mt-0"
          min-height="32"
          :class="{ hidden: !item.visible }"
          density="compact"
        >
          <template #prepend>
            <VIcon icon="mdi-drag" size="small" class="mr-1 cursor-move" />
            <VCheckbox v-model="item.checked" class="none_draggable shrink-0" hide-details density="compact" />
          </template>
          <VListItemTitle class="min-w-0 truncate text-sm" @click="toggleColumn(item)">
            <component :is="item.title" v-if="typeof item.title === 'function'" />
            <template v-else>{{ item.title }}</template>
          </VListItemTitle>
          <template #append>
            <ButtonIcon
              :disabled="!item.checked"
              :tooltip-content="$t(tooltipRecord[item.fixed])"
              @click="handleFixed(item)"
            >
              <VIcon v-if="item.fixed === 'unFixed'" icon="mdi-pin-outline" size="small" />
              <VIcon v-else-if="item.fixed === 'left'" icon="mdi-pin" size="small" class="rotate-270" />
              <VIcon v-else icon="mdi-pin-off" size="small" />
            </ButtonIcon>
          </template>
        </VListItem>
      </VueDraggable>
    </VList>
  </VMenu>
</template>

<style scoped></style>
