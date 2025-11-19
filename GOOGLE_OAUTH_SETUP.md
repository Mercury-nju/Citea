# Google OAuth 配置指南

## 📋 环境变量配置

### 本地开发环境

1. 在项目根目录创建 `.env.local` 文件：

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# App URL (开发环境)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **⚠️ 重要提示：**  
> 请使用你从 Google Cloud Console 获取的实际 Client ID 和 Client Secret 替换占位符。

2. 重启开发服务器：
```bash
npm run dev
```

---

### 生产环境 (Vercel)

1. 登录 Vercel Dashboard
2. 进入你的 Citea 项目
3. 点击 **Settings** → **Environment Variables**
4. 添加以下变量：

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `GOOGLE_CLIENT_ID` | 你的 Google Client ID | Production, Preview, Development |
| `GOOGLE_CLIENT_SECRET` | 你的 Google Client Secret | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | `https://citea.cc` | Production |
| `NEXT_PUBLIC_APP_URL` | `https://your-preview-url.vercel.app` | Preview |

5. 点击 **Save**
6. 重新部署项目（Redeploy）

---

## 🔐 Google Cloud Console 配置

### 已配置的重定向 URI

确保你在 Google Cloud Console 中配置了以下重定向 URI：

**开发环境：**
```
http://localhost:3000/api/auth/google/callback
```

**生产环境：**
```
https://citea.cc/api/auth/google/callback
```

**JavaScript Origins：**
```
http://localhost:3000
https://citea.cc
```

---

## 🧪 测试 Google 登录

### 本地测试

1. 启动开发服务器：`npm run dev`
2. 访问：http://localhost:3000/auth/signin
3. 点击 "Google" 按钮
4. 使用 Google 账号登录
5. 登录成功后会自动跳转到 Dashboard

### 生产环境测试

1. 访问：https://citea.cc/auth/signin
2. 点击 "Google" 按钮
3. 完成 Google 登录流程
4. 验证用户信息是否正确显示

---

## 🔍 故障排查

### 错误：redirect_uri_mismatch

**原因**：Google Cloud Console 中配置的重定向 URI 与实际请求的 URI 不匹配

**解决方案**：
1. 检查 Google Cloud Console → Credentials → OAuth 2.0 Client IDs
2. 确保添加了正确的 redirect URI
3. 确认 `NEXT_PUBLIC_APP_URL` 环境变量设置正确

### 错误：配置未找到

**原因**：环境变量未正确设置

**解决方案**：
1. 检查 `.env.local` 文件（本地）
2. 检查 Vercel 环境变量（生产）
3. 重启开发服务器或重新部署

### Google 登录后无法跳转

**原因**：Dashboard 未正确处理 OAuth 回调参数

**解决方案**：
1. 检查浏览器控制台是否有错误
2. 确认 localStorage 中是否保存了 token
3. 清除浏览器缓存重试

---

## 📊 功能特性

### ✅ 已实现

- [x] Google OAuth 初始化流程
- [x] OAuth 回调处理
- [x] 自动创建新用户
- [x] 关联现有邮箱账户
- [x] 用户头像支持
- [x] 邮箱自动验证（Google 账号已验证）
- [x] 登录页面 Google 按钮
- [x] 注册页面 Google 按钮

### 🔒 安全特性

- OAuth 2.0 标准协议
- HTTPS 强制（生产环境）
- JWT token 认证
- Client Secret 环境变量加密
- 自动 token 刷新机制

---

## 📝 数据库字段

新增字段（已添加到 `StoredUser` 类型）：

```typescript
{
  authProvider?: 'email' | 'google',  // 认证提供者
  googleId?: string,                  // Google 用户 ID
  avatar?: string,                    // 用户头像 URL
}
```

---

## 🚀 下一步

### 可选增强功能

1. **其他 OAuth 提供者**
   - Discord 登录
   - GitHub 登录
   - Microsoft 登录

2. **用户体验优化**
   - 登录状态持久化
   - 自动 token 刷新
   - 登录设备管理

3. **安全增强**
   - 两步验证（2FA）
   - 登录活动日志
   - 可疑登录检测

---

## 📞 技术支持

如有问题，请联系：
- Email: lihongyangnju@gmail.com
- Discord: [Citea Community](https://discord.gg/GQZDMRYhGC)

---

**最后更新：** 2024-11-06
