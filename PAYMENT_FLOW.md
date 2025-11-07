# 支付流程说明

## 支付流程概述

### 1. 用户支付流程

1. **用户点击支付按钮**
   - 从 `/pricing` 页面或 `/dashboard` 页面点击订阅按钮
   - 跳转到 `/api/creem/checkout?plan=monthly` 或 `/api/creem/checkout?plan=yearly`

2. **创建支付会话**
   - `/api/creem/checkout` 端点调用 Creem API 创建支付会话
   - 如果用户已登录，会将用户邮箱作为 metadata 传递给 Creem
   - 如果用户未登录，Creem 支付页面会收集用户邮箱

3. **用户完成支付**
   - 用户在 Creem 支付页面填写：
     - 邮箱地址（必需）
     - 支付信息（银行卡/Google Pay）
   - 支付成功后，Creem 会重定向到成功页面

4. **Webhook 处理**
   - Creem 发送 webhook 事件到 `/api/creem/webhook`
   - Webhook 事件类型：`checkout.completed`, `subscription.activated`, `payment.succeeded`
   - Webhook 会：
     - 从事件中提取用户邮箱
     - 检查用户是否存在
     - 如果不存在，**自动创建账户**（未注册用户支付后自动创建）
     - 如果存在，更新用户权益
     - 设置会员计划、积分、订阅过期时间等

5. **权益生效**
   - 支付成功后，webhook 立即处理
   - 用户账户立即获得会员权益
   - 支付成功页面会自动刷新用户数据
   - Dashboard 会每30秒自动刷新，确保权益显示

## 未注册用户支付保障

### 自动创建账户
- 如果用户在支付页面填写了邮箱，但该邮箱未注册
- Webhook 收到支付成功事件后，会：
  1. 检查用户是否存在
  2. 如果不存在，自动创建账户
  3. 设置会员计划为付费计划（monthly/yearly）
  4. 设置积分、订阅过期时间等
  5. 标记邮箱为已验证（支付即验证）

### 用户登录
- 支付完成后，用户可以使用支付时填写的邮箱登录
- 由于账户是自动创建的，用户需要：
  - 使用邮箱登录
  - 如果忘记密码，可以使用"忘记密码"功能重置

## 支付连接验证

### 1. 环境变量检查
确保以下环境变量已设置：
- `CREEM_API_KEY` - Creem API 密钥
- `CREEM_PRODUCT_ID_MONTHLY` - 月付产品ID
- `CREEM_PRODUCT_ID_YEARLY` - 年付产品ID

### 2. Webhook URL 配置
在 Creem 后台配置 webhook URL：
```
https://your-domain.com/api/creem/webhook
```

### 3. 测试支付连接
访问测试端点检查配置：
```
GET /api/creem/test-webhook
```

### 4. 测试支付流程
1. 访问 `/api/creem/checkout?plan=monthly&debug=1` 检查配置
2. 完成一次测试支付
3. 检查 webhook 日志（Vercel Dashboard）
4. 验证用户账户是否正确创建/更新

## 权益保障机制

### 1. 多重检查
- Webhook 处理所有支付事件
- 支付成功页面自动刷新用户数据
- Dashboard 每30秒自动刷新

### 2. 完整字段设置
支付成功后，以下字段会被正确设置：
- `plan` - 会员计划（monthly/yearly）
- `credits` - 积分（根据计划）
- `subscriptionStartDate` - 订阅开始日期
- `subscriptionExpiresAt` - 订阅过期时间
- `creditsResetDate` - 积分重置日期
- `emailVerified` - 邮箱验证状态

### 3. 权限检查
所有功能都通过 `getPlanLimits(user.plan)` 检查权限：
- `hasAdvancedDatabases` - 高级数据库访问
- `hasChatAccess` - AI 聊天功能
- `wordLimit` - 字数限制
- `maxCredits` - 最大积分

## 故障排查

### 问题：支付完成后权益未生效
1. 检查 webhook 是否收到事件（查看 Vercel 日志）
2. 检查用户邮箱是否正确提取
3. 检查用户账户是否正确创建/更新
4. 检查环境变量是否正确设置

### 问题：未注册用户支付后无法登录
1. 确认 webhook 已创建账户
2. 用户可以使用支付邮箱 + "忘记密码"功能
3. 或者联系客服手动设置密码

### 问题：Webhook 未收到事件
1. 检查 Creem 后台 webhook URL 配置
2. 检查 webhook URL 是否可访问
3. 检查 Creem API 密钥是否正确
4. 查看 Creem 后台的 webhook 事件日志

## 日志监控

所有关键操作都有详细日志：
- `[Webhook]` - Webhook 处理日志
- `[Auth/Me]` - 用户信息获取日志
- `[Dashboard]` - Dashboard 刷新日志

在 Vercel Dashboard 中可以查看所有日志。

