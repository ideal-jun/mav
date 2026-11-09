<script setup lang="ts">
import { computed, toRaw } from 'vue';
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
    <VExpansionPanels variant="accordion">
      <VExpansionPanel :title="$t('common.search')">
        <VExpansionPanelText>
          <VForm @submit.prevent="search">
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <VTextField
                v-model="model.roleName"
                :label="$t('page.manage.role.roleName')"
                :placeholder="$t('page.manage.role.form.roleName')"
                density="compact"
                hide-details="auto"
              />
              <VTextField
                v-model="model.roleCode"
                :label="$t('page.manage.role.roleCode')"
                :placeholder="$t('page.manage.role.form.roleCode')"
                density="compact"
                hide-details="auto"
              />
              <VSelect
                v-model="model.status"
                :label="$t('page.manage.role.roleStatus')"
                :placeholder="$t('page.manage.role.form.roleStatus')"
                :items="enableStatusItems"
                clearable
                density="compact"
                hide-details="auto"
              />
              <div class="flex items-end justify-end gap-2">
                <VBtn variant="text" prepend-icon="mdi-refresh" @click="resetModel">{{ $t('common.reset') }}</VBtn>
                <VBtn color="primary" variant="outlined" prepend-icon="mdi-magnify" @click="search">
                  {{ $t('common.search') }}
                </VBtn>
              </div>
            </div>
          </VForm>
        </VExpansionPanelText>
      </VExpansionPanel>
    </VExpansionPanels>
  </VCard>
</template>

<style scoped></style>
