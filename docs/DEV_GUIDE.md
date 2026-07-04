# 开发规范（mobile-frontend）

版本：2026-07-04

目的：为本项目前端开发者提供可执行的代码风格、分支/提交规范、代码检查以及日常开发流程。

1. 代码风格与工具
- 语言：TypeScript + Vue 3（SFC）。
- 格式化：使用 Prettier（建议规则统一）。
- 静态检查：ESLint（@typescript-eslint + eslint-plugin-vue）。
- 类型检查：`vue-tsc -b`（在 CI 中必须通过）。

2. 分支与提交规范
- 分支：`main`（生产）、`develop`（日常开发）、`feature/*`、`fix/*`。
- 提交信息：遵循 Conventional Commits，例如：`feat(chat): add quote support`、`fix(auth): handle token refresh`。
- Pull Request：PR 需包含描述、影响范围、测试步骤；至少一位 reviewer 批准并 CI 通过。

3. 提交流程（本地）
```bash
# 开发分支
git checkout -b feature/your-feature
# 完成后
git add .
git commit -m "feat(module): short description"
git push origin feature/your-feature
# 在 GitHub 发起 PR
```

4. 代码组织与命名
- 组件：文件名 PascalCase 或 kebab-case，但组件内 `name` 使用 PascalCase。
- 样式：优先使用 `scoped`，全局变量放 `src/style.css`。
- 状态：Pinia，每个模块单独 store 文件。Store 名称为 `useXxxStore`。

5. API 调用约定
- 使用 `src/api/request.ts` 中的 axios 实例；所有 API 调用用 `try/catch`，并处理异常提示。
- 不直接依赖后端返回的原始包装结构（拦截器会解包 `data`）。

6. WebSocket 使用约定
- 使用 `src/stores/websocket.ts` 管理连接与消息分发。
- 心跳：每 30s 发送 `ping`；收到 `pong` 则健康。

7. 安全
- 用户输入在渲染前必须转义（或使用可信渲染组件）。
- Token 存储在 `localStorage`（使用 `STORAGE_KEYS` 常量）。

8. CI 建议
- 在 CI 中运行：`npm ci`、`npm run build`（含类型检查）、ESLint 与 Prettier 检查。

9. 代码检查清单（PR 前）
- 无 `console.log`、`debugger`。
- 类型检查通过。
- 单元/集成测试（若有）通过。
- 无未提交的本地改动。

如需我生成 `.eslintrc` / `prettier` 配置或 CI YAML，我可以继续创建。 
