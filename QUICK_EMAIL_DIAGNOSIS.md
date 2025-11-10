# 🚨 快速诊断邮件发送问题

## 立即诊断步骤

### 方法 1: 使用诊断 API（最快）

访问以下 URL（替换为您的邮箱）：
```
https://citea.cc/api/test/email-diagnosis?email=your-email@example.com
```

这将返回：
- ✅ BREVO_API_KEY 是否配置
- ✅ API Key 格式是否正确
- ✅ 测试邮件发送结果
- ✅ 详细的错误信息和修复建议

### 方法 2: 检查 Vercel Dashboard

1. **访问 Vercel Dashboard**：
   - https://vercel.com/dashboard
   - 选择项目 `citea`

2. **检查环境变量**：
   - Settings → Environment Variables
   - 查找 `BREVO_API_KEY`
   - 确认：
     - ✅ 已配置
     - ✅ 格式正确（以 `xkeysib-` 开头）
     - ✅ 已应用到 Production 环境

3. **查看运行时日志**：
   - Deployments → 最新部署
   - Functions → `/api/auth/signup`
   - 查找以下关键词：
     - `[Email]` - 邮件发送相关
     - `[Signup]` - 注册相关
     - `BREVO_API_KEY` - API Key 配置
     - `邮件发送失败` - 错误信息

## 常见问题

### 问题 1: BREVO_API_KEY 未配置

**症状**：
- 日志显示：`BREVO_API_KEY not configured`
- 诊断 API 返回：`hasBrevoKey: false`

**解决方案**：
1. 访问 https://app.brevo.com/settings/keys/api
2. 生成新的 API Key（格式：`xkeysib-xxxxx...`）
3. 在 Vercel 项目设置中添加环境变量：
   - Key: `BREVO_API_KEY`
   - Value: `你的API密钥`
   - Environment: `Production`（重要！）
4. 重新部署应用

### 问题 2: BREVO_API_KEY 未应用到生产环境

**症状**：
- 环境变量已配置，但只在 Development/Preview 环境
- 生产环境仍然无法发送邮件

**解决方案**：
1. 在 Vercel 项目设置中编辑 `BREVO_API_KEY`
2. 确保勾选 `Production` 环境
3. 重新部署应用

### 问题 3: API Key 无效或已过期

**症状**：
- 日志显示：`401 Unauthorized`
- 错误：`BREVO_API_KEY 无效或已过期`

**解决方案**：
1. 在 Brevo 控制台生成新的 API Key
2. 更新 Vercel 环境变量 `BREVO_API_KEY`
3. 重新部署应用

### 问题 4: Brevo 配额已用完

**症状**：
- 日志显示：`402 Payment Required`
- 错误：`Brevo 配额已用完`

**解决方案**：
1. Brevo 免费账户每日限制 300 封邮件
2. 等待明天重置配额
3. 或升级到 Brevo 付费计划

## 立即测试

### 测试 1: 诊断 API

访问：
```
https://citea.cc/api/test/email-diagnosis?email=your-email@example.com
```

### 测试 2: 尝试注册

1. 访问 https://citea.cc/auth/signup
2. 填写注册信息
3. 提交注册
4. 立即查看 Vercel Dashboard 中的 Functions 日志
5. 查找 `[Email]` 和 `[Signup]` 日志

### 测试 3: 检查 Brevo 控制台

1. 访问 https://app.brevo.com/
2. 查看发送日志
3. 检查配额使用情况
4. 查看是否有发送失败记录

## 需要的信息

请提供以下信息：

1. **诊断 API 返回结果**：
   - 访问 `https://citea.cc/api/test/email-diagnosis?email=your-email@example.com`
   - 复制返回的 JSON

2. **Vercel 日志**：
   - 查找 `[Email]` 相关日志
   - 查找错误信息

3. **环境变量状态**：
   - `BREVO_API_KEY` 是否已配置
   - 是否已应用到 Production 环境

4. **Brevo 控制台状态**：
   - API Key 是否有效
   - 配额是否用完
   - 发送日志是否有错误

---

**现在请访问诊断 API 并提供返回结果，这将帮助我们快速定位问题！**

