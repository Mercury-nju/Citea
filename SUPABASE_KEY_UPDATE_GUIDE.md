# Supabase API 密钥更新指南

## 问题诊断
当前 Supabase API 密钥返回 "Invalid API key" 错误，需要更新。

## 解决步骤

### 1. 访问 Supabase 控制台
- 打开: https://supabase.com/dashboard
- 登录你的账户

### 2. 获取新的 API 密钥
- 选择项目 `ntssisjdeveetrgpyena`
- 进入 Settings → API
- 复制以下密钥：
  - `Project URL`: `https://ntssisjdeveetrgpyena.supabase.co`
  - `anon public`: 匿名密钥
  - `service_role`: 服务角色密钥（⚠️ 保密，不要泄露）

### 3. 更新 Vercel 环境变量
```bash
# 在 Vercel 项目设置中更新以下环境变量
NEXT_PUBLIC_SUPABASE_URL=https://ntssisjdeveetrgpyena.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=新的匿名密钥
SUPABASE_SERVICE_ROLE_KEY=新的服务角色密钥
```

### 4. 重新部署
```bash
# 触发重新部署
vercel --prod
```

### 5. 验证修复
```bash
# 运行测试脚本
node scripts/test-supabase-connection.js
```

## 重要提醒
- 服务角色密钥具有管理员权限，务必保密
- 更新密钥后需要重新部署才能生效
- 确保所有相关环境变量都已更新

## 预期结果
更新密钥后，用户注册邮件发送功能应该恢复正常。