# 上线前代码检查清单

## ✅ 已检查的核心功能

### 1. 注册/登录流程
- ✅ 注册API (`app/api/auth/signup/route.ts`)
  - 密码哈希使用 bcrypt
  - 邮箱验证码生成和发送
  - 用户创建和积分初始化
  - 错误处理完善
- ✅ 登录API (`app/api/auth/signin/route.ts`)
  - JWT token 生成
  - 密码验证
  - 用户信息返回
- ⚠️ **问题**: 登录后没有自动设置 cookie，需要前端处理

### 2. 核心功能 API

#### Source Finder (`app/api/find-sources/route.ts`)
- ✅ 用户认证检查
- ✅ 字数限制检查
- ✅ 积分消耗机制
- ✅ 多数据库搜索（CrossRef, PubMed, Semantic Scholar, arXiv）
- ✅ 智能意图分析
- ✅ 分步执行支持
- ✅ 错误处理完善

#### Citation Checker (`app/api/check-citations/route.ts`)
- ✅ 用户认证检查
- ✅ 字数限制检查
- ✅ 积分消耗机制
- ✅ 引用提取和解析
- ✅ 数据库验证（CrossRef, Semantic Scholar）
- ✅ 相似度计算
- ✅ 超时保护（15秒）
- ✅ 错误处理完善

#### AI Chat (`app/api/chat/route.ts`)
- ✅ 用户认证检查
- ✅ 积分消耗（所有用户可用）
- ✅ 多语言支持
- ✅ 通义千问 API 集成

### 3. 支付系统
- ✅ Creem Checkout (`app/api/creem/checkout/route.ts`)
  - API Key 检查
  - 产品 ID 映射（月费/年费）
  - 用户邮箱 metadata
  - 错误处理
- ✅ Creem Webhook (`app/api/creem/webhook/route.ts`)
  - 事件处理（激活/取消）
  - 用户套餐更新
  - 积分重置
  - ⚠️ **缺少**: Webhook 签名验证（如 Creem 提供）

### 4. 认证系统
- ✅ JWT 生成和验证 (`lib/auth.ts`)
  - 使用 jose 库
  - 7天过期时间
  - Cookie 设置
  - ⚠️ **问题**: secure cookie 被禁用（生产环境应启用）
- ✅ Middleware (`middleware.ts`)
  - 路由保护
  - Dashboard 路由客户端处理
  - 登录状态检查

### 5. 积分系统 (`lib/credits.ts`)
- ✅ 计划限制配置
- ✅ 积分重置逻辑（日/周/月/年）
- ✅ 积分消耗
- ✅ 字数限制检查

### 6. 用户存储 (`lib/userStore.ts`)
- ✅ 支持 KV 和 Redis
- ✅ 用户创建、更新、查询
- ✅ 邮箱验证
- ✅ 积分管理

## ⚠️ 需要检查的配置

### 必需的环境变量

#### 生产环境必须配置：
1. **JWT_SECRET** - JWT 签名密钥（必须设置，不能使用默认值）
2. **BREVO_API_KEY** - 邮件服务 API Key
3. **BREVO_FROM_EMAIL** - 发件邮箱地址
4. **TONGYI_API_KEY** - 通义千问 API Key（已有默认值，建议配置）
5. **CREEM_API_KEY** - Creem 支付 API Key
6. **CREEM_PRODUCT_ID_MONTHLY** - 月费产品 ID（可选，有默认值）
7. **CREEM_PRODUCT_ID_YEARLY** - 年费产品 ID（可选，有默认值）

#### 数据库配置（二选一）：
8. **KV_REST_API_URL** + **KV_REST_API_TOKEN** - Vercel KV
   或
9. **REDIS_URL** - Redis 连接字符串（格式：`redis://...` 或 `rediss://...`）

### 安全检查

#### 🔴 高优先级问题：
1. **JWT_SECRET 默认值** (`lib/auth.ts:15`)
   - 当前使用 `'dev-secret-change-me'` 作为默认值
   - **必须**在生产环境设置强随机密钥
   - 建议：使用 `openssl rand -base64 32` 生成

2. **Secure Cookie 被禁用** (`lib/auth.ts:117`)
   - 当前 `secure: false`
   - 生产环境应设置为 `true`（HTTPS 必须）

