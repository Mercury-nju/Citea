# 🔧 Supabase API密钥修复指南

## 🚨 问题诊断

你的Supabase API密钥返回 "Invalid API key" 错误，可能原因：
- Supabase项目被暂停或删除
- 密钥已被重新生成
- 项目配置问题

## 🔧 解决方案

### 步骤1: 检查Supabase项目状态

1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 登录你的账户
3. 检查项目是否显示为：
   - ✅ 活跃（Active）
   - ⚠️ 暂停（Paused）
   - ❌ 删除（Deleted）

### 步骤2: 获取新的API密钥

#### 如果项目存在但被暂停：
1. 点击项目进入详情页
2. 点击 "Resume Project" 重新激活
3. 等待几分钟让项目完全启动

#### 如果项目被删除或需要新项目：
1. 点击 "New Project"
2. 输入项目信息：
   - 项目名称：Citea
   - 数据库密码：设置强密码
   - 地区：选择离你最近的地区
3. 等待项目创建完成（约2-3分钟）

#### 获取新的API密钥：
1. 进入项目后，点击左侧菜单的 **Settings**
2. 点击 **API**
3. 复制以下密钥：
   - **Project URL**（项目URL）
   - **anon public**（匿名密钥）
   - **service_role**（服务角色密钥）⚠️ 注意保密

### 步骤3: 更新环境变量

1. 打开 `.env.local` 文件
2. 更新以下变量：

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=你的新项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的新匿名密钥
SUPABASE_SERVICE_ROLE_KEY=你的新服务角色密钥
```

3. 保存文件

### 步骤4: 验证新密钥

运行诊断脚本验证新密钥：

```bash
node scripts/diagnose-supabase-keys.js
```

预期输出：
```
✅ Anon Key 连接: 成功
✅ Service Key 连接: 成功
```

### 步骤5: 测试邮件功能

更新密钥后，测试邮件发送：

```bash
node scripts/test-signup-simple.js
```

预期结果：
- ✅ 用户注册成功
- ✅ 验证码正确生成
- ✅ 邮件发送成功（不再显示 "Invalid API key"）

## 📋 验证清单

- [ ] Supabase项目状态正常
- [ ] 获取了新的API密钥
- [ ] 更新了.env.local文件
- [ ] 诊断脚本显示连接成功
- [ ] 邮件发送测试通过

## 🆘 如果仍然失败

1. **检查项目配额**：确认没有超出免费额度
2. **检查网络连接**：确保能访问Supabase服务
3. **重新创建项目**：如果问题持续，创建全新项目
4. **联系支持**：访问 [Supabase支持](https://supabase.com/support)

## 🎯 成功标准

修复成功后，你应该能够：
- ✅ 用户注册时收到验证码邮件
- ✅ 验证码正确存储在Redis中
- ✅ 用户能够成功验证邮箱
- ✅ 整个注册流程正常工作