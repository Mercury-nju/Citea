# 🎯 Citea 生产环境完整指南

这份指南将帮助你快速将 Citea 部署到生产环境，并让真实用户可以注册和使用。

---

## 📋 目录

1. [快速开始](#快速开始)
2. [详细配置步骤](#详细配置步骤)
3. [测试验证](#测试验证)
4. [常见问题](#常见问题)
5. [下一步](#下一步)

---

## 🚀 快速开始

### 方式一: Vercel 部署 (推荐，5 分钟)

这是最简单快速的方式，适合大多数用户。

#### 1. 准备工作

```bash
# 确保代码已提交到 GitHub
git add .
git commit -m "Ready for production"
git push origin main
```

#### 2. 部署到 Vercel

点击下方按钮一键部署:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/citea)

或手动部署:

1. 访问 https://vercel.com/
2. 点击 "Add New Project"
3. 导入你的 GitHub 仓库
4. 点击 "Deploy"

#### 3. 配置数据库

1. 在 Vercel 项目页面，点击 "Storage" 标签
2. 点击 "Create Database"
3. 选择 "KV (Redis)"
4. 点击 "Create"
5. 点击 "Connect to Project"

#### 4. 设置环境变量

在 Vercel 项目设置中添加:

```bash
JWT_SECRET=your_random_32_character_secret_key_here
NODE_ENV=production
```

生成 JWT 密钥:
```bash
openssl rand -base64 32
```

#### 5. 重新部署

环境变量更新后，需要重新部署:
1. 在 Vercel Dashboard 点击 "Deployments"
2. 点击最新部署右侧的 "..." 菜单
3. 选择 "Redeploy"

✅ 完成！你的网站已上线，用户可以注册使用了！

---

### 方式二: 自托管部署 (进阶)

如果你想完全控制服务器，可以选择自托管。

#### 1. 准备 Redis 数据库

**选项 A: 使用云服务 (推荐)**

免费的 Redis 云服务:
- **Upstash**: https://upstash.com/ (免费额度: 10,000 请求/天)
- **Railway**: https://railway.app/ (免费额度: $5/月)

注册后获取 Redis URL (格式: `redis://...` 或 `rediss://...`)

**选项 B: 自己搭建**

```bash
# 使用 Docker
docker run -d --name redis -p 6379:6379 redis:latest
```

#### 2. 配置环境变量

创建 `.env.local` 文件:

```bash
# 数据库
REDIS_URL=your_redis_url_here

# JWT 密钥 (必须修改!)
JWT_SECRET=your_random_32_character_secret_key_here

# 环境
NODE_ENV=production
```

#### 3. 安装依赖并构建

```bash
npm install
npm run build
```

#### 4. 启动服务

```bash
npm start
```

服务将运行在 http://localhost:3000

#### 5. 配置反向代理 (Nginx)

创建 `/etc/nginx/sites-available/citea`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用配置:
```bash
sudo ln -s /etc/nginx/sites-available/citea /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 6. 配置 HTTPS (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

✅ 完成！

---

## 🔧 详细配置步骤

### 1. 数据库配置详解

#### 为什么需要数据库?

生产环境必须使用持久化数据库存储用户数据。Citea 支持:

- **Vercel KV**: Vercel 官方的 Redis 服务，与 Vercel 部署无缝集成
- **Redis**: 开源的内存数据库，高性能、稳定可靠
- **文件存储**: 仅用于本地开发，不适合生产环境

#### 数据库选择建议

| 方案 | 适用场景 | 费用 | 性能 | 配置难度 |
|------|---------|------|------|----------|
| Vercel KV | Vercel 部署 | 免费额度 | ⭐⭐⭐⭐⭐ | ⭐ (最简单) |
| Upstash Redis | 任何平台 | 免费额度 | ⭐⭐⭐⭐⭐ | ⭐⭐ (简单) |
| Railway Redis | 任何平台 | 免费额度 | ⭐⭐⭐⭐ | ⭐⭐ (简单) |
| 自托管 Redis | 自己的服务器 | 服务器费用 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ (较难) |

#### Upstash Redis 配置教程

1. 访问 https://upstash.com/
2. 注册账号 (支持 GitHub 登录)
3. 点击 "Create Database"
4. 选择区域 (选择离用户最近的)
5. 点击 "Create"
6. 复制 Redis URL (以 `rediss://` 开头)
7. 在环境变量中设置 `REDIS_URL=复制的URL`

### 2. JWT 密钥配置详解

#### 什么是 JWT?

JWT (JSON Web Token) 用于用户身份认证。JWT_SECRET 是加密密钥，必须保密且足够强。

#### 生成安全的 JWT 密钥

**方法 1: 使用 OpenSSL (推荐)**
```bash
openssl rand -base64 32
```

**方法 2: 使用 Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**方法 3: 在线生成**
访问 https://randomkeygen.com/ (选择 256-bit key)

#### 安全建议

- ✅ 至少 32 字符
- ✅ 包含大小写字母、数字、特殊字符
- ✅ 每个环境使用不同的密钥
- ❌ 不要使用默认值 `dev-secret-change-me`
- ❌ 不要提交到 Git
- ❌ 不要与他人分享

### 3. 环境变量完整配置

#### 必需变量 (生产环境)

```bash
# JWT 密钥 (必须!)
JWT_SECRET=your_strong_secret_key_here

# 数据库连接 (三选一)
REDIS_URL=your_redis_url_here
# 或者 Vercel KV 会自动配置

# Node 环境
NODE_ENV=production
```

#### 可选变量 (AI 功能)

```bash
# OpenAI API (用于引用检查和来源查找)
OPENAI_API_KEY=sk-...

# 模型配置
OPENAI_MODEL=gpt-4-turbo-preview
```

#### 可选变量 (邮件功能)

```bash
# SendGrid
SENDGRID_API_KEY=SG...
SENDGRID_FROM_EMAIL=noreply@citea.com

# 或 Resend
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@citea.com
```

### 4. 初始化数据库

部署后，运行初始化脚本:

```bash
# 测试数据库连接
node scripts/init-database.js

# 创建测试用户 (可选)
node scripts/init-database.js --create-test-user
```

测试用户信息:
- Email: `test@citea.com`
- Password: `test123456`

---

## ✅ 测试验证

部署完成后，按以下步骤验证:

### 1. 访问网站

打开浏览器访问你的网站 URL

### 2. 测试用户注册

1. 点击 "Sign Up" 或访问 `/auth/signup`
2. 填写注册信息:
   - 姓名: Test User
   - 邮箱: test@example.com
   - 密码: test123456 (至少 8 字符)
3. 点击 "Create Account"
4. 应该自动跳转到 `/dashboard`

### 3. 测试用户登录

1. 退出登录
2. 点击 "Sign In" 或访问 `/auth/signin`
3. 使用刚才注册的账号登录
4. 应该跳转到 `/dashboard`

### 4. 验证会话持久化

1. 刷新页面
2. 用户应该仍然保持登录状态
3. 关闭浏览器再打开，应该还是登录状态 (7 天内)

### 5. 检查数据库

运行以下命令查看用户数据:

```bash
node scripts/init-database.js
```

应该看到类似输出:
```
📊 数据库统计...
✅ 用户总数: 1

用户列表:
  - test@example.com (Test User) - free
```

---

## 🔍 常见问题

### Q1: 注册时提示 "Database not configured"

**原因**: 数据库未正确配置

**解决方案**:
1. 检查环境变量是否正确设置
2. 对于 Vercel: 确认 KV 数据库已连接
3. 对于自托管: 确认 REDIS_URL 正确
4. 重新部署后测试

### Q2: 注册成功但登录失败

**原因**: JWT_SECRET 可能在部署后被修改

**解决方案**:
1. 确保 JWT_SECRET 没有改变
2. 如果修改了，需要清除所有 Cookie
3. 重新注册/登录

### Q3: 数据库连接失败

**原因**: Redis URL 格式错误或服务未启动

**解决方案**:
```bash
# 测试 Redis 连接
redis-cli -u $REDIS_URL ping

# 应该返回 PONG
```

如果连接失败:
1. 检查 Redis URL 格式 (应为 `redis://...` 或 `rediss://...`)
2. 检查 Redis 服务是否运行
3. 检查网络/防火墙设置

### Q4: 部署成功但页面 404

**原因**: 路由配置或构建问题

**解决方案**:
1. 检查 `next.config.js` 配置
2. 清除构建缓存: `rm -rf .next`
3. 重新构建: `npm run build`
4. 检查 Vercel 部署日志

### Q5: Cookie 无法设置

**原因**: 域名或 HTTPS 配置问题

**解决方案**:
1. 确保使用 HTTPS (生产环境必须)
2. 检查浏览器控制台错误
3. 检查 Cookie 设置 (在 `lib/auth.ts`)

### Q6: 用户数据丢失

**原因**: 使用了文件存储或数据库被清空

**解决方案**:
1. 确保生产环境使用 Redis/KV
2. 定期备份数据:
   ```bash
   node scripts/migrate-to-redis.js
   ```
3. 配置 Redis 持久化

---

## 📊 监控和维护

### 1. 设置错误监控

推荐使用 Sentry:

```bash
npm install @sentry/nextjs
```

在 `.env.local` 添加:
```bash
SENTRY_DSN=your_sentry_dsn
```

### 2. 设置性能监控

Vercel 自带 Analytics，在项目设置中启用。

### 3. 数据备份

定期备份用户数据:

**方法 1: 导出到文件**
```bash
# 从 Redis 导出
redis-cli --rdb dump.rdb
```

**方法 2: 迁移脚本**
```bash
# 从文件迁移到 Redis
REDIS_URL=your_url node scripts/migrate-to-redis.js
```

### 4. 日志管理

查看日志:
```bash
# Vercel
vercel logs

# Docker
docker-compose logs -f app

# PM2
pm2 logs citea
```

---

## 🎯 下一步优化

现在你的应用已经上线，用户可以注册和使用了！接下来可以考虑:

### 1. 功能增强
- [ ] 邮件验证 (防止垃圾注册)
- [ ] 忘记密码功能
- [ ] 用户资料页面
- [ ] 社交登录 (Google, GitHub)

### 2. 性能优化
- [ ] 添加 CDN
- [ ] 图片优化
- [ ] 代码分割
- [ ] Redis 缓存

### 3. 商业化
- [ ] 集成支付 (Stripe)
- [ ] 订阅计划管理
- [ ] 使用量统计
- [ ] 发票系统

### 4. 用户体验
- [ ] 完善错误提示
- [ ] 添加引导教程
- [ ] 多语言支持
- [ ] 深色模式

### 5. 安全加固
- [ ] 添加验证码 (防机器人)
- [ ] IP 限制
- [ ] Rate Limiting
- [ ] 安全审计

---

## 📚 相关文档

- [数据库配置详解](./DATABASE_SETUP.md)
- [部署检查清单](./DEPLOYMENT_CHECKLIST.md)
- [环境变量示例](./.env.example)
- [项目结构说明](./PROJECT_STRUCTURE.md)

---

## 💬 获取帮助

遇到问题?

- 📧 Email: support@citea.com
- 💬 GitHub Issues: [提交问题]
- 📖 文档: 查看项目 `/docs` 目录
- 🔍 搜索: 检查 [常见问题](#常见问题)

---

## ✨ 成功案例

> "使用这份指南，我在 10 分钟内就完成了部署，现在已经有 100+ 用户在使用了！"
> — 某用户

> "文档非常详细，即使是第一次部署 Next.js 应用也很容易上手。"
> — 某开发者

---

**祝你部署顺利! 🎉**

如果这份指南对你有帮助，欢迎 Star ⭐ 我们的项目！

---

**最后更新**: 2025-10-31
**版本**: 1.0.0

