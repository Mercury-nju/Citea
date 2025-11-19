# 🚀 Supabase 迁移指南

本指南将帮助你完成从 Brevo 到 Supabase Auth 的迁移。

## 📋 迁移步骤

### 1. 在 Supabase Dashboard 中运行 SQL 脚本

1. 登录 [Supabase Dashboard](https://app.supabase.com/)
2. 选择你的项目（Citea）
3. 进入 **SQL Editor**
4. 打开项目根目录的 `supabase-migration.sql` 文件
5. 复制全部内容到 SQL Editor
6. 点击 **Run** 执行脚本

这将创建：
- `profiles` 表（存储用户扩展信息）
- Row Level Security (RLS) 策略
- 自动创建 profile 的触发器
- 必要的索引

### 2. 配置 Supabase Authentication

1. 在 Supabase Dashboard 中，进入 **Authentication** → **Providers**
2. 确保 **Email** 提供商已启用
3. 进入 **Authentication** → **Email Templates**
4. 配置以下设置：
   - ✅ **Enable email confirmations** - 启用邮箱确认
   - ✅ **Enable email OTP** - 启用邮箱 OTP（6位数字验证码）
   - 设置 **Site URL** 为你的生产环境域名（例如：`https://citea.cc`）

### 3. 配置环境变量

在 **Vercel Dashboard** 中添加以下环境变量：

#### 必需的环境变量：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://cgbjrnowqkdqhsbbbpoz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnYmpybm93cWtkcWhzYmJicG96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3ODI1NjcsImV4cCI6MjA3ODM1ODU2N30.U4oCBMbi6_9MKDuXWboRHlALy8PwAPOS83kJTirbspM
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnYmpybm93cWtkcWhzYmJicG96Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4MjU2NywiZXhwIjoyMDc4MzU4NTY3fQ.6ek3D_T4NzuCSv5SxHGjfKj-sHSj3Mgxaw_o_uOVFqE
```

#### 可选：保留 Brevo（用于欢迎邮件等）

如果你还想使用 Brevo 发送欢迎邮件等非关键邮件，可以保留：
```bash
BREVO_API_KEY=你的Brevo_API_Key（可选）
BREVO_FROM_EMAIL=你的发件邮箱（可选）
```

#### 可以移除的环境变量（如果不再使用 Brevo）：

```bash
# 以下变量可以删除（如果完全迁移到 Supabase）
# BREVO_API_KEY
# BREVO_FROM_EMAIL
```

### 4. 在 Vercel 中配置环境变量

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. 进入 **Settings** → **Environment Variables**
4. 添加上述三个 Supabase 环境变量
5. 确保为 **Production**, **Preview**, **Development** 都设置了这些变量
6. 点击 **Save**

### 5. 部署更新

1. 提交代码到 Git：
   ```bash
   git add .
   git commit -m "Migrate from Brevo to Supabase Auth"
   git push
   ```

2. Vercel 会自动部署，或手动触发部署

### 6. 测试注册流程

1. 访问你的网站注册页面
2. 填写注册信息并提交
3. 检查邮箱是否收到 Supabase 发送的验证码邮件
4. 输入验证码完成验证
5. 确认能够成功登录

## 🔍 验证迁移是否成功

### 检查 Supabase Dashboard

1. 进入 **Authentication** → **Users**
2. 应该能看到新注册的用户
3. 检查用户的 **Email Confirmed** 状态

### 检查数据库

1. 进入 **Table Editor** → **profiles**
2. 应该能看到新用户的 profile 记录
3. 检查字段是否正确填充（name, plan, credits 等）

## ⚠️ 注意事项

### 现有用户迁移

如果你有现有用户需要迁移：

1. **方案 A：让现有用户重新注册**
   - 最简单，但用户需要重新注册

2. **方案 B：手动迁移用户数据**
   - 使用 Supabase Admin API 创建用户
   - 迁移密码哈希（需要知道原始密码或让用户重置密码）
   - 迁移用户的其他数据到 profiles 表

### 邮件发送限制

- Supabase 免费计划有邮件发送限制
- 如果邮件量很大，考虑：
  - 升级 Supabase 计划
  - 或配置自定义 SMTP（在 Supabase Dashboard → Authentication → SMTP Settings）

### 验证码格式

- Supabase 默认发送 6 位数字验证码
- 验证码有效期可以在 Supabase Dashboard 中配置

## 🐛 故障排除

### 问题 1: 注册后没有收到验证邮件

**解决方案：**
1. 检查 Supabase Dashboard → Authentication → Email Templates 配置
2. 检查邮箱垃圾邮件文件夹
3. 确认 Site URL 配置正确
4. 检查 Supabase 邮件发送配额

### 问题 2: 验证码无效

**解决方案：**
1. 确认验证码在有效期内（默认 1 小时）
2. 检查是否输入了正确的 6 位数字
3. 尝试重新发送验证码

### 问题 3: Profile 表未创建

**解决方案：**
1. 确认已运行 `supabase-migration.sql` 脚本
2. 检查 SQL Editor 是否有错误
3. 手动检查 Table Editor 中是否存在 profiles 表

### 问题 4: 环境变量未生效

**解决方案：**
1. 确认在 Vercel 中正确设置了环境变量
2. 重新部署应用
3. 检查 Vercel 构建日志中的环境变量

## 📚 相关文档

- [Supabase Auth 文档](https://supabase.com/docs/guides/auth)
- [Supabase Email OTP 文档](https://supabase.com/docs/guides/auth/auth-email-otp)
- [Supabase Admin API 文档](https://supabase.com/docs/reference/javascript/auth-admin-api)

## ✅ 迁移检查清单

- [ ] 在 Supabase Dashboard 运行了 SQL 脚本
- [ ] 配置了 Supabase Authentication（Email OTP）
- [ ] 在 Vercel 中添加了环境变量
- [ ] 重新部署了应用
- [ ] 测试了新用户注册流程
- [ ] 测试了邮箱验证流程
- [ ] 确认用户数据正确保存到 profiles 表
- [ ] （可选）移除了 Brevo 相关环境变量

完成以上步骤后，你的应用就已经成功迁移到 Supabase Auth 了！🎉






