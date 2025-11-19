# 📧 Brevo 验证发件邮箱步骤

## 🎯 当前位置

你现在在：**SMTP & API** → **SMTP** 标签页

这是配置 SMTP 服务器的地方，**不是验证发件邮箱的地方**。

---

## ✅ 正确的验证步骤

### 步骤 1: 进入发件人设置

**方法 A（通过侧边栏）**:
1. 在左侧菜单栏找到 **"Senders & IP"**（发件人和IP）
2. 或找到 **"Settings"** → **"Senders & IP"**

**方法 B（直接访问）**:
直接访问：
```
https://app.brevo.com/settings/senders
```

### 步骤 2: 添加发件人

1. 点击页面上的 **"Add a sender"** 或 **"Create a sender"** 按钮
2. 输入邮箱地址：
   - 建议测试用：`lihongyangnju@gmail.com`
   - 或公司邮箱：`hello@yourdomain.com`
   - 或 QQ 邮箱：`2945235656@qq.com`
3. 填写发件人名称（可选）：`Citea`
4. 点击 **"Save"** 或 **"Create"**

### 步骤 3: 验证邮箱

1. Brevo 会发送验证邮件到你输入的邮箱
2. **打开你的邮箱**（Gmail 或 QQ 邮箱）
3. 找到 Brevo 发送的验证邮件（可能在垃圾邮件文件夹）
4. **点击邮件中的验证链接**
5. 验证成功后，回到 Brevo Dashboard
6. 发件人状态会变为 **"Validated"** ✅

---

## 📍 页面位置对照

### 当前页面（SMTP & API）：
- ❌ **不能**验证发件邮箱
- ✅ 用于查看 SMTP 服务器信息
- ✅ 用于生成 SMTP 密钥

### 需要去的页面（Senders & IP）：
- ✅ **可以**验证发件邮箱
- ✅ 可以添加和管理发件人
- ✅ 可以看到发件人验证状态

---

## 🚀 快速链接

**直接点击下面的链接**（登录 Brevo 后会自动跳转）：

```
https://app.brevo.com/settings/senders
```

或：

```
https://app.brevo.com/transactional
```

然后在页面中找到 **"Senders"** 或 **"Senders & IP"** 部分。

---

## 💡 如果找不到

1. **查看左侧菜单栏**：
   - Settings（设置）
   - Senders & IP（发件人和IP）
   - 或 Transactional（交易邮件）→ Senders

2. **使用搜索功能**：
   - 在 Brevo Dashboard 顶部搜索框输入："senders"

3. **通过 URL 直接访问**：
   - 先登录 Brevo
   - 然后访问：`https://app.brevo.com/settings/senders`

---

## ✅ 验证成功后

1. 发件人状态显示 **"Validated"** ✅
2. 更新 Vercel 环境变量：
   ```
   BREVO_FROM_EMAIL=你验证的邮箱@example.com
   ```
3. 重新测试发送邮件

---

**现在请切换到 "Senders & IP" 页面，添加并验证发件邮箱！**

