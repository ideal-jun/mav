# Vuetify 迁移约定（NaiveUI → Vuetify）

> 目标：把 `src/**` 里所有 NaiveUI / pro-naive-ui 组件迁移为 Vuetify 4（`vuetify@4.3.2`，`vite-plugin-vuetify` autoImport）。
> 菜单（`src/layouts/modules/global-menu/**`）**最后再做**，本阶段禁止改动。

## 0. 环境

- 依赖已安装（`node_modules` 存在）。**不要**执行 `pnpm install` / `pnpm dev` / `pnpm build`（会和 Lead 冲突）。
- 自检：`npx vue-tsc --noEmit --skipLibCheck 2>&1 | Select-String "你的文件路径"`。全项目 typecheck 基线是**通过**的（exit 0），你只要保证自己范围内不新增错误。
- 参考 API：`node_modules/vuetify/lib/components/<Component>/<Component>.d.ts`、`node_modules/vuetify/lib/composables/*.d.ts`。

## 1. 组件写法

- 组件在模板里用 **PascalCase 且无需 import**（autoImport 已生效）：`<VBtn>`、`<VCard>`、`<VDataTableServer>`、`<VDialog>`、`<VTextField>`…
- **禁用**：`<N*>`、`Pro*/`pro-naive-ui`、`from 'naive-ui'`。迁移后文件里不应再出现这些引用。
- 保留 `window.$*` 调用不变（Lead 正在用 Vuetify 重写其实现，API 不变）：`$message.success/error/warning/info`、`$dialog.error/warning/info/success`、`$notification.create/success`、`$loadingBar.start/finish`。

## 2. 常用映射

| Naive                        | Vuetify                                                                                                                                                                                                                              |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---- | -------- | ------------------------------------------------------------------- |
| NCard / NCard title          | `VCard` + `VCardTitle` + `VCardText`（`:title` 用 `VCardTitle` 或 `:title` prop）                                                                                                                                                    |
| NButton / NButton text       | `VBtn`（`variant="flat                                                                                                                                                                                                               | text | outlined | tonal"` `color="primary"` `size="small"` `prepend-icon="mdi-xxx"`） |
| NInput                       | `VTextField`（`:rules`、`variant="outlined"` 已是全局默认）                                                                                                                                                                          |
| NInputNumber                 | `VNumberInput`                                                                                                                                                                                                                       |
| NSelect                      | `VSelect`，items 用 `{ title, value }`（Naive 的 `{label,value}` 要改）                                                                                                                                                              |
| NSwitch / NCheckbox / NRadio | `VSwitch` / `VCheckbox` / `VRadioGroup`+`VRadio`                                                                                                                                                                                     |
| NTag                         | `VChip`（`:color` `:variant="tonal"`）                                                                                                                                                                                               |
| NTooltip                     | `VTooltip` + activator（`VIcon`/`VBtn`）                                                                                                                                                                                             |
| NPopover / NPopconfirm       | `VMenu`（activator + `VList` 操作项）；确认类可 `VDialog`                                                                                                                                                                            |
| NDrawer（右滑表单）          | `<VNavigationDrawer temporary location="right" :width="...">`                                                                                                                                                                        |
| NModal / NDialog             | `VDialog` + `VCard`                                                                                                                                                                                                                  |
| NForm / NFormItem            | `VForm` + `VTextField` 自带 label/messages；分组用 `VRow/VCol`                                                                                                                                                                       |
| NDataTable                   | `VDataTableServer`（后端分页）或 `VDataTable`（前端分页）                                                                                                                                                                            |
| NPagination                  | `VDataTableServer` 自带 `bottom` 插槽 / `VPagination`                                                                                                                                                                                |
| NSpace                       | `<div class="d-flex flex-column ga-4">` 或 UnoCSS `flex gap-4`                                                                                                                                                                       |
| NDivider                     | `VDivider`                                                                                                                                                                                                                           |
| NScrollbar                   | `@sa/materials` 的 `SimpleScrollbar` 或原生 overflow                                                                                                                                                                                 |
| NWatermark                   | `AppWatermark`（Lead 新增，`src/components/common/app-watermark.vue`）                                                                                                                                                               |
| NIcon / icons                | MDI 用 Vuetify `<VIcon icon="mdi-xxx" />`（@mdi/font 已加载）；本地 svg 用 `<SvgIcon local-icon="activity" />`（`src/assets/svg-icon`）。iconify / unplugin-icons 已移除，旧图标名用 `resolveMdiIcon()`（`src/utils/icon.ts`）归一化 |

## 3. 表格规范（VDataTableServer）

```vue
<VDataTableServer
  v-model:page="pagination.page"
  v-model:items-per-page="pagination.pageSize"
  :headers="headers"
  :items="rows"
  :items-length="total"
  :loading="loading"
  item-value="id"
  @update:options="handleOptions"
