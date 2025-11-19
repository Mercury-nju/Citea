# Vercel 环境变量配置指南

## ✅ 本地配置已完成

本地 `.env.local` 已配置以下变量：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

连接测试通过！✅

## 🚀 Vercel 生产环境配置

### 方法 1: 通过 Vercel Dashboard（推荐）

1. **访问 Vercel Dashboard**
   - 打开 https://vercel.com/dashboard
   - 选择你的项目（Citea）

2. **进入环境变量设置**
   - 点击 **Settings** 标签
   - 点击左侧 **Environment Variables**

3. **添加 Supabase 变量**
   
   添加以下 3 个变量（每个都要单独添加）：

   **变量 1:**
   - Key: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://ntssisjdeveetrgpyena.supabase.co`
   - Environment: 勾选 **Production**, **Preview**, **Development**
   - 点击 **Save**

   **变量 2:**
   - Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50c3Npc2pkZXZlZXRyZ3B5ZW5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4MjcwNjYsImV4cCI6MjA3ODQwMzA2Nn0.f_2uyOYrcAZE4KdRf1tuCSUd-6PzLYdNqIpI_LWzY38`
   - Environment: 勾选 **Production**, **Preview**, **Development**
   - 点击 **Save**

   **变量 3:**
   - Key: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50c3Npc2pkZXZlZXRyZ3B5ZW5hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjgyNzA2NiwiZXhwIjoyMDc4NDAzMDY2fQ.zp9mo-nw-EEk-_3RetEocQdabOG9nlTpYw1NoLTfio0`
   - Environment: 勾选 **Production**, **Preview**, **Development**
   - 点击 **Save**

4. **重新部署**
   - 进入 **Deployments** 标签
   - 点击最新部署右侧的 **⋯** (三个点)
   - 选择 **Redeploy**
   - 确认重新部署

### 方法 2: 通过 Vercel CLI

```bash
# 安装 Vercel CLI（如果还没有）
npm i -g vercel

# 登录
vercel login

# 添加环境变量
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# 粘贴: https://ntssisjdeveetrgpyena.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# 粘贴 anon key

vercel env add SUPABASE_SERVICE_ROLE_KEY production
# 粘贴 service role key

# 重新部署
vercel --prod
```

## 🔧 Supabase Dashboard 配置

### 1. 启用 Email Authentication

1. 访问 https://supabase.com/dashboard
2. 选择项目 `ntssisjdeveetrgpyena`
3. 进入 **Authentication** → **Providers**
4. 确保 **Email** 已启用 ✅

### 2. 配置 URL

1. 进入 **Authentication** → **URL Configuration**
2. 设置以下 URL：

   **Site URL:**
   ```
   https://citea.cc
   ```

   **Redirect URLs:** (点击 Add URL 添加)
   ```
   http://localhost:3000/auth/callback
   https://citea.cc/auth/callback
   https://citea.cc/*
   ```

3. 点击 **Save**

### 3. 自定义邮件模板（可选）

1. 进入 **Authentication** → **Email Templates**
2. 选择 **Confirm signup**
3. 可以自定义邮件内容

## ✅ 验证清单

部署后验证以下内容：

- [ ] Vercel 环境变量已添加（3 个）
- [ ] 应用已重新部署
- [ ] Supabase Email Provider 已启用
- [ ] Site URL 配置正确
- [ ] Redirect URLs 已添加

## 🧪 测试注册流程

1. **访问注册页面**
   ```
   https://citea.cc/auth/signup
   ```

2. **填写注册信息**
   - 姓名
   - 邮箱（使用真实邮箱）
   - 密码（至少 6 位）

3. **提交注册**
   - 应该看到成功消息
   - 检查邮箱（包括垃圾邮件文件夹）

4. **点击验证链接**
   - 邮件中的验证链接
   - 应该重定向到你的应用

5. **验证成功**
   - 用户应该可以登录

## 📊 监控

### Vercel 日志
查看注册 API 日志：
1. Vercel Dashboard → Deployments
2. 点击最新部署
3. 点击 **Functions**
4. 查看 `/api/auth/signup` 日志

### Supabase 日志
查看认证日志：
1. Supabase Dashboard → Logs
2. 选择 **Auth Logs**
3. 查看用户创建和验证记录

## ⚠️ 故障排除

### 问题：收不到验证邮件
**解决方案：**
1. 检查垃圾邮件文件夹
2. 查看 Supabase Auth Logs
3. 确认 Site URL 配置正确
4. 检查 Supabase 邮件配额

### 问题：验证链接点击后报错
**解决方案：**
1. 检查 Redirect URLs 配置
2. 查看 Vercel 函数日志
3. 确认 `verify-email/route.ts` 正常工作

## 🎉 完成！

配置完成后，用户就可以：
1. ✅ 注册新账号
2. ✅ 收到验证邮件
3. ✅ 点击链接验证
4. ✅ 登录使用应用
