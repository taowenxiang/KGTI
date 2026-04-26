# PersonaQuest —— AI 编码代理项目指南

> 本文档供 AI 编码代理阅读。读者被假设对该项目一无所知。所有信息均基于实际代码与配置，不做假设或泛化。

---

## 项目概述

**PersonaQuest**（超级AI大学人格测试）是一个面向港科广学生的 4 维度人格测试 Web 平台。学生完成 31 道校园情境题后，系统根据四个维度（E/I、S/N、J/P、A/H）的得分组合出 16 种人格之一，并展示个性化解读、像素艺术形象与四维度光谱对比条。

核心用户流程：
```
首页 → 选择测试模板 → 答题（31题，乱序/正序） → 提交 → 结果页（人格卡片 + 四维度光谱）
```

项目采用中文作为界面与文档的主要语言。所有用户可见文本、代码注释、文档均使用中文。

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | React 19 + React Router DOM 7 |
| 构建工具 | Vite 6（客户端），TypeScript Compiler（服务端） |
| 样式 | Tailwind CSS v4 + `@tailwindcss/postcss` |
| 状态管理 | Zustand 5 |
| 图标 | Lucide React |
| 动画 | Framer Motion |
| 后端框架 | Express 4 |
| 数据库 | SQLite（通过 Prisma ORM 6 访问） |
| 认证 | JWT（`jsonwebtoken`）+ bcryptjs |
| 运行时 | Node.js，TypeScript 编译为 ESM |
| 开发工具 | `tsx`（直接运行 TS）、`nodemon`（服务端热重载）、`concurrently`（前后端并行启动） |

---

## 项目结构

