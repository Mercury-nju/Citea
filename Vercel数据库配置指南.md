# 🔧 Vercel 数据库配置指南

## ❌ 问题：注册时出现 "Internal error"

**原因**: 在 Vercel 生产环境中，应用需要数据库存储用户数据，但数据库未配置。

---

## ✅ 解决方案：配置 Vercel KV（推荐）

Vercel KV 是 Vercel 提供的 Redis 数据库服务，非常适合存储用户数据。

### 步骤 1: 创建 Vercel KV 数据库

1. **访问 Vercel Dashboard**: https://vercel.com/dashboard
2. **进入 Storage 页面**:
   - 点击左侧菜单 **"Storage"**
   - 或访问: https://vercel.com/dashboard/stores
3. **创建 KV Store**:
   - 点击 **"Create Database"** 或 **"Add KV"**
   - 选择 **"KV"** (Redis 数据库)
   - 输入名称（例如: `citea-kv`）
   - 选择区域（选择离你最近的区域）
   - 点击 **"Create"**

### 步骤 2: 连接到项目

1. **选择项目**:
   - 在 KV Store 详情页面
   - 点击 **"Connect"** 或 **"Add to Project"**
   - 选择你的项目: `citea`
   - 点击 **"Connect"**

2. **自动配置环境变量**:
   - Vercel 会自动添加以下环境变量到你的项目：
     - `KV_REST_API_URL`
     - `KV_REST_API_TOKEN`
     - `KV_REST_API_READ_ONLY_TOKEN`

### 步骤 3: 验证配置

1. **检查环境变量**:
   - 进入项目: **Settings** > **Environment Variables**
   - 确认以下变量已存在：
     - ✅ `KV_REST_API_URL`
     - ✅ `KV_REST_API_TOKEN`
     - ✅ `KV_REST_API_READ_ONLY_TOKEN`

2. **重新部署**:
   - 环境变量添加后，Vercel 会自动触发重新部署
   - 或手动触发: **Deployments** > **Redeploy**

### 步骤 4: 测试注册

1. 访问应用注册页面
2. 尝试注册新账号
3. 应该可以成功注册了！

---

## 🆓 免费额度

**Vercel KV 免费计划**:
- ✅ 256 MB 存储空间
- ✅ 每天 30,000 次读取
- ✅ 每天 30,000 次写入
- ✅ 足够初期使用

---

## 🔄 替代方案：使用外部 Redis

如果你已经有 Redis 服务器，也可以使用外部 Redis：

### 配置 Redis URL

在 Vercel 环境变量中添加：

```
REDIS_URL=redis://your-redis-host:6379
```

或者使用 Redis 连接字符串（支持密码）:

```
REDIS_URL=redis://:password@your-redis-host:6379
```

**推荐的 Redis 服务**:
- **Upstash Redis** (免费额度): https://upstash.com/
- **Redis Cloud** (免费额度): https://redis.com/cloud/
- **Railway Redis**: https://railway.app/

---

## 📋 完整的环境变量清单

注册功能需要以下环境变量：

### 必需的环境变量

**数据库配置（二选一）**:
```
KV_REST_API_URL=https://xxx.kv.vercel.app
KV_REST_API_TOKEN=xxx
```

或

```
REDIS_URL=redis://your-redis-host:6379
```

**邮件服务配置**:
```
BREVO_API_KEY=xkeysib-xxx...
BREVO_FROM_EMAIL=noreply@brevo.com
```

**应用 URL**（可选，但推荐）:
```
NEXT_PUBLIC_APP_URL=https://citea-4cg6h63bu-mercury-njus-projects.vercel.app
```

---

## 🔍 诊断步骤

如果注册仍然失败，按以下步骤检查：

### 1. 检查 Vercel 日志

1. 进入 Vercel Dashboard
2. 选择项目 > **Deployments**
3. 点击最新的部署
4. 查看 **"Logs"** 标签
5. 查找错误信息

### 2. 检查环境变量

1. 进入 **Settings** > **Environment Variables**
2. 确认所有必需的变量都已配置
3. 确认环境范围正确（Production, Preview, Development）

### 3. 测试数据库连接

创建一个测试 API 路由来验证数据库连接。

---

## ✅ 配置检查清单

完成以下步骤后，注册功能应该可以正常工作：

- [ ] 创建 Vercel KV Store
- [ ] 将 KV Store 连接到项目
- [ ] 确认环境变量已自动配置（KV_REST_API_URL, KV_REST_API_TOKEN）
- [ ] 配置 BREVO_API_KEY
- [ ] 配置 BREVO_FROM_EMAIL
- [ ] 配置 NEXT_PUBLIC_APP_URL（可选）
- [ ] 重新部署应用
- [ ] 测试注册功能

---

## 🎯 快速配置步骤（总结）

1. **Vercel Dashboard** > **Storage** > **Create Database** > **KV**
2. 创建后点击 **"Connect"** 连接到项目
3. 自动添加环境变量，等待重新部署
4. 测试注册功能

**总时间**: 约 2-3 分钟

---

## 📚 相关文档

- **Vercel KV 文档**: https://vercel.com/docs/storage/vercel-kv
- **Vercel KV Dashboard**: https://vercel.com/dashboard/stores
- **项目代码**: `lib/userStore.ts` - 查看数据库配置逻辑

---

## 🐛 常见问题

### Q1: KV Store 创建失败

**解决方案**:
- 检查 Vercel 账号状态
- 确认有足够的免费额度
- 尝试刷新页面重试

### Q2: 环境变量未自动添加

**解决方案**:
1. 手动添加环境变量：
   - 从 KV Store 详情页面复制变量值
   - 在项目设置中手动添加
2. 或重新连接 KV Store 到项目

### Q3: 仍然显示 "Internal error"

**解决方案**:
1. 查看 Vercel 部署日志
2. 检查控制台错误信息
3. 确认所有环境变量都已配置
4. 确认应用已重新部署

---

## 🎉 完成！

配置完成后，你的应用就可以：
- ✅ 正常注册用户
- ✅ 存储用户数据
- ✅ 发送验证邮件
- ✅ 完整功能运行

如有问题，请检查 Vercel 部署日志获取详细错误信息。




