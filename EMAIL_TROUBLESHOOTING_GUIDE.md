# 📧 邮件发送问题排查指南

## 问题：用户没有收到注册验证码

### 立即诊断步骤

#### 1. 检查 Vercel 日志

访问 Vercel Dashboard：
1. 打开 https://vercel.com/dashboard
2. 选择您的项目
3. 点击 "Deployments" → 最新部署
4. 点击 "Functions" → `/api/auth/signup`
5. 查看日志，查找以下关键词：
   - `[Email]` - 邮件发送相关日志
   - `[Signup]` - 注册相关日志
   - `BREVO_API_KEY` - API Key 配置
   - `邮件发送失败` - 错误信息

#### 2. 使用诊断 API

访问诊断端点（需要管理员权限或添加到测试路由）：
```
https://citea.cc/api/test/email-diagnosis?email=your-email@example.com
```

这将返回：
- 环境变量配置状态
- BREVO_API_KEY 是否存在
- API Key 格式是否正确
- 测试邮件发送结果
- 详细的错误信息和修复建议

#### 3. 检查常见问题

##### 问题 1: BREVO_API_KEY 未配置
**症状**：
- 日志显示：`BREVO_API_KEY not configured`
- 错误消息：`邮件服务未配置`

**解决方案**：
1. 访问 https://app.brevo.com/settings/keys/api
2. 生成新的 API Key（格式：`xkeysib-xxxxx...`）
3. 在 Vercel 项目设置中添加环境变量：
   - Key: `BREVO_API_KEY`
   - Value: `xkeysib-你的API密钥`
4. 重新部署应用

##### 问题 2: BREVO_API_KEY 无效或已过期
**症状**：
- 日志显示：`401 Unauthorized`
- 错误消息：`BREVO_API_KEY 无效或已过期`

**解决方案**：
1. 在 Brevo 控制台生成新的 API Key
2. 更新 Vercel 环境变量 `BREVO_API_KEY`
3. 重新部署应用

##### 问题 3: Brevo 配额已用完
**症状**：
- 日志显示：`402 Payment Required`
- 错误消息：`Brevo 配额已用完`

**解决方案**：
1. Brevo 免费账户每日限制 300 封邮件
2. 等待明天重置配额
3. 或升级到 Brevo 付费计划

##### 问题 4: 发件邮箱未验证
**症状**：
- 日志显示：`403 Forbidden`
- 错误消息：`API 访问被拒绝`

**解决方案**：
1. 访问 Brevo 控制台
2. 验证发件邮箱（`lihongyangnju@gmail.com` 或 `BREVO_FROM_EMAIL`）
3. 如果使用自定义域名，验证域名

##### 问题 5: 邮件被拦截
**症状**：
- 日志显示邮件发送成功（有 messageId）
- 但用户没有收到邮件

**解决方案**：
1. 检查用户的垃圾邮件文件夹
2. 检查邮箱过滤器
3. 检查 Brevo 控制台的发送日志
4. 确认邮件没有被 Brevo 标记为垃圾邮件

## 改进的错误处理

### 新增功能

1. **详细的日志记录**
   - 记录邮件发送的每个步骤
   - 记录 API Key 配置状态
   - 记录 Brevo API 响应
   - 记录错误详情

2. **错误分类**
   - API Key 未配置
   - API Key 无效
   - 配额已用完
   - 发件邮箱未验证
   - 网络错误

3. **诊断 API**
   - 测试邮件发送功能
   - 检查环境变量配置
   - 提供修复建议

## 检查清单

### Vercel 环境变量
- [ ] `BREVO_API_KEY` 已配置
- [ ] `BREVO_API_KEY` 格式正确（以 `xkeysib-` 开头）
- [ ] `BREVO_FROM_EMAIL` 已配置（可选）
- [ ] 环境变量已应用到生产环境

### Brevo 配置
- [ ] API Key 在 Brevo 控制台中有效
- [ ] 发件邮箱已在 Brevo 中验证
- [ ] 域名已验证（如果使用自定义域名）
- [ ] 配额未用完（免费账户每日 300 封）

### 邮件发送
- [ ] 日志显示邮件发送成功
- [ ] 有 messageId 返回
- [ ] 用户检查了垃圾邮件文件夹
- [ ] 用户检查了邮箱过滤器

## 测试邮件发送

### 方法 1: 使用诊断 API

```bash
# 测试邮件发送（替换为您的邮箱）
curl "https://citea.cc/api/test/email-diagnosis?email=your-email@example.com"
```

### 方法 2: 检查 Vercel 日志

1. 访问 Vercel Dashboard
2. 查看最新部署的日志
3. 查找 `[Email]` 和 `[Signup]` 日志
4. 检查错误信息

### 方法 3: 注册测试用户

1. 尝试注册新用户
2. 检查 Vercel 日志
3. 查看邮件发送结果
4. 检查用户邮箱（包括垃圾邮件文件夹）

## 常见错误代码

| 错误代码 | 含义 | 解决方案 |
|---------|------|---------|
| 401 | API Key 无效 | 生成新的 API Key |
| 400 | 邮件格式错误 | 检查邮件内容格式 |
| 402 | 配额已用完 | 等待重置或升级计划 |
| 403 | 访问被拒绝 | 验证发件邮箱和域名 |
| 500 | 服务器错误 | 检查 Brevo 服务状态 |

## 下一步

1. **检查 Vercel 日志**：查看最新的注册请求日志
2. **使用诊断 API**：测试邮件发送功能
3. **检查环境变量**：确认 BREVO_API_KEY 已配置
4. **检查 Brevo 账户**：确认 API Key 有效且配额未用完

## 联系支持

如果问题仍然存在：
1. 提供 Vercel 日志截图
2. 提供诊断 API 返回结果
3. 提供 Brevo 控制台截图
4. 描述具体的错误信息

## 快速修复

### 如果 BREVO_API_KEY 未配置：

1. 访问 https://app.brevo.com/settings/keys/api
2. 点击 "Generate a new API key"
3. 复制 API Key（格式：`xkeysib-xxxxx...`）
4. 在 Vercel 项目设置中添加：
   - Key: `BREVO_API_KEY`
   - Value: `你的API密钥`
5. 重新部署应用

### 如果 API Key 无效：

1. 在 Brevo 控制台生成新的 API Key
2. 更新 Vercel 环境变量
3. 重新部署应用

### 如果配额已用完：

1. 等待明天重置（免费账户每日 300 封）
2. 或升级到 Brevo 付费计划

---

**现在请检查 Vercel 日志，查找 `[Email]` 和 `[Signup]` 相关的日志，这将帮助我们定位问题！**






