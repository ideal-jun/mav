import { computed, effectScope, onScopeDispose, reactive, shallowRef, watch } from 'vue';
import type { Ref } from 'vue';
import { useBoolean, useTable } from '@sa/hooks';
import type { PaginationData, TableColumnCheck, UseTableOptions } from '@sa/hooks';
import type { FlatResponseData } from '@sa/axios';
import { jsonClone } from '@sa/utils';
import { useAppStore } from '@/store/modules/app';
import { $t } from '@/locales';

/**
 * A Vuetify data-table column (header) definition.
 *
 * The columns are consumed by Vuetify's `VDataTable` / `VDataTableServer` through the `headers` prop,
 * cell rendering is done with the `item.<key>` slots of the table component.
 */
export interface TableColumn {
  /** the unique key of the column, it maps to the `item.<key>` slot of the table */
  key: string;
  /** the column title */
  title?: string;
  /** the text alignment of the column */
  align?: 'start' | 'center' | 'end';
  /** the fixed width of the column */
  width?: number | string;
  /** the min width of the column */
  minWidth?: number | string;
  /** the max width of the column */
  maxWidth?: number | string;
  /** whether the column is sortable */
  sortable?: boolean;
  /** the fixed position of the column */
  fixed?: boolean | 'start' | 'end';
}

/**
 * The type of the table operation
 *
 * - add: add table item
 * - edit: edit table item
 */
export type TableOperateType = 'add' | 'edit';

/** the pagination params of the table api */
export interface TablePaginationParams {
  page: number;
  pageSize: number;
}

/** the pagination state shared with `VDataTableServer` */
export interface TablePagination extends TablePaginationParams {
  total: number;
}

export type UseVuetifyTableOptions<ResponseData, ApiData, Pagination extends boolean> = Omit<
  UseTableOptions<ResponseData, ApiData, TableColumn, Pagination>,
  'pagination' | 'getColumnChecks' | 'getColumns'
> & {
  /**
   * whether to show the selection column of the table
   *
   * @default false
   */
  showSelect?: boolean;
  /**
   * get column visible
   *
   * @param column
   *
   * @default true
   *
   * @returns true if the column is visible in the column setting panel, false otherwise
   */
  getColumnVisible?: (column: TableColumn) => boolean;
};

type UseVuetifyPaginatedTableOptions<ResponseData, ApiData> = UseVuetifyTableOptions<ResponseData, ApiData, true> & {
  /** the initial pagination state */
  paginationProps?: Partial<TablePaginationParams>;
  onPaginationParamsChange?: (params: TablePaginationParams) => void | Promise<void>;
};

export function useVuetifyTable<ResponseData, ApiData>(options: UseVuetifyTableOptions<ResponseData, ApiData, false>) {
  const scope = effectScope();
  const appStore = useAppStore();

  const result = useTable<ResponseData, ApiData, TableColumn, false>({
    ...options,
    pagination: false,
    getColumnChecks: cols => getColumnChecks(cols, options.getColumnVisible),
    getColumns
  });

  scope.run(() => {
    watch(
      () => appStore.locale,
      () => {
        result.reloadColumns();
      }
    );
  });

  onScopeDispose(() => {
    scope.stop();
  });

  return {
    ...result,
    showSelect: Boolean(options.showSelect)
  };
}

export function useVuetifyPaginatedTable<ResponseData, ApiData>(
  options: UseVuetifyPaginatedTableOptions<ResponseData, ApiData>
) {
  const scope = effectScope();
  const appStore = useAppStore();

  const pagination = reactive<TablePagination>({
    page: options.paginationProps?.page ?? 1,
    pageSize: options.paginationProps?.pageSize ?? 10,
    total: 0
  });

  const paginationParams = computed<TablePaginationParams>(() => ({
    page: pagination.page,
    pageSize: pagination.pageSize
  }));

  const result = useTable<ResponseData, ApiData, TableColumn, true>({
    ...options,
    pagination: true,
    getColumnChecks: cols => getColumnChecks(cols, options.getColumnVisible),
    getColumns,
    onFetched: data => {
      pagination.total = data.total;
      pagination.pageSize = data.pageSize;
    }
  });

  /** jump to the target page and fetch the data, it is used by the search form */
  async function getDataByPage(page = 1) {
    if (page !== pagination.page) {
      pagination.page = page;

      return;
    }

    await result.getData();
  }

  scope.run(() => {
    watch(
      () => appStore.locale,
      () => {
        result.reloadColumns();
      }
    );

    // Vuetify does not reset the page when the page size changes, do it to keep the api params valid
    watch(
      () => pagination.pageSize,
      (newPageSize, oldPageSize) => {
        if (oldPageSize !== undefined && newPageSize !== oldPageSize) {
          pagination.page = 1;
        }
      }
    );

    watch(paginationParams, async newVal => {
      await options.onPaginationParamsChange?.(newVal);

      await result.getData();
    });
  });

  onScopeDispose(() => {
    scope.stop();
  });

  return {
    ...result,
    getDataByPage,
    pagination,
    showSelect: Boolean(options.showSelect)
  };
}

