# KGTI 部署指南

这份指南对应当前仓库结构：

- Web：`apps/web`
- API：`apps/api`
- Shared types：`packages/shared`
- Prisma：`prisma`
- 数据源：`data`

目标地址：

- 前端最终入口：`https://demo.wenxiangtao.com/kgti`
- 后端 API：`https://kgti-api.wenxiangtao.com`

## 1. 先理解最终架构

这次不是靠 DNS 直接把 `/kgti` 指到 KGTI。

正确做法是：

1. KGTI 前端自己先部署成一个独立的 Vercel Project
2. KGTI 后端自己再部署成另一个独立的 Vercel Project
3. `demo.wenxiangtao.com` 仍由你的 `demo-router` 项目接管
4. `demo-router` 用 rewrite 把 `/kgti` 转发到 KGTI 前端项目

所以最终会有三个角色：

- `demo-router`：对外主入口，负责 `/kgti`
- `KGTI Web`：实际 React 站点
- `KGTI API`：实际 Express API

## 2. 本地准备

### 2.1 安装依赖

```bash
npm install
```

### 2.2 创建本地 `.env`

```bash
cp .env.example .env
```

本地开发可先这样填：

```env
PORT=3001
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kgti?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/kgti?schema=public"
JWT_SECRET="replace-with-a-long-random-string"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173"
VITE_API_BASE_URL="http://localhost:3001/api"
VITE_APP_BASE_PATH="/"
```

### 2.3 本地初始化数据库

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 2.4 本地开发检查

```bash
npm run dev
```

检查：

- `http://localhost:5173`
- `http://localhost:3001/api/health`

## 3. 创建 Neon 数据库

### 3.1 创建项目

在 Neon 控制台新建一个 Postgres 项目。

### 3.2 取两条连接串

你需要两条连接串：

- `DATABASE_URL`：运行时使用，建议用 Neon pooler 连接
- `DIRECT_URL`：Prisma migration 使用，建议用直连

建议形态如下：

```env
DATABASE_URL="postgresql://USER:PASSWORD@YOUR-ENDPOINT-pooler.region.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://USER:PASSWORD@YOUR-ENDPOINT.region.aws.neon.tech/neondb?sslmode=require"
```

如果你担心 Neon 冷启动带来的连接等待，可以在运行时连接串追加：

```env
DATABASE_URL="postgresql://USER:PASSWORD@YOUR-ENDPOINT-pooler.region.aws.neon.tech/neondb?sslmode=require&connect_timeout=15&pool_timeout=15"
```

## 4. 用 Neon 初始化生产库

先在本地把 `.env` 临时改成 Neon 连接串，然后执行：

```bash
npm run db:generate
npm run db:migrate:deploy
npm run db:seed
```

这一步的目标是确认：

- Prisma 能连接 Neon
- 迁移能落到空库
- 种子数据能导入成功

## 5. 推到 GitHub

```bash
git add .
git commit -m "Refactor KGTI monorepo for Vercel and Neon deployment"
git push
```

## 6. 部署后端到 Vercel

### 6.1 新建后端 Project

在 Vercel 里导入同一个 GitHub 仓库，新建一个项目，名字建议：

- `kgti-api`

### 6.2 Root Directory

选择：

```text
apps/api
```

### 6.3 Build / Install

通常让 Vercel 自动识别即可。

如果你手动填，建议：

- Install Command：`npm install`
- Build Command：留空或默认

这类 Express on Vercel 的项目核心是 `apps/api/api/index.ts` 和 `apps/api/vercel.json`。

### 6.4 环境变量

在 Vercel Project 里添加：

```env
DATABASE_URL=你的 Neon pooler 连接串
DIRECT_URL=你的 Neon direct 连接串
JWT_SECRET=一段足够长的随机字符串
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://demo.wenxiangtao.com
```

如果你想同时允许 Vercel 预览域名访问，可以临时加上你的 preview 域名：

```env
CORS_ORIGIN=https://demo.wenxiangtao.com,https://your-preview-domain.vercel.app
```

### 6.5 首次上线后验证

部署成功后先打开：

```text
https://<你的-api-project>.vercel.app/api/health
```