>
  <template #item.userName="{ item }">{{ item.userName }}</template>
  <template #item.status="{ item }">
    <VChip :color="item.status ? 'success' : 'default'" size="small" variant="tonal">…</VChip>
  </template>
  <template #bottom><!-- 分页 --></template>
</VDataTableServer>
```

- header 类型：`{ title: string; key: string; sortable?: boolean; align?: 'start'|'center'|'end'; width?: number }`
- 选择列：`<VDataTableServer v-model="selected">` + `show-select` + `item-value`；批量删除用 `selected`。
- 行操作按钮放 `#item.actions` 插槽。

## 4. 表单规范

- 已有 helpers：`src/hooks/common/form.ts` 的 `useVuetifyForm()`（`formRef/validate/restoreValidation`）与 `useVuetifyFormRules()`（`required/pattern/createConfirmPwdRule`）。
- 校验规则是 Vuetify 的 `ValidationRule = (value) => true | string | Promise<...>`。
- 校验：`const { valid } = await formRef.value.validate()`（`useVuetifyForm().validate()` 返回 boolean）。

## 5. 主题 / 样式

- 全局 Vuetify defaults 在 `src/App.vue`：表单已默认 `density="compact" variant="outlined"`、圆角跟随主题；不要再手写 `dense` 之类旧参数。
- 布局间距优先 UnoCSS 原子类（`flex`、`gap-4`、`p-4`、`h-full`），不要引入 scoped CSS 库。
- 深色模式由 `html.dark` + Vuetify theme 双写，颜色用 `color="primary"` 等语义色，别硬编码。

## 6. 必须保持行为一致

- 相同的 API 调用（`src/service/api/*`）、相同的字段名、相同的 i18n key（`$t('page.xxx')`）、相同的路由 name/path。
- 不删页面/不做需求变更；只换 UI 实现。`LookForward` 占位页保持不动。
- 不修改自己 scope 之外的文件；需要共享 helper 先发消息给 `lead`。

## 7. 完成标准

1. 文件中无 `naive-ui`/`pro-naive-ui`/`<N*`/`Pro*` 残留（grep 自查）。
2. `npx vue-tsc --noEmit --skipLibCheck` 中自己范围内的文件零错误。
3. 用 `send_message` 给 lead 汇报：改了哪些文件、遗留问题、需要 Lead 处理的事项（例如需要新增的共享组件）。

---

# 迁移完成记录

## 范围与结果

- `src/**` 中 **0** 处 `from 'naive-ui'` / `pro-naive-ui` / `<N*>` / `NaiveUI.*` / `useNaive*`。
- 依赖层移除：`naive-ui`、`pro-naive-ui`、`pro-naive-ui-resolver`（package.json / pnpm-lock / tsconfig types / build/plugins/unplugin.ts 的 NaiveUiResolver）。
- 删除文件：`src/locales/naive.ts`、`src/typings/naive-ui.d.ts`。
- 新增基础设施：
  - `src/plugins/app-services.ts`：Vuetify 版 `window.$message/$dialog/$notification/$loadingBar`（API 与调用方不变）。
  - `src/components/common/app-provider.vue`：Vuetify 渲染宿主（VAlert/VCard/VDialog/VProgressLinear）。
  - `src/components/common/{app-watermark,github-link,web-site-link}.vue`、`src/components/custom/custom-icon-select.vue`（补齐仓库里缺失的组件）。
  - `src/layouts/modules/global-menu/components/{menu-icon,app-menu-nodes,app-menu,app-horizontal-menu}.vue`：菜单共享渲染层。
