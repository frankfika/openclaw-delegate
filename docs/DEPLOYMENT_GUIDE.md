# VoteNow 部署指南

## ✅ 已完成：前端部署

### Cloudflare Pages
- **URL**: https://votenow-86u.pages.dev
- **状态**: ✅ 已部署成功
- **框架**: React 19 + Vite
- **自动部署**: 连接到 GitHub 仓库后自动触发

### 访问地址
```
生产环境: https://votenow-86u.pages.dev
预览部署: https://e66dc5cc.votenow-86u.pages.dev
```

---

## 🔧 待完成：后端 API 部署

### 推荐方案：Railway (最简单)

**为什么选择 Railway？**
- 完整 Node.js 支持（无需修改代码）
- 自动从 GitHub 部署
- 免费 $5/月额度
- 自带 PostgreSQL/Redis
- 5 分钟完成部署

#### 部署步骤

1. **创建 Railway 账号**
   ```
   访问: https://railway.app
   使用 GitHub 登录
   ```

2. **新建项目**
   ```bash
   # 选择 "Deploy from GitHub repo"
   # 选择: frankfika/openclaw-delegate
   # Root Directory: server
   # Build Command: npm install
   # Start Command: npm start
   ```

3. **配置环境变量**
   在 Railway Dashboard 中添加:
   ```
   DEEPSEEK_API_KEY=sk-659c30588e7041668dcd34b3027bd827
   TELEGRAM_BOT_TOKEN=8386258337:AAFAX5z4yiwcoU5hi_LJlbIczJSYiX8Nnjc
   PORT=3001
   FRONTEND_URL=https://votenow-86u.pages.dev
   NODE_ENV=production
   ```

4. **获取 API URL**
   ```
   Railway 会自动生成: https://votenow-api-production.up.railway.app
   ```

5. **更新前端 API 地址**
   在 `frontend/src/services/api.ts` 中:
   ```typescript
   const API_URL = 'https://votenow-api-production.up.railway.app'
   ```

---

### 备选方案 1：Fly.io

```bash
# 安装 Fly CLI
brew install flyctl

# 登录
flyctl auth login

# 在 server 目录
cd server

# 初始化
flyctl launch --name votenow-api --region sin

# 设置环境变量
flyctl secrets set DEEPSEEK_API_KEY=xxx
flyctl secrets set TELEGRAM_BOT_TOKEN=xxx
flyctl secrets set FRONTEND_URL=https://votenow-86u.pages.dev

# 部署
flyctl deploy
```

**成本**: $5-10/月

---

### 备选方案 2：Render

```bash
# 访问 https://render.com
# 选择 "New Web Service"
# 连接 GitHub: frankfika/openclaw-delegate
# Root Directory: server
# Build Command: npm install
# Start Command: npm start

# 环境变量（在 Dashboard 设置）:
DEEPSEEK_API_KEY=xxx
TELEGRAM_BOT_TOKEN=xxx
FRONTEND_URL=https://votenow-86u.pages.dev
PORT=3001
```

**成本**: 免费（有限额）

---

### 备选方案 3：Vercel Serverless Functions

需要修改代码为 Serverless 模式：
```typescript
// api/index.ts
export default async function handler(req, res) {
  // Hono app logic
}
```

**优点**: 免费额度大
**缺点**: 需要重构代码

---

## 📝 部署清单

### 前端（已完成 ✅）
- [x] 构建生产版本 (`npm run build`)
- [x] 部署到 Cloudflare Pages
- [x] 获取生产 URL: https://votenow-86u.pages.dev

### 后端（待完成 ⏳）
- [ ] 选择部署平台（推荐 Railway）
- [ ] 配置环境变量（DEEPSEEK_API_KEY 等）
- [ ] 部署后端 API
- [ ] 获取 API URL
- [ ] 更新前端 API 配置
- [ ] 重新部署前端（连接新 API）

### 数据库（生产优化 - 可选）
- [ ] 添加 PostgreSQL（Railway 内置）
- [ ] 迁移数据（从 in-memory 到 DB）
- [ ] 添加 Redis 缓存

---

## 🚀 快速部署（推荐 Railway）

### 一键部署命令

```bash
# 1. 安装 Railway CLI
npm install -g @railway/cli

# 2. 登录
railway login

# 3. 在 server 目录部署
cd server
railway init
railway up

# 4. 添加环境变量
railway variables set DEEPSEEK_API_KEY=sk-659c30588e7041668dcd34b3027bd827
railway variables set TELEGRAM_BOT_TOKEN=8386258337:AAFAX5z4yiwcoU5hi_LJlbIczJSYiX8Nnjc
railway variables set FRONTEND_URL=https://votenow-86u.pages.dev

# 5. 获取 URL
railway domain
```

---

## 🔄 CI/CD 自动部署

### GitHub Actions（未来优化）

```yaml
# .github/workflows/deploy.yml
name: Deploy VoteNow
on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: cd frontend && npm install && npm run build
      - uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          projectName: votenow

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: railwayapp/railway-action@v1
        with:
          apiToken: ${{ secrets.RAILWAY_API_TOKEN }}
          dir: server
```

---

## 📊 部署成本估算

| 平台 | 前端 | 后端 | 数据库 | 总计 |
|------|------|------|--------|------|
| **Cloudflare + Railway** | $0 | $5/月 | $0 (内置) | **$5/月** |
| **Cloudflare + Fly.io** | $0 | $5-10/月 | $0 (内置) | **$5-10/月** |
| **Cloudflare + Render** | $0 | $0 (Free tier) | $0 | **$0/月** |
| **Vercel (全栈)** | $0 | $0 (Serverless) | 需外接 | **$0/月** |

**推荐配置**: Cloudflare Pages (前端) + Railway (后端) = $5/月

---

## 🔧 故障排查

### 前端无法访问
```bash
# 检查部署状态
wrangler pages deployment list --project-name=votenow

# 查看日志
wrangler pages deployment tail --project-name=votenow
```

### 后端 API 报错
```bash
# Railway 查看日志
railway logs

# Fly.io 查看日志
flyctl logs
```

### CORS 错误
确保后端 CORS 配置包含前端 URL:
```typescript
app.use('*', cors({
  origin: ['https://votenow-86u.pages.dev'],
  // ...
}))
```

---

## 🎯 下一步

1. **立即部署后端到 Railway**（最快 5 分钟）
2. **更新前端 API URL**
3. **重新部署前端**
4. **测试完整流程**
5. **绑定自定义域名**（可选）

需要我帮你自动执行 Railway 部署吗？
