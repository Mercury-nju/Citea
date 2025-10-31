# 🚀 Citea 生产部署快速指南

## 开始之前

你的 Citea 项目已经包含了完整的用户认证系统！用户可以:
- ✅ 注册账号
- ✅ 登录/登出
- ✅ 会话管理
- ✅ 数据持久化

现在只需要 **配置数据库** 和 **设置环境变量**，就可以部署上线了！

---

## ⚡ 5 分钟快速部署 (Vercel + KV)

### 步骤 1: 推送代码到 GitHub

```bash
git add .
git commit -m "Ready for production"
git push origin main
```

### 步骤 2: 部署到 Vercel

1. 访问 https://vercel.com/
2. 点击 "New Project"
3. 导入你的 GitHub 仓库
4. 点击 "Deploy"

### 步骤 3: 添加数据库

在 Vercel 项目页面:
1. 点击 "Storage" 标签
2. 点击 "Create Database"
3. 选择 "KV" 
4. 点击 "Create" → "Connect to Project"

### 步骤 4: 设置 JWT 密钥

在 Vercel 项目设置 → Environment Variables 添加:

```
JWT_SECRET=你的32位随机密钥
```

生成密钥:
```bash
openssl rand -base64 32
```

### 步骤 5: 重新部署

在 Vercel Deployments 页面，重新部署最新版本。

✅ **完成！访问你的网站，用户可以注册使用了！**

---

## 🔧 自托管部署 (Redis)

### 1. 获取 Redis 数据库

**免费选项 (推荐新手):**
- [Upstash](https://upstash.com/) - 10,000 请求/天免费
- [Railway](https://railway.app/) - $5/月免费额度

**自建选项:**
```bash
docker run -d -p 6379:6379 redis:latest
```

### 2. 配置环境变量

创建 `.env.local`:

```bash
REDIS_URL=your_redis_url_here
JWT_SECRET=your_32_char_secret_key
NODE_ENV=production
```

### 3. 安装和启动

```bash
npm install
npm run build
npm start
```

访问 http://localhost:3000

---

## ✅ 测试验证

### 测试注册
1. 访问 `/auth/signup`
2. 填写信息注册
3. 应该跳转到 `/dashboard`

### 测试登录
1. 退出后访问 `/auth/signin`
2. 使用注册的账号登录
3. 应该跳转到 `/dashboard`

### 检查数据库
```bash
npm run db:init
```

应该看到用户数据。

---

## 📚 详细文档

- **完整部署指南**: [PRODUCTION_GUIDE.md](./PRODUCTION_GUIDE.md)
- **数据库配置**: [DATABASE_SETUP.md](./DATABASE_SETUP.md)
- **部署检查清单**: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
- **环境变量示例**: [.env.example](./.env.example)

---

## 🛠️ 有用的命令

```bash
# 初始化数据库
npm run db:init

# 创建测试用户
npm run db:test

# 从文件迁移到 Redis
npm run db:migrate
```

---

## ❓ 遇到问题?

### 注册时报错 "Database not configured"
→ 检查 REDIS_URL 或 Vercel KV 是否正确配置

### Cookie 无法设置
→ 确保使用 HTTPS (生产环境必须)

### 数据库连接失败
→ 运行 `npm run db:init` 测试连接

更多问题请查看 [PRODUCTION_GUIDE.md](./PRODUCTION_GUIDE.md) 的常见问题部分。

---

## 🎯 现在可以做什么?

你的用户认证系统已经可以使用了！接下来:

1. ✅ 部署到生产环境
2. ✅ 让用户注册测试
3. ⬜ 添加邮件验证 (可选)
4. ⬜ 集成支付系统 (可选)
5. ⬜ 添加用户资料页 (可选)

---

**快速帮助**: 如有问题，请参考详细文档或提交 Issue。

祝部署顺利! 🎉

