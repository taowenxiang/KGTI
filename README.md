# KGTI

KGTI 是一个校园人格测试产品单仓库，采用：

- `apps/web`：React + Vite 前端
- `apps/api`：Express + Prisma API
- `packages/shared`：前后端共享类型
- `prisma` + `data`：数据库模型、迁移和种子数据

当前仓库已经按以下上线目标整理好：

- 前端以子路径方式部署到 `demo.wenxiangtao.com/kgti`
- 后端单独部署到 `kgti-api.wenxiangtao.com`
- 数据库使用 Neon Postgres
- 前后端继续共用一个 Git 仓库，但分别作为两个 Vercel Project 部署

## 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

本地开发建议保留：

```env
PORT=3001
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kgti?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/kgti?schema=public"
JWT_SECRET="change-this-in-production"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173"
VITE_API_BASE_URL="http://localhost:3001/api"
VITE_APP_BASE_PATH="/"
```

### 3. 初始化数据库

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 4. 启动项目

```bash
npm run dev
```

默认地址：

- 前端：`http://localhost:5173`
- 后端：`http://localhost:3001`
- 健康检查：`http://localhost:3001/api/health`

## 常用命令

```bash
npm run dev
npm run dev:web
npm run dev:api
npm run build
npm run build:web
npm run build:api
npm run start
npm run db:generate
npm run db:migrate
npm run db:migrate:deploy
npm run db:seed
```

## 目录结构

```text
.
├── apps
│   ├── api
│   │   ├── api
│   │   │   └── index.ts
│   │   ├── src
│   │   ├── package.json
│   │   └── vercel.json
│   └── web
│       ├── public
│       ├── src
│       ├── index.html
│       ├── package.json
│       ├── vercel.json
│       └── vite.config.ts
├── data
├── docs
├── packages
│   └── shared
│       └── src
├── prisma
├── package.json
├── tsconfig.base.json
├── tsconfig.json
└── tsconfig.server.json
```

## 部署说明

详细的 Vercel + Neon 上线流程见：

- [docs/deploy-vercel-neon.md](/Users/mount/Desktop/Programming/KGTI/docs/deploy-vercel-neon.md)
