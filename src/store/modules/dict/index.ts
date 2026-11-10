import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getDictDataByType } from '@/service/api/ruoyi/dict';

/** The option of a dict type used by the pages and the `DictTag` component. */
export interface DictOption {
  label: string;
  value: string;
  /** the ruoyi tag color class: default / primary / success / info / warning / danger */
  listClass?: string;
  cssClass?: string;
  raw?: any;
}

export const useDictStore = defineStore('dict', () => {
  const dictCache = ref<Record<string, DictOption[]>>({});

  const pending = new Map<string, Promise<DictOption[]>>();

  /** Load the options of a dict type (cached). */
  async function getDict(dictType: string): Promise<DictOption[]> {
    if (dictCache.value[dictType]) {
      return dictCache.value[dictType];
    }

    const pendingTask = pending.get(dictType);

    if (pendingTask) {
      return pendingTask;
    }

    const task = (async () => {
      const { data, error } = await getDictDataByType(dictType);

      const options: DictOption[] =
        error || !data
          ? []
          : data.map((item: any) => ({
              label: item.dictLabel,
              value: item.dictValue,
              listClass: item.listClass,
              cssClass: item.cssClass,
              raw: item
            }));

      dictCache.value[dictType] = options;
      pending.delete(dictType);

      return options;
    })();

    pending.set(dictType, task);

    return task;
  }

  /** Clear the dict cache (called when the user logs out). */
  function resetDict() {
    dictCache.value = {};
    pending.clear();
  }

  return {
    dictCache,
    getDict,
    resetDict
  };
});
