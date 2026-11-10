# RuoYi-Cloud-Plus 业务页面开发约定（mav）

> 本文件是 Lead 为业务页面开发同学准备的约定与骨架。mav = soybean-admin + Vuetify 4 前端，正在接入
> RuoYi-Cloud-Plus 6.1.0 后端（D:\workspace\RuoYi-Cloud-Plus）。
> 页面外观/交互/字段/权限点参考 plus-ui（D:\workspace\plus-ui，同版本官方 Element Plus 前端）。

## 1. 文件与路由映射

后端 `/system/menu/getRouters` 返回的 `component` 字段会映射到 `src/views/<component>.vue`，
所以页面文件路径必须与 plus-ui 的 `src/views/**` 完全一致：

| 后端 component          | mav 文件                                                                |
| ----------------------- | ----------------------------------------------------------------------- |
| system/user/index       | src/views/system/user/index.vue                                         |
| system/user/authRole    | src/views/system/user/authRole/index.vue                                |
| system/user/profile     | src/views/system/user/profile/index.vue                                 |
| system/dept/index       | src/views/system/dept/index.vue                                         |
| system/role/index       | src/views/system/role/index.vue                                         |
| system/role/authUser    | src/views/system/role/authUser/index.vue                                |
| system/menu/index       | src/views/system/menu/index.vue                                         |
| system/dict/index       | src/views/system/dict/index.vue（字典数据用抽屉/弹窗，和 plus-ui 一致） |
| system/post/index       | src/views/system/post/index.vue                                         |
| system/config/index     | src/views/system/config/index.vue                                       |
| system/notice/index     | src/views/system/notice/index.vue                                       |
| system/client/index     | src/views/system/client/index.vue                                       |
| system/oss/index        | src/views/system/oss/index.vue                                          |
| system/oss/config       | src/views/system/oss/config/index.vue                                   |
| monitor/operlog/index   | src/views/monitor/operlog/index.vue                                     |
| monitor/logininfo/index | src/views/monitor/logininfo/index.vue                                   |
| monitor/online/index    | src/views/monitor/online/index.vue                                      |
| monitor/cache/index     | src/views/monitor/cache/index.vue                                       |

页面子组件放同目录 `modules/` 下（如 `system/user/modules/user-form.vue`）。

## 2. UI 规范（Vuetify 4）

- 组件 PascalCase、自动导入，无需 import：`<VCard>`、`<VDataTableServer>`、`<VDialog>` 等。
- **界面文案直接用中文**（RuoYi 业务页是中文后台，不要新增 i18n key；外壳通用文案可继续用 `$t('common.add')` 等已有 key）。
- 页面布局参考 plus-ui 的"搜索卡片 + 表格卡片 + 操作弹窗"，使用 mav 现有写法：
  - 根容器：`<div class="flex h-full min-h-0 flex-col gap-4">`
  - 搜索区：`<VCard class="card-wrapper shrink-0">` + `<VForm>` + 栅格 `<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">` + 查询/重置按钮（`VBtn color="primary"` / `variant="outlined"`）。
  - 表格区：`<VCard class="card-wrapper flex min-h-0 flex-1 flex-col">` + `<VCardTitle class="flex shrink-0 flex-wrap items-center justify-between gap-2">` 标题 + `<TableHeaderOperation ...>`；表格放可滚动容器 `<div class="min-h-0 flex-1">`。
  - 表格：`<VDataTableServer>`（见第 4 节），`fixed-header`，行操作放 `#item.actions` 插槽。
  - 新增/编辑：优先 `<VDialog>` + `<VCard>` + `<VForm>`；复杂表单可用右侧 `<VNavigationDrawer temporary location="right" :width="...">`（参考 `src/views/manage/user/modules/user-operate-drawer.vue`）。
- 图标统一 MDI：`prepend-icon="mdi-plus"`、`<VIcon icon="mdi-pencil" />`。
- 删除确认用 `VDialog` + `window.$message`；批量删除按钮放 TableHeaderOperation 默认插槽/prefix 插槽。

## 3. 表格 hook 与分页

用 `useRuoYiTable`（`@/hooks/common/ruoyi-table`）把 RuoYi 列表接口和 VDataTableServer 绑定：

```ts
import { useRuoYiTable } from '@/hooks/common/ruoyi-table';
import type { TableColumn } from '@/hooks/common/table';
import { listUser } from '@/service/api/ruoyi/system/user';
import type { UserQuery, UserVO } from '@/service/api/ruoyi/system/user/types';

const query = ref<UserQuery>({ pageNum: 1, pageSize: 10, userName: '', status: '' });
const { data, loading, pagination, columnChecks, columns, checkedRowKeys, getData, getDataByPage, handleQuery } =
  useRuoYiTable<UserVO, UserQuery>({
    api: listUser,
    query,
    showSelect: true,
    columns: (): TableColumn[] => [
      { key: 'index', title: '序号', align: 'center', width: 70, sortable: false },
      { key: 'userName', title: '用户名称', align: 'center', minWidth: 110 },
      { key: 'status', title: '状态', align: 'center', width: 90 },
      { key: 'actions', title: '操作', align: 'center', width: 180, sortable: false }
    ]
  });
```

模板：

```vue
<VDataTableServer
  v-model:page="pagination.page"
  v-model:items-per-page="pagination.pageSize"
  v-model="checkedRowKeys"
  :headers="columns"
  :items="data"
  :items-length="pagination.total"
  :items-per-page-options="[10, 20, 50, 100]"
  :loading="loading"
  item-value="userId"
  fixed-header
>
  <template #item.index="{ index }">{{ index + 1 }}</template>
  <template #item.status="{ item }">...</template>
  <template #item.actions="{ item }">
    <VBtn size="small" variant="text" color="primary" @click="handleEdit(item)">修改</VBtn>
    <VBtn size="small" variant="text" color="error" @click="handleDelete(item)">删除</VBtn>
  </template>
</VDataTableServer>
```

