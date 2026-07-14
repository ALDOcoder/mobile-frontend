# mobile-frontend 项目文档

## 项目概述

`mobile-frontend` 是一个基于 **Vue3 + Vant + TypeScript** 的移动端社交应用前端项目，提供即时通讯、好友管理、用户搜索等核心功能。

---

## 技术栈

### 核心框架
| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.4+ | 前端框架，Composition API |
| TypeScript | 5.5+ | 类型安全，提升代码质量 |
| Vite | 5.4+ | 构建工具，快速开发体验 |

### UI 组件库
| 技术 | 版本 | 用途 |
|------|------|------|
| Vant | 4.9+ | 移动端 UI 组件库 (按钮/列表/弹窗/导航等) |
| @vant/icons | 3.0+ | Vant 图标库 |

### 状态管理与路由
| 技术 | 版本 | 用途 |
|------|------|------|
| Pinia | 2.1+ | 状态管理 (用户信息/聊天状态) |
| Vue Router | 4.3+ | 单页应用路由 |

### 网络与动画
| 技术 | 版本 | 用途 |
|------|------|------|
| Axios | 1.7+ | HTTP 请求，对接后端 API |
| GSAP | 3.15+ | 高性能动画库 (列表入场/Tab切换/交互反馈) |

---

## 项目结构

```
mobile-frontend/
├── src/
│   ├── api/              # API 接口层
│   │   ├── friend.ts     # 好友相关接口
│   │   └── request.ts    # Axios 封装
│   ├── assets/           # 静态资源
│   ├── components/       # 公共组件
│   ├── router/           # 路由配置
│   ├── stores/           # Pinia 状态管理
│   ├── utils/            # 工具函数
│   ├── views/            # 页面视图
│   │   ├── Friends.vue   # 好友列表/请求页面
│   │   ├── Search.vue    # 用户搜索
│   │   └── ...
│   ├── App.vue           # 根组件
│   ├── main.ts           # 入口文件
│   └── style.css         # 全局样式
├── .mimocode/
│   └── skills/
│       └── design-taste-mobile/
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 核心功能

### 1. 好友系统
- 好友列表 - 查看已添加的好友
- 好友请求 - 收到/已发送的好友申请，支持同意/拒绝
- 用户搜索 - 通过用户名/邮箱搜索用户
- 发送请求 - 向其他用户发送好友申请
- 删除/拉黑 - 好友管理操作

### 2. 即时通讯
- 私聊 - 一对一实时消息
- 消息列表 - 最近聊天记录

### 3. 用户中心
- 个人资料 - 查看/编辑个人信息
- 头像/昵称 - 用户形象设置

---

## 开发环境

### 启动开发服务器
```bash
cd mobile-frontend
npm install
npm run dev
```

### 构建生产版本
```bash
npm run build
```

---

## API 对接

后端接口基础路径：http://localhost:8438

| 接口 | 方法 | 说明 |
|------|------|------|
| /friend/list | GET | 获取好友列表 |
| /friend/requests | GET | 获取收到的好友请求 |
| /friend/sent | GET | 获取已发送的好友请求 |
| /friend/request | POST | 发送好友请求 |
| /friend/handle | POST | 处理好友请求 (同意/拒绝) |
| /friend/profile/:id | GET | 获取用户资料 |
| /friend/:id | DELETE | 删除好友 |

---

## 设计规范

本项目遵循 design-taste-mobile 技能规范。

核心原则：
- Anti-AI-Tells - 避免 AI 生成的设计套路
- 三参数调优 - DESIGN_VARIANCE / MOTION_INTENSITY / VISUAL_DENSITY
- Pre-Flight Check - 发布前检查清单

技术规范：
- 组件：优先使用 Vant 组件，禁止重复造轮子
- 动画：GSAP 实现，支持 prefers-reduced-motion
- 样式：Scoped CSS + Vant 主题变量
- 状态：Pinia 管理全局状态