预期返回：

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "service": "kgti-api"
  }
}
```

### 6.6 绑定自定义域名

给这个 Vercel Project 绑定：

```text
kgti-api.wenxiangtao.com
```

按 Vercel 面板提示去 DNS 服务商那里加记录，等待 SSL 生效。

然后再次验证：

```text
https://kgti-api.wenxiangtao.com/api/health
```

## 7. 部署前端到 Vercel

### 7.1 新建前端 Project

同样导入同一个 GitHub 仓库，再建一个项目，名字建议：

- `kgti-web`

### 7.2 Root Directory

选择：

```text
apps/web
```

### 7.3 环境变量

在 Vercel Project 里添加：

```env
VITE_API_BASE_URL=https://kgti-api.wenxiangtao.com/api
VITE_APP_BASE_PATH=/kgti/
```

这里的 `VITE_APP_BASE_PATH=/kgti/` 很重要，它决定前端会按子路径模式构建。

### 7.4 Build / Output 设置

这里保持最简单的默认值就行：

- Build Command：`npm run build`
- Output Directory：`dist`

不要填 `../../dist/web`，因为 Vercel 会按 `apps/web` 这个 Root Directory 去找输出目录。

### 7.5 构建结果检查

部署完成后，先直接打开你的前端 Vercel 域名：

```text
https://<你的-web-project>.vercel.app/kgti
```

你要检查：

- 首页能正常打开
- 静态资源不 404
- 图鉴图片能显示
- 刷新 `/kgti/gallery`、`/kgti/login`、`/kgti/result/...` 不会 404

## 8. 配置 demo-router

你的最终公网入口不是这个前端项目自己的域名，而是：

```text
https://demo.wenxiangtao.com/kgti
```

所以你需要去 `demo-router` 仓库里加 rewrite。

### 8.1 最核心的 rewrite 规则

把下面这组规则放进 `demo-router` 的 `vercel.json`，并且一定放在比通配 fallback 更靠前的位置：

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    {
      "source": "/kgti/assets/:path*",
      "destination": "https://YOUR-KGTI-WEB.vercel.app/kgti/assets/:path*"
    },
    {
      "source": "/kgti/images/:path*",
      "destination": "https://YOUR-KGTI-WEB.vercel.app/kgti/images/:path*"
    },
    {
      "source": "/kgti",
      "destination": "https://YOUR-KGTI-WEB.vercel.app/kgti"
    },
    {
      "source": "/kgti/:path*",
      "destination": "https://YOUR-KGTI-WEB.vercel.app/kgti/:path*"
    }
  ]
}
```

把 `YOUR-KGTI-WEB.vercel.app` 换成你真实的前端项目域名。

### 8.2 为什么要单独写 assets 和 images

因为 KGTI 前端是以 `/kgti` 为 base path 构建的：

- JS/CSS 资源会走 `/kgti/assets/...`
- 公共图片会走 `/kgti/images/...`

如果你只写一个 `/kgti/:path*` 的 catch-all，静态资源容易被错误地回落到 HTML。

## 9. 正式验收顺序

推荐按这个顺序测：

1. `https://kgti-api.wenxiangtao.com/api/health`
2. `https://YOUR-KGTI-WEB.vercel.app/kgti`
3. `https://demo.wenxiangtao.com/kgti`
4. `https://demo.wenxiangtao.com/kgti/gallery`
5. `https://demo.wenxiangtao.com/kgti/login`
6. 做一次完整游客测试
7. 打开结果页后刷新
8. 注册或登录并认领结果

## 10. 最容易踩的坑

### 10.1 只配 DNS，不配 router rewrite

DNS 解决不了 `/kgti` 这种路径问题，必须由 `demo-router` 做 rewrite。

### 10.2 前端没设 `VITE_APP_BASE_PATH=/kgti/`

这会导致资源和路由都按根路径输出，挂到 `/kgti` 后直接错位。

### 10.3 CORS 只写了本地地址

如果 API 没把 `https://demo.wenxiangtao.com` 放进 `CORS_ORIGIN`，浏览器请求会被拦截。

### 10.4 Prisma migration 还走 pooler

当前仓库已经把 `DIRECT_URL` 单独留出来了。迁移时优先让 Prisma 用 direct 连接，不要把 migration 和运行时都压到同一条 pooled URL 上。

## 11. 这次仓库里哪些文件和部署直接相关

- `apps/web/vite.config.ts`
- `apps/web/vercel.json`
- `apps/web/src/main.tsx`
- `apps/web/src/lib/assets.ts`
- `apps/web/src/components/result/PersonalityVisual.tsx`
- `apps/api/vercel.json`
- `apps/api/api/index.ts`
- `apps/api/src/app.ts`
- `prisma/schema.prisma`
- `.env.example`

如果后面你换成 `/bridgechat`、`/foo` 这种第二个项目，基本也可以照着这套结构再复制一遍。