3. **TONGYI_API_KEY 硬编码** (`app/api/find-sources/route.ts:7`, `app/api/check-citations/route.ts:8`)
   - 有默认值，建议移至环境变量

#### 🟡 中优先级问题：
1. **Webhook 缺少签名验证** (`app/api/creem/webhook/route.ts:9`)
   - 如果 Creem 提供签名验证，应该实现

2. **错误信息泄露** (`app/api/auth/signup/route.ts:114`)
   - 开发环境显示详细错误，生产环境应隐藏

3. **超时设置** (`app/api/check-citations/route.ts:192, 212`)
   - 15秒超时可能对某些请求太短

#### 🟢 低优先级建议：
1. **日志过多** - 生产环境可减少 console.log
2. **Rate Limiting** - API 路由缺少限流保护
3. **CORS 配置** - 如需要跨域访问

## 📋 上线前必须完成的步骤

### 1. 环境变量配置
在 Vercel 项目设置中配置以下变量：

```bash
# 必需
JWT_SECRET=<生成32字符以上的随机字符串>
BREVO_API_KEY=<你的Brevo API Key>
BREVO_FROM_EMAIL=<验证过的发件邮箱>
CREEM_API_KEY=creem_1TZu3zrdh3i1CZyg9GgPtb

# 数据库（二选一）
KV_REST_API_URL=<Vercel KV URL>
KV_REST_API_TOKEN=<Vercel KV Token>
# 或
REDIS_URL=redis://<your-redis-url>

# 可选但建议
TONGYI_API_KEY=<你的通义千问API Key>
CREEM_PRODUCT_ID_MONTHLY=prod_6hdXzIZTTl6397GcDmgDc3
CREEM_PRODUCT_ID_YEARLY=prod_gg235rl7HEDxGtAwv5bJ6
```

### 2. 代码修复（上线前）

#### 修复 Secure Cookie
```typescript
// lib/auth.ts:117
secure: process.env.NODE_ENV === 'production', // 改为根据环境自动设置
```

#### 移除 JWT_SECRET 默认值警告
```typescript
// lib/auth.ts:15
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in production')
}
```

### 3. Creem 配置
1. ✅ 在 Creem 后台配置 Webhook URL: `https://你的域名/api/creem/webhook`
2. ✅ 在 Creem 产品设置中配置 Return URL: `https://你的域名/billing/success`
3. ⚠️ 确认 Creem 账号已启用生产支付（非测试模式）

### 4. 邮件服务验证
1. ✅ 在 Brevo 后台验证发件邮箱
2. ✅ 测试邮件发送功能

### 5. 数据库连接
1. ✅ 测试 Vercel KV 或 Redis 连接
2. ✅ 验证用户数据可以正常存储和读取

## 🧪 测试清单

### 功能测试
- [ ] 用户注册
- [ ] 邮箱验证
- [ ] 用户登录
- [ ] Source Finder 搜索
- [ ] Citation Checker 验证
- [ ] AI Chat 对话
- [ ] 积分消耗
- [ ] 月费订阅流程
- [ ] 年费订阅流程
- [ ] Webhook 接收和处理

### 安全测试
- [ ] JWT token 验证
- [ ] 未认证用户访问受保护路由
- [ ] 积分不足时的处理
- [ ] 字数超限的处理
- [ ] 无效输入的处理

### 性能测试
- [ ] API 响应时间
- [ ] 并发请求处理
- [ ] 数据库查询性能

## 📝 已知限制

1. **邮件发送失败不阻止注册** - 用户仍可注册，但无法验证邮箱
2. **无 Rate Limiting** - API 可能被滥用
3. **Webhook 无签名验证** - 依赖 Creem 安全措施
4. **调试模式** - Creem checkout 有 debug 参数，生产环境可移除

## 🚀 上线建议

1. **先启用测试模式** - 在 Creem 测试模式下验证支付流程
2. **监控日志** - 上线后密切关注 Vercel 日志
3. **逐步启用功能** - 可以先隐藏部分功能，逐步开放
4. **备份数据** - 确保数据库有备份机制

## 📞 支持

如遇到问题，检查：
1. Vercel 部署日志
2. API 错误响应
3. 数据库连接状态
4. 环境变量配置

