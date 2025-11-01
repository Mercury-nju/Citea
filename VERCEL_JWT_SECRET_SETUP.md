# Vercel JWT_SECRET 环境变量配置指南

## 问题诊断

如果登录后立即闪退回登录页，很可能是 `JWT_SECRET` 环境变量未设置或不一致导致的。

## 解决步骤

### 1. 登录 Vercel Dashboard
访问 https://vercel.com 并登录你的账户

### 2. 选择项目
找到并选择你的 Citea 项目

### 3. 进入项目设置
- 点击项目名称
- 点击顶部导航栏的 **Settings**
- 在左侧菜单选择 **Environment Variables**

### 4. 添加 JWT_SECRET
- 点击 **Add New**
- **Key**: 输入 `JWT_SECRET`
- **Value**: 输入一个长随机字符串（至少 32 个字符），例如：
  ```
  your-super-secret-jwt-key-change-this-in-production-1234567890
  ```
- **Environment**: 选择 **Production**, **Preview**, 和 **Development**（全部选择）
- 点击 **Save**

### 5. 重新部署
- 进入 **Deployments** 标签页
- 找到最新的部署，点击右侧的 **...** 菜单
- 选择 **Redeploy**
- 或者在 GitHub 上推送一个新 commit 触发自动部署

### 6. 验证
部署完成后，清除浏览器 localStorage 并重新登录测试。

## 重要提示

⚠️ **JWT_SECRET 必须一致**
- 登录 API 和验证 API 必须使用相同的 JWT_SECRET
- 如果环境变量未设置，会使用默认值 `'dev-secret-change-me'`
- 确保生产环境使用强随机密钥

## 生成安全密钥

可以使用以下命令生成一个安全的随机密钥：
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

然后将生成的字符串设置为 `JWT_SECRET` 环境变量的值。

