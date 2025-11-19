# 数据持久化机制说明

## 📊 用户数据存储架构

### 1️⃣ **用户账户数据**（数据库存储）

存储位置：**Redis/Vercel KV**（生产环境）或 **本地文件**（开发环境）

```typescript
// 保存内容
{
  id: string                    // 用户 ID
  name: string                  // 用户名
  email: string                 // 邮箱（唯一标识）
  passwordHash: string          // 密码哈希
  plan: 'free' | 'monthly' | 'yearly'  // 订阅计划
  credits: number               // 当前积分
  creditsResetDate: string      // 积分重置日期
  emailVerified: boolean        // 邮箱验证状态
  authProvider: 'email' | 'google'  // 认证方式
  googleId?: string             // Google 用户 ID
  avatar?: string               // 头像 URL
  createdAt: string             // 创建时间
  lastLoginAt: string           // 最后登录时间
}
```

**特点：**
- ✅ 跨设备同步（存储在服务器）
- ✅ 永久保存
- ✅ 每次登录从 `/api/auth/me` 恢复
- ✅ 积分自动重置（免费用户每日，付费用户按计划）

---

### 2️⃣ **认证 Token**（浏览器 localStorage）

存储位置：`localStorage`

```typescript
// Key: 'citea_auth_token'
// Value: JWT Token (JSON Web Token)

// 用途：
// - 验证用户身份
// - 调用 API 时在 Authorization header 中发送
// - 保持登录状态
```

**特点：**
- ✅ 浏览器本地存储，自动持久化
- ✅ 每次页面刷新后验证
- ⚠️ 不同浏览器/设备需要重新登录
- ⚠️ 清除浏览器数据会丢失（需要重新登录）

---

### 3️⃣ **用户基本信息缓存**（浏览器 localStorage）

存储位置：`localStorage`

```typescript
// Key: 'citea_user'
// Value: JSON 字符串

{
  id: string
  email: string
  name: string
  plan: string
  credits: number
  avatar?: string
}
```

**特点：**
- ✅ 快速加载，无需每次请求 API
- ✅ 每次登录时从服务器更新
- ⚠️ 仅用于显示，不用于权限验证
- ⚠️ 清除浏览器数据会丢失（重新登录即可恢复）

---

### 4️⃣ **Write 文档**（浏览器 localStorage，按用户隔离）✅ 已修复

存储位置：`localStorage`

```typescript
// Key: `citea_documents_${user.email}`  ✅ 按用户隔离
// Value: JSON 数组

[
  {
    id: string              // 文档 ID
    title: string           // 标题
    outline: string[]       // 大纲
    content: string         // 内容
    preview: string         // 预览
    createdAt: number       // 创建时间戳
    updatedAt: number       // 更新时间戳
  }
]
```

**修复前的问题：** ❌
- 所有用户共享同一个 `citea_documents` key
- 用户 A 能看到用户 B 的文档
- 切换账号后文档混乱

**修复后：** ✅
- 每个用户有独立的存储 key：`citea_documents_{email}`
- 完全隔离，互不干扰
- 自动关联到登录用户

**特点：**
- ✅ 按用户邮箱隔离
- ✅ 实时保存编辑
- ⚠️ 仅本地存储（不跨设备）
- ⚠️ 清除浏览器数据会丢失（未来可改为服务器存储）

---

### 5️⃣ **搜索历史**（浏览器 localStorage，按用户隔离）✅ 已正确实现

存储位置：`localStorage`

```typescript
// Key: `citea_search_history_${user.email}`  ✅ 按用户隔离
// Value: JSON 数组

[
  {
    id: string
    title: string
    date: string
    type: 'finder' | 'checker'
    fullQuery: string
    results: any
    timestamp: number
  }
]
```

**特点：**
- ✅ 按用户邮箱隔离
- ✅ 最多保存 50 条
- ✅ 自动关联到登录用户
- ⚠️ 仅本地存储（不跨设备）

---

## 🔄 登录流程与数据恢复

### 用户登录时

1. **邮箱/密码登录** 或 **Google OAuth 登录**
2. 后端验证成功后生成 JWT token
3. 前端保存到 localStorage：
   ```typescript
   localStorage.setItem('citea_auth_token', token)
   localStorage.setItem('citea_user', JSON.stringify(user))
   ```
4. 跳转到 Dashboard

### Dashboard 页面加载时

