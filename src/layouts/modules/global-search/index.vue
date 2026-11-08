<script lang="ts" setup>
import { computed, shallowRef } from 'vue';
import { useRouter } from 'vue-router';
import { VCommandPalette } from 'vuetify/labs/VCommandPalette';
import { useAppStore } from '@/store/modules/app';
import { useThemeStore } from '@/store/modules/theme';
import { useRouteStore } from '@/store/modules/route';
import { $t } from '@/locales';
import { resolveMdiIcon } from '@/utils/icon';
import SearchFooter from './components/search-footer.vue';

defineOptions({ name: 'GlobalSearch' });

/** The item of the command palette */
interface SearchItem {
  /** The menu title */
  title: string;
  /** The route path of the menu */
  subtitle: string;
  /** The route path to jump to */
  routePath: string;
  /** The Material Design Icons name */
  mdiIcon?: string;
  /** The local svg icon name */
  localIcon?: string;

  appendIcon?: string;
}

const router = useRouter();
const appStore = useAppStore();
const themeStore = useThemeStore();
const routeStore = useRouteStore();

const isMobile = computed(() => appStore.isMobile);

/** Search-first: the palette lists nothing until the user types a query. */
const keyword = shallowRef('');

/**
 * Query shared by the palette (`v-model:search`) and its custom input.
 *
 * VTextField's `clearable` button resets the model to `null`, which would make
 * `keyword.value.trim()` throw; normalize it back to an empty string.
 */
const search = computed<string, string | null>({
  get: () => keyword.value,
  set: value => {
    keyword.value = value ?? '';
  }
});

type KeydownHandler = (event: KeyboardEvent) => void;

function isKeydownHandler(value: unknown): value is KeydownHandler {
  return typeof value === 'function';
}

/**
 * VCommandPalette executes the selected item on Enter. While an IME composition is
 * active (typing Chinese, Japanese, …) Enter only commits the composition, so the
 * palette's keydown handler must not run — otherwise the palette navigates away.
 */
function withImeGuard(inputProps: Record<string, unknown>): Record<string, unknown> {
  const { onKeydown, ...rest } = inputProps;

  return {
    ...rest,
    onKeydown: (event: KeyboardEvent) => {
      // Keys typed while an IME composition is active (e.g. the Enter that commits
      // pinyin) belong to the input method, not to the palette.
      if (event.isComposing) {
        return;
      }

      if (isKeydownHandler(onKeydown)) {
        onKeydown(event);
      }
    }
  };
}

/** The search menus of the route store, it is filtered by VCommandPalette itself */
const items = computed<SearchItem[]>(() => {
  if (search.value.trim() === '') {
    return [];
  }
  return routeStore.searchMenus.map(menu => ({
    title: (menu.i18nKey && $t(menu.i18nKey)) || menu.label,
    subtitle: menu.routePath,
    routePath: menu.routePath,
    mdiIcon: resolveMdiIcon(menu.icon),
    localIcon: menu.localIcon,
    appendIcon: '$enter',
    onClick: () => handleSelect(menu)
  }));
});

/** The palette item is the search item, cast it for typing */
function toSearchItem(item: unknown) {
  return item as SearchItem;
}

function handleSelect(item: unknown) {
  router.push(toSearchItem(item).routePath);
}

const borderRadius = computed(() => `rounded-${themeStore.themeRadius}px`);
</script>

<template>
  <VCommandPalette
    v-model:search="search"
    :items="items"
    hotkey="meta+k"
    :list-props="{
      nav: true,
      color: 'primary',
      prependGap: 10
    }"
    offset-top="10vh"
    :class="borderRadius"
    @click:item="handleSelect"
  >
    <template #activator="{ props }">
      <VBtn v-bind="props" class="text-medium-emphasis" prepend-icon="mdi-magnify" :text="$t('common.search')">
        <template #append>
          <VHotkey color="text-medium-emphasis " display-mode="icon" keys="meta+k" platform="auto" variant="outlined" />
        </template>
      </VBtn>
    </template>
    <template #input="{ props: inputProps }">
      <VTextField
        v-model="search"
        v-bind="withImeGuard(inputProps)"
        autocomplete="off"
        :placeholder="$t('common.searchPlaceholder')"
        prepend-inner-icon="mdi-magnify"
        variant="filled"
        density="comfortable"
        clearable
        hide-details
      ></VTextField>
    </template>
    <template #item.prepend="{ item }">
      <SvgIcon v-if="toSearchItem(item).localIcon" :local-icon="toSearchItem(item).localIcon" size="18" />
      <VIcon v-else :icon="toSearchItem(item).mdiIcon" size="18" />
    </template>
    <template #no-data>
      <span v-if="search.trim() !== ''">{{ $t('common.searchEmpty') }}</span>
      <VEmptyState v-else icon="mdi-magnify" :text="$t('common.searchPrompt')" />
    </template>
    <template #append>
      <template v-if="!isMobile">
        <VDivider />
        <SearchFooter />
      </template>
    </template>
  </VCommandPalette>
</template>

<style lang="scss" scoped></style>