```
├── data/                       # 可编辑数据源
│   ├── questions.json          # 题库（31道情境题、选项、分值）
│   └── personalities.json      # 人格库（16型人格定义、描述、像素画）
├── docs/                       # 人工撰写文档
│   ├── README.md               # 项目框架文档（面向项目 owner）
│   ├── question_design.md      # 原始题库设计稿
│   ├── scoring_criteria.md     # 评分与划分标准
│   └── todo.md                 # 协作任务清单
├── prisma/
│   ├── schema.prisma           # 数据库模型定义（SQLite）
│   ├── seed.ts                 # 种子脚本：从 data/*.json 导入数据，并创建默认账号
│   └── migrations/             # Prisma 迁移文件
├── src/
│   ├── client/                 # 前端（React + Vite）
│   │   ├── App.tsx             # 路由配置 + ProtectedRoute 守卫
│   │   ├── main.tsx            # 前端入口（StrictMode + BrowserRouter）
│   │   ├── index.css           # Tailwind 导入 + 自定义主题色 + 动画 keyframes
│   │   ├── pages/              # 页面组件
│   │   │   ├── HomePage.tsx
│   │   │   ├── TestPage.tsx
│   │   │   ├── ResultPage.tsx
│   │   │   ├── GalleryPage.tsx
│   │   │   ├── PersonalityDetailPage.tsx
│   │   │   ├── LoginPage.tsx / RegisterPage.tsx
│   │   │   ├── admin/          # AdminDashboard, QuestionManager, PersonalityManager
│   │   │   └── creator/        # CreatorDashboard, SubmitPage
│   │   ├── components/         # 可复用组件
│   │   │   ├── layout/         # Header.tsx, Footer.tsx
│   │   │   ├── test/           # QuestionCard.tsx, ProgressBar.tsx
│   │   │   └── result/         # PersonalityCard.tsx, PixelAvatar.tsx
│   │   ├── stores/             # Zustand 状态管理
│   │   │   ├── authStore.ts    # 用户登录态、token、localStorage 同步
│   │   │   └── testStore.ts    # 答题进度、题目、答案、当前索引
│   │   ├── hooks/              # React Hooks
│   │   │   ├── useAuth.ts      # 挂载时自动校验 token 并拉取 /auth/me
│   │   │   └── useMobile.ts    # 响应式断点检测（默认 768px）
│   │   └── lib/                # 工具与常量
│   │       ├── api.ts          # fetch 封装：自动注入 Bearer token、统一 ApiResponse 解析
│   │       ├── utils.ts        # cn (clsx + twMerge)、formatDate、角色/状态标签映射
│   │       └── constants.ts    # APP_NAME、ROUTES 常量表
│   ├── server/                 # 后端（Express + Prisma）
│   │   ├── index.ts            # 服务入口：启动 HTTP 监听
│   │   ├── app.ts              # Express 应用配置：中间件、路由挂载、全局错误处理
│   │   ├── routes/             # API 路由（按领域拆分）
│   │   │   ├── auth.routes.ts
│   │   │   ├── test.routes.ts      # 模板/题目获取、提交计分、结果查询
│   │   │   ├── personality.routes.ts
│   │   │   ├── admin.routes.ts     # 审核、题目/人格 CRUD（需 ADMIN）
│   │   │   └── creator.routes.ts   # 提交新内容、查看自己的提交（需 CREATOR/ADMIN）
│   │   ├── controllers/        # 请求处理层（目前仅 auth.controller.ts 使用）
│   │   ├── services/           # 业务逻辑层（目前仅 auth.service.ts 使用）
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts   # JWT 校验，将用户信息注入 req.user
│   │   │   ├── role.middleware.ts   # 角色权限守卫（requireRole）
│   │   │   └── error.middleware.ts  # 全局错误处理中间件
│   │   ├── config/
│   │   │   └── auth.ts              # JWT_SECRET、JWT_EXPIRES_IN 配置
│   │   └── utils/
│   │       └── prisma.ts            # PrismaClient 单例（开发环境复用全局实例）
│   └── shared/                 # 前后端共享代码
│       └── types.ts            # TypeScript 类型定义（User、Question、Personality、TestResult 等）
├── public/                     # 静态资源
├── index.html                  # Vite 入口 HTML（lang="zh-CN"）
├── package.json
├── tsconfig.json               # 前端 TS 配置（noEmit，含路径别名 @/*、@shared/*）
├── tsconfig.server.json        # 后端 TS 配置（emit 到 dist/server，模块 NodeNext）
├── vite.config.ts              # Vite 配置：React 插件、路径别名、端口 5173、/api 代理到 3001
├── tailwind.config.js          # Tailwind v4 主题扩展（primary 色阶、自定义动画）
├── postcss.config.js           # PostCSS：仅 @tailwindcss/postcss 插件
└── .env.example                # 环境变量模板
```

---

## 路径别名

| 别名 | 指向 |
|------|------|
| `@/*` | `src/client/*` |
| `@shared/*` | `src/shared/*` |

前后端均使用 `.js` 扩展名进行模块导入（`"type": "module"` + TypeScript 编译要求），即使源文件是 `.ts`。

---

## 环境变量

复制 `.env.example` 为 `.env` 并根据需要修改：

```
PORT=3001                           # Express 服务端口号
DATABASE_URL="file:./dev.db"        # SQLite 数据库路径
JWT_SECRET="..."                    # JWT 签名密钥（生产环境务必更换）
JWT_EXPIRES_IN="7d"                 # Token 有效期
VITE_API_BASE_URL="http://localhost:3001/api"   # 前端 API 基地址
```

**安全提示**：`JWT_SECRET` 在生产环境中必须替换为强随机字符串。当前默认种子账号密码仅用于本地开发。

---

## 常用命令