表格头部操作栏：

```vue
<TableHeaderOperation
  v-model:columns="columnChecks"
  :disabled-delete="checkedRowKeys.length === 0"
  :loading="loading"
  @add="handleAdd"
  @delete="handleBatchDelete"
  @refresh="getData"
>
  <template #prefix>
    <VBtn size="small" variant="outlined" color="success" prepend-icon="mdi-export" @click="handleExport">导出</VBtn>
  </template>
</TableHeaderOperation>
```

- 查询按钮：`await handleQuery()`（回到第 1 页并刷新）；重置：重置 query 字段后同样调用。
- 分页参数就是 RuoYi 的 `pageNum`/`pageSize`，hook 会自动同步。
- `pagination.total` 是总条数。

## 4. API 调用

API 层由 api-owner 维护，统一在 `@/service/api/ruoyi/**`。请求包装器返回 `{ data, error }`：

```ts
const { data, error } = await listUser(query); // data: { rows: UserVO[]; total: number }
const { data: detail } = await getUser(userId); // data: UserInfoVO
const { error } = await addUser(form); // R.data 为空
if (!error) {
  window.$message?.success('新增成功');
  getData();
}
```

- 列表接口 data 形如 `RuoYi.PageResult<T>` = `{ rows, total }`。
- 详情/普通接口 data 就是后端 `R.data` 的值。
- 删除接口参数可以是 id 或 id 数组。
- 导出/导入模板用 `import { download } from '@/utils/download'`：
  `download('/system/user/export', query, 'user.xlsx')`。
- 常用 API 函数名与 plus-ui 一致：listUser/addUser/updateUser/delUser/resetUserPwd/changeUserStatus/deptTreeSelect；
  listRole/addRole/updateRole/delRole/changeRoleStatus/roleMenuTreeSelect/roleDeptTreeSelect；listMenu/getMenu/treetableMenu；
  listDept/getDept/addDept/updateDept/delDept/listDeptExcludeChild；listPost/addPost/updatePost/delPost/optionselectPost；
  listType/getType/addType/updateType/delType/refreshDictCache；listData/getData/addData/updateData/delData/getDictDataByType；
  listConfig/getConfig/addConfig/updateConfig/delConfig/refreshConfigCache；listNotice/getNotice/addNotice/updateNotice/delNotice；
  listClient/getClient/addClient/updateClient/delClient/changeClientStatus；
  listOss/delOss/listOssConfig/getOssConfig/addOssConfig/updateOssConfig/delOssConfig；
  listOperLog/delOperlog/cleanOperlog；listLoginInfo/delLoginInfo/cleanLoginInfo/unlockLoginInfo；listOnline/delOnline/forceLogout。
  具体签名以 `src/service/api/ruoyi/**` 源码为准（类型文件同目录）。

## 5. 权限与字典

- 按钮权限：`import { useAuth } from '@/hooks/business/auth'; const { hasAuth } = useAuth();`
  然后 `v-if="hasAuth(['system:user:add'])"`（权限点同 plus-ui 的 `v-hasPermi`）。
- 字典：`const dict = useDict('sys_normal_disable', 'sys_user_sex');`，模板 `<DictTag :options="dict.sys_normal_disable" :value="item.status" />`；
  下拉选项 `toSelectItems(dict.sys_normal_disable)`；文本回显 `getDictLabel(dict.xxx, value)`。
  常用字典类型：sys_normal_disable（正常/停用）、sys_user_sex（男/女/未知）、sys_show_hide、sys_yes_no、sys_notice_type、sys_notice_status、sys_oper_type、sys_common_status、sys_oss。
- 日期显示：`import { parseTime } from '@/utils/ruoyi';` `parseTime(row.createTime)`。

## 6. 表单

```ts
import { useVuetifyForm } from '@/hooks/common/form';
const { formRef, validate, restoreValidation } = useVuetifyForm();
const rules = { userName: [(v: string) => Boolean(v) || '请输入用户名称'] };
async function submit() {
  if (!(await validate())) return;
  const { error } = await addUser(form);
  if (!error) {
    window.$message?.success('新增成功');
    visible.value = false;
    emit('submitted');
  }
}
```

- 表单字段名必须与后端 VO 完全一致（参考 API 层 types 和 plus-ui 对应页面的 `el-form` 字段）。
- 打开弹窗时重置表单 + `restoreValidation()`；编辑时深拷贝行数据（`structuredClone` 或 `jsonClone`）。

## 7. 协作约束

- 只改自己任务 write scope 内的文件；**不要动** `src/service/request/**`、`src/store/**`、`src/router/**`、
  `src/hooks/common/ruoyi-table.ts`、`src/hooks/business/dict.ts`、`src/components/common/dict-tag.vue`、
  `.env*`、`package.json`、`src/locales/**`。需要共享改动先给 lead 发消息。
- 不要跑 `pnpm dev` / `pnpm build` / `pnpm install`（Lead 会统一跑构建和 typecheck；dev server 已在运行）。
- 自查：`npx vue-tsc --noEmit --skipLibCheck 2>&1 | Select-String "你的目录"` 不新增错误。
- 完成后逐项自测清单：列表加载/分页/搜索/重置、新增、编辑、删除（单条+批量）、状态切换、导出（如有）、权限按钮、字典回显。
