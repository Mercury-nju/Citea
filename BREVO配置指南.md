# 📧 Brevo 邮件服务配置指南

## 🎯 为什么选择 Brevo？

✅ **免费额度**: 每天 300 封邮件（永久免费）  
✅ **无需信用卡**: 完全免费注册  
✅ **支持自定义域名**: 提高邮件送达率  
✅ **提供 REST API**: 易于集成  
✅ **中文界面**: 便于使用  
✅ **稳定可靠**: 企业级邮件服务

---

## 📋 配置步骤

### 步骤 1: 注册 Brevo 账号

1. **访问 Brevo 官网**: https://www.brevo.com/
2. **点击"免费注册"**（右上角或页面中央）
3. **填写注册信息**:
   - 邮箱地址
   - 密码
   - 公司名称（可选）
4. **验证邮箱**: 检查邮箱并点击验证链接
5. **完成注册**: 无需信用卡！

---

### 步骤 2: 获取 API Key

1. **登录 Brevo Dashboard**: https://app.brevo.com/
2. **进入设置**:
   - 点击右上角头像
   - 选择 **"SMTP & API"** 或 **"Settings" > "SMTP & API"**
3. **创建 API Key**:
   - 点击 **"Create a new API key"**
   - 输入名称（例如: "Citea Production"）
   - 选择权限: **"Send emails"** (推荐) 或 **"Full access"**
   - 点击 **"Generate"**
4. **复制 API Key**: 
   - ⚠️ **重要**: API Key 只显示一次，请立即复制保存！
   - 格式类似: `xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxxx`

---

### 步骤 3: 配置发件邮箱（可选但推荐）

#### 选项 A: 使用 Brevo 默认发件邮箱（快速开始）

- 无需配置，直接使用 `noreply@brevo.com`
- 限制: 不能自定义发件人邮箱地址，但可以自定义发件人名称

#### 选项 B: 添加并验证自定义域名（推荐生产环境）

**为什么要验证域名？**
- 提高邮件送达率
- 避免邮件进入垃圾箱
- 显示专业的发件人地址

**配置步骤**:

1. **在 Brevo 添加域名**:
   - 进入 **"SMTP & API"** > **"Senders & IP"** > **"Domains"**
   - 点击 **"Add a domain"**
   - 输入你的域名（例如: `citea.com`）
   - 点击 **"Add this domain"**

2. **添加 DNS 记录**:
   Brevo 会提供需要添加的 DNS 记录，在你的域名 DNS 管理中添加：

   **记录 1: SPF 记录**
   ```
   类型: TXT
   名称: @ (或根域名)
   值: v=spf1 include:spf.brevo.com ~all
   TTL: 3600
   ```

   **记录 2: DKIM 记录**（Brevo 会提供）
   ```
   类型: TXT
   名称: brevo._domainkey
   值: (Brevo 提供的值)
   TTL: 3600
   ```

   **记录 3: DMARC 记录**（可选但推荐）
   ```
   类型: TXT
   名称: _dmarc
   值: v=DMARC1; p=none; rua=mailto:your-email@yourdomain.com
   TTL: 3600
   ```

3. **验证域名**:
   - 添加 DNS 记录后，回到 Brevo Dashboard
   - 点击 **"Verify domain"**
   - 等待验证完成（通常几分钟到几小时）

4. **配置发件邮箱**:
   - 验证成功后，在 **"Senders"** 中添加发件人邮箱
   - 例如: `noreply@yourdomain.com`
   - 验证邮箱后即可使用

---

### 步骤 4: 配置环境变量

在项目的 `.env.local` 文件中添加：

```bash
# Brevo API Key
BREVO_API_KEY=xkeysib-your-api-key-here

# 发件邮箱（可选，如果不设置会使用默认值）
# 选项 1: 使用自定义域名邮箱
BREVO_FROM_EMAIL=noreply@yourdomain.com

# 选项 2: 使用 Brevo 默认邮箱（也可以不设置）
BREVO_FROM_EMAIL=noreply@brevo.com
```

**重要提示**:
- ⚠️ 不要在代码中硬编码 API Key
- ⚠️ 不要将 `.env.local` 提交到 Git（已在 `.gitignore` 中）
- ⚠️ 生产环境需要在部署平台（如 Vercel、Cloudflare）配置环境变量

---

