# 数据库配置指南

## 概述

Citea 支持三种数据存储方案：
1. **本地文件存储** (开发环境)
2. **Redis** (推荐用于生产环境)
3. **Vercel KV** (Vercel 平台部署)

---

## 方案一：本地开发 (文件存储)

### 适用场景
- 本地开发和测试
- 无需额外配置

### 配置步骤
1. 无需任何配置，系统会自动创建 `data/users.json` 文件
2. 运行 `npm run dev` 即可使用

### 注意事项
⚠️ **不要在生产环境使用文件存储！**
- 数据不持久化
- 无法扩展
- 性能差

---

## 方案二：Redis (推荐生产环境)

### 适用场景
- 生产环境部署
- 需要高性能和可靠性
- 自托管服务器或云平台

### 配置步骤

#### 1. 获取 Redis 实例

**选项 A: 使用 Upstash (免费额度)**
1. 访问 [https://upstash.com/](https://upstash.com/)
2. 注册并创建 Redis 数据库
3. 获取 Redis URL (格式: `rediss://...`)

**选项 B: 使用 Railway**
1. 访问 [https://railway.app/](https://railway.app/)
2. 创建新项目并添加 Redis 服务
3. 获取 Redis URL

**选项 C: 使用 Redis Cloud**
1. 访问 [https://redis.com/try-free/](https://redis.com/try-free/)
2. 创建免费数据库
3. 获取连接 URL

**选项 D: 自托管 Redis**
```bash
# Docker 快速启动
docker run -d -p 6379:6379 redis:latest

# 连接 URL
redis://localhost:6379
```

#### 2. 配置环境变量

创建 `.env.local` 文件：
```bash
# Redis 配置
REDIS_URL=your_redis_url_here

# JWT 密钥 (必须修改！)
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars_long_change_this

# 环境
NODE_ENV=production
```

#### 3. 测试连接

```bash
npm run dev
```

访问 `/auth/signup` 注册一个测试账号，如果成功则配置正确。

---

## 方案三：Vercel KV (Vercel 部署)

### 适用场景
- 部署在 Vercel 平台
- 需要无服务器架构
- 快速上线

### 配置步骤

#### 1. 创建 Vercel KV 数据库

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 进入你的项目
3. 点击 **Storage** 标签
4. 点击 **Create Database**
5. 选择 **KV (Redis)**
6. 点击 **Create**

#### 2. 连接数据库到项目

1. 在 KV 数据库页面，点击 **Connect to Project**
2. 选择你的项目
3. Vercel 会自动添加以下环境变量：
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN`
   - `KV_URL`

#### 3. 添加 JWT 密钥

在 Vercel 项目设置中添加环境变量：
```bash
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars_long_change_this
```

#### 4. 重新部署

```bash
git push
```

或在 Vercel Dashboard 中手动触发部署。

---

## 环境变量完整列表

### 必需变量

```bash
# JWT 密钥 (生产环境必须修改！)
JWT_SECRET=your_secret_key_here

# 数据库配置 (三选一)
REDIS_URL=your_redis_url          # Redis 方案
# 或 Vercel KV 会自动配置以下变量：
# KV_REST_API_URL=...
# KV_REST_API_TOKEN=...
```

### 可选变量

```bash
# Node 环境
NODE_ENV=production

# API 密钥 (如果使用 AI 功能)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
```

---

## 数据结构

### 用户数据模型

```typescript
{
  id: string              // UUID
  name: string           // 用户名
  email: string          // 邮箱 (唯一)
  passwordHash: string   // 加密后的密码
  plan: string           // 订阅计划: 'free' | 'pro' | 'enterprise'
  createdAt: string      // 创建时间 (ISO 8601)
  lastLoginAt: string    // 最后登录时间
}
```

### Redis 存储结构

```
Key: user:{email}
Type: Hash
Fields:
  - id
  - name
  - email
  - passwordHash
  - plan
  - createdAt
  - lastLoginAt
```

---

## 数据迁移

### 从文件存储迁移到 Redis

运行迁移脚本：
```bash
node scripts/migrate-to-redis.js
```

### 从 Redis 迁移到 Vercel KV

Vercel KV 与 Redis 兼容，直接配置环境变量即可。

---

## 安全建议

### 1. JWT 密钥
- ✅ 至少 32 字符
- ✅ 包含大小写字母、数字、特殊字符
- ✅ 定期更换 (建议每 6 个月)
- ❌ 不要使用默认值 'dev-secret-change-me'

### 2. 密码策略
- ✅ 最短 8 字符 (当前配置)
- ✅ 使用 bcrypt 加密 (已实现)
- ✅ Salt rounds: 10 (已配置)

### 3. 环境变量
- ✅ 不要提交 `.env.local` 到 Git
- ✅ 生产环境使用环境变量管理
- ✅ 定期审查和更新

### 4. HTTPS
- ✅ 生产环境必须使用 HTTPS
- ✅ Cookie 设置为 secure (已配置)

---

## 性能优化

### Redis 连接池
当前配置使用单一 Redis 连接。高流量场景下建议配置连接池：

```typescript
// lib/userStore.ts
const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true
})
```

### 缓存策略
考虑添加用户数据缓存：
- 会话缓存 (JWT 已实现)
- 用户信息缓存 (可选)

---

## 监控和日志

### 推荐工具
- **Upstash Console**: 查看 Redis 使用情况
- **Vercel Analytics**: 监控 API 性能
- **Sentry**: 错误追踪
- **LogRocket**: 用户会话回放

### 关键指标
- 用户注册量
- 登录成功率
- API 响应时间
- 数据库连接错误

---

## 常见问题

### Q1: 如何生成安全的 JWT 密钥？

```bash
# 方法 1: OpenSSL
openssl rand -base64 32

# 方法 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# 方法 3: 在线工具
# https://randomkeygen.com/
```

### Q2: 忘记密码功能如何实现？

需要添加：
1. 密码重置令牌表
2. 邮件发送服务 (SendGrid/Resend)
3. 重置密码页面

参考 `docs/PASSWORD_RESET.md` (待创建)

### Q3: 如何备份用户数据？

**Redis 方案：**
```bash
# 导出
redis-cli --rdb dump.rdb

# 导入
redis-cli --pipe < dump.rdb
```

**Vercel KV：**
使用 Vercel CLI 或 API 导出数据

### Q4: 支持社交登录吗？

当前仅有 UI，需要集成：
- NextAuth.js (推荐)
- Auth0
- Supabase Auth

参考 `docs/SOCIAL_AUTH.md` (待创建)

### Q5: 如何限制 API 调用频率？

添加 Rate Limiting 中间件：
```typescript
// lib/rateLimit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),
})
```

---

## 下一步

1. ✅ 选择数据库方案
2. ✅ 配置环境变量
3. ✅ 测试注册登录
4. ⬜ 添加邮件验证
5. ⬜ 实现忘记密码
6. ⬜ 添加用户资料页面
7. ⬜ 集成支付系统
8. ⬜ 添加使用统计

---

## 技术支持

遇到问题？
- 📧 Email: support@citea.com
- 💬 GitHub Issues: [项目仓库]
- 📚 文档: `/docs`

---

**最后更新**: 2025-10-31

