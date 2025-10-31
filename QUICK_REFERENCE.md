# 🎯 Citea 快速参考指南

## 📝 一句话总结

**你的项目已经有完整的用户注册/登录系统，只需配置数据库和环境变量就可以部署上线！**

---

## ⚡ 5 分钟部署清单

### Vercel 部署 (推荐)

```bash
# ✅ 步骤 1: 推送代码
git push origin main

# ✅ 步骤 2: Vercel Dashboard
# - 导入 GitHub 项目
# - 等待部署完成

# ✅ 步骤 3: 添加数据库
# Storage → Create Database → KV → Connect

# ✅ 步骤 4: 设置环境变量
# Settings → Environment Variables
# JWT_SECRET = $(openssl rand -base64 32)

# ✅ 步骤 5: 重新部署
# Deployments → Redeploy

# 🎉 完成！
```

### 自托管部署

```bash
# ✅ 步骤 1: 获取 Redis URL
# Upstash: https://upstash.com/ (免费)

# ✅ 步骤 2: 配置环境变量
cat > .env.local << EOF
REDIS_URL=your_redis_url_here
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
EOF

# ✅ 步骤 3: 初始化和启动
npm run db:init
npm run build
npm start

# 🎉 完成！
```

---

## 📚 关键文档

| 文档 | 用途 | 阅读时间 |
|------|------|----------|
| [README_DEPLOYMENT.md](./README_DEPLOYMENT.md) | 快速部署 | 3 分钟 |
| [PRODUCTION_GUIDE.md](./PRODUCTION_GUIDE.md) | 详细指南 | 10 分钟 |
| [DATABASE_SETUP.md](./DATABASE_SETUP.md) | 数据库配置 | 5 分钟 |
| [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) | 检查清单 | 5 分钟 |
| [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) | 技术总结 | 5 分钟 |

---

## 🔧 有用命令

```bash
# 开发
npm run dev              # 启动开发服务器

# 数据库
npm run db:init          # 初始化数据库 + 查看统计
npm run db:test          # 创建测试用户 (test@citea.com / test123456)
npm run db:migrate       # 从文件迁移到 Redis

# 部署
npm run build            # 构建生产版本
npm start                # 启动生产服务器
npm run lint             # 代码检查
```

---

## 🔑 必需的环境变量

### 生产环境 (Vercel)

```bash
# 必需
JWT_SECRET=your_32_char_secret_key_here

# Vercel KV 自动添加
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
```

### 生产环境 (自托管)

```bash
# 必需
REDIS_URL=redis://your_redis_url
JWT_SECRET=your_32_char_secret_key_here
NODE_ENV=production
```

### 生成 JWT 密钥

```bash
# 方法 1: OpenSSL (推荐)
openssl rand -base64 32

# 方法 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## ✅ 测试流程

### 1. 测试注册

```
访问: /auth/signup
填写: 姓名、邮箱、密码 (≥8字符)
结果: 应跳转到 /dashboard
```

### 2. 测试登录

```
访问: /auth/signin
填写: 注册的邮箱和密码
结果: 应跳转到 /dashboard
```

### 3. 测试会话

```
刷新页面 → 仍然登录
关闭浏览器 → 7天内仍然登录
访问 /dashboard 未登录 → 重定向到 /auth/signin
```

### 4. 检查数据库

```bash
npm run db:init
# 应显示用户列表
```

---

## 🐛 故障排除

| 问题 | 解决方案 |
|------|----------|
| "Database not configured" | 检查 REDIS_URL 或 Vercel KV 配置 |
| 无法设置 Cookie | 确保使用 HTTPS (生产环境) |
| JWT 错误 | 检查 JWT_SECRET 是否正确设置 |
| 数据库连接失败 | 运行 `npm run db:init` 测试连接 |
| 用户无法登录 | 检查密码是否正确，清除浏览器 Cookie 重试 |

---

## 📊 项目特性

### ✅ 已实现

- [x] 用户注册 (邮箱 + 密码)
- [x] 用户登录
- [x] 会话管理 (7 天)
- [x] 路由保护 (中间件)
- [x] 密码加密 (bcrypt)
- [x] JWT 认证
- [x] Redis/KV 数据库
- [x] 本地开发支持
- [x] 完整文档
- [x] 数据库脚本

### 🚧 可选增强

- [ ] 邮件验证
- [ ] 忘记密码
- [ ] 社交登录
- [ ] 用户资料页
- [ ] 订阅管理
- [ ] 支付集成

---

## 🌐 关键路由

```
/ ........................ 主页
/auth/signup ............. 注册页面
/auth/signin ............. 登录页面
/dashboard ............... 用户控制台 (需登录)

API:
/api/auth/signup ......... 注册 API
/api/auth/signin ......... 登录 API
/api/auth/signout ........ 退出 API
/api/auth/me ............. 获取当前用户
```

---

## 💡 最佳实践

### 安全

- ✅ 使用强 JWT 密钥 (≥32 字符)
- ✅ 生产环境启用 HTTPS
- ✅ 定期更换 JWT 密钥
- ✅ 不要提交 .env.local 到 Git
- ✅ 密码最短 8 字符

### 性能

- ✅ 使用 Redis/KV (不要用文件存储)
- ✅ 启用 CDN
- ✅ 定期备份数据
- ✅ 监控错误日志

### 维护

- ✅ 定期更新依赖
- ✅ 定期检查日志
- ✅ 设置错误监控 (Sentry)
- ✅ 配置自动备份

---

## 📞 获取帮助

**遇到问题？按优先级查看:**

1. 📖 [常见问题](./PRODUCTION_GUIDE.md#常见问题)
2. 📚 [完整文档](./PRODUCTION_GUIDE.md)
3. 💬 GitHub Issues
4. 📧 Email: support@citea.com

---

## 🎉 下一步

部署成功后:

1. ✅ 测试所有功能
2. ✅ 邀请用户测试
3. ✅ 设置监控和日志
4. ✅ 配置自定义域名
5. ⬜ 添加更多功能

---

## 🚀 快速命令速查

```bash
# 开发
npm run dev

# 测试数据库
npm run db:init

# 创建测试用户
npm run db:test

# 部署
npm run build && npm start

# 查看帮助
cat README_DEPLOYMENT.md
```

---

**记住**: 你的项目已经可以直接部署了！只需要配置数据库和环境变量。

**祝部署顺利！** 🎊

---

*最后更新: 2025-10-31*

