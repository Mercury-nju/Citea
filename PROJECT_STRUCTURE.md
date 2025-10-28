# 📁 Citea 项目结构详解

## 🌳 完整目录树

```
Citea/
│
├── 📱 app/                          # Next.js 14 App Router
│   ├── 🔌 api/                      # API 路由
│   │   ├── find-sources/
│   │   │   └── route.ts             # 文献搜索 API
│   │   ├── check-citations/
│   │   │   └── route.ts             # 引用验证 API
│   │   └── chat/
│   │       └── route.ts             # AI 对话 API
│   ├── globals.css                  # 全局样式
│   ├── layout.tsx                   # 根布局组件
│   └── page.tsx                     # 主页面（组装所有组件）
│
├── 🧩 components/                   # React 组件
│   ├── Header.tsx                   # 顶部导航栏
│   ├── Hero.tsx                     # 英雄区（主标题）
│   ├── Features.tsx                 # 功能卡片展示
│   ├── DetailedFeatures.tsx         # 详细功能说明
│   ├── Tools.tsx                    # 核心工具面板 ⭐
│   ├── Testimonials.tsx             # 用户评价
│   ├── Pricing.tsx                  # 定价（免费）
│   ├── FAQ.tsx                      # 常见问题
│   └── Footer.tsx                   # 页脚
│
├── 📄 public/                       # 静态资源
│   └── robots.txt                   # SEO 配置
│
├── 🛠️ scripts/                      # 安装脚本
│   ├── setup.sh                     # Linux/Mac 安装
│   └── setup.bat                    # Windows 安装
│
├── ⚙️ 配置文件
│   ├── package.json                 # 项目依赖和脚本
│   ├── tsconfig.json                # TypeScript 配置
│   ├── tailwind.config.js           # Tailwind CSS 配置
│   ├── next.config.js               # Next.js 配置
│   ├── postcss.config.js            # PostCSS 配置
│   └── .gitignore                   # Git 忽略规则
│
├── 📚 文档（英文）
│   ├── README.md                    # 完整项目说明
│   ├── QUICK_START.md               # 快速开始指南
│   ├── FEATURES.md                  # 功能详细文档
│   └── DEPLOYMENT.md                # 部署完整指南
│
├── 📚 文档（中文）
│   ├── 使用说明.md                  # 完整中文指南
│   ├── 开始使用.md                  # 中文快速开始
│   ├── 项目总结.md                  # 项目完成总结
│   ├── START_HERE.md                # 快速导航（双语）
│   ├── PROJECT_CHECKLIST.md         # 完成清单
│   └── PROJECT_STRUCTURE.md         # 本文档
│
└── 🔒 自动生成
    ├── node_modules/                # 依赖包（169个）
    ├── .next/                       # Next.js 构建输出
    ├── next-env.d.ts                # Next.js 类型定义
    └── package-lock.json            # 依赖锁定文件
```

---

## 🎯 核心文件说明

### 🔥 最重要的文件

#### 1. `app/page.tsx` - 主页面
```typescript
// 组装所有组件的主页面
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Features from '@/components/Features'
// ... 等等

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      {/* 所有其他组件 */}
    </main>
  )
}
```
**作用**: 整个网站的入口和组件组装

---

#### 2. `components/Tools.tsx` - 核心工具 ⭐
```typescript
// 包含三个核心功能的交互式工具面板
- Source Finder（文献查找）
- Citation Checker（引用验证）
- AI Assistant（AI 助手）
```
**作用**: 最核心的功能实现，用户交互最多的组件

---

#### 3. API 路由

##### `app/api/find-sources/route.ts`
```typescript
// 文献搜索 API
- 集成 CrossRef
- 集成 PubMed
- 集成 Semantic Scholar
- 并行搜索，合并结果
```

##### `app/api/check-citations/route.ts`
```typescript
// 引用验证 API
- 提取引用
- 数据库验证
- AI 检测虚假引用
- 返回可信度评分
```

##### `app/api/chat/route.ts`
```typescript
// AI 对话 API
- 调用通义千问
- 处理对话历史
- 返回 AI 响应
```

---

## 📊 文件功能矩阵

