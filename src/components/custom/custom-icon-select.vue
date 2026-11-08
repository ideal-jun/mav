<script setup lang="ts">
defineOptions({
  name: 'CustomIconSelect'
});

interface Props {
  /** Material Design Icons (MDI) icon names */
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
            <VIcon :icon="item" size="20" />
          </template>
          <VListItemTitle>{{ item }}</VListItemTitle>
        </VListItem>
      </template>
      <template #selection="{ item }">
        <div class="flex items-center gap-2">
          <VIcon :icon="item" size="20" />
          <span>{{ item }}</span>
        </div>
      </template>
    </VSelect>
    <VIcon v-if="value" :icon="value" size="40" class="text-primary" />
  </div>
</template>

<style scoped></style>
