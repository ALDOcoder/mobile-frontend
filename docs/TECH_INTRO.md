# 项目技术介绍（mobile-frontend）

版本：2026-07-04

概述：mobile-frontend 是基于 Vue 3 + TypeScript 的移动端聊天室前端。主要功能包括：用户认证、群聊/私聊、文件上传、在线状态与 WebRTC 信令。

技术栈
- 框架：Vue 3（Composition API，`<script setup>`）
- 构建：Vite
- 状态管理：Pinia
- HTTP：Axios（统一实例在 `src/api/request.ts`）
- UI：Vant
- 语言：TypeScript

架构要点
- 单页应用（SPA），路由由 `vue-router` 管理，视图位于 `src/views/`。
- 可复用组件放在 `src/components/`。
- 后端接口封装在 `src/api/`；WebSocket 在 `src/stores/websocket.ts` 管理。

关键文件
- `src/api/request.ts`：axios 实例、拦截器、统一错误处理与 token 刷新逻辑。
- `src/api/auth.ts`：认证相关接口示例（登录需要表单编码）。
- `src/stores/websocket.ts`：封装群聊与私聊的 WebSocket 连接、消息分发 API。
- `src/utils/constants.ts`：API 基础路径、WS URL、storage keys。

后端接口与协议（摘要）
- REST 基础路径：`/api`。返回包：`{ code, message, data, total }`。拦截器会将 `response.data` 替换为内层 `data`。
- WebSocket 端点：`/chat/room`（群聊）、`/chat/private`（私聊）、`/webrtc/signaling`（信令）。消息类型：`chat`、`recall`、`ping`/`pong`、`onlineUsers` 等。

运行与构建
- 安装依赖：`npm install`
- 开发：`npm run dev`
- 构建：`npm run build`
- 本地预览：`npm run preview`

部署说明（简要）
- 构建输出由 Vite 放在 `dist/`，可部署到任意静态托管或与后端 Nginx 一起托管。
- 部署时确保 Nginx 将 `/api` 转发到后端服务，静态文件由 `root` 提供。

扩展点
- 若需支持更复杂的消息存储缓存或离线消息，可在 `src/stores/chat.ts` 增加本地索引与持久化策略（IndexedDB）。
- WebRTC 部分仅处理信令，可按需在 `src/webrtc/` 下添加模块封装 PeerConnection 管理。

联系方式与维护
- 推荐将维护指南与 API 对照表放入 `docs/`（可自动生成）。
