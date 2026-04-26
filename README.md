# PersonaQuest —— 超级AI大学人格测试

[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF)](https://vitejs.dev)
[![Express](https://img.shields.io/badge/Express-4-green)](https://expressjs.com)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748)](https://www.prisma.io)

> 一个面向高校学生的四维度人格测试 Web 平台。完成情境选择题，解锁你的 16 型人格光谱，生成可分享的个性卡片。

---

## 🎯 三种目标用户

| 用户角色 | 核心功能 |
|---------|---------|
| **学生** | 参与测试、生成人格、查看解读、分享结果、浏览图鉴、查看测试历史 |
| **内容运营者** | 提交新题目/新人格、基于基础题库制作新风格测试问卷、查看人格分布数据 |
| **平台管理员** | 审核运营者提交、维护题库与人格库、查看全平台数据统计 |

---

## ✨ 功能清单

### 学生端
- **趣味测试** — 选择测试模板，完成情境选择题，四维度（E/I · S/N · J/P · A/H）科学计分
- **16 型人格** — 每种人格配有独特像素形象、搞笑解读与四维度光谱条
- **分享卡片** — 一键生成 PNG 结果卡片，适合社交媒体传播
- **测试历史** — 登录后可查看过往所有测试结果与维度变化
- **人格图鉴** — 浏览全部人格类型，点击卡片查看详情

### 内容运营者端
- **提交新题** — 为平台贡献新的情境选择题（需管理员审核）
- **提交人格** — 设计全新的人格类型与解读（需管理员审核）
- **制作问卷** — 在不改动基础题库的前提下，自选基础题 + 添加个性化题目，创建新风格测试模板
- **我的提交** — 查看所有提交内容的审核状态与拒绝理由
- **人格分布** — 查看全平台各人格类型的测试占比数据

### 管理员端
- **审核中心** — 处理运营者提交的新题目、新人格、新模板
- **题目管理** — 编辑、审核、删除题库中的所有题目
- **人格管理** — 管理所有人格类型与特征设定
- **数据统计** — 查看用户概览、人格类型分布、各题选项分布

---

## 🚀 快速开始（评审专用）

### 环境要求

- [Node.js](https://nodejs.org/) ≥ 18
- npm ≥ 9

### 安装与运行

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env
# Windows 用户请手动复制 .env.example 为 .env

# 3. 初始化数据库
npm run db:migrate
npm run db:seed

# 4. 启动开发服务器（前后端同时）
npm run dev
```

启动后访问：
- 前端：`http://localhost:5173`
- 后端 API：`http://localhost:3001/api`

---

## 🔑 默认账号（评审用）

| 角色 | 邮箱 | 密码 | 可访问路径 |
|------|------|------|-----------|
| 管理员 | `admin@example.com` | `admin123` | `/admin/*`、`/creator/*`、学生端全部 |
| 内容运营者 | `creator@example.com` | `creator123` | `/creator/*`、学生端全部 |
| 学生 | 自行注册 | - | 首页、测试、结果、图鉴、历史 |

> ⚠️ 生产环境请务必更换默认密码与 `JWT_SECRET`。

---

## 🛠 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | React 19 + React Router DOM 7 |
| 构建工具 | Vite 6（客户端）+ TypeScript Compiler（服务端） |
| 样式 | Tailwind CSS v4 |
| 状态管理 | Zustand 5 |
| 图标 | Lucide React |
| 动画 | Framer Motion |
| 后端框架 | Express 4 |
| 数据库 | SQLite（Prisma ORM 6） |
| 认证 | JWT + bcryptjs |
| 运行时 | Node.js，ESM |

---

## 📁 项目结构

```
├── data/                       # 可编辑数据源
│   ├── questions.json          # 题库（情境题、选项、分值）
│   └── personalities.json      # 人格库（16型人格定义、描述、像素画）
├── docs/                       # 设计文档
│   ├── README.md               # 项目框架文档
│   ├── question_design.md      # 题库设计稿
│   ├── scoring_criteria.md     # 评分与划分标准
│   └── todo.md                 # 协作任务清单
├── prisma/
│   ├── schema.prisma           # 数据库模型（SQLite）
│   ├── seed.ts                 # 种子脚本：导入 data/*.json
│   ├── dev.db                  # SQLite 数据库文件
│   └── migrations/             # Prisma 迁移文件
├── src/
│   ├── client/                 # 前端（React + Vite）
│   │   ├── App.tsx             # 路由配置（含角色权限守卫）
│   │   ├── pages/              # 页面组件
│   │   │   ├── HomePage.tsx              # 首页（模板列表）
│   │   │   ├── TestPage.tsx              # 答题页
│   │   │   ├── ResultPage.tsx            # 结果页（人格卡片 + 分享）
│   │   │   ├── GalleryPage.tsx           # 人格图鉴
│   │   │   ├── HistoryPage.tsx           # 测试历史
│   │   │   ├── LoginPage.tsx             # 登录
│   │   │   ├── RegisterPage.tsx          # 注册
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.tsx    # 管理后台首页
│   │   │   │   ├── AdminReviewPage.tsx   # 审核中心
│   │   │   │   ├── QuestionManager.tsx   # 题目管理
│   │   │   │   ├── PersonalityManager.tsx # 人格管理
│   │   │   │   └── AdminStatsPage.tsx    # 数据统计
│   │   │   └── creator/
│   │   │       ├── CreatorDashboard.tsx  # 创作中心首页
│   │   │       ├── SubmitPage.tsx        # 提交新题/人格
│   │   │       ├── TemplateBuilder.tsx   # 制作新风格问卷
│   │   │       ├── CreatorSubmissions.tsx # 我的提交
│   │   │       └── CreatorStatsPage.tsx  # 人格分布
│   │   ├── components/         # 可复用组件
│   │   ├── stores/             # Zustand 状态管理
│   │   ├── hooks/              # React Hooks
│   │   └── lib/                # 工具与 API 封装
│   ├── server/                 # 后端（Express + Prisma）
│   │   ├── index.ts            # 服务入口
│   │   ├── app.ts              # Express 应用配置
│   │   ├── routes/             # API 路由
│   │   │   ├── auth.routes.ts            # 登录/注册
│   │   │   ├── test.routes.ts            # 测试提交/题目获取/结果查询
│   │   │   ├── personality.routes.ts     # 人格图鉴 API
│   │   │   ├── admin.routes.ts           # 管理员审核与管理
│   │   │   └── creator.routes.ts         # 创作者提交与查询
│   │   ├── middleware/         # 认证、权限、错误处理
│   │   └── utils/              # PrismaClient 单例
│   └── shared/                 # 前后端共享类型
│       └── types.ts
├── package.json
├── tsconfig.json               # 前端 TS 配置
├── tsconfig.server.json        # 后端 TS 配置
├── vite.config.ts              # Vite 配置
└── .env.example                # 环境变量模板
```

---

## 📝 常用命令

```bash
# 开发模式（前后端同时启动）
npm run dev

# 仅启动前端（Vite，端口 5173）
npm run dev:client

# 仅启动后端（nodemon + tsx，端口 3001）
npm run dev:server

# 数据库迁移（修改 schema.prisma 后执行）
npm run db:migrate

# 生成 Prisma Client
npm run db:generate

# 导入题库与人格数据（修改 data/*.json 后执行）
npm run db:seed

# Prisma Studio（可视化查看/编辑数据库）
npm run db:studio

# 构建生产包（客户端 + 服务端）
npm run build

# 生产环境启动（需先 build）
npm start
```

---

## 🔐 环境变量

复制 `.env.example` 为 `.env` 并根据需要修改：

```env
PORT=3001                           # Express 服务端口号
DATABASE_URL="file:./dev.db"        # SQLite 数据库路径
JWT_SECRET="your-secret-key"        # JWT 签名密钥（生产环境务必更换）
JWT_EXPIRES_IN="7d"                 # Token 有效期
VITE_API_BASE_URL="http://localhost:3001/api"   # 前端 API 基地址
```

---

## 🧪 测试策略

当前项目未配置自动化测试框架。建议后续添加：

- **后端 API**：Vitest + `supertest`
- **前端组件**：Vitest + React Testing Library
- **数据库测试**：独立测试数据库或 Prisma 环境重置方案

---

## 🏗 部署说明

1. 设置环境变量（`.env`）。
2. 执行 `npm run build`：
   - `tsc`（前端类型检查）
   - `vite build`（构建客户端到 `dist/client`）
   - `tsc -p tsconfig.server.json`（编译服务端到 `dist/server`）
3. 执行数据库迁移：`npx prisma migrate deploy`。
4. 执行种子（可选）：`npm run db:seed`。
5. 启动服务：`npm start`（运行 `dist/server/index.js`）。

> **注意**：构建产物中 `dist/client` 为静态前端资源，生产部署时需由外部 Web 服务器（如 Nginx）或 Express 自行托管静态文件。

---

## 📄 许可证

[MIT](LICENSE)

---

> 本项目由 PersonaQuest 团队开发，面向高校学生群体，旨在通过趣味测试探索人格特质。
