# 📧 邮件发送问题诊断报告

## 🔍 当前状态

根据诊断 API 检查结果：

- ✅ **BREVO_API_KEY**: 已配置
- ⚠️ **发件邮箱**: 未配置（将使用默认值 `lihongyangnju@gmail.com`）
- ✅ **环境**: production

## ❌ 问题分析

### 可能的原因

1. **BREVO_API_KEY 无效或已过期**
   - API Key 可能在 Brevo 控制台中已被删除
   - API Key 可能已过期
   - API Key 权限可能不足

2. **发件邮箱未验证**
   - 默认发件邮箱 `lihongyangnju@gmail.com` 可能未在 Brevo 中验证
   - 需要验证发件邮箱才能发送邮件

3. **Brevo 配额已用完**
   - 免费账户每日限制 300 封邮件
   - 如果今日已发送 300 封，将无法继续发送

4. **邮件发送 API 调用失败**
   - 网络连接问题
   - Brevo API 服务暂时不可用
   - 邮件格式问题

## 🔧 立即排查步骤

### 步骤 1: 检查 Vercel 运行时日志

**这是最重要的步骤！**

1. 访问 Vercel Dashboard: https://vercel.com/dashboard
2. 选择项目 `citea`
3. 点击 **Deployments** → 最新部署
4. 点击 **Functions** → `/api/auth/signup`
5. 查看日志，查找以下关键词：
   - `[Email]` - 邮件发送相关
   - `[Signup]` - 注册相关
   - `BREVO_API_KEY` - API Key 状态
   - `邮件发送失败` - 错误信息
   - `401` - 认证错误
   - `402` - 配额错误
   - `403` - 权限错误

**请复制日志中的错误信息给我！**

### 步骤 2: 检查 Brevo 控制台

1. 访问 https://app.brevo.com/
2. 进入 **SMTP & API** → **API Keys**
3. 检查 API Key 状态：
   - ✅ 是否有效
   - ✅ 是否已启用
   - ✅ 权限是否正确

4. 检查发件邮箱：
   - 进入 **Senders & IP**
   - 检查 `lihongyangnju@gmail.com` 是否已验证
   - 如果未验证，点击验证

5. 检查配额：
   - 进入 **Statistics**
   - 查看今日已发送邮件数
   - 确认是否超过 300 封（免费账户限制）

### 步骤 3: 测试邮件发送

使用诊断 API 测试邮件发送：

```bash
# 替换为您的邮箱
curl "https://citea.cc/api/test/email-diagnosis?email=your-email@example.com"
```

或者访问：
```
https://citea.cc/api/test/email-diagnosis?email=your-email@example.com
```

这将返回：
- 环境变量配置状态
- 邮件发送测试结果
- 详细的错误信息
- 修复建议

### 步骤 4: 检查环境变量

使用 Vercel API 检查环境变量（需要 Vercel Token）：

```bash
node scripts/check-email-config.js <VERCEL_TOKEN>
```

或者直接访问 Vercel Dashboard：
1. 进入 **Settings** → **Environment Variables**
2. 检查 `BREVO_API_KEY` 是否存在
3. 检查 `BREVO_FROM_EMAIL` 是否存在
4. 确认环境范围（Production, Preview, Development）

## 🛠️ 修复方案

### 方案 1: 验证发件邮箱

1. 访问 Brevo 控制台: https://app.brevo.com/
2. 进入 **Senders & IP** → **Senders**
3. 添加或验证发件邮箱 `lihongyangnju@gmail.com`
4. 点击验证链接（会发送到邮箱）
5. 验证成功后，在 Vercel 环境变量中添加：
   ```
   BREVO_FROM_EMAIL=lihongyangnju@gmail.com
   ```

### 方案 2: 更新 BREVO_API_KEY

如果 API Key 无效：

1. 访问 https://app.brevo.com/settings/keys/api
2. 生成新的 API Key
3. 在 Vercel 项目设置中更新 `BREVO_API_KEY`
4. 重新部署应用

### 方案 3: 检查 Brevo 配额

如果配额已用完：

1. 等待明天重置（免费账户每日 300 封）
2. 或升级到 Brevo 付费计划

### 方案 4: 添加详细的错误日志

代码已经添加了详细的日志记录。请查看 Vercel 日志获取具体的错误信息。

## 📊 下一步操作

### 立即操作

1. **查看 Vercel 日志**
   - 访问 Vercel Dashboard
   - 查看 `/api/auth/signup` 函数的日志
   - 查找 `[Email]` 和 `[Signup]` 相关日志
   - **复制错误信息给我**

2. **使用诊断 API**
   - 访问: `https://citea.cc/api/test/email-diagnosis?email=your-email@example.com`
   - 查看返回的详细诊断信息

3. **检查 Brevo 控制台**
   - 确认 API Key 有效
   - 确认发件邮箱已验证
   - 确认配额未用完

### 需要的信息

请提供以下信息，以便进一步诊断：

1. **Vercel 日志**
   - 最新的注册请求日志
   - `[Email]` 和 `[Signup]` 相关日志
   - 错误信息和状态码

2. **诊断 API 返回结果**
   - 访问诊断 API 的返回结果
   - 特别是 `testResult` 部分

3. **Brevo 控制台状态**
   - API Key 是否有效
   - 发件邮箱是否已验证
   - 配额使用情况

## 🔍 常见错误代码

| 错误代码 | 含义 | 解决方案 |
|---------|------|---------|
| 401 | API Key 无效 | 生成新的 API Key |
| 400 | 邮件格式错误 | 检查邮件内容格式 |
| 402 | 配额已用完 | 等待重置或升级计划 |
| 403 | 访问被拒绝 | 验证发件邮箱和域名 |
| 500 | 服务器错误 | 检查 Brevo 服务状态 |

## 💡 快速修复

### 如果 BREVO_API_KEY 无效：

1. 访问 https://app.brevo.com/settings/keys/api
2. 生成新的 API Key
3. 更新 Vercel 环境变量 `BREVO_API_KEY`
4. 重新部署应用

### 如果发件邮箱未验证：

1. 访问 https://app.brevo.com/senders/sender
2. 添加发件邮箱 `lihongyangnju@gmail.com`
3. 点击验证链接
4. 验证成功后，邮件就可以正常发送了

---

**现在请查看 Vercel 日志，查找 `[Email]` 和 `[Signup]` 相关的错误信息，这将帮助我们定位问题！**

