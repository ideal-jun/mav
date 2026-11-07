<script setup lang="ts">
defineOptions({
  name: 'CustomIconSelect'
});

interface Props {
  /** iconify icon names */
  icons: string[];
  /** select placeholder */
  placeholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请选择图标'
});

const value = defineModel<string>('value', { default: '' });
</script>

<template>
  <div class="flex items-center gap-4">
    <VSelect
      v-model="value"
      :items="props.icons"
      :placeholder="props.placeholder"
      density="compact"
      variant="outlined"
      hide-details
      clearable
      class="w-320px"
    >
      <template #item="{ item, props: itemProps }">
        <VListItem v-bind="itemProps" :title="undefined">
          <template #prepend>
            <SvgIcon :icon="item" class="text-20px" />
          </template>
          <VListItemTitle>{{ item }}</VListItemTitle>
        </VListItem>
      </template>
      <template #selection="{ item }">
        <div class="flex items-center gap-2">
          <SvgIcon :icon="item" class="text-20px" />
          <span>{{ item }}</span>
        </div>
      </template>
    </VSelect>
    <SvgIcon v-if="value" :icon="value" class="text-40px text-primary" />
  </div>
</template>

<style scoped></style>
