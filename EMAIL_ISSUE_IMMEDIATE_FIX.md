# 🚨 邮件发送问题 - 立即修复指南

## 问题：用户没有收到注册验证码

您提供的构建日志显示部署成功，但没有显示运行时日志。要诊断邮件发送问题，我们需要：

## 🔍 立即诊断（3 种方法）

### 方法 1: 使用诊断 API（推荐，最快）

**访问以下 URL**（替换为您的邮箱）：
```
https://citea.cc/api/test/email-diagnosis?email=your-email@example.com
```

**这将返回**：
- ✅ BREVO_API_KEY 是否配置
- ✅ API Key 格式是否正确  
- ✅ 测试邮件发送结果
- ✅ 详细的错误信息
- ✅ 修复建议

### 方法 2: 检查 Vercel Dashboard 日志

1. **访问 Vercel Dashboard**：
   - https://vercel.com/dashboard
   - 选择项目 `citea`

2. **查看最新部署**：
   - Deployments → 最新部署
   - 点击部署 ID

3. **查看 Functions 日志**：
   - 点击 "Functions" 标签
   - 找到 `/api/auth/signup` 函数
   - 查看日志，查找：
     - `[Email]` - 邮件发送相关
     - `[Signup]` - 注册相关
     - `BREVO_API_KEY` - API Key 配置
     - `邮件发送失败` - 错误信息

4. **如果还没有注册请求**：
   - 尝试注册一个新用户
   - 立即查看日志

### 方法 3: 检查环境变量

1. **访问 Vercel Dashboard**：
   - Settings → Environment Variables

2. **检查 BREVO_API_KEY**：
   - ✅ 是否存在
   - ✅ 格式是否正确（以 `xkeysib-` 开头）
   - ✅ **是否已应用到 Production 环境**（重要！）

3. **如果未配置或未应用到 Production**：
   - 添加/编辑环境变量
   - 确保勾选 `Production` 环境
   - 重新部署应用

## 🎯 最可能的原因

根据经验，最常见的问题是：

### 1. BREVO_API_KEY 未配置（80% 的可能性）

**检查方法**：
- 访问诊断 API：`https://citea.cc/api/test/email-diagnosis`
- 查看 `hasBrevoKey: false`

**修复方法**：
1. 访问 https://app.brevo.com/settings/keys/api
2. 生成新的 API Key
3. 在 Vercel 项目设置中添加：
   - Key: `BREVO_API_KEY`
   - Value: `你的API密钥`
   - Environment: `Production` ✅（重要！）
4. 重新部署应用

### 2. BREVO_API_KEY 未应用到 Production 环境（15% 的可能性）

**症状**：
- 环境变量已配置
- 但只在 Development/Preview 环境
- Production 环境无法访问

**修复方法**：
1. 在 Vercel 项目设置中编辑 `BREVO_API_KEY`
2. 确保勾选 `Production` 环境
3. 重新部署应用

### 3. API Key 无效或已过期（5% 的可能性）

**症状**：
- 日志显示：`401 Unauthorized`
- 错误：`BREVO_API_KEY 无效或已过期`

**修复方法**：
1. 在 Brevo 控制台生成新的 API Key
2. 更新 Vercel 环境变量
3. 重新部署应用

## 📋 检查清单

请逐一检查：

- [ ] BREVO_API_KEY 已在 Vercel 中配置
- [ ] BREVO_API_KEY 已应用到 Production 环境
- [ ] BREVO_API_KEY 格式正确（以 `xkeysib-` 开头）
- [ ] API Key 在 Brevo 控制台中有效
- [ ] 发件邮箱已在 Brevo 中验证
- [ ] Brevo 配额未用完（免费账户每日 300 封）
- [ ] 已重新部署应用（环境变量更改后需要重新部署）

## 🚀 立即行动

### 步骤 1: 访问诊断 API

访问：
```
https://citea.cc/api/test/email-diagnosis?email=your-email@example.com
```

复制返回的 JSON 结果。

### 步骤 2: 检查环境变量

1. 访问 Vercel Dashboard
2. Settings → Environment Variables
3. 检查 `BREVO_API_KEY`
4. 确认已应用到 Production

### 步骤 3: 查看日志

1. 尝试注册新用户
2. 立即查看 Vercel Dashboard 中的 Functions 日志
3. 查找 `[Email]` 和 `[Signup]` 日志

### 步骤 4: 提供信息

请提供：
1. 诊断 API 返回的 JSON
2. Vercel 日志中的错误信息
3. 环境变量配置状态

## 💡 快速修复

如果诊断 API 显示 `hasBrevoKey: false`：

1. **立即修复**：
   - 访问 https://app.brevo.com/settings/keys/api
   - 生成新的 API Key
   - 在 Vercel 中添加环境变量 `BREVO_API_KEY`
   - **确保应用到 Production 环境**
   - 重新部署应用

2. **验证修复**：
   - 访问诊断 API 再次测试
   - 或尝试注册新用户
   - 检查是否收到验证码邮件

---

**现在请访问诊断 API 并提供返回结果，这将帮助我们快速定位问题！**

访问：`https://citea.cc/api/test/email-diagnosis?email=your-email@example.com`






