<script setup lang="ts">
import { computed, defineComponent } from 'vue';
import type { PropType, VNode } from 'vue';
import { $t } from '@/locales';
import { appServiceState, finishDialog, removeMessage, removeNotification } from '@/plugins/app-services';

defineOptions({
  name: 'AppProvider'
});

/** Renders a VNode produced outside of a component render scope */
const VNodeRenderer = defineComponent({
  name: 'VNodeRenderer',
  props: {
    node: { type: [Object, Function] as PropType<VNode | (() => VNode)>, required: true }
  },
  setup(props) {
    return () => (typeof props.node === 'function' ? props.node() : props.node);
  }
});

const dialogOptions = computed(() => appServiceState.dialog.options);

const dialogOpen = computed({
  get: () => appServiceState.dialog.open,
  set: value => {
    if (!value) {
      finishDialog(false);
    }
  }
});

const dialogTitle = computed(() => dialogOptions.value.title ?? '');
const dialogContent = computed(() => dialogOptions.value.content ?? '');
const dialogPositiveText = computed(() => dialogOptions.value.positiveText ?? $t('common.confirm'));
const dialogNegativeText = computed(() => dialogOptions.value.negativeText ?? '');
const dialogPersistent = computed(() => dialogOptions.value.maskClosable === false);

const loadingColor = computed(() => (appServiceState.loadingBar.error ? 'error' : 'primary'));
</script>

<template>
  <slot />

  <!-- global loading bar -->
  <div v-if="appServiceState.loadingBar.active" class="app-loading-bar">
    <VProgressLinear :indeterminate="!appServiceState.loadingBar.error" :color="loadingColor" height="3" />
  </div>

  <!-- messages (top center) -->
  <div class="app-toast-layer app-toast-layer--top">
    <TransitionGroup name="app-toast">
      <VAlert
        v-for="item in appServiceState.messages"
        :key="item.id"
        :type="item.type"
        variant="elevated"
        density="compact"
        class="app-message"
        closable
        @click:close="removeMessage(item.id)"
      >
        {{ item.content }}
      </VAlert>
    </TransitionGroup>
  </div>

  <!-- notifications (top right) -->
  <div class="app-toast-layer app-toast-layer--right">
    <TransitionGroup name="app-toast">
      <VCard v-for="item in appServiceState.notifications" :key="item.id" class="app-notification" elevation="8">
        <VCardItem v-if="item.options.title" class="pb-0">
          <template #title>
            <span class="text-body-1 font-weight-medium">{{ item.options.title }}</span>
          </template>
          <template #append>
            <VBtn icon="mdi-close" variant="text" size="x-small" @click="removeNotification(item.id)" />
          </template>
        </VCardItem>
        <VCardText class="text-body-2 whitespace-pre-wrap">{{ item.options.content }}</VCardText>
        <VCardActions v-if="item.options.action" class="pt-0">
          <VNodeRenderer :node="item.options.action" />
        </VCardActions>
      </VCard>
    </TransitionGroup>
  </div>

  <!-- imperative dialog -->
  <VDialog v-model="dialogOpen" max-width="480" :persistent="dialogPersistent">
    <VCard>
      <VCardItem v-if="dialogTitle" class="pb-0">
        <template #title>
          <span class="text-h6">{{ dialogTitle }}</span>
        </template>
      </VCardItem>
      <VCardText class="whitespace-pre-wrap">{{ dialogContent }}</VCardText>
      <VCardActions class="px-4 pb-4">
        <VSpacer />
        <VBtn v-if="dialogNegativeText" variant="text" @click="finishDialog(false)">{{ dialogNegativeText }}</VBtn>
        <VBtn color="primary" variant="flat" @click="finishDialog(true)">{{ dialogPositiveText }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.app-loading-bar {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 9999;
}

.app-toast-layer {
  position: fixed;
  z-index: 9998;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}

.app-toast-layer > * {
  pointer-events: auto;
}

.app-toast-layer--top {
  top: 16px;
  left: 50%;
  width: min(480px, calc(100vw - 32px));
  transform: translateX(-50%);
  align-items: stretch;
}

.app-toast-layer--right {
  top: 16px;
  right: 16px;
  width: min(360px, calc(100vw - 32px));
  align-items: stretch;
}

.app-message {
  width: 100%;
}

.app-notification {
  width: 100%;
  background: rgb(var(--v-theme-surface));
}

.app-toast-enter-active,
.app-toast-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.app-toast-enter-from,
.app-toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