- 迁移顺序：页面/布局 → 主题抽屉 → **菜单最后**（6 个菜单变体 + 共享菜单组件）。
- 修复：① 5 个 `<script setup lang="tsx">` 文件改为 `lang="ts"`（vite-plugin-vuetify 内联模板会剥离 `_resolveComponent(...)` 但残留 TS 非空断言 `!`，导致 prod build 语法错误）；② 面包屑 `VBreadcrumb(Item)` → `VBreadcrumbs(Item)`（Vuetify 4 正确组件名）。

## 验证命令与结果

```bash
npx vue-tsc --noEmit --skipLibCheck   # exit 0
pnpm lint                             # 0 warnings / 0 errors
pnpm build                            # Build successful
grep -r "naive" src                   # 仅剩路由名/文档等非组件文本
```

## 已知遗留（非组件迁移问题，未处理）

1. ~~路由名与 i18n key 仍为 pro-naive~~ —— 已删除 `src/views/pro-naive/**`（页面 + ConfigProvider + search-form），并清理了对应路由生成物、`route.*` i18n key、`page.proNaive` schema/文案。
2. `card-wrapper` 是仓库内无定义的死类（迁移前后都如此），`@sa/uno-preset` 仍未在 uno.config.ts 注册。
3. `src/styles/css/global.css`（reset/nprogress/transition）无人 import，进度条与「页面动画」设置本就不生效。
4. 未做浏览器端视觉回归（无可用浏览器环境），运行时交互需人工走查一遍。

## 布局层 Vuetify 化（后续需求）

布局不再使用 `@sa/materials` 的 `AdminLayout` / `PageTab` / `SimpleScrollbar`，改为 Vuetify 原生布局组件：

| 区域   | 组件                | 说明                                                                 |
| ------ | ------------------- | -------------------------------------------------------------------- |
| 根     | `VApp`（App.vue）   | 提供 layout 上下文                                                   |
| 顶栏   | `VAppBar`           | `height` = themeStore.header.height                                  |
| 页签条 | `VSystemBar`        | `height` = themeStore.tab.height；内部用 `VBtn` 实现 tab / 关闭按钮  |
| 侧边栏 | `VNavigationDrawer` | 桌面 `permanent`、移动端 `temporary`；宽度随收起/展开与 mix 模式计算 |
| 内容   | `VMain`             | 滚动容器，保留 `#__SCROLL_EL_ID__` 供 GlobalContent 复位滚动         |
| 页脚   | `VFooter`           | `height` = themeStore.footer.height                                  |

几何关系由 layout item 的 `order` 决定：

- 竖向布局族（vertical / vertical-mix / vertical-hybrid-header-first）：sider=0 → header=1 → tab=2 → footer=3，sider 通栏全高、header 从 sider 右侧开始。
- 横向布局族（horizontal / top-hybrid-\*）：header=0 → tab=1 → sider=2 → footer=3，header 通栏、sider 从 header 下方开始。

同时移除：`@sa/materials`、`@better-scroll/core` 依赖，`components/custom/better-scroll.vue`，`LAYOUT_SCROLL_EL_ID` 改为 `src/constants/app.ts` 本地常量。

行为差异（主题设置项失效，已知）：

1. `layout.scrollMode`（wrapper/content）不再区分，统一由 VMain 内部滚动。
2. `footer.fixed` 恒为固定底栏（VFooter 布局项）。
3. `fixedHeaderAndTab` 恒为固定（Vuetify 布局项默认 fixed）。
4. tab 的 chrome/slider/button 三种模式改为近似样式（`VBtn` + 类名），不再是 CSS Modules 的 chrome 造型。

> 注意（Vuetify layout item）：`VAppBar` / `VNavigationDrawer` / `VSystemBar` 默认就是 layout item，但 **`VFooter` 的 `app` prop 默认是 false**。漏写 `app` 时它不参与 layout，会变成普通文档流元素（`flex: 1 1 auto` 撑满高度），并且在 `VMain scrollable`（绝对定位）的情况下盖在内容之上，表现为"页面空白"。必须写成 `<VFooter app>`。

### 内容全屏（页签条右侧 ⛶）