export function useTableOperate<TableData>(
  data: Ref<TableData[]>,
  idKey: keyof TableData,
  getData: () => Promise<void>
) {
  const { bool: drawerVisible, setTrue: openDrawer, setFalse: closeDrawer } = useBoolean();

  const operateType = shallowRef<TableOperateType>('add');

  function handleAdd() {
    operateType.value = 'add';
    openDrawer();
  }

  /** the editing row data */
  const editingData = shallowRef<TableData | null>(null);

  function handleEdit(id: TableData[keyof TableData]) {
    operateType.value = 'edit';
    const findItem = data.value.find(item => item[idKey] === id) || null;
    editingData.value = jsonClone(findItem);

    openDrawer();
  }

  /** the selected row values of the table */
  const checkedRowKeys = shallowRef<Array<TableData[keyof TableData]>>([]);

  /** the hook after the batch delete operation is completed */
  async function onBatchDeleted() {
    window.$message?.success($t('common.deleteSuccess'));

    checkedRowKeys.value = [];

    await getData();
  }

  /** the hook after the delete operation is completed */
  async function onDeleted() {
    window.$message?.success($t('common.deleteSuccess'));

    await getData();
  }

  return {
    drawerVisible,
    openDrawer,
    closeDrawer,
    operateType,
    handleAdd,
    editingData,
    handleEdit,
    checkedRowKeys,
    onBatchDeleted,
    onDeleted
  };
}

export function defaultTransform<ApiData>(
  response: FlatResponseData<any, Api.Common.PaginatingQueryRecord<ApiData>>
): PaginationData<ApiData> {
  const { data, error } = response;

  if (!error) {
    const { records, current, size, total } = data;

    return {
      data: records,
      pageNum: current,
      pageSize: size,
      total
    };
  }

  return {
    data: [],
    pageNum: 1,
    pageSize: 10,
    total: 0
  };
}

function getColumnChecks(cols: TableColumn[], getColumnVisible?: (column: TableColumn) => boolean) {
  const checks: TableColumnCheck[] = [];

  cols.forEach(column => {
    checks.push({
      key: column.key,
      title: column.title ?? column.key,
      checked: true,
      fixed: toColumnFixed(column.fixed),
      visible: getColumnVisible?.(column) ?? true
    });
  });

  return checks;
}

function getColumns(cols: TableColumn[], checks: TableColumnCheck[]): TableColumn[] {
  const columnMap = new Map<string, TableColumn>();

  cols.forEach(column => {
    columnMap.set(column.key, column);
  });

  const result: TableColumn[] = [];

  checks.forEach(check => {
    if (!check.checked) return;

    const column = columnMap.get(check.key);

    if (!column) return;

    result.push({
      ...column,
      fixed: fromColumnFixed(check.fixed)
    });
  });

  return result;
}

type TableColumnFixed = TableColumnCheck['fixed'];

function toColumnFixed(fixed: TableColumn['fixed']): TableColumnFixed {
  if (fixed === 'end') {
    return 'right';
  }

  if (fixed) {
    return 'left';
  }

  return 'unFixed';
}

function fromColumnFixed(fixed: TableColumnFixed): TableColumn['fixed'] {
  if (fixed === 'right') {
    return 'end';
  }

  if (fixed === 'left') {
    return 'start';
  }

  return false;
}
