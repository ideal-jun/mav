<script setup lang="ts">
import { computed, shallowRef } from 'vue';
import { $t } from '@/locales';

defineOptions({
  name: 'ButtonAuthModal'
});

interface Props {
  /** the roleId */
  roleId: number;
}

const props = defineProps<Props>();

const visible = defineModel<boolean>('visible', {
  default: false
});

function closeModal() {
  visible.value = false;
}

const title = computed(() => $t('common.edit') + $t('page.manage.role.buttonAuth'));

type ButtonConfig = {
  id: number;
  label: string;
  code: string;
};

const tree = shallowRef<ButtonConfig[]>([]);

async function getAllButtons() {
  // request
  tree.value = [
    { id: 1, label: 'button1', code: 'code1' },
    { id: 2, label: 'button2', code: 'code2' },
    { id: 3, label: 'button3', code: 'code3' },
    { id: 4, label: 'button4', code: 'code4' },
    { id: 5, label: 'button5', code: 'code5' },
    { id: 6, label: 'button6', code: 'code6' },
    { id: 7, label: 'button7', code: 'code7' },
    { id: 8, label: 'button8', code: 'code8' },
    { id: 9, label: 'button9', code: 'code9' },
    { id: 10, label: 'button10', code: 'code10' }
  ];
}

const checks = shallowRef<number[]>([]);

async function getChecks() {
  console.log(props.roleId);
  // request
  checks.value = [1, 2, 3, 4, 5];
}

function handleSubmit() {
  console.log(checks.value, props.roleId);
  // request

  window.$message?.success?.($t('common.modifySuccess'));

  closeModal();
}

function init() {
  getAllButtons();
  getChecks();
}

// init
init();
</script>

<template>
  <VDialog v-model="visible" max-width="480">
    <VCard>
      <VCardTitle>{{ title }}</VCardTitle>
      <VCardText>
        <div class="h-280px overflow-y-auto">
          <VTreeview
            v-model:selected="checks"
            :items="tree"
            item-title="label"
            item-value="id"
            selectable
            select-strategy="classic"
            open-on-click
            density="compact"
          />
        </div>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="closeModal">{{ $t('common.cancel') }}</VBtn>
        <VBtn color="primary" variant="flat" @click="handleSubmit">{{ $t('common.confirm') }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped></style>
