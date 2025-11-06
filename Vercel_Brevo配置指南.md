# 🚀 Vercel + Brevo 部署配置指南

## 📋 配置概述

你的应用部署在: **https://citea-4cg6h63bu-mercury-njus-projects.vercel.app/**

Brevo 需要配置的是**发件人邮箱的域名**（不是 Vercel 部署域名）。

---

## 🎯 方案选择

### 方案 A: 快速开始（推荐首次使用）

**使用 Brevo 默认邮箱，无需配置域名**

✅ 5 分钟完成  
✅ 无需自己的域名  
✅ 可直接开始使用  
⚠️ 发件人显示为 `noreply@brevo.com`

### 方案 B: 生产环境（推荐长期使用）

**验证自己的域名（如 citea.com）**

✅ 专业发件人地址（如 `noreply@citea.com`）  
✅ 更高送达率  
✅ 更好的品牌形象  
⏱️ 需要 30 分钟配置域名

---

## 🔧 方案 A: 快速配置（5分钟）

### 步骤 1: 获取 Brevo API Key

1. 注册 Brevo: https://www.brevo.com/
2. 登录 Dashboard: https://app.brevo.com/
3. 进入 **"SMTP & API"** > **"API Keys"**
4. 点击 **"Create a new API key"**
5. 复制 API Key（格式: `xkeysib-xxx...`）

### 步骤 2: 在 Vercel 配置环境变量

1. **进入 Vercel 项目设置**:
   - 访问: https://vercel.com/dashboard
   - 选择你的项目: `citea`
   - 进入 **"Settings"** > **"Environment Variables"**

2. **添加环境变量**:
   
   点击 **"Add New"**，添加以下变量：

   **变量 1: BREVO_API_KEY**
   ```
   Name: BREVO_API_KEY
   Value: xkeysib-your-api-key-here
   Environment: Production, Preview, Development（全部勾选）
   ```

   **变量 2: BREVO_FROM_EMAIL**（可选，建议添加）
   ```
   Name: BREVO_FROM_EMAIL
   Value: noreply@brevo.com
   Environment: Production, Preview, Development（全部勾选）
   ```

   **变量 3: NEXT_PUBLIC_APP_URL**（用于邮件链接）
   ```
   Name: NEXT_PUBLIC_APP_URL
   Value: https://citea-4cg6h63bu-mercury-njus-projects.vercel.app
   Environment: Production, Preview, Development（全部勾选）
   ```

3. **保存并重新部署**:
   - 点击 **"Save"**
   - Vercel 会自动重新部署
   - 或手动触发部署: **"Deployments"** > **"Redeploy"**

### 步骤 3: 测试邮件发送

访问应用并尝试注册，验证邮件应该会发送成功！

---

## 🔧 方案 B: 配置自定义域名（生产环境）

### 前提条件

- 需要有自己的域名（例如: `citea.com`）
- 可以管理域名的 DNS 记录

### 步骤 1: 在 Brevo 添加域名

1. **登录 Brevo Dashboard**: https://app.brevo.com/
2. **进入域名设置**:
   - **"SMTP & API"** > **"Senders & IP"** > **"Domains"**
   - 点击 **"Add a domain"**
3. **输入域名**:
   - 输入你的域名（例如: `citea.com`）
   - 不要包含 `www` 或协议（如 `https://`）
   - 点击 **"Add this domain"**

### 步骤 2: 配置 DNS 记录

Brevo 会显示需要添加的 DNS 记录。在你的域名 DNS 管理中添加：

**在域名注册商（如 Cloudflare, Namecheap, GoDaddy）添加：**

#### 记录 1: SPF 记录
```
类型: TXT
名称: @ (或根域名 citea.com)
值: v=spf1 include:spf.brevo.com ~all
TTL: 3600 (或 Auto)
```

#### 记录 2: DKIM 记录（Brevo 会提供）
```
类型: TXT
名称: brevo._domainkey
值: (Brevo 提供的完整值)
TTL: 3600 (或 Auto)
```

#### 记录 3: DMARC 记录（可选但推荐）
```
类型: TXT
名称: _dmarc
值: v=DMARC1; p=none; rua=mailto:support@citea.com
TTL: 3600 (或 Auto)
```

**DNS 配置示例（以 Cloudflare 为例）**:

1. 登录 Cloudflare
2. 选择域名 `citea.com`
3. 进入 **"DNS"** > **"Records"**
4. 点击 **"Add record"**，依次添加上述三个记录
5. 保存

### 步骤 3: 验证域名

1. **等待 DNS 传播**: 通常需要 5-30 分钟
2. **回到 Brevo Dashboard**: 
   - 在 **"Domains"** 页面
   - 点击域名旁边的 **"Verify domain"** 按钮
3. **验证成功**: 状态会显示为 ✅ "Verified"

### 步骤 4: 添加发件人邮箱

