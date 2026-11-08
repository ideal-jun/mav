<script setup lang="ts">
defineOptions({ name: 'MenuGroup' });

interface Props {
  menu: App.Global.Menu;
}

defineProps<Props>();
</script>

<template>
  <VListGroup :value="menu.key">
    <template #activator="{ props: activatorProps }">
      <VListItem v-bind="activatorProps" :value="menu.key" :title="menu.label" :prepend-icon="menu.icon"></VListItem>
    </template>
    <template v-for="child in menu.children" :key="child.key">
      <MenuGroup v-if="child.children?.length" :menu="child" />
      <VListItem
        v-else
        :value="child.key"
        :title="child.label"
        :prepend-icon="child.icon"
        :to="child.routePath"
      ></VListItem>
    </template>
  </VListGroup>
</template>

<style scoped></style>
