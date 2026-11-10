import { reactive } from 'vue';
import { useDictStore } from '@/store/modules/dict';
import type { DictOption } from '@/store/modules/dict';

/**
 * Load the options of one or more dict types.
 *
 * @example
 * const dict = useDict('sys_normal_disable', 'sys_user_sex');
 * // dict.sys_normal_disable -> DictOption[]
 */
export function useDict<T extends string>(...dictTypes: T[]) {
  const dictStore = useDictStore();

  const dict = reactive<Record<string, DictOption[]>>({});

  dictTypes.forEach(dictType => {
    dict[dictType] = [];

    dictStore.getDict(dictType).then(options => {
      dict[dictType] = options;
    });
  });

  return dict as Record<T, DictOption[]>;
}

/** Convert the dict options to vuetify select items (`{ title, value }`). */
export function toSelectItems(options: DictOption[]) {
  return options.map(option => ({ title: option.label, value: option.value }));
}

/** Get the label of a dict value from the options. */
export function getDictLabel(options: DictOption[], value?: string | number | null) {
  if (value === undefined || value === null || value === '') {
    return '';
  }

  return options.find(option => option.value == `${value}`)?.label ?? `${value}`;
}