1. **进入 Senders**:
   - **"SMTP & API"** > **"Senders & IP"** > **"Senders"**
   - 点击 **"Add a sender"**
2. **输入发件人信息**:
   - Email: `noreply@citea.com`
   - Name: `Citea`
   - Click "Save"
3. **验证邮箱**:
   - Brevo 会发送验证邮件到 `noreply@citea.com`
   - 如果这是你的邮箱，点击邮件中的验证链接
   - 或者使用 DNS 验证（如果已配置 MX 记录）

### 步骤 5: 更新 Vercel 环境变量

在 Vercel 项目设置中更新环境变量：

```
BREVO_FROM_EMAIL=noreply@citea.com
```

**如果已经绑定自定义域名到 Vercel**，也更新：

```
NEXT_PUBLIC_APP_URL=https://citea.com
```

---

## 🌐 可选：将自定义域名绑定到 Vercel

如果你有自己的域名（如 `citea.com`），也可以将域名绑定到 Vercel 部署：

### 步骤 1: 在 Vercel 添加域名

1. 进入项目: https://vercel.com/your-project/settings
2. 进入 **"Domains"**
3. 输入域名: `citea.com`
4. 点击 **"Add"**

### 步骤 2: 配置 DNS

Vercel 会提供 DNS 记录，在你的域名 DNS 中添加：

```
类型: CNAME
名称: @ (或 www)
值: cname.vercel-dns.com
```

或者使用 A 记录（Vercel 会提供 IP 地址）

### 步骤 3: 等待生效

- DNS 传播通常需要几分钟到几小时
- Vercel 会自动配置 HTTPS 证书

---

## ✅ 配置检查清单

### 方案 A（快速开始）
- [ ] 注册 Brevo 账号
- [ ] 获取 API Key
- [ ] 在 Vercel 配置 `BREVO_API_KEY`
- [ ] 在 Vercel 配置 `BREVO_FROM_EMAIL=noreply@brevo.com`
- [ ] 在 Vercel 配置 `NEXT_PUBLIC_APP_URL`
- [ ] 测试注册功能，验证邮件发送

### 方案 B（自定义域名）
- [ ] 在 Brevo 添加域名
- [ ] 配置 DNS 记录（SPF, DKIM, DMARC）
- [ ] 验证域名在 Brevo 中
- [ ] 添加发件人邮箱并验证
- [ ] 更新 Vercel 环境变量 `BREVO_FROM_EMAIL`
- [ ] （可选）绑定域名到 Vercel
- [ ] 测试邮件发送

---

## 🧪 测试邮件发送

### 方法 1: 通过应用测试
1. 访问: https://citea-4cg6h63bu-mercury-njus-projects.vercel.app/auth/signup
2. 注册一个新账号
3. 检查邮箱（包括垃圾邮件文件夹）

### 方法 2: 使用测试脚本（本地）

在本地运行：
```bash
node scripts/test-email.js your@email.com
```

需要先在本地 `.env.local` 配置：
```bash
BREVO_API_KEY=your-api-key
BREVO_FROM_EMAIL=noreply@brevo.com
```

---

## 📊 查看发送状态

### 在 Brevo Dashboard 查看

1. 登录: https://app.brevo.com/
2. 进入 **"Statistics"** > **"Transactional Emails"**
3. 查看:
   - 发送数量
   - 送达率
   - 错误日志

### 查看邮件日志

进入 **"Statistics"** > **"Email Logs"** 查看每封邮件的详细状态

---

## 🐛 常见问题

### Q1: 邮件发送失败

**检查清单**:
1. ✅ Vercel 环境变量是否已配置
2. ✅ API Key 是否正确
3. ✅ 是否已重新部署（环境变量更新后需要重新部署）
4. ✅ 查看 Vercel 部署日志是否有错误
5. ✅ 查看 Brevo Dashboard 的发送日志

### Q2: 邮件进入垃圾箱

**解决方案**:
1. 使用方案 B 配置自定义域名
2. 确保 SPF、DKIM、DMARC 记录正确
3. 避免使用触发垃圾邮件的词汇

### Q3: 环境变量不生效

**解决方案**:
1. 确认在 Vercel 的 **"Environment Variables"** 中配置
2. 重新部署应用（重要！）
3. 检查是否选择了正确的环境（Production/Preview/Development）

---

## 📝 总结

**快速开始（推荐）**:
- 使用 `noreply@brevo.com`
- 5 分钟完成配置
- 适合测试和初期使用

**生产环境（长期）**:
- 配置自己的域名
- 使用 `noreply@citea.com`
- 更好的品牌形象和送达率

---

## 🎉 完成！

配置完成后，你的应用就可以通过 Brevo 发送邮件了！

**免费额度**: 每天 300 封邮件，足够大多数应用使用。

如有问题，请参考：
- `BREVO配置指南.md` - 详细的 Brevo 配置说明
- Brevo 官方文档: https://developers.brevo.com/


