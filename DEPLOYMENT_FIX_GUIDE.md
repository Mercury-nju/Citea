# 部署问题解决方案

## 问题：401 Unauthorized

### 原因分析
1. Vercel项目可能需要身份验证
2. 环境变量未正确配置
3. 项目设置为私有

### 解决方案

#### 步骤1：配置Vercel环境变量
访问 https://vercel.com/dashboard 并添加以下环境变量：

```bash
NEXT_PUBLIC_SUPABASE_URL=你的Supabase URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase匿名密钥
SUPABASE_SERVICE_ROLE_KEY=你的Supabase服务角色密钥
REDIS_URL=你的Redis连接URL
JWT_SECRET=你的JWT密钥
```

#### 步骤2：检查项目设置
确保项目不是私有的，检查部署保护设置。

#### 步骤3：重新部署
推送新的提交触发重新部署。

### 测试部署
部署成功后，访问提供的URL测试功能。
