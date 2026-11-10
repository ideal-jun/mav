<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { download } from '@/utils/download';
import { request } from '@/service/request';

defineOptions({
  name: 'UserImportDialog'
});

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', { default: false });

const files = ref<File | File[] | null>(null);
const updateSupport = ref(false);
const submitting = ref(false);

const selectedFile = computed<File | null>(() => {
  if (!files.value) return null;

  return Array.isArray(files.value) ? (files.value[0] ?? null) : files.value;
});

function reset() {
  files.value = null;
  updateSupport.value = false;
}

async function handleTemplate() {
  await download('/system/user/importTemplate', {}, `user_template_${Date.now()}.xlsx`);
}

async function submit() {
  const file = selectedFile.value;

  if (!file) {
    window.$message?.warning('请选择要导入的 Excel 文件');
    return;
  }

  submitting.value = true;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('updateSupport', String(updateSupport.value));

  const { error } = await request({
    url: '/system/user/importData',
    method: 'post',
    data: formData
  });

  submitting.value = false;

  if (!error) {
    window.$message?.success('导入成功');
    visible.value = false;
    reset();
    emit('submitted');
  }
}

watch(visible, value => {
  if (value) {
    reset();
  }
});
</script>

<template>
  <VDialog v-model="visible" max-width="520">
    <VCard>
      <VCardTitle class="text-h6">用户导入</VCardTitle>
      <VDivider />
      <VCardText class="pa-4">
        <VFileInput
          v-model="files"
          label="选择 Excel 文件"
          accept=".xlsx,.xls"
          prepend-icon="mdi-upload"
          variant="outlined"
          density="compact"
          :disabled="submitting"
          hide-details
        />
        <div class="pt-3 text-body-2 text-medium-emphasis">仅允许导入 xls、xlsx 格式文件。</div>
        <VCheckbox v-model="updateSupport" label="是否更新已经存在的用户数据" density="compact" hide-details />
        <div class="pt-2">
          <VBtn size="small" variant="text" color="primary" prepend-icon="mdi-download" @click="handleTemplate">
            下载模板
          </VBtn>
        </div>
      </VCardText>
      <VDivider />
      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="visible = false">取消</VBtn>
        <VBtn color="primary" variant="flat" :loading="submitting" @click="submit">确定</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped></style>
