---
name: design-taste-mobile
description: Anti-slop mobile UI skill for Vue3 + Vant projects. Adapts design-taste-frontend principles for iOS/Android mobile apps.
---

# design-taste-mobile: Vue3 移动端 Anti-Slop 设计技能

> 适配自 Leonxlnx/taste-skill 原版 React/Next.js 技能。
> 本版本专为 Vue3 + Vant + GSAP + TypeScript 移动端项目优化。

---

## 技术栈映射

| 原版 (React) | Vue3 移动端适配 |
|-------------|----------------|
| React Server Components | Vue3 SFC (script setup) |
| motion/react | GSAP (已安装 v3.15) |
| shadcn/ui / Radix | Vant 4 (已安装) |
| Tailwind CSS | Scoped CSS + Vant 主题定制 |
| useMotionValue | gsap.to() / gsap.from() |
| useReducedMotion | CSS @media (prefers-reduced-motion) |

---

## 0. BRIEF INFERENCE (读需求再动手)

### 0.A 先读信号
1. 页面类型 - 首页 / 功能页 / 引导页 / 个人中心 / 设置页
2. 风格词 - "简约" / "高级" / "Material" / "iOS 原生"
3. 参考 - 用户发的截图、链接、竞品名
4. 受众 - B 端用户 / C 端消费者 / 内部工具
5. 已有资产 - logo、配色、字体、图片素材
6. 约束 - 无障碍、老年用户、合规要求

### 0.B 输出 Design Read
在写代码前，先输出一行：
"Reading this as: [页面类型] for [受众], with [风格] language, leaning toward [设计方向]."

### 0.C 模糊时问一个问题
不要多问，只问一个最关键的问题。

---

## 1. THREE DIALS (三参数调优)

- DESIGN_VARIANCE: 8 - 1=对称工整, 10=艺术化
- MOTION_INTENSITY: 6 - 1=静态, 10=电影级动画
- VISUAL_DENSITY: 4 - 1=画廊感, 10=信息密集

### 移动端默认值
| 场景 | VARIANCE | MOTION | DENSITY |
|------|----------|--------|---------|
| App 首页 | 6 | 5 | 4 |
| 功能详情页 | 4 | 3 | 5 |
| 引导/Onboarding | 7 | 6 | 2 |
| 电商商品页 | 6 | 4 | 5 |
| 个人中心 | 5 | 3 | 4 |
| 设置页 | 3 | 1 | 6 |

---

## 2. Vant 组件使用规范

### 优先使用 Vant 组件
- 列表: van-cell-group / van-cell
- 按钮: van-button
- 表单: van-field
- 弹窗: van-dialog
- 加载: van-loading

### Vant 主题定制
```css
:root {
  --van-primary-color: #07c160;
  --van-text-color: #323233;
  --van-border-color: #ebedf0;
  --van-radius-sm: 4px;
  --van-radius-md: 8px;
  --van-radius-lg: 12px;
}
```

### 禁止手写已有的 Vant 组件
- 不要自己实现 Tab、NavBar、PullRefresh、List、Cell
- 不要用 div 模拟 Button、Input、Dialog
- Vant 没有对应组件时才手写

---

## 3. GSAP 动画规范

### 入场动画 (列表项)
```typescript
import gsap from 'gsap'

function animateListItems(selector: string) {
  gsap.from(selector, {
    autoAlpha: 0,
    y: 20,
    duration: 0.4,
    stagger: 0.05,
    ease: 'power2.out',
    clearProps: 'all'
  })
}
```

### Tab 切换动画
```typescript
function animateTabContent(el: HTMLElement) {
  gsap.from(el, {
    autoAlpha: 0,
    duration: 0.3,
    ease: 'power1.out'
  })
}
```

### Vue3 组合式写法
```vue
<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import gsap from 'gsap'

const listRef = ref<HTMLElement | null>(null)

onMounted(() => {
  nextTick(() => {
    gsap.from('.list-item', {
      autoAlpha: 0,
      y: 20,
      stagger: 0.05,
      ease: 'power2.out'
    })
  })
})
</script>
```