| 文件 | 类型 | 功能 | 重要性 |
|------|------|------|--------|
| `app/page.tsx` | 页面 | 主页面入口 | ⭐⭐⭐⭐⭐ |
| `components/Tools.tsx` | 组件 | 核心工具面板 | ⭐⭐⭐⭐⭐ |
| `app/api/*/route.ts` | API | 后端功能 | ⭐⭐⭐⭐⭐ |
| `components/Header.tsx` | 组件 | 导航栏 | ⭐⭐⭐⭐ |
| `components/Hero.tsx` | 组件 | 首屏展示 | ⭐⭐⭐⭐ |
| `components/Features.tsx` | 组件 | 功能展示 | ⭐⭐⭐ |
| `components/Pricing.tsx` | 组件 | 免费说明 | ⭐⭐⭐ |
| `app/layout.tsx` | 布局 | 根布局 | ⭐⭐⭐⭐ |
| `app/globals.css` | 样式 | 全局样式 | ⭐⭐⭐ |
| `tailwind.config.js` | 配置 | 样式配置 | ⭐⭐⭐ |

---

## 🔄 数据流向图

```
用户浏览器
    ↓
┌─────────────────────────────────────┐
│  app/page.tsx (主页面)              │
│  ┌───────────────────────────────┐  │
│  │ components/Tools.tsx          │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │ 用户输入                │  │  │
│  │  └──────────┬──────────────┘  │  │
│  │             ↓                  │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │ API 调用                │  │  │
│  │  └──────────┬──────────────┘  │  │
│  └─────────────┼──────────────────┘  │
└────────────────┼─────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│  API 路由 (app/api/)                │
│  ┌─────────────────────────────┐   │
│  │ find-sources/route.ts       │   │
│  │ check-citations/route.ts    │   │
│  │ chat/route.ts               │   │
│  └──────────┬──────────────────┘   │
└─────────────┼──────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  外部服务                           │
│  ├─ CrossRef API                   │
│  ├─ PubMed API                     │
│  ├─ Semantic Scholar API           │
│  └─ 通义千问 API                   │
└─────────────────────────────────────┘
```

---

## 🎨 组件层级结构

```
app/page.tsx (主页面)
│
├── Header
│   ├── Logo
│   ├── Navigation
│   │   ├── Features Link
│   │   ├── Testimonials Link
│   │   ├── Pricing Link
│   │   ├── FAQ Link
│   │   └── Blog Link
│   ├── Language Selector
│   └── CTA Button
│
├── Hero
│   ├── Main Title
│   ├── Subtitle
│   ├── CTA Buttons
│   └── Database Badges
│
├── Features
│   ├── Feature Card 1 (Source Finder)
│   ├── Feature Card 2 (Citation Checker)
│   └── Feature Card 3 (AI Assistant)
│
├── DetailedFeatures
│   ├── Source Finder Detail
│   ├── Citation Checker Detail
│   └── Research Assistant Detail
│
├── Tools ⭐⭐⭐ (核心)
│   ├── Tab Navigation
│   │   ├── Source Finder Tab
│   │   ├── Citation Checker Tab
│   │   └── AI Assistant Tab
│   ├── Source Finder Panel
│   │   ├── Search Input
│   │   ├── Search Button
│   │   └── Results Display
│   ├── Citation Checker Panel
│   │   ├── Text Input
│   │   ├── Verify Button
│   │   └── Results Display
│   └── AI Assistant Panel
│       ├── Message Display
│       ├── Input Field
│       └── Send Button
│
├── Testimonials
│   ├── Column 1 (2 testimonials)
│   ├── Column 2 (2 testimonials)
│   └── Column 3 (2 testimonials)
│
├── Pricing
│   └── Free Plan Card
│       ├── Title
│       ├── Features List
│       └── CTA Button
│
├── FAQ
│   ├── Column 1 (3 questions)
│   ├── Column 2 (3 questions)
│   └── Column 3 (3 questions)
│
└── Footer
    ├── About Section
    ├── Product Links
    ├── Resources Links
    ├── Friends Links
    └── Copyright
```

---

## 📦 依赖关系

### 主要依赖
```json
{
  "next": "14.0.4",           // React 框架
  "react": "18.2.0",          // UI 库
  "typescript": "5.3.3",      // 类型系统
  "tailwindcss": "3.3.6",     // CSS 框架
  "axios": "1.6.2",           // HTTP 客户端
  "framer-motion": "10.16.16", // 动画库
  "lucide-react": "0.298.0"   // 图标库
}
```