```typescript
// app/dashboard/layout.tsx
useEffect(() => {
  const checkAuth = async () => {
    // 1. 获取 token
    const token = localStorage.getItem('citea_auth_token')
    if (!token) {
      router.push('/auth/signin')  // 没有 token，跳转登录
      return
    }
    
    // 2. 从缓存快速加载用户信息
    const savedUser = localStorage.getItem('citea_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    
    // 3. 验证 token 并获取最新数据
    const res = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    const data = await res.json()
    
    if (data.user) {
      // 4. 更新用户信息（包括最新积分）
      setUser(data.user)
      localStorage.setItem('citea_user', JSON.stringify(data.user))
    } else {
      // Token 失效，清除并跳转登录
      localStorage.removeItem('citea_auth_token')
      localStorage.removeItem('citea_user')
      router.push('/auth/signin')
    }
  }
  
  checkAuth()
}, [])
```

### 用户特定数据加载

```typescript
// 加载文档列表
const user = JSON.parse(localStorage.getItem('citea_user') || '{}')
const documents = JSON.parse(localStorage.getItem(`citea_documents_${user.email}`) || '[]')

// 加载搜索历史
const history = JSON.parse(localStorage.getItem(`citea_search_history_${user.email}`) || '[]')
```

---

## 🔒 数据隔离保证

### ✅ 已实现

1. **账户数据**：通过邮箱作为数据库 key 隔离
2. **Write 文档**：通过 `citea_documents_${email}` 隔离
3. **搜索历史**：通过 `citea_search_history_${email}` 隔离

### 测试场景

**场景 1：同一浏览器切换账号**
- 用户 A 登出，用户 B 登录
- 用户 B 只能看到自己的文档和历史 ✅

**场景 2：不同设备登录**
- 用户在手机和电脑上登录
- 账户数据（积分、计划）自动同步 ✅
- 文档和历史需要手动同步（localStorage 不跨设备）⚠️

**场景 3：清除浏览器数据**
- Token 丢失，需要重新登录
- 账户数据从服务器恢复 ✅
- 本地文档和历史丢失 ⚠️

---

## 🚀 未来改进建议

### 1. 将 Write 文档迁移到服务器存储

**优点：**
- 跨设备同步
- 永久保存，不怕浏览器数据清除
- 支持协作功能

**实现方案：**
```typescript
// 后端 API
POST /api/documents          // 创建文档
GET  /api/documents          // 获取用户所有文档
GET  /api/documents/{id}     // 获取单个文档
PUT  /api/documents/{id}     // 更新文档
DELETE /api/documents/{id}   // 删除文档

// 数据库表
{
  id: string
  userId: string              // 关联用户
  title: string
  outline: string[]
  content: string
  createdAt: timestamp
  updatedAt: timestamp
}
```

### 2. 添加自动保存

- 编辑器内容变化时自动保存到服务器
- 使用防抖（debounce）避免频繁请求
- 显示"已保存"/"正在保存"状态

### 3. 离线支持

- 使用 Service Worker
- 离线时保存到 IndexedDB
- 在线时自动同步

---

## 📝 当前数据持久化总结

| 数据类型 | 存储位置 | 是否隔离 | 跨设备 | 持久性 |
|---------|---------|---------|--------|--------|
| 用户账户 | Redis/KV | ✅ 按邮箱 | ✅ 是 | ✅ 永久 |
| 认证 Token | localStorage | N/A | ❌ 否 | ⚠️ 浏览器清除会丢失 |
| 用户信息缓存 | localStorage | N/A | ❌ 否 | ⚠️ 可从服务器恢复 |
| Write 文档 | localStorage | ✅ 按邮箱 | ❌ 否 | ⚠️ 浏览器清除会丢失 |
| 搜索历史 | localStorage | ✅ 按邮箱 | ❌ 否 | ⚠️ 浏览器清除会丢失 |

---

## ✅ 修复记录

**时间：** 2024-11-07  
**问题：** Write 文档未按用户隔离，导致用户间数据混乱  
**修复：** 将 `citea_documents` 改为 `citea_documents_${user.email}`  
**影响文件：**
- `app/dashboard/write/page.tsx`
- `app/dashboard/write/[id]/page.tsx`

**结果：** ✅ 每个用户现在拥有独立的文档存储空间，完全隔离

---

## 📞 技术支持

如有问题，请联系：
- Email: lihongyangnju@gmail.com
- Discord: [Citea Community](https://discord.gg/GQZDMRYhGC)

