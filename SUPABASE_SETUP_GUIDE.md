# Supabase 注册功能配置指南

## 📋 已完成的工作

✅ 创建了以下文件：
- `lib/supabase.ts` - Supabase 客户端配置
- `app/api/auth/signup/route.ts` - 用户注册 API
- `app/api/auth/verify-email/route.ts` - 邮箱验证 API

## 🔧 配置步骤

### 步骤 1: 获取 Supabase 密钥

#### 如果已有 Supabase 项目：
1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 点击左侧 **Settings** → **API**
4. 复制以下信息：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: 这是你的 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role**: 这是你的 `SUPABASE_SERVICE_ROLE_KEY` ⚠️ 保密

#### 如果没有 Supabase 项目：
1. 访问 [Supabase](https://supabase.com)
2. 点击 "Start your project"
3. 创建新项目（设置项目名称和数据库密码）
4. 等待项目初始化（约 2 分钟）
5. 按上述步骤获取 API 密钥

### 步骤 2: 配置环境变量

#### 本地开发
在项目根目录创建或编辑 `.env.local` 文件：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 其他现有配置保持不变
JWT_SECRET=your-jwt-secret
```

#### Vercel 生产环境
1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. 进入 **Settings** → **Environment Variables**
4. 添加以下变量（Environment 选择 **Production**）：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. 点击 **Save**
6. 重新部署应用

### 步骤 3: 配置 Supabase Email Authentication

1. 在 Supabase Dashboard，进入 **Authentication** → **Providers**
2. 找到 **Email**，确保已启用
3. 进入 **Authentication** → **URL Configuration**
4. 设置以下 URL：
   - **Site URL**: 
     - 开发环境：`http://localhost:3000`
     - 生产环境：`https://citea.cc`（你的实际域名）
   - **Redirect URLs**: 添加
     - `http://localhost:3000/auth/callback`
     - `https://citea.cc/auth/callback`

### 步骤 4: 自定义邮件模板（可选）

1. 进入 **Authentication** → **Email Templates**
2. 选择 **Confirm signup**
3. 可以自定义邮件内容，使用变量：
   - `{{ .ConfirmationURL }}` - 验证链接
   - `{{ .SiteURL }}` - 网站 URL
   - `{{ .Email }}` - 用户邮箱

## 🧪 测试

### 本地测试
```bash
# 1. 确保环境变量已配置
cat .env.local

# 2. 启动开发服务器
npm run dev

# 3. 访问注册页面
# http://localhost:3000/auth/signup

# 4. 注册新用户
# 检查邮箱是否收到验证邮件
```

### 验证流程
1. 用户填写注册表单（姓名、邮箱、密码）
2. 提交后，Supabase 自动发送验证邮件
3. 用户点击邮件中的验证链接
4. 重定向到你的应用，完成验证
5. 用户可以登录

## ⚠️ 常见问题

### Q: 收不到验证邮件？
**A**: 检查以下几点：
1. 垃圾邮件文件夹
2. Supabase 邮件配额（免费版有限制）
3. Site URL 配置是否正确
4. 查看 Supabase Dashboard → Authentication → Users 确认用户已创建

### Q: 验证链接点击后报错？
**A**: 
1. 检查 Redirect URLs 配置
2. 确保 `verify-email/route.ts` 正确处理回调
3. 查看浏览器控制台和 Vercel 日志

### Q: 如何查看 Supabase 日志？
**A**: 
Supabase Dashboard → Logs → Auth Logs

## 📝 下一步

配置完成后：
1. ✅ 测试本地注册流程
2. ✅ 部署到 Vercel
3. ✅ 测试生产环境注册
4. ✅ 确认邮件发送和验证正常

## 🆘 需要帮助？

如果遇到问题，请提供：
- Vercel 函数日志（`/api/auth/signup`）
- Supabase Auth Logs
- 具体的错误信息
