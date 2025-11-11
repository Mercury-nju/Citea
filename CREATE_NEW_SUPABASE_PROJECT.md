# 🚀 创建新的Supabase项目指南

## 🚨 问题确认

你的Supabase项目 `cgbjrnowqkdqhsbbbpoz.supabase.co` 返回404错误，**项目已被删除或不存在**。

## 🔧 解决方案：创建新项目

### 步骤1: 注册/登录Supabase

1. 访问 [Supabase官网](https://supabase.com)
2. 点击 "Sign In" 登录你的账户
3. 如果没有账户，点击 "Get Started" 注册

### 步骤2: 创建新项目

1. 登录后点击 "New Project"
2. 填写项目信息：
   - **Project name**: `Citea` (或你喜欢的名称)
   - **Database Password**: 设置强密码（**务必保存好**）
   - **Region**: 选择离你最近的地区
     - 推荐：`East US (North Virginia)` 或 `Southeast Asia (Singapore)`

3. 点击 "Create New Project"
4. **等待2-3分钟**让项目完全启动

### 步骤3: 获取新的API密钥

项目创建完成后：

1. 点击左侧菜单的 **Settings** (齿轮图标)
2. 点击 **API**
3. 复制以下信息（**保存到安全的地方**）：

```
Project URL: https://[your-project-id].supabase.co
Anon Key: [your-anon-key]
Service Role Key: [your-service-role-key]
```

⚠️ **重要**：Service Role Key 必须保密，不要分享给他人。

### 步骤4: 更新环境变量

1. 打开你的 `.env.local` 文件
2. **完全替换**Supabase相关配置：

```env
# 删除旧的配置
# NEXT_PUBLIC_SUPABASE_URL=https://cgbjrnowqkdqhsbbbpoz.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
# SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...

# 添加新的配置
NEXT_PUBLIC_SUPABASE_URL=https://[your-new-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-new-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-new-service-role-key]
```

### 步骤5: 验证新密钥

运行诊断脚本：

```bash
node scripts/diagnose-supabase-keys.js
```

**预期输出**：
```
✅ Anon Key 连接: 成功
✅ Service Key 连接: 成功
```

### 步骤6: 初始化数据库

1. 在Supabase Dashboard中，点击 **SQL Editor**
2. 运行以下SQL创建用户表：

```sql
-- 创建profiles表
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  plan TEXT DEFAULT 'free',
  credits INTEGER DEFAULT 3,
  email_verified BOOLEAN DEFAULT FALSE,
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  credits_reset_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 启用RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 创建更新函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 创建触发器
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 创建新用户时自动创建profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 步骤7: 配置邮件设置

1. 在左侧菜单点击 **Authentication**
2. 点击 **Providers**
3. 找到 **Email**，确保以下选项已启用：
   - ✅ **Enable Email Confirmations**
   - ✅ **Enable Email OTP** (如果可用)
4. 点击 **URL Configuration**
5. 设置 **Site URL** 为你的应用URL：
   - 开发环境：`http://localhost:3000`
   - 生产环境：`https://your-domain.com`

### 步骤8: 测试完整流程

```bash
# 测试注册流程
node scripts/test-signup-simple.js

# 验证邮件发送
node scripts/diagnose-supabase-keys.js
```

## ✅ 成功标准

- [ ] 新Supabase项目创建成功
- [ ] API密钥已更新到.env.local
- [ ] 诊断脚本显示连接成功
- [ ] 用户注册流程正常工作
- [ ] 邮件发送成功
- [ ] 验证码正确接收

## 🆘 常见问题

### Q: 项目创建失败？
**A**: 检查网络连接，或尝试不同的地区

### Q: 数据库SQL执行失败？
**A**: 确保按顺序执行，或分步执行

### Q: 邮件仍然发送失败？
**A**: 检查Supabase邮件配额，或使用自定义SMTP

## 📞 支持

如果遇到困难：
1. 查看 [Supabase文档](https://supabase.com/docs)
2. 访问 [Supabase社区](https://github.com/supabase/supabase/discussions)
3. 联系Supabase支持