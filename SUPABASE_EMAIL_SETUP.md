# 📧 Supabase 邮件配置详细步骤

## 步骤 1: 配置 Email Provider

1. 在 Supabase Dashboard 左侧菜单，点击 **Authentication**
2. 点击 **Providers**（不是 Templates）
3. 找到 **Email** 提供商，点击进入或展开
4. 在这里应该能看到以下选项：
   - ✅ **Enable email confirmations** - 启用邮箱确认
   - ✅ **Enable email OTP** - 启用邮箱 OTP（6位数字验证码）

## 如果找不到这些选项

### 方法 A: 检查 URL
确保你在正确的页面：
```
https://app.supabase.com/project/[你的项目ID]/auth/providers
```

### 方法 B: 通过 API 配置（如果 UI 中没有）

如果 Dashboard 中没有这些选项，可以通过 Supabase API 或直接使用代码配置。

实际上，Supabase 的 Email OTP 功能可能已经默认启用，或者需要通过代码调用。

## 步骤 2: 配置 Site URL

1. 在 **Authentication** → **URL Configuration**
2. 设置 **Site URL** 为你的生产环境域名：
   - 例如：`https://citea.cc`
   - 或：`https://your-domain.vercel.app`

## 步骤 3: 配置邮件模板（可选）

1. 在 **Authentication** → **Email Templates**
2. 可以自定义验证邮件的模板
3. 默认模板已经包含验证码，通常不需要修改

## 关于 SMTP 设置

**暂时不需要配置自定义 SMTP**，因为：
- Supabase 默认邮件服务可以用于生产环境
- 免费计划有发送限制，但通常足够使用
- 如果后续邮件量很大，再考虑配置自定义 SMTP

## 验证配置是否生效

配置完成后，可以通过以下方式验证：

1. **测试注册**：
   - 访问你的网站注册页面
   - 注册一个新用户
   - 检查邮箱是否收到验证码邮件

2. **检查 Supabase Dashboard**：
   - 进入 **Authentication** → **Users**
   - 应该能看到新注册的用户
   - 检查用户的邮箱确认状态

## 常见问题

### Q: 找不到 "Enable email OTP" 选项？

**A:** 可能的原因：
1. Supabase 版本不同，选项名称可能不同
2. Email OTP 可能已经默认启用
3. 可能需要通过代码调用 `signInWithOtp` 方法

**解决方案：**
- 直接测试注册功能，如果收到 6 位数字验证码，说明 OTP 已启用
- 或者查看 Supabase 文档确认你的版本是否支持

### Q: 注册后没有收到邮件？

**A:** 检查以下几点：
1. 检查垃圾邮件文件夹
2. 确认 Site URL 配置正确
3. 检查 Supabase 邮件发送配额
4. 查看 Supabase Dashboard → **Authentication** → **Users** 中的用户状态

### Q: 收到的是链接而不是验证码？

**A:** 这说明可能使用的是 Magic Link 而不是 OTP。需要：
1. 确认 "Enable email OTP" 已启用
2. 或者修改代码使用 OTP 方式（我们的代码已经配置为使用 OTP）

## 下一步

完成以上配置后：
1. 在 Vercel 中配置环境变量（参考 `SUPABASE_ENV_SETUP.md`）
2. 运行 SQL 脚本创建 profiles 表（参考 `supabase-migration.sql`）
3. 重新部署应用
4. 测试注册和验证流程