```bash
# 安装依赖
npm install

# 开发模式（前后端同时启动）
npm run dev

# 仅启动前端（Vite，端口 5173）
npm run dev:client

# 仅启动后端（nodemon + tsx，端口 3001）
npm run dev:server

# 数据库迁移（修改 schema.prisma 后执行）
npm run db:migrate

# 生成 Prisma Client（schema 变更后）
npm run db:generate

# 导入题库与人格数据（修改 data/*.json 后执行）
npm run db:seed

# Prisma Studio（可视化查看/编辑数据库）
npm run db:studio

# 构建生产包（客户端 + 服务端）
npm run build

# 生产环境启动服务端（需先 build）
npm start
```

开发时，Vite 开发服务器会将 `/api/*` 请求代理到 `http://localhost:3001`，因此前后端可以独立运行而不产生 CORS 问题。

---

## 数据库模型

SQLite 数据库，通过 Prisma 管理。核心表：

| 表名 | 作用 | 关键字段 |
|------|------|----------|
| `User` | 用户 | email, password, name, role (`STUDENT`/`CREATOR`/`ADMIN`) |
| `Question` | 题目 | content, options (**JSON 字符串**), category, status |
| `Personality` | 人格类型 | id (如 `"ENJA"`), name, title, description, traits (**JSON**), icon, color, pixelArt (**JSON**) |
| `Template` | 测试模板 | name, description, isDefault |
| `TemplateQuestion` | 模板-题目关联 | templateId, questionId, order |
| `TestResult` | 测试结果 | userId, templateId, personalityId, scores (**JSON**), answers (**JSON**) |
| `Submission` | 创作者提交 | type (`QUESTION`/`PERSONALITY`), content (**JSON**), status, remark |

**重要约定**：`options`、`traits`、`scores`、`answers`、`pixelArt` 等字段在数据库中以 JSON 字符串存储，读写时需要通过 `JSON.parse` / `JSON.stringify` 转换。前后端共享类型定义在 `src/shared/types.ts` 中，这些字段在 TypeScript 层面已经是结构化对象。

---

## API 接口概览

所有 API 返回统一格式：`{ success: boolean, data?: T, message?: string, error?: string }`。

- `POST /api/auth/register` / `POST /api/auth/login` / `GET /api/auth/me`
- `GET /api/test/templates` / `GET /api/test/templates/:id/questions` / `POST /api/test/submit` / `GET /api/test/results/:id`
- `GET /api/personalities?status=APPROVED` / `GET /api/personalities/:id`
- `GET|POST|PUT|DELETE /api/admin/*`（需 `ADMIN` 角色）
- `POST|GET /api/creator/*`（需 `CREATOR` 或 `ADMIN` 角色）

详细接口列表见 `docs/README.md`。

---

## 用户角色与权限

| 角色 | 权限 |
|------|------|
| `STUDENT` | 答题、查看结果、浏览图鉴 |
| `CREATOR` | 提交新题目/新人格、查看自己的提交记录 |
| `ADMIN` | 审核创作者提交、管理所有题目和人格、查看全部数据 |

默认种子账号（由 `prisma/seed.ts` 创建）：
- 管理员：`admin@example.com` / `admin123`
- 创作者：`creator@example.com` / `creator123`

---

## 计分逻辑

核心代码位于 `src/server/routes/test.routes.ts`。

1. 遍历用户提交的答案。
2. 每个选项的 `scores` 累加到对应维度（`E`、`I`、`S`、`N`、`J`、`P`、`A`、`H`）。
3. 每个维度比较两边得分，高者胜（同分默认左极）。
4. 组合成 4 位人格代码（如 `ENJA`）。
5. 查询 `Personality` 表返回结果并持久化到 `TestResult`。

评分标准细节见 `docs/scoring_criteria.md`。

---

## 代码风格与约定

