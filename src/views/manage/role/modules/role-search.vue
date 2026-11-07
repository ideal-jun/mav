<script setup lang="ts">
import { computed, ref, toRaw } from 'vue';
import { jsonClone } from '@sa/utils';
import { enableStatusOptions } from '@/constants/business';
import { translateOptions } from '@/utils/common';
import { $t } from '@/locales';

defineOptions({
  name: 'RoleSearch'
});

interface Emits {
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const model = defineModel<Api.SystemManage.RoleSearchParams>('model', { required: true });

const enableStatusItems = computed(() =>
  translateOptions(enableStatusOptions).map(item => ({ title: item.label, value: item.value }))
);

const expanded = ref<string[]>(['role-search']);

const defaultModel = jsonClone(toRaw(model.value));

function resetModel() {
  Object.assign(model.value, defaultModel);
}

function search() {
  emit('search');
}
</script>

<template>
  <VCard class="card-wrapper">
    <VExpansionPanels v-model="expanded" variant="accordion">
      <VExpansionPanel value="role-search" :title="$t('common.search')">
        <VExpansionPanelText>
          <VForm @submit.prevent="search">
            <VRow>
              <VCol cols="12" sm="12" md="6" class="pr-6">
                <VTextField
                  v-model="model.roleName"
                  :label="$t('page.manage.role.roleName')"
                  :placeholder="$t('page.manage.role.form.roleName')"
                />
              </VCol>
              <VCol cols="12" sm="12" md="6" class="pr-6">
                <VTextField
                  v-model="model.roleCode"
                  :label="$t('page.manage.role.roleCode')"
                  :placeholder="$t('page.manage.role.form.roleCode')"
                />
              </VCol>
              <VCol cols="12" sm="12" md="6" class="pr-6">
                <VSelect
                  v-model="model.status"
                  :label="$t('page.manage.role.roleStatus')"
                  :placeholder="$t('page.manage.role.form.roleStatus')"
                  :items="enableStatusItems"
                  clearable
                />
              </VCol>
              <VCol cols="12" sm="12" md="6" class="pr-6">
                <div class="flex h-full items-center justify-end gap-2">
                  <VBtn variant="text" prepend-icon="mdi-refresh" @click="resetModel">
                    {{ $t('common.reset') }}
                  </VBtn>
                  <VBtn color="primary" variant="outlined" prepend-icon="mdi-magnify" @click="search">
                    {{ $t('common.search') }}
                  </VBtn>
                </div>
              </VCol>
            </VRow>
          </VForm>
        </VExpansionPanelText>
      </VExpansionPanel>
    </VExpansionPanels>
  </VCard>
</template>

<style scoped></style>
