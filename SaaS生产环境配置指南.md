# 🚀 Citea SaaS 生产环境完整配置指南

## 📋 概述

本文档指导你完成 Citea 作为 SaaS 产品的生产环境配置，确保真实用户可以正常使用所有功能。

---

## ✅ 当前状态检查

### 已完成 ✅
- ✅ 用户注册/登录系统
- ✅ 邮箱验证码功能
- ✅ Redis 数据库配置
- ✅ JWT 认证
- ✅ 数据持久化

### 需要配置 ⚠️
- ⚠️ 自定义域名邮件服务
- ⚠️ 生产环境环境变量
- ⚠️ 错误处理优化
- ⚠️ 用户友好提示

---

## 🔧 步骤 1: 配置自定义域名邮件（必需）

### 为什么需要？

- ❌ 测试域名 `onboarding@resend.dev` 只能发送给验证过的邮箱
- ✅ 自定义域名可以发送给任何用户
- ✅ 更专业的发件人地址（如 `noreply@citea.com`）
- ✅ 更高的送达率

### 配置步骤

#### 1.1 在 Resend 添加域名

1. **访问 Resend Dashboard**:
   https://resend.com/domains

2. **添加域名**:
   - 点击 "Add Domain"
   - 输入你的域名（例如：`citea.com` 或 `yourdomain.com`）
   - 选择域名用途（Transactional）
   - 点击 "Add Domain"

#### 1.2 配置 DNS 记录

Resend 会显示需要添加的 DNS 记录。在你的域名注册商（如 Cloudflare, Namecheap）添加：

**记录 1: TXT 验证记录**
```
类型: TXT
名称: _resend
值: resend-verify=xxx...（Resend 提供的值）
TTL: 3600
```

**记录 2: MX 记录（用于接收回信）**
```
类型: MX
名称: @
值: feedback-smtp.resend.com
优先级: 10
TTL: 3600
```

**记录 3: SPF 记录**
```
类型: TXT
名称: @
值: v=spf1 include:_spf.resend.com ~all
TTL: 3600
```

**记录 4: DKIM 记录**（Resend 会提供多个）
```
类型: TXT
名称: resend._domainkey
值: （Resend 提供的值）
TTL: 3600
```

#### 1.3 等待 DNS 验证

- DNS 生效通常需要 **10 分钟到 1 小时**
- 在 Resend Dashboard 查看验证状态
- 验证成功后显示 "Verified" 绿色标记

#### 1.4 更新代码

修改 `lib/email.ts`:

```typescript
// 修改发件人地址
from: 'Citea <noreply@yourdomain.com>'  // 替换为你的域名
```

#### 1.5 测试发送

```bash
node scripts/test-email.js your@email.com
```

确认可以收到邮件。

---

## 🌐 步骤 2: Vercel 生产环境配置

### 2.1 环境变量清单

在 Vercel Dashboard → Settings → Environment Variables 添加：

