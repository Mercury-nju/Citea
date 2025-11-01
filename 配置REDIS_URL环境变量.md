# 🔧 配置 REDIS_URL 环境变量

## 📋 问题

Upstash 创建的环境变量可能是 `CITEA_REDIS_URL`，但代码需要 `REDIS_URL`。

## ✅ 解决方案：在 Vercel 手动添加 REDIS_URL

### 步骤 1: 获取 Redis URL 值

1. **在 Upstash Dashboard** 找到 `CITEA_REDIS_URL` 的值
2. **复制完整的 URL**（例如：`redis://default:xxx@xxx.upstash.io:6379`）
   或如果是 REST URL：`https://xxx.upstash.io`

### 步骤 2: 在 Vercel 添加环境变量

1. **访问 Vercel Dashboard**: https://vercel.com/dashboard
2. **选择项目** `citea`
3. **进入 Settings** > **Environment Variables**
4. **点击 "Add New"** 添加新变量：

   ```
   Name: REDIS_URL
   Value: (粘贴从 Upstash 复制的 CITEA_REDIS_URL 的值)
   Environment: ✅ Production  ✅ Preview  ✅ Development
   ```

5. **点击 "Save"**

### 步骤 3: 重新部署

- 环境变量添加后会自动触发部署
- 或手动触发：**Deployments** > **Redeploy**

---

## 🔍 如何找到正确的 Redis URL

### 选项 A: 从 Upstash Dashboard 复制

1. 访问 Upstash Dashboard
2. 找到你的数据库 `citea-redis`
3. 在 "Connection" 或 ".env.local" 标签下
4. 复制 `CITEA_REDIS_URL` 的值

### 选项 B: 从 Vercel 环境变量复制

1. 进入 **Settings** > **Environment Variables**
2. 查找 `CITEA_REDIS_URL`
3. 复制它的值
4. 创建一个新的 `REDIS_URL` 变量，使用相同的值

---

## 📝 Redis URL 格式

Redis URL 通常有以下格式：

**标准格式**:
```
redis://default:password@host:port
```

**Upstash REST URL**:
```
https://xxx.upstash.io
```

两种格式都可以，代码会自动处理。

---

## ✅ 验证配置

配置完成后：

1. ✅ `REDIS_URL` 环境变量已添加
2. ✅ 值是正确的 Redis 连接字符串
3. ✅ 三个环境都已配置
4. ✅ 应用已重新部署
5. ✅ 测试注册功能

---

## 🎯 快速操作步骤

1. **复制** `CITEA_REDIS_URL` 的值（从 Vercel 或 Upstash）
2. **添加新变量** `REDIS_URL`，使用复制的值
3. **保存并等待部署**
4. **测试注册功能**

---

完成后告诉我，我们测试一下！

