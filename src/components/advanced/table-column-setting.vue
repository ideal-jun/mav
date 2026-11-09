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
</script>

<template>
  <VMenu location="bottom end" :close-on-content-click="false">
    <template #activator="{ props: activatorProps }">
      <VBtn v-bind="activatorProps" size="small" variant="text" prepend-icon="mdi-cog-outline">
        {{ $t('common.columnSetting') }}
      </VBtn>
    </template>
    <VCard class="min-w-[220px] p-2" max-height="300">
      <div class="flex items-center px-2">
        <VCheckbox
          :model-value="selectAllChecked"
          :indeterminate="selectAllIndeterminate"
          :disabled="visibleStats.total === 0"
          :label="$t('common.selectAll')"
          hide-details
          density="compact"
          @update:model-value="value => toggleSelectAll(Boolean(value))"
        />
      </div>
      <VDivider class="my-1" />
      <VueDraggable v-model="columns" :animation="150" filter=".none_draggable" class="max-h-[200px] overflow-y-auto">
        <div
          v-for="item in columns"
          :key="item.key"
          class="flex items-center justify-between gap-2"
          :class="{ hidden: !item.visible }"
        >
          <div class="flex min-w-0 flex-1 items-center">
            <VIcon icon="mdi-drag" size="small" class="mr-2 cursor-move" />
            <VCheckbox v-model="item.checked" class="none_draggable flex-1" hide-details density="compact">
              <template v-if="typeof item.title === 'function'">
                <component :is="item.title" />
              </template>
              <template v-else>{{ item.title }}</template>
            </VCheckbox>
          </div>
          <ButtonIcon
            :disabled="!item.checked"
            :tooltip-content="$t(tooltipRecord[item.fixed])"
            @click="handleFixed(item)"
          >
            <VIcon v-if="item.fixed === 'unFixed'" icon="mdi-pin-outline" size="small" />
            <VIcon v-else-if="item.fixed === 'left'" icon="mdi-pin" size="small" class="rotate-270" />
            <VIcon v-else icon="mdi-pin-off" size="small" />
          </ButtonIcon>
        </div>
      </VueDraggable>
    </VCard>
  </VMenu>
</template>

<style scoped></style>
