# 🔧 Supabase 环境变量配置

## 在 Vercel 中配置环境变量

### 步骤 1: 登录 Vercel Dashboard

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目（Citea）

### 步骤 2: 添加环境变量

1. 进入 **Settings** → **Environment Variables**
2. 点击 **Add New** 添加以下变量：

#### 必需的环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://cgbjrnowqkdqhsbbbpoz.supabase.co` | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnYmpybm93cWtkcWhzYmJicG96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3ODI1NjcsImV4cCI6MjA3ODM1ODU2N30.U4oCBMbi6_9MKDuXWboRHlALy8PwAPOS83kJTirbspM` | Supabase 公开 API Key |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnYmpybm93cWtkcWhzYmJicG96Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4MjU2NywiZXhwIjoyMDc4MzU4NTY3fQ.6ek3D_T4NzuCSv5SxHGjfKj-sHSj3Mgxaw_o_uOVFqE` | Supabase 服务端 API Key（保密） |

### 步骤 3: 设置环境范围

为每个变量选择环境范围：
- ✅ **Production**（生产环境）
- ✅ **Preview**（预览环境）
- ✅ **Development**（开发环境）

### 步骤 4: 保存并重新部署

1. 点击 **Save** 保存所有环境变量
2. 进入 **Deployments** 标签
3. 点击最新部署右侧的 **...** → **Redeploy** 重新部署

## 本地开发环境配置

在项目根目录创建 `.env.local` 文件（如果不存在）：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://cgbjrnowqkdqhsbbbpoz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnYmpybm93cWtkcWhzYmJicG96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3ODI1NjcsImV4cCI6MjA3ODM1ODU2N30.U4oCBMbi6_9MKDuXWboRHlALy8PwAPOS83kJTirbspM
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnYmpybm93cWtkcWhzYmJicG96Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4MjU2NywiZXhwIjoyMDc4MzU4NTY3fQ.6ek3D_T4NzuCSv5SxHGjfKj-sHSj3Mgxaw_o_uOVFqE
```

⚠️ **注意**: `.env.local` 文件已添加到 `.gitignore`，不会被提交到 Git。

## 验证配置

配置完成后，可以通过以下方式验证：

1. **检查 Vercel 构建日志**
   - 部署时查看日志，确认环境变量已加载

2. **测试注册功能**
   - 访问注册页面
   - 尝试注册新用户
   - 检查是否收到 Supabase 验证邮件

3. **检查 Supabase Dashboard**
   - 登录 [Supabase Dashboard](https://app.supabase.com/)
   - 进入 **Authentication** → **Users**
   - 应该能看到新注册的用户

## 可选：保留 Brevo（用于其他邮件）

如果你还想使用 Brevo 发送欢迎邮件等非关键邮件，可以保留：

```bash
BREVO_API_KEY=你的Brevo_API_Key
BREVO_FROM_EMAIL=你的发件邮箱
```

这些变量不是必需的，因为验证邮件现在由 Supabase 发送。

## 故障排除

### 问题：环境变量未生效

**解决方案：**
1. 确认变量名拼写正确（注意大小写）
2. 确认已为所有环境（Production/Preview/Development）设置了变量
3. 重新部署应用
4. 检查 Vercel 构建日志

### 问题：注册时提示 "Missing Supabase environment variables"

**解决方案：**
1. 检查 `.env.local` 文件是否存在（本地开发）
2. 检查 Vercel 环境变量是否已设置（生产环境）
3. 确认变量名完全匹配（包括 `NEXT_PUBLIC_` 前缀）

