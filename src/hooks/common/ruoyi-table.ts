import type { Ref } from 'vue';
import { computed, ref } from 'vue';
import type { TableColumn } from './table';
import { useVuetifyPaginatedTable } from './table';

/** The page query of the ruoyi list api. */
export interface RuoYiPageQuery {
  pageNum: number;
  pageSize: number;
  [key: string]: any;
}

interface UseRuoYiTableOptions<Row, Query extends RuoYiPageQuery> {
  /** the ruoyi list api, resolved by the flat request (`{ data, error }`) */
  api: (query: Query) => Promise<{ data: { rows: Row[]; total: number } | null; error: any }>;
  /** the reactive query params of the page */
  query: Ref<Query>;
  /** the table columns */
  columns: () => TableColumn[];
  /** whether to show the selection column */
  showSelect?: boolean;
  /** the default page size */
  defaultPageSize?: number;
}

/**
 * Paginated ruoyi table helper.
 *
 * It connects a `VDataTableServer` with a ruoyi list api (`R<PageResult<T>>`) and keeps the
 * `pageNum` / `pageSize` of the query params in sync with the table pagination.
 */
export function useRuoYiTable<Row, Query extends RuoYiPageQuery>(options: UseRuoYiTableOptions<Row, Query>) {
  const { query } = options;

  if (!query.value.pageNum) {
    query.value.pageNum = 1;
  }

  if (!query.value.pageSize) {
    query.value.pageSize = options.defaultPageSize ?? 10;
  }

  const table = useVuetifyPaginatedTable<any, Row>({
    api: () => options.api(query.value as Query) as any,
    transform: (response: any) => {
      const { data, error } = response as any;

      if (!error && data) {
        return {
          data: data.rows ?? [],
          pageNum: Number(query.value.pageNum ?? 1),
          pageSize: Number(query.value.pageSize ?? 10),
          total: Number(data.total ?? 0)
        };
      }

      return {
        data: [],
        pageNum: 1,
        pageSize: Number(query.value.pageSize ?? 10),
        total: 0
      };
    },
    onPaginationParamsChange: (params: { page: number; pageSize: number }) => {
      query.value.pageNum = params.page;
      query.value.pageSize = params.pageSize;
    },
    columns: options.columns,
    showSelect: options.showSelect
  } as any);

  /** the selected row keys of the table */
  const checkedRowKeys = ref<any[]>([]);

  const total = computed(() => table.pagination.total);

  /** reset to the first page and reload */
  async function handleQuery() {
    table.pagination.page = 1;
    query.value.pageNum = 1;

    await table.getData();
  }

  return {
    ...table,
    checkedRowKeys,
    total,
    handleQuery
  };
}