### 动画禁忌
- 禁止 window.addEventListener('scroll', ...)
- 禁止在动画中修改 Vue reactive 状态导致重渲染
- 动画元素加 will-change: transform, opacity
- 必须支持 prefers-reduced-motion

---

## 4. DESIGN ENGINEERING (设计红线)

### 4.1 Typography (字体)
- 正文最小 14px，推荐 15-16px
- 标题用 font-weight: 600-700
- 行高 1.5-1.6 保证可读性
- 禁止在移动端用 font-size: 12px 作为正文

### 4.2 Color (配色)
- 最多 1 个强调色，饱和度 < 80%
- 禁止 AI 紫蓝渐变作为默认
- 中性色用 Zinc/Slate/Stone，不要用纯灰
- 主题色一致性：整个 App 用同一套配色

### 4.3 Layout (布局)
- 移动端强制单列 (w-full, px-4)
- 安全区域：顶部 env(safe-area-inset-top)，底部 env(safe-area-inset-bottom)
- 间距用 4px 倍数 (gap-4, p-6, mb-8)

### 4.4 Interactive States (交互状态)
- 按钮必须有 :active 状态 (scale: 0.98 或 translateY: 1px)
- 列表项点击反馈
- 空状态要有引导文案
- 加载状态用骨架屏，不要用全屏 loading

### 4.5 Shape Consistency (圆角一致性)
- 选择一套圆角系统并贯穿整个 App
- 全圆角 (border-radius: 999px) - 胶囊按钮
- 中圆角 (8-12px) - 卡片
- 小圆角 (4px) - 标签
- 禁止混用不同圆角风格

---

## 5. MOBILE-SPECIFIC (移动端专项)

### 5.1 Safe Area (安全区域)
```css
.page {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}
```

### 5.2 Viewport (视口)
- 使用 100dvh 替代 100vh（解决 iOS 地址栏问题）
- 禁止在移动端用 position: fixed 覆盖安全区域

### 5.3 Touch (触摸)
- 可点击区域最小 44x44px (Apple HIG)
- 按钮间距至少 8px
- 手势操作要平滑，禁止突兀的跳转

### 5.4 Performance (性能)
- 列表用 Vant van-list 虚拟滚动
- 图片用 lazy-load
- 动画只动 transform 和 opacity
- 禁止动画中触发 layout reflow

---

## 6. AI TELLS (AI 设计套路 - 禁止)

### 视觉禁忌
- 紫蓝渐变作为默认强调色
- 玻璃拟态用在所有地方
- 无意义的微动画循环
- 纯黑 #000 背景
- 过饱和的强调色

### 布局禁忌
- 三等分卡片排列
- 空洞的统计数字卡片堆叠
- 伪截图 (用 div 模拟 UI)
- 每个区块都加 eyebrow 标签

### 文案禁忌
- "赋能" / "无缝" / "颠覆" / "下一代"
- "Acme" / "NovaCore" 等假品牌名
- 无意义的占位符文案

### 图标禁忌
- 手写 SVG 图标（用 @vant/icons）
- Lucide 作为默认图标库
- 图标风格不统一

---

## 7. PRE-FLIGHT CHECK (发布前检查)

- [ ] 字体大小：正文 >= 14px，标题层次清晰
- [ ] 配色一致：整个 App 用同一套主题色
- [ ] 圆角一致：所有组件用同一套圆角系统
- [ ] 安全区域：顶部/底部适配
- [ ] 触摸区域：所有可点击元素 >= 44px
- [ ] 加载状态：骨架屏或 loading 状态
- [ ] 空状态：有引导文案
- [ ] 错误状态：有重试机制
- [ ] 动画：prefers-reduced-motion 兼容
- [ ] 性能：列表虚拟滚动，图片懒加载
- [ ] 无 AI 套路：紫蓝渐变、三等分卡片、伪截图

---

## 8. 附录：原版技能参考

原版 React/Next.js 技能：https://github.com/Leonxlnx/taste-skill

本 Vue3 移动端适配保留了以下核心原则：
- Brief Inference (需求推断)
- Three Dials (三参数调优)
- Anti-AI-Tells (禁止 AI 套路)
- Pre-Flight Check (发布前检查)
- Typography / Color / Layout Discipline

代码实现已全部改为 Vue3 Composition API + Vant + GSAP。