```bash
# 数据库（必需）
REDIS_URL=redis://default:tI2IC8ylvKsvSFQ0k2wRraNv4MI5vlC8@redis-19318.c9.us-east-1-2.ec2.redns.redis-cloud.com:19318

# 认证密钥（必需）
JWT_SECRET=T4pJj3grK+iWLeNtaPtTP2jUhaxQHenJWiJnYohbsX4=

# 邮件服务（必需）
RESEND_API_KEY=re_9wZT2a8a_49TQF5EQTSGQxMR48wRphztm

# 环境标识（必需）
NODE_ENV=production

# 应用 URL（推荐）
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

**⚠️ 重要**: 
- 所有变量都选择 **Production**, **Preview**, **Development** 三个环境
- 确保每个变量都正确添加

### 2.2 域名配置（可选但推荐）

1. **在 Vercel 添加自定义域名**:
   - 项目 → Settings → Domains
   - 点击 "Add Domain"
   - 输入你的域名

2. **配置 DNS**:
   - 添加 CNAME 记录指向 Vercel
   - 等待 SSL 证书自动配置

3. **更新环境变量**:
   ```bash
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   ```

---

## 📧 步骤 3: 更新邮件发件人地址

### 3.1 修改代码

找到 `lib/email.ts`，更新发件人地址：

```typescript
from: 'Citea <noreply@yourdomain.com>'  // 使用你的域名
```

### 3.2 提交并部署

```bash
git add lib/email.ts
git commit -m "update email from address for production"
git push
```

---

## 🔍 步骤 4: 测试完整流程

### 4.1 注册流程测试

1. **访问网站**:
   https://your-domain.com/auth/signup

2. **注册新用户**:
   - 使用真实邮箱（确保可以接收邮件）
   - 填写信息
   - 点击注册

3. **验证邮箱**:
   - 查收验证码邮件
   - 输入 6 位验证码
   - 验证成功

4. **登录测试**:
   - 退出登录
   - 使用注册的邮箱登录
   - 应该成功登录到 Dashboard

### 4.2 错误处理测试

- ✅ 注册重复邮箱 → 显示友好错误
- ✅ 验证码错误 → 提示重新输入
- ✅ 验证码过期 → 提示重新发送
- ✅ 网络错误 → 显示重试提示

---

## 🛡️ 步骤 5: 安全加固（推荐）

### 5.1 Rate Limiting（限流）

防止恶意注册和暴力破解：

**安装包**:
```bash
npm install @upstash/ratelimit @upstash/redis
```

**创建限流中间件** (可选):
- 限制注册频率：1 次/分钟/邮箱
- 限制验证码发送：3 次/小时/邮箱
- 限制登录尝试：5 次/15分钟/邮箱

### 5.2 密码强度要求

当前已有最小 8 字符，可以增强：
- 至少包含数字
- 至少包含字母
- 至少包含特殊字符（可选）

### 5.3 HTTPS 强制

Vercel 自动配置 HTTPS，确保：
- 所有 Cookie 设置为 Secure
- 所有 API 调用使用 HTTPS

---

## 📊 步骤 6: 监控和日志

### 6.1 错误监控

**推荐工具**:
- **Sentry** (免费额度)
- **Vercel Analytics** (免费)
- **LogRocket** (可选)

### 6.2 邮件发送监控

在 Resend Dashboard 监控：
- 发送成功率
- 失败原因
- 退回率

### 6.3 用户活动日志

记录关键事件：
- 用户注册
- 邮箱验证
- 登录成功/失败

---

## ✅ 生产环境检查清单

### 配置检查
- [ ] Resend 自定义域名已配置并验证
- [ ] Vercel 所有环境变量已设置
- [ ] 邮件发件人地址已更新
- [ ] 自定义域名已配置（如需要）
- [ ] HTTPS 已启用

### 功能测试
- [ ] 用户注册 → 收到验证邮件
- [ ] 输入验证码 → 验证成功
- [ ] 登录功能正常
- [ ] 数据保存到 Redis
- [ ] 会话保持正常

### 用户体验
- [ ] 错误提示友好清晰
- [ ] 加载状态有反馈
- [ ] 移动端适配正常
- [ ] 页面响应速度正常

### 安全
- [ ] 密码正确加密存储
- [ ] JWT 密钥足够强
- [ ] Cookie 设置安全
- [ ] API 限流已配置（推荐）

---

## 🚨 常见问题

### Q1: 用户收不到验证邮件

**检查清单**:
1. ✅ Resend 域名是否已验证
2. ✅ DNS 记录是否正确
3. ✅ 邮件是否在垃圾文件夹
4. ✅ Resend Dashboard 查看发送状态
5. ✅ API Key 是否正确

### Q2: 登录后立即退出

**可能原因**:
- JWT_SECRET 在不同环境不一致
- Cookie 域名配置错误
- HTTPS 配置问题

**解决**:
- 检查 Vercel 环境变量
- 确认 Cookie 设置正确
- 使用 HTTPS

### Q3: 数据丢失

**预防**:
- 定期备份 Redis 数据
- 设置 Redis 持久化
- 监控数据库连接

---

## 📈 性能优化

### 数据库
- ✅ 使用 Redis 连接池（已优化）
- ✅ 启用 Redis 持久化
- ⬜ 添加查询缓存（可选）

### 邮件发送
- ✅ 异步发送（已实现）
- ⬜ 添加发送队列（可选，高流量时）

### 前端
- ✅ Next.js 自动优化
- ✅ 代码分割
- ⬜ CDN 加速（Vercel 自动）

---

## 🎯 上线后维护

### 日常监控
- [ ] 查看 Resend 发送统计
- [ ] 检查 Vercel 部署日志
- [ ] 监控 Redis 使用情况
- [ ] 关注用户反馈

### 定期任务
- [ ] 每周备份用户数据
- [ ] 每月审查安全配置
- [ ] 每季度更新依赖包
- [ ] 定期审查错误日志

### 扩展准备
- [ ] 监控数据库容量
- [ ] 准备邮件发送升级方案
- [ ] 规划用户增长策略

---

## 📞 获取帮助

### Resend 支持
- 文档: https://resend.com/docs
- 支持: support@resend.com

### Vercel 支持
- 文档: https://vercel.com/docs
- 社区: https://github.com/vercel/vercel/discussions

### Redis 支持
- Upstash: https://docs.upstash.com/redis

---

## ✅ 快速开始

### 5 分钟上线清单

1. ✅ 在 Resend 配置自定义域名（约 30 分钟等待 DNS）
2. ✅ 在 Vercel 设置所有环境变量
3. ✅ 更新 `lib/email.ts` 发件人地址
4. ✅ 提交代码并部署
5. ✅ 测试完整注册流程

---

## 🎉 完成！

配置完成后，你的 Citea SaaS 产品就可以供真实用户使用了！

**下一步**: 
1. 配置自定义域名邮件
2. 完成 Vercel 环境变量配置
3. 测试完整流程
4. 发布上线！

---

**祝你 SaaS 产品成功！** 🚀

