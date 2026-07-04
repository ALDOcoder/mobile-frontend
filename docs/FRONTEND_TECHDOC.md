# 前端技术文档与开发规范（mobile-frontend）

最后更新：2026-07-04

此文档面向本仓库 `mobile-frontend` 的前端开发者，包含项目概览、运行与构建、与后端 API 的对接说明、WebSocket 协议要点、组件与状态管理约定、代码风格与提交流程等。

**目录**
- 项目概览
- 快速开始
- 目录与核心文件说明
- 与后端 API 映射（要点）
- WebSocket 协议（要点）
- 状态管理（Pinia）与全局服务
- 组件开发规范
- 样式与 UI 规范
- API 调用与错误处理
- 文件上传与下载
- 安全与认证
- 开发流程、提交与 PR 规范
- 常见命令

**项目概览**
- 技术栈：Vue 3 + TypeScript + Vite + Pinia + Vant + Axios
- 主要目录：参见下文“目录与核心文件说明”

**快速开始**
1. 克隆仓库并安装依赖：

```powershell
npm install
npm run dev
```

2. 构建生产包：

```powershell
npm run build
npm run preview
```

**目录与核心文件说明**
- `src/`：源码根目录。
  - `src/api/`：后端请求封装（示例：`auth.ts`、`request.ts`）。具体见 [src/api/auth.ts](src/api/auth.ts#L1) 和 [src/api/request.ts](src/api/request.ts#L1).
  - `src/stores/`：Pinia 状态管理（示例：`websocket.ts`）。参考 [src/stores/websocket.ts](src/stores/websocket.ts#L1).
  - `src/components/`：可复用 UI 组件（`MessageBubble.vue`、`MessageInput.vue` 等）。
  - `src/views/`：路由视图（如 `Login.vue`、`ChatRoom.vue`）。
  - `src/utils/`：常量、格式化工具与 JWT 辅助（示例：`constants.ts`）。见 [src/utils/constants.ts](src/utils/constants.ts#L1).

**与后端 API 映射（要点）**
后端 REST 基础路径为 `/api`（见后端文档）。前端通过 `src/api/*.ts` 的封装调用这些接口。重要接口说明：

- 认证
  - `POST /security/login`：登录（`authApi.login` 使用 `application/x-www-form-urlencoded`），见 [src/api/auth.ts](src/api/auth.ts#L1-L20).
  - `POST /security/logout`：登出（`authApi.logout`）。

- 验证码
  - `GET /captcha/generate`：获取验证码图片（Base64 + uuid）。前端在登录页通过 `authApi.getCaptcha()` 获取并展示。后端返回 `data.image` 与 `data.uuid`。

- 用户
  - `GET /user/info`：获取当前用户信息（需 `Authorization` 头）。
  - `PUT /user/info`：更新用户信息。
  - `POST /user/avatar`：上传头像（multipart/form-data）。

- 聊天消息与会话
  - `GET /chat/message/history`：拉取历史消息（分页）。
  - 私聊历史：`GET /private/chat/history`。
  - 会话列表：`GET /private/chat/conversations`。
  - 消息撤回、删除等通过对应 `POST` 路径完成。

- 好友与请求
  - `GET /friend/list`、`POST /friend/request`、`POST /friend/handle` 等。

注意：后端统一返回格式为 `{ code, message, data, total }`，`src/api/request.ts` 的响应拦截器会解包并将 `response.data` 替换为内层 `data`，同时在响应头中处理可能的 token 刷新（见 [src/api/request.ts](src/api/request.ts#L1-L40)）。

**WebSocket 协议（要点）**
后端提供三个 WebSocket 端点（详见后端文档）：

- 群聊：`/chat/room`，连接示例：`ws://host/chat/room?token={jwt}`。
- 私聊：`/chat/private`，连接示例：`ws://host/chat/private?token={jwt}`。
- WebRTC 信令：`/webrtc/signaling`（用于音视频通话）。

消息类型与约定（摘要）：
- `chat`：发送聊天消息（group/private），字段包含 `content`、`messageType`、`fileUrl` 等。
- `recall`：撤回消息，带 `messageId`。
- `ping`/`pong`：心跳（客户端每 30s 发送 `ping`）。
- `onlineUsers`：在线用户列表，由服务器推送。

前端实现：`src/stores/websocket.ts` 提供连接/断开、发送、订阅处理函数，使用 `WS_URL` 常量构造连接地址（见 [src/stores/websocket.ts](src/stores/websocket.ts#L1) 和 [src/utils/constants.ts](src/utils/constants.ts#L1)）。

最佳实践：
- 在用户登录并拿到 token 后再建立 WebSocket 连接。
- 将消息分发到组件层时确保 JSON.parse 的异常被捕获。
- 在页面卸载或切换时优雅断开连接以避免资源泄露。

**状态管理（Pinia）与全局服务**
- 推荐按功能划分 store（如 `auth`、`chat`、`websocket`），store 只存放最小可序列化的状态（不保存 WebSocket 实例的复杂对象，或在需要时用 `ref(null)` 并忽略序列化）。
- `auth` store 负责登录、登出、存储/读取 `userInfo` 与 token；localStorage key 使用 `src/utils/constants.ts` 中定义的 `STORAGE_KEYS`。

**组件开发规范**
- 单文件组件（SFC）：使用 `<script setup lang="ts">`，样式采用 `scoped` 限定（如必要时使用 `:deep()`）。
- Props、emit 要写明类型；尽量减少 `any`，使用接口声明数据结构。
- 组件职责单一：视图组件只负责展示与触发事件，复杂逻辑放入组合函数或 store。
- 命名：组件名使用 PascalCase，文件名使用 Kebab-case 或 PascalCase（与团队约定保持一致）。

示例：MessageBubble 组件保证只接收 `message` prop 并暴露 `onClick` 事件。

**样式与 UI 规范**
- 使用 Vant 组件库的同时，避免覆盖其全局样式。
- 全局变量与常量放在 `src/style.css` 或全局 CSS 变量文件中。
- 遵循移动端响应式原则，优先使用 flex 布局，保证触控目标 >= 44px。

**API 调用与错误处理**
- 统一使用 `src/api/request.ts` 中的 axios 实例：
  - Request 拦截器：添加 `Authorization`、`Refresh-Token`（如果存在）。
  - Response 拦截器：处理后端 `{code}` 约定，统一展示错误提示并在 401 时跳转登录。
- 所有对后端返回 data 的调用使用 `try/catch` 捕获异常并展示友好提示。

示例：
```ts
try {
  const data = await authApi.login({ username, password, code, uuid })
  // 登录成功后，auth store 处理 token
} catch (e) {
  // 已由拦截器显示消息，必要时在这里做额外处理
}
```

**文件上传与下载**
- 使用后端约定的上传接口：
  - 图片（聊天图片）：`POST /file/upload-chat-image`（max 10MB）
  - 文件（聊天文件）：`POST /file/upload-chat-file`（max 50MB）
- 前端使用 `FormData` 发送 multipart 请求（Vite/axios 支持）。
- 下载时后端会返回文件流并设置 `Content-Disposition`，前端使用创建链接并模拟点击实现下载。

**安全与认证**
- Token 存储：使用 `localStorage`（已在项目中使用）。禁止存储明文密码。
- XSS：所有用户内容在渲染前必须转义或使用安全的渲染组件（注意富文本场景的白名单策略）。
- CSRF：后端使用 JWT，前端需避免在 URL 中暴露敏感 token。

**开发流程、提交与 PR 规范**
- 分支策略：`main`（发布）、`develop`（日常开发）或采用 GitHub Flow（feature 分支 → PR → review → merge）。
- Commit 信息遵循 Conventional Commits（示例：`feat(chat): add message quote support`）。
- PR 要包含变更描述、测试步骤与影响范围，至少一位同事 review 并通过自动化检查（lint、typecheck、unit tests）后合并。

**CI / 代码质量建议**
- 推荐集成：ESLint（TypeScript + Vue 3）、Prettier、TypeScript 类型检查（`vue-tsc -b` 已在 `package.json` 的 build 中使用）、单元测试（Vitest 或 Jest）。
- 在 CI 中运行：`npm run build`（包含 `vue-tsc`）以保证类型检查通过。

**常见命令**
- 本地开发：`npm run dev`
- 构建：`npm run build`
- 预览构建：`npm run preview`

**参考文件**
- 后端 API 文档（项目外部）：docs/04-api-reference
- 本项目关键实现：
  - [src/api/request.ts](src/api/request.ts#L1)
  - [src/api/auth.ts](src/api/auth.ts#L1)
  - [src/stores/websocket.ts](src/stores/websocket.ts#L1)
  - [src/utils/constants.ts](src/utils/constants.ts#L1)

---
如需我把本文件复制到仓库的 `docs/` 目录下，或生成更细化的“接口逐条对照表”或“组件参考模板”，回复告诉我你想要的格式（Markdown / Confluence / PDF）。
