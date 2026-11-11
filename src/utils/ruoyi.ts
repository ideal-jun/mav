import dayjs from 'dayjs';

/**
 * Small helpers ported from plus-ui 6.1.0 (`src/utils/ruoyi.ts`) that the ruoyi business
 * pages rely on (date formatting, date ranges, dict labels, tree building, ...).
 */

/** Format the value of a filter date input (`VDateInput`) as `YYYY-MM-DD`. */
export function formatFilterDate(value: Date | string | null | undefined, pattern = 'YYYY-MM-DD') {
  if (!value) {
    return '';
  }

  return dayjs(value).format(pattern);
}

/** Format a date/time value with the given pattern (default `{y}-{m}-{d} {h}:{i}:{s}`). */
export function parseTime(time: any, pattern?: string) {
  if (!time) {
    return null;
  }

  const format = pattern || '{y}-{m}-{d} {h}:{i}:{s}';

  let date: Date;

  if (typeof time === 'object') {
    date = time;
  } else {
    let value = time;

    if (typeof value === 'string' && /^[0-9]+$/.test(value)) {
      value = parseInt(value, 10);
    } else if (typeof value === 'string') {
      value = value
        .replace(new RegExp(/-/gm), '/')
        .replace('T', ' ')
        .replace(new RegExp(/\.[\d]{3}/gm), '');
    }

    if (typeof value === 'number' && value.toString().length === 10) {
      value *= 1000;
    }

    date = new Date(value);
  }

  const formatObj: Record<string, number> = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  };

  return format.replace(/{(y|m|d|h|i|s|a)+}/g, (result: string, key: string) => {
    const value = formatObj[key];

    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value];
    }

    return result.length > 1 && value < 10 ? `0${value}` : String(value ?? 0);
  });
}

/** Attach a date range to the query params (`params.beginTime` / `params.endTime`). */
export function addDateRange(params: any, dateRange: any[], propName?: string) {
  const search = params;

  search.params =
    typeof search.params === 'object' && search.params !== null && !Array.isArray(search.params) ? search.params : {};

  const range = Array.isArray(dateRange) ? dateRange : [];

  if (typeof propName === 'undefined') {
    search.params.beginTime = range[0];
    search.params.endTime = range[1];
  } else {
    search.params[`begin${propName}`] = range[0];
    search.params[`end${propName}`] = range[1];
  }

  return search;
}

/** Get the label of a dict value. */
export function selectDictLabel(datas: any, value: number | string) {
  if (value === undefined) {
    return '';
  }

  const actions: Array<string | number> = [];

  Object.keys(datas || {}).some(key => {
    if (datas[key].value == `${value}`) {
      actions.push(datas[key].label);

      return true;
    }

    return false;
  });

  if (actions.length === 0) {
    actions.push(value);
  }

  return actions.join('');
}

/** Convert `undefined` / `null` / `'undefined'` / `'null'` to an empty string. */
export function parseStrEmpty(str: any) {
  if (!str || str === 'undefined' || str === 'null') {
    return '';
  }

  return str;
}

/**
 * Build a tree from a flat list.
 *
 * @param data the flat list
 * @param id the id field, defaults to `id`
 * @param parentId the parent id field, defaults to `parentId`
 * @param children the children field, defaults to `children`
 */
export function handleTree<T = any>(data: any[], id?: string, parentId?: string, children?: string): T[] {
  const config = {
    id: id || 'id',
    parentId: parentId || 'parentId',
    childrenList: children || 'children'
  };

  const childrenListMap: any = {};
  const tree: T[] = [];

  for (const item of data) {
    const itemId = item[config.id];

    childrenListMap[itemId] = item;

    if (!item[config.childrenList]) {
      item[config.childrenList] = [];
    }
  }

  for (const item of data) {
    const itemParentId = item[config.parentId];
    const parentObj = childrenListMap[itemParentId];

    if (!parentObj) {
      tree.push(item);
    } else {
      parentObj[config.childrenList].push(item);
    }
  }

  return tree;
}

/** Encode the query params as an url encoded string. */
export function tansParams(params: any) {
  let result = '';

  for (const propName of Object.keys(params || {})) {
    const value = params[propName];
    const part = `${encodeURIComponent(propName)}=`;

    if (value !== null && value !== '' && typeof value !== 'undefined') {
      if (typeof value === 'object') {
        for (const key of Object.keys(value)) {
          if (value[key] !== null && value[key] !== '' && typeof value[key] !== 'undefined') {
            const paramsKey = `${propName}[${key}]`;
            result += `${encodeURIComponent(paramsKey)}=${encodeURIComponent(value[key])}&`;
          }
        }
      } else {
        result += `${part}${encodeURIComponent(value)}&`;
      }
    }
  }

  return result;
}

/** Whether the blob is a real file instead of an error json. */
export function blobValidate(blob: Blob) {
  return blob.size > 0 && blob.type !== 'application/json';
}

/** Normalize a project path. */
export function getNormalPath(p: string): string {
  if (!p || p === 'undefined' || p.length === 0) {
    return p;
  }

  const res = p.replace('//', '/');

  return res[res.length - 1] === '/' ? res.slice(0, res.length - 1) : res;
}