### 开发依赖
```json
{
  "@types/react": "18.2.45",     // React 类型
  "@types/node": "20.10.5",      // Node 类型
  "autoprefixer": "10.4.16",     // CSS 前缀
  "postcss": "8.4.32"            // CSS 处理
}
```

---

## 🔑 关键技术点

### 1. App Router (Next.js 14)
```
app/
├── layout.tsx    # 根布局
├── page.tsx      # 页面路由
└── api/          # API 路由
    └── */route.ts
```

### 2. 服务端组件 vs 客户端组件
```typescript
// 默认服务端组件（静态内容）
export default function Features() { }

// 客户端组件（交互内容）
'use client'
export default function Tools() { }
```

### 3. API 路由处理
```typescript
// app/api/*/route.ts
export async function POST(request: NextRequest) {
  const data = await request.json()
  // 处理逻辑
  return NextResponse.json(result)
}
```

---

## 🎯 修改指南

### 想要修改颜色主题？
📁 编辑: `tailwind.config.js`
```javascript
colors: {
  primary: {
    500: '#your-color',  // 改这里
  }
}
```

### 想要修改文本内容？
📁 编辑对应组件:
- 标题: `components/Hero.tsx`
- 功能: `components/Features.tsx`
- 定价: `components/Pricing.tsx`
- FAQ: `components/FAQ.tsx`

### 想要添加新功能？
1. 在 `components/Tools.tsx` 添加新标签
2. 在 `app/api/` 创建新的 API 路由
3. 在 Tools 组件中调用新 API

### 想要修改 AI 行为？
📁 编辑: `app/api/chat/route.ts`
```typescript
// 修改系统提示词
{
  role: 'system',
  content: '你的新提示词...'
}
```

---

## 📱 响应式断点

```css
/* Tailwind 断点 */
sm:  640px   // 手机横屏
md:  768px   // 平板
lg:  1024px  // 小笔记本
xl:  1280px  // 笔记本
2xl: 1536px  // 桌面
```

### 使用示例
```tsx
<div className="
  grid 
  grid-cols-1      // 手机: 1 列
  md:grid-cols-2   // 平板: 2 列
  lg:grid-cols-3   // 笔记本: 3 列
">
```

---

## 🚀 构建流程

```bash
# 开发模式
npm run dev
  ↓
Next.js 启动开发服务器
  ↓
热重载监听文件变化
  ↓
访问 http://localhost:3000

# 生产构建
npm run build
  ↓
TypeScript 编译
  ↓
Tailwind CSS 编译
  ↓
Next.js 优化打包
  ↓
生成 .next/ 输出
  ↓
npm start (启动生产服务器)
```

---

## 📈 性能优化点

### 1. 代码分割
- 每个组件独立文件
- 动态导入（可选）
- API 路由按需加载

### 2. 样式优化
- Tailwind JIT 模式
- 自动清除未使用的 CSS
- CSS 压缩

### 3. 图片优化
- Next.js Image 组件（可用）
- 自动格式转换
- 懒加载

---

## 🔍 快速定位

### 想找某个功能的代码？

| 功能 | 位置 |
|------|------|
| 导航栏 | `components/Header.tsx` |
| 主标题 | `components/Hero.tsx` |
| 文献搜索 | `components/Tools.tsx` + `app/api/find-sources/` |
| 引用验证 | `components/Tools.tsx` + `app/api/check-citations/` |
| AI 对话 | `components/Tools.tsx` + `app/api/chat/` |
| 免费说明 | `components/Pricing.tsx` |
| FAQ | `components/FAQ.tsx` |
| 页脚 | `components/Footer.tsx` |
| 全局样式 | `app/globals.css` |
| 颜色配置 | `tailwind.config.js` |

---

## 💡 最佳实践

### 1. 组件开发
- 一个组件一个文件
- 使用 TypeScript 类型
- 提取可复用逻辑

### 2. 样式编写
- 优先使用 Tailwind 类
- 复杂样式用 CSS Modules
- 保持一致的间距

### 3. API 开发
- 错误处理完善
- 返回标准格式
- 添加日志记录

---

<div align="center">

## 📚 项目结构总览

**总文件数**: ~30 个核心文件  
**代码行数**: ~2,500 行  
**组件数量**: 9 个  
**API 路由**: 3 个  
**文档数量**: 10+ 个  

**结构清晰 | 易于维护 | 便于扩展**

</div>