`appStore.fullContent` 用**组件属性**实现，不再用 `v-if` 卸载布局组件：

- `<VAppBar :height="fullContent ? 0 : themeStore.header.height">`：高度属性归零，`#extension` 里的页签条（48px）保留，因此"退出全屏"按钮始终可用；顶栏内容用 `v-show="!fullContent"` 隐藏，避免 0 高度下内容溢出。
- 侧边栏用 `v-model="drawerModel"`（组件属性）：`fullContent` / 横向布局无 sider / 移动端抽屉开合都合并进这个 computed，因此收起时有 Vuetify 自带的 0.2s 滑动动画，不会像 `v-if` 那样直接消失。
- 页脚仍用 `v-if`（`VFooter` 没有 `model-value` 属性）。
- 旧实现用 `v-if` 卸载整个 `VAppBar`，页签条和退出按钮一起消失，全屏后只能刷新页面才能退出；现实现已修复。

## 图标体系：MDI + 本地 svg 图标

- **移除 iconify**：`@iconify/vue`、`@iconify/json`、`unplugin-icons`（以及 `<icon-local-*>` / `<icon-*-*>` 组件写法）、`VITE_ICONIFY_URL`、`src/plugins/iconify.ts`、`setupIconifyOffline()` 全部移除。
- **保留本地 svg 图标**：`src/assets/svg-icon/*.svg` + `vite-plugin-svg-icons`（`virtual:svg-icons-register`，symbol id 为 `${VITE_ICON_LOCAL_PREFIX}-[name]`，即 `icon-local-activity`）。MDI 里没有的图标，直接把 svg 放进该目录，用 `local-icon` 渲染。
- **分工明确**：
  - MDI 图标 → Vuetify `<VIcon icon="mdi-xxx" />`（样式来自 `@mdi/font`，已在 `src/plugins/vuetify.ts` 引入）
  - 本地 svg 图标 → `<SvgIcon local-icon="activity" />`（`src/components/custom/svg-icon.vue` **只负责本地 svg**，渲染 `src/assets/svg-icon/activity.svg`）
  - 两者都支持的 `size`（数字按 px）；动态图标处用 `v-if="localIcon" / v-else` 分流
- **图标名归一化**：`src/utils/icon.ts` 的 `resolveMdiIcon()` 兼容后端/历史 iconify 名称（`mdi:home` → `mdi-home`、`not-found` → `mdi-map-search-outline`）。
- **菜单/面包屑/标签页**：`App.Global.Menu` / `App.Global.Tab` 同时有 `icon`（MDI 名称字符串）与 `localIcon`（本地 svg 名称），渲染统一走 `<SvgIcon>`。
- **菜单表单**：图标类型 `iconType`（`1` = 图标/MDI，`2` = 本地 svg）保留，分别用 `mdiIcons` 与 `getLocalIcons()` 作为下拉数据，后端字段不变。
- **图标示例页**：`/plugin/icon` 同时展示 MDI 与本地 svg 图标。

## 全局搜索：VCommandPalette（Vuetify labs）

- 全局搜索（`src/layouts/modules/global-search/index.vue`）改用 `VCommandPalette`（`vuetify/labs/VCommandPalette`）实现，替换了原来自写的 `VDialog + VTextField + VList` 弹窗（`search-modal.vue` / `search-result.vue` 已删除）。
- 数据：`useRouteStore().searchMenus`（叶子菜单）映射为 palette items，`title` = 菜单 i18n 标题，`subtitle` = 路由路径；palette 内置按 `title`/`subtitle` 过滤（`filterKeys` 默认值）。
- 图标：`#item.prepend` 插槽，`localIcon` 用 `<SvgIcon>`，否则用 `<VIcon>`（MDI）。
- 交互全部由组件内置：输入聚焦、↑/↓ 切换、Enter 执行、Esc 关闭、点击外部关闭、无数据文案；`@click:item` 里 `router.push` 跳转。
- 页脚提示复用 `SearchFooter`，通过 `#append` 插槽注入（移动端隐藏）。
- 注意：labs 组件不会被 `vite-plugin-vuetify` 的 autoImport 处理，必须显式 `import { VCommandPalette } from 'vuetify/labs/VCommandPalette'`（组件自带 CSS）。
