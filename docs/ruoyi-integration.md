# mav × RuoYi-Cloud-Plus 6.1.0 接入说明

mav 已从 soybean-admin 的 Apifox mock 模式切换为 RuoYi-Cloud-Plus 6.1.0 的真实后端：
登录 / 用户信息 / 动态菜单路由 / 权限 / 字典 / 业务页面全部走后端接口。

## 1. 前端配置

`.env`（新增/修改项）

| 变量                        | 说明                                    | 当前值                               |
| --------------------------- | --------------------------------------- | ------------------------------------ |
| `VITE_APP_CLIENT_ID`        | OAuth 客户端 id（sys_client.client_id） | e5cd7e4891bf95d1d19206ce24a7b32e     |
| `VITE_APP_ENCRYPT`          | 是否加密请求体（AES + RSA）             | Y                                    |
| `VITE_APP_RSA_PUBLIC_KEY`   | 加密 AES 密钥用的 RSA 公钥              | 与后端 `api-decrypt.privateKey` 对应 |
| `VITE_APP_RSA_PRIVATE_KEY`  | 解密后端响应用的 RSA 私钥               | 与后端 `api-decrypt.publicKey` 对应  |
| `VITE_SERVICE_SUCCESS_CODE` | RuoYi 成功码                            | 200                                  |
| `VITE_SERVICE_LOGOUT_CODES` | token 失效码                            | 401                                  |

`.env.test` / `.env.prod`

- `VITE_SERVICE_BASE_URL`：网关地址。开发环境默认 `http://127.0.0.1:8081`（本机 Nacos 控制台占用了 8080，
  网关用 8081 启动）；如果你把网关跑在 8080，直接改这里即可。

## 2. 后端启动（本地）

基础设施（已在本机 Docker 中）：MySQL 3306（root/123456，ry-cloud 库）、Redis 6379、Nacos 8848（nacos/nacos）、MinIO 9000。

```powershell
# 1) 构建（只需网关 / 认证 / 系统 / 资源四个服务）
cd D:\workspace\RuoYi-Cloud-Plus
.\mvnw.cmd -T 1C -DskipTests -Dmaven.test.skip=true -pl ruoyi-gateway,ruoyi-auth,ruoyi-modules/ruoyi-system,ruoyi-modules/ruoyi-resource -am install

# 2) 启动 system / auth / gateway（gateway 用 8081 避开 Nacos 控制台的 8080）
java -jar ruoyi-modules\ruoyi-system\target\ruoyi-system.jar
java -jar ruoyi-auth\target\ruoyi-auth.jar
java -jar ruoyi-gateway\target\ruoyi-gateway.jar --server.port=8081

# 3) 资源服务（OSS/文件上传下载；Nacos 缺少 ruoyi-resource.yml 时需要显式给数据源与 dubbo 端口）
java -jar ruoyi-modules\ruoyi-resource\target\ruoyi-resource.jar ^
  --dubbo.custom.request-log=false --dubbo.protocol.port=20881 ^
  --spring.datasource.dynamic.primary=master ^
  --spring.datasource.dynamic.datasource.master.type=com.zaxxer.hikari.HikariDataSource ^
  --spring.datasource.dynamic.datasource.master.driver-class-name=com.mysql.cj.jdbc.Driver ^
  "--spring.datasource.dynamic.datasource.master.url=jdbc:mysql://127.0.0.1:3306/ry-cloud?useUnicode=true&characterEncoding=utf8&zeroDateTimeBehavior=convertToNull&useSSL=true&serverTimezone=GMT%2B8&rewriteBatchedStatements=true&allowPublicKeyRetrieval=true" ^
  --spring.datasource.dynamic.datasource.master.username=root ^
  --spring.datasource.dynamic.datasource.master.password=123456
```

> ⚠️ 当前本机 Nacos 中的 `application-common.yml` 是旧版/裁剪版，缺少 6.1.0 模板里的若干配置，
> 直接启动会出现以下问题（mav 前端本身没问题，属于后端配置）：
>
> - 缺少 `dubbo.custom.request-log` → 登录报 "RPC异常"（`DubboCustomProperties.getRequestLog()` 为 null）；
> - 缺少 `dubbo.protocol.port: -1` / `dubbo.application.qos-enable: false` → 多服务同时启动时 Dubbo 20880 / QoS 22222 端口冲突；
> - 缺少 `ruoyi-resource.yml` → resource 服务找不到 primary datasource。
>
> **推荐做法**：用仓库 `script/config/nacos/` 下的 6.1.0 配置整体覆盖 Nacos 中的同名配置，
> 再按上面的标准命令启动，就不需要任何 CLI 覆盖参数。上面的 CLI 参数只是本机联调时的临时绕过方式。
> 认证服务的验证码本次联调临时用 `--security.captcha.enabled=false` 关闭；正式环境保持 Nacos 中 `security.captcha.enabled: true` 即可，mav 登录页已适配验证码开关。

## 3. 前端接入实现

| 能力                                                                  | 文件                                                                                                           |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| 请求层（R 包装、Bearer、clientid、AES+RSA 加密、401 退出）            | src/service/request/index.ts、src/utils/crypto.ts、src/utils/jsencrypt.ts                                      |
| 登录 / 用户信息 / 退出                                                | src/service/api/ruoyi/auth.ts、src/store/modules/auth/index.ts、src/views/_builtin/login/modules/pwd-login.vue |
| 动态路由（getRouters → vue-router + 组件映射 + ParentView/InnerLink） | src/router/routes/dynamic.ts、src/store/modules/route/index.ts、src/router/guard/route.ts                      |
| API 层与类型（system / monitor / auth）                               | src/service/api/ruoyi/**、src/typings/ruoyi.d.ts                                                               |
| 表格（分页/查询）、字典、下载、权限                                   | src/hooks/common/ruoyi-table.ts、src/hooks/business/dict.ts、src/utils/download.ts、src/hooks/business/auth.ts |
| 业务页面                                                              | src/views/system/**、src/views/monitor/**                                                                      |

### 路由组件映射规则

后端 `/system/menu/getRouters` 的 `component` 字符串按 `src/views/<component>.vue` 映射，
并自动兜底 `<component>/index.vue`。例如：

- `system/user/index` → src/views/system/user/index.vue
- `system/user/authRole` → src/views/system/user/authRole/index.vue
- `Layout` → ParentView（根布局下的 RouterView）
- `InnerLink` → src/views/_builtin/iframe-page/index.vue

因此新增业务页面时，页面文件路径要与 plus-ui 完全一致，无需在路由表里注册。

## 4. 已实现并验证的页面

- system/user（部门树 + CRUD + 分配角色 + 导入导出）、system/user/authRole、system/user/profile
- system/role（菜单权限树 + 数据权限 + 分配用户）、system/role/authUser、system/menu
- system/dept、system/post、system/dict（含字典数据）、system/config、system/notice
- system/client、system/oss、system/oss/config
- monitor/operlog、monitor/logininfo、monitor/online、monitor/cache
- 首页 /home（保留 mav 原仪表盘）、登录页

验证方式：Playwright 驱动本机 Chrome，真实登录后端后逐页打开并检查控制台与数据行数；
生产构建：`pnpm build`。

验证截图见 `docs/verification/`（登录页、用户管理、角色管理、菜单管理、字典管理）。

## 5. 开发命令

```powershell
pnpm dev            # vite --mode test，代理 /proxy-default -> .env.test 的 VITE_SERVICE_BASE_URL
pnpm typecheck      # vue-tsc --noEmit --skipLibCheck
pnpm build          # vite build --mode prod
```