- **语言**：TypeScript（严格模式开启）。
- **模块系统**：ESM（`"type": "module"`）。
- **导入扩展名**：所有相对导入必须使用 `.js` 扩展名（包括指向 `.ts` 文件）。
- **前端严格检查**：`noUnusedLocals: true`、`noUnusedParameters: true`。
- **命名**：React 组件使用 PascalCase 默认导出；hooks 使用 `useXxx` 命名；store 使用 camelCase。
- **样式**：优先使用 Tailwind 工具类；复杂条件类名通过 `cn()`（`clsx` + `tailwind-merge`）合并。
- **状态管理**：
  - 全局共享状态使用 Zustand（`authStore`、`testStore`）。
  - 局部状态使用 `useState` / `useEffect`。
- **API 调用**：统一使用 `src/client/lib/api.ts` 中的 `api.get/post/put/del`，禁止直接写裸 `fetch`。
- **类型复用**：前后端共享类型必须放在 `src/shared/types.ts`，通过 `@shared/types` 导入。
- **中文内容**：所有用户界面文本、错误提示、日志输出均使用中文。

---

## 测试策略

**当前项目未配置任何测试框架。** 没有单元测试、集成测试或 E2E 测试。

若需添加测试，建议：
- 后端 API：使用 Vitest + `supertest` 测试 Express 路由。
- 前端组件：使用 Vitest + React Testing Library。
- 数据库测试：使用独立测试数据库或 Prisma 的 `jest`/`vitest` 环境重置方案。

---

## 部署说明

1. 设置环境变量（`.env`）。
2. 执行 `npm run build`：
   - `tsc`（前端类型检查）
   - `vite build`（构建客户端到 `dist/client`）
   - `tsc -p tsconfig.server.json`（编译服务端到 `dist/server`）
3. 执行数据库迁移：`npx prisma migrate deploy`。
4. 执行种子（可选）：`npm run db:seed`。
5. 启动服务：`npm start`（运行 `dist/server/index.js`）。

**注意**：构建产物中 `dist/client` 为静态前端资源，需要由外部 Web 服务器（如 Nginx）或 Express 自行托管。当前代码中 Express 并未内置静态文件托管逻辑，生产部署时需额外配置。

---

## 关键文件速查

| 场景 | 文件 |
|------|------|
| 修改题库内容 | `data/questions.json` → 运行 `npm run db:seed` |
| 修改人格定义 | `data/personalities.json` → 运行 `npm run db:seed` |
| 修改数据库模型 | `prisma/schema.prisma` → 运行 `npm run db:migrate` |
| 添加新 API | `src/server/routes/*.routes.ts` → 在 `app.ts` 中挂载 |
| 添加新页面 | `src/client/pages/*.tsx` → 在 `App.tsx` 中配置路由 |
| 添加共享类型 | `src/shared/types.ts` |
| 调整主题色/动画 | `tailwind.config.js` + `src/client/index.css` |
| 调整代理/构建 | `vite.config.ts` |

---

## 扩展中的功能（参考 `docs/todo.md`）

根据 `docs/todo.md`，以下功能已在计划中或部分实现：
- 题目乱序（固定抽取全部题目，仅打乱顺序）
- 人格详情页（`PersonalityDetailPage.tsx` 已存在）
- 结果页分享卡片生成（适合朋友圈传播的图片导出）
- 测试历史记录（学生查看过往结果）
- 管理员数据统计（各人格占比、各题选项分布）
- 多模板支持（除默认模板外创建不同主题测试）

---

## 安全注意事项

- **JWT 密钥**：生产环境必须将 `JWT_SECRET` 替换为强随机字符串。
- **密码存储**：使用 `bcryptjs` 加盐哈希（默认 10 rounds）。
- **CORS**：当前配置为 `app.use(cors())`，生产环境应限制为具体域名。
- **SQL 注入**：通过 Prisma ORM 参数化查询天然防护。
- **认证中间件**：`authMiddleware` 校验 Bearer token 后将用户信息挂载到 `req.user`；后续路由通过 `req.user!` 访问，需确保中间件已正确挂载。
- **权限校验**：`requireRole` 中间件必须在 `authMiddleware` 之后挂载，否则 `req.user` 为空会导致拒绝访问。
