<script lang="ts" setup>
import { $t } from '@/locales';

defineOptions({ name: 'SearchResult' });

interface Props {
  options: App.Global.Menu[];
}

defineProps<Props>();

type Emits = {
  (e: 'enter'): void;
};

const emit = defineEmits<Emits>();

const active = defineModel<string>('path', { required: true });

function handleMouseEnter(item: App.Global.Menu) {
  active.value = item.routePath;
}

function handleTo() {
  emit('enter');
}
</script>

<template>
  <VList class="max-h-[50vh] overflow-y-auto" density="compact">
    <VListItem
      v-for="item in options"
      :key="item.routePath"
      :active="item.routePath === active"
      color="primary"
      @click="handleTo"
      @mouseenter="handleMouseEnter(item)"
    >
      <template v-if="item.icon" #prepend>
        <component :is="item.icon" />
      </template>
      <VListItemTitle>{{ (item.i18nKey && $t(item.i18nKey)) || item.label }}</VListItemTitle>
      <template #append>
        <VIcon icon="mdi-keyboard-return" size="18" />
      </template>
    </VListItem>
  </VList>
</template>

<style lang="scss" scoped></style>
