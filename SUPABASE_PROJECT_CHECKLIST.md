# ✅ Supabase项目创建检查清单

## 🎯 当前状态
- ❌ **旧项目已删除**: `cgbjrnowqkdqhsbbbpoz.supabase.co` 返回404
- 🔄 **需要创建新项目**: 获取有效的API密钥

---

## 📋 操作步骤

### 1. 创建Supabase项目 ⏳
- [ ] 访问 [Supabase Dashboard](https://app.supabase.com)
- [ ] 点击 "New Project"
- [ ] 设置项目信息：
  - 项目名称：`Citea`
  - 数据库密码：设置强密码并保存
  - 地区：选择最近的位置
- [ ] 等待项目创建完成（2-3分钟）

### 2. 获取API密钥 ⏳
- [ ] 进入项目 **Settings** → **API**
- [ ] 复制以下信息：
  ```
  Project URL: https://[new-project-id].supabase.co
  Anon Key: [your-new-anon-key]  
  Service Role Key: [your-new-service-role-key]
  ```

### 3. 更新环境变量 ⏳
- [ ] 打开 `.env.local` 文件
- [ ] **完全替换** Supabase配置：
  ```env
  NEXT_PUBLIC_SUPABASE_URL=https://[your-new-project-id].supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-new-anon-key]
  SUPABASE_SERVICE_ROLE_KEY=[your-new-service-role-key]
  ```

### 4. 验证连接 ⏳
- [ ] 运行诊断脚本：
  ```bash
  node scripts/diagnose-supabase-keys.js
  ```
- [ ] 预期输出：
  ```
  ✅ Anon Key 连接: 成功
  ✅ Service Key 连接: 成功
  ```

### 5. 初始化数据库 ⏳
- [ ] 进入 **SQL Editor**
- [ ] 运行数据库初始化SQL（参考 `CREATE_NEW_SUPABASE_PROJECT.md`）
- [ ] 验证表结构创建成功

### 6. 配置邮件服务 ⏳
- [ ] 进入 **Authentication** → **Providers**
- [ ] 启用 **Email Confirmations**
- [ ] 设置 **Site URL**: `http://localhost:3000`
- [ ] 配置邮件模板（可选）

### 7. 测试完整流程 ⏳
- [ ] 运行测试脚本：
  ```bash
  node scripts/test-signup-simple.js
  ```
- [ ] 验证：
  - ✅ 用户注册成功
  - ✅ 邮件发送成功（无"Invalid API key"错误）
  - ✅ 验证码正确存储
  - ✅ 邮箱验证流程正常

---

## 🎯 完成标准

当所有复选框都勾选后，你的Supabase邮件服务将完全正常工作。

## 🆘 遇到问题？

1. **项目创建失败** → 检查网络连接，尝试不同地区
2. **API密钥无效** → 确认复制完整，无多余空格
3. **数据库SQL失败** → 分步执行，检查语法
4. **邮件发送失败** → 检查邮件配额，确认配置正确

---

**完成后运行测试验证整个流程！** 🚀