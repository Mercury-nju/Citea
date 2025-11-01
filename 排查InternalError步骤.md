# 🔍 排查 Internal Error 步骤

## 📋 检查清单

按照以下步骤逐一检查：

---

## 步骤 1: 检查 Vercel 部署日志

**这是最重要的一步！** 日志会显示具体的错误信息。

1. **访问 Vercel Dashboard**: https://vercel.com/dashboard
2. **选择项目** `citea`
3. **进入 Deployments**
4. **点击最新的部署**
5. **查看 "Logs" 标签**
6. **查找错误信息**（红色文字）

**常见错误**:
- `Database not configured` - 数据库未配置
- `ECONNREFUSED` - Redis 连接被拒绝
- `Invalid REDIS_URL` - Redis URL 格式错误
- `Cannot read property...` - 代码错误

**把日志中的错误信息复制给我，我会帮你解决！**

---

## 步骤 2: 检查环境变量

1. **进入 Settings** > **Environment Variables**
2. **确认以下变量存在**:

   ✅ **必须的变量**:
   ```
   REDIS_URL = redis://... 或 https://... (Upstash 提供的)
   BREVO_API_KEY = xkeysib-xxx...
   BREVO_FROM_EMAIL = noreply@brevo.com
   ```

3. **检查 REDIS_URL 的格式**:
   - ✅ 有效: `redis://default:password@host:port`
   - ✅ 有效: `rediss://default:password@host:port` (SSL)
   - ❌ 无效: `https://xxx.upstash.io` (这是 REST API，需要特殊处理)

---

## 步骤 3: 检查 Redis URL 格式

### 如果是 `redis://` 或 `rediss://` 格式
✅ 这个可以直接使用，代码已经支持

### 如果是 `https://xxx.upstash.io` 格式（REST API）
❌ 需要修改代码使用 Upstash REST API SDK

**解决方法**: 在 Upstash Dashboard 中找到 **"Redis"** 标签（不是 REST），复制标准的 Redis 连接字符串。

---

## 步骤 4: 验证环境变量是否生效

### 方法 1: 通过 Vercel 函数日志

在代码中添加临时日志：

```typescript
console.log('REDIS_URL configured:', !!process.env.REDIS_URL)
console.log('REDIS_URL value:', process.env.REDIS_URL ? process.env.REDIS_URL.substring(0, 20) + '...' : 'NOT SET')
```

然后查看部署日志。

### 方法 2: 创建测试 API 路由

创建一个测试路由来验证环境变量：

```typescript
// app/api/test-env/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    hasRedis: !!process.env.REDIS_URL,
    redisUrlPrefix: process.env.REDIS_URL?.substring(0, 20) || 'NOT SET',
    hasBrevo: !!process.env.BREVO_API_KEY,
  })
}
```

访问: `https://citea-2fuwy93mi-mercury-njus-projects.vercel.app/api/test-env`

---

## 步骤 5: 检查 Upstash Redis 状态

1. **访问 Upstash Dashboard**
2. **检查数据库状态**:
   - ✅ 应该是 "Available" 或 "Active"
   - ❌ 如果是 "Suspended" 或 "Error"，需要修复

3. **检查连接限制**:
   - 免费计划可能有连接数限制
   - 检查是否超出配额

---

## 步骤 6: 查看改进的错误信息

我已经更新了错误处理，现在会显示更详细的错误信息。

**重新部署后**，错误对话框应该会显示：
- `Database connection failed` - Redis 连接问题
- `Database not configured` - 数据库未配置
- 其他具体错误信息

---

## 🔧 快速修复方案

### 如果 REDIS_URL 是 REST API 格式 (`https://...`)

**方案 A: 获取标准 Redis 连接字符串**

1. 在 Upstash Dashboard
2. 找到 **"Redis"** 标签（不是 "REST"）
3. 复制 **"Connect via Redis protocol"** 的连接字符串
4. 应该类似: `redis://default:xxx@xxx.upstash.io:6379`
5. 更新 Vercel 中的 `REDIS_URL` 环境变量

**方案 B: 使用 Upstash REST API SDK（需要修改代码）**

如果只有 REST API URL，需要安装 `@upstash/redis` 并修改代码。

---

## 📝 请提供以下信息

帮我排查时，请提供：

1. **Vercel 部署日志中的错误信息**（最重要！）
2. **REDIS_URL 的前几个字符**（例如: `redis://` 或 `https://`）
3. **Upstash 数据库的状态**（Available/Error）
4. **所有环境变量的名称列表**（不包含值）

---

## 🎯 下一步

**立即执行**:
1. ✅ 查看 Vercel 部署日志
2. ✅ 复制错误信息
3. ✅ 告诉我你看到的错误

然后我会给你精确的解决方案！