### 步骤 5: 测试邮件发送

使用测试脚本验证配置：

```bash
node scripts/test-email.js your@email.com
```

**预期输出**:
```
📧 测试邮件发送 (Brevo)...
API Key: xkeysib-x...
收件人: your@email.com

✅ 发送成功!
邮件 ID: <message-id>
```

如果看到错误，请检查：
1. API Key 是否正确
2. 环境变量是否已加载
3. 网络连接是否正常

---

## 🔧 部署配置

### Vercel 部署

1. **进入项目设置**: https://vercel.com/your-project/settings
2. **添加环境变量**:
   - `BREVO_API_KEY`: 你的 Brevo API Key
   - `BREVO_FROM_EMAIL`: 发件邮箱（可选）
3. **重新部署**: 环境变量更新后会自动重新部署

### Cloudflare Pages 部署

1. **进入 Pages 设置**: Workers & Pages > 你的项目 > Settings > Environment variables
2. **添加环境变量**: 同上
3. **重新部署**

### 其他平台

在所有部署平台中，确保设置了 `BREVO_API_KEY` 环境变量。

---

## 📊 监控和管理

### 查看发送统计

1. 登录 Brevo Dashboard
2. 进入 **"Statistics"** > **"Transactional Emails"**
3. 查看：
   - 发送数量
   - 送达率
   - 打开率（需要跟踪）
   - 点击率（需要跟踪）

### 查看发送日志

1. 进入 **"Statistics"** > **"Email Logs"**
2. 查看每封邮件的：
   - 发送状态
   - 送达状态
   - 错误信息（如有）

### 配额管理

- **免费计划**: 每天 300 封
- **查看剩余配额**: Dashboard 首页显示
- **超出配额**: 当天无法发送，第二天重置

---

## 🐛 常见问题

### Q1: API Key 无效错误

**错误信息**: `Invalid API key`

**解决方案**:
1. 检查 API Key 是否正确复制（包括前后空格）
2. 确认 API Key 是否有发送邮件权限
3. 重新生成 API Key 试试

---

### Q2: 邮件进入垃圾箱

**原因**:
- 未验证域名
- DNS 记录配置错误
- 发件频率过高

**解决方案**:
1. 验证并配置域名（步骤 3 选项 B）
2. 检查 DNS 记录是否正确
3. 降低发送频率
4. 避免使用触发垃圾邮件的词汇

---

### Q3: 超出每日配额

**错误信息**: `Daily limit exceeded`

**解决方案**:
1. 等待第二天重置（免费计划每天 300 封）
2. 升级到付费计划（每月起价约 $25）
3. 优化邮件发送逻辑，避免重复发送

---

### Q4: 邮件发送成功但收不到

**检查清单**:
1. ✅ 检查垃圾邮件文件夹
2. ✅ 查看 Brevo Dashboard 的发送日志
3. ✅ 确认收件人邮箱地址正确
4. ✅ 检查发件人邮箱是否已验证

---

### Q5: 如何升级到付费计划？

1. 登录 Brevo Dashboard
2. 进入 **"Billing"** > **"Upgrade Plan"**
3. 选择计划（每月约 $25 起）
4. 增加发送限额和功能

---

## 📚 相关资源

- **Brevo 官网**: https://www.brevo.com/
- **API 文档**: https://developers.brevo.com/
- **SDK 文档**: https://github.com/getbrevo/brevo-nodejs
- **中文支持**: Brevo 提供中文界面和文档

---

## ✅ 配置检查清单

完成以下所有步骤后，Brevo 配置就完成了：

- [ ] 注册 Brevo 账号并验证邮箱
- [ ] 创建并复制 API Key
- [ ] （可选）添加并验证自定义域名
- [ ] 在 `.env.local` 中配置 `BREVO_API_KEY`
- [ ] （可选）配置 `BREVO_FROM_EMAIL`
- [ ] 运行测试脚本验证配置
- [ ] 在部署平台配置环境变量
- [ ] 测试生产环境邮件发送

---

## 🎉 完成！

配置完成后，你的应用就可以使用 Brevo 发送邮件了！

**免费额度**: 每天 300 封邮件，对于大多数应用来说已经足够。

如有问题，请参考：
- Brevo 官方文档
- 项目中的 `lib/email.ts` 实现
- 测试脚本 `scripts/test-email.js`


