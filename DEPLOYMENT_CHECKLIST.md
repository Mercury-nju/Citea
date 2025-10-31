# 🚀 Citea 部署检查清单

## 部署前准备 (Pre-deployment)

### 1. 代码准备
- [ ] 所有功能已测试并正常工作
- [ ] 已修复所有已知的 bug
- [ ] 代码已提交到 Git 仓库
- [ ] 移除所有调试代码和 console.log
- [ ] 更新版本号 (package.json)

### 2. 环境变量配置
- [ ] 已创建 `.env.local` 文件 (本地)
- [ ] 已设置生产环境变量 (Vercel/服务器)
- [ ] **JWT_SECRET** 已设置为强密钥 (至少 32 字符)
- [ ] **NODE_ENV** 设置为 `production`
- [ ] 数据库连接已配置 (Redis/Vercel KV)

### 3. 数据库配置
- [ ] 选择数据库方案 (Redis/Vercel KV)
- [ ] 数据库连接已测试
- [ ] 运行数据库初始化脚本
  ```bash
  node scripts/init-database.js
  ```
- [ ] 创建测试用户并验证登录
- [ ] 备份现有数据 (如有)

### 4. 安全检查
- [ ] JWT 密钥不是默认值
- [ ] 生产环境不使用文件存储
- [ ] HTTPS 已启用
- [ ] CORS 配置正确
- [ ] Cookie 设置 secure 标志
- [ ] 敏感信息不在代码中硬编码
- [ ] `.env.local` 已加入 `.gitignore`

---

## Vercel 部署步骤

### 方案 A: 通过 Vercel Dashboard 部署

#### 步骤 1: 准备代码仓库
```bash
# 确保代码已推送到 GitHub
git add .
git commit -m "Ready for production deployment"
git push origin main
```

#### 步骤 2: 导入项目到 Vercel
1. 访问 [vercel.com](https://vercel.com/)
2. 点击 "Add New Project"
3. 选择你的 GitHub 仓库
4. 点击 "Import"

#### 步骤 3: 配置环境变量
在 Vercel 项目设置中添加以下环境变量:

```bash
# 必需变量
JWT_SECRET=your_production_jwt_secret_here
NODE_ENV=production

# 如果使用 OpenAI (可选)
OPENAI_API_KEY=your_openai_key_here
```

#### 步骤 4: 添加 Vercel KV 数据库
1. 在 Vercel 项目页面，点击 "Storage" 标签
2. 点击 "Create Database"
3. 选择 "KV (Redis)"
4. 点击 "Create"
5. 点击 "Connect to Project" 连接到你的项目
6. Vercel 会自动添加 KV 相关的环境变量

#### 步骤 5: 部署
1. 点击 "Deploy" 按钮
2. 等待部署完成
3. 访问生成的 URL 测试网站

#### 步骤 6: 配置自定义域名 (可选)
1. 在项目设置中点击 "Domains"
2. 添加你的域名
3. 按照提示配置 DNS 记录

### 方案 B: 通过 Vercel CLI 部署

#### 步骤 1: 安装 Vercel CLI
```bash
npm install -g vercel
```

#### 步骤 2: 登录 Vercel
```bash
vercel login
```

#### 步骤 3: 部署
```bash
# 首次部署
vercel

# 生产环境部署
vercel --prod
```

#### 步骤 4: 设置环境变量
```bash
vercel env add JWT_SECRET production
# 输入你的 JWT 密钥

vercel env add NODE_ENV production
# 输入: production
```

---

## 自托管部署步骤 (Docker)

### 步骤 1: 准备 Redis 数据库

**选项 A: 使用云服务 Redis**
- Upstash: https://upstash.com/
- Railway: https://railway.app/
- Redis Cloud: https://redis.com/

**选项 B: 自托管 Redis**
```bash
docker run -d \
  --name citea-redis \
  -p 6379:6379 \
  -v redis-data:/data \
  redis:latest
```

### 步骤 2: 创建 Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### 步骤 3: 创建 docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis

  redis:
    image: redis:latest
    volumes:
      - redis-data:/data

volumes:
  redis-data:
```

### 步骤 4: 部署
```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f app

# 停止
docker-compose down
```

---

## 部署后验证

### 1. 功能测试
- [ ] 主页正常加载
- [ ] 用户注册功能正常
- [ ] 用户登录功能正常
- [ ] Dashboard 页面正常显示
- [ ] 退出登录功能正常
- [ ] AI 功能正常 (如果配置了)

### 2. 性能测试
- [ ] 页面加载时间 < 3 秒
- [ ] API 响应时间 < 500ms
- [ ] 数据库查询正常
- [ ] 无内存泄漏

### 3. 安全测试
- [ ] HTTPS 正常工作
- [ ] Cookie 设置正确
- [ ] JWT 过期时间正确
- [ ] 密码正确加密
- [ ] 无敏感信息泄露

### 4. 用户体验测试
- [ ] 移动端适配正常
- [ ] 错误提示友好
- [ ] 加载动画流畅
- [ ] 多语言切换正常

---

## 监控和维护

### 1. 设置监控
- [ ] 配置 Vercel Analytics (免费)
- [ ] 设置错误追踪 (Sentry)
- [ ] 配置 Uptime 监控
- [ ] 设置日志收集

### 2. 备份策略
- [ ] 设置数据库自动备份
- [ ] 定期导出用户数据
- [ ] 备份环境变量配置
- [ ] 代码定期推送到 Git

### 3. 更新计划
- [ ] 定期更新依赖包
- [ ] 定期更换 JWT 密钥
- [ ] 定期检查安全漏洞
- [ ] 定期审查用户反馈

---

## 常见问题排查

### 问题 1: 部署成功但无法访问

**可能原因:**
- DNS 未生效
- HTTPS 证书未配置
- 防火墙阻止

**解决方案:**
```bash
# 检查 DNS
nslookup your-domain.com

# 检查服务器状态
curl -I https://your-domain.com
```

### 问题 2: 用户无法注册/登录

**可能原因:**
- 数据库未连接
- JWT_SECRET 未设置
- Cookie 配置错误

**解决方案:**
1. 检查环境变量
2. 查看服务器日志
3. 测试数据库连接
```bash
node scripts/init-database.js
```

### 问题 3: 数据库连接失败

**可能原因:**
- REDIS_URL 配置错误
- Redis 服务未启动
- 网络问题

**解决方案:**
```bash
# 测试 Redis 连接
redis-cli -u $REDIS_URL ping

# 检查 Redis 状态
redis-cli info
```

### 问题 4: API 响应慢

**可能原因:**
- 数据库查询慢
- 服务器资源不足
- 网络延迟

**解决方案:**
1. 启用 Redis 缓存
2. 优化数据库查询
3. 增加服务器资源
4. 使用 CDN

---

## 回滚计划

如果部署出现严重问题，按以下步骤回滚:

### Vercel 回滚
1. 在 Vercel Dashboard 找到项目
2. 点击 "Deployments" 标签
3. 找到上一个稳定版本
4. 点击右侧 "..." 菜单
5. 选择 "Promote to Production"

### Docker 回滚
```bash
# 停止当前版本
docker-compose down

# 切换到稳定版本
git checkout <stable-commit>

# 重新部署
docker-compose up -d
```

---

## 紧急联系信息

**技术支持:**
- Email: support@citea.com
- GitHub Issues: [项目仓库]

**服务提供商:**
- Vercel Status: https://www.vercel-status.com/
- Upstash Status: https://status.upstash.com/
- OpenAI Status: https://status.openai.com/

---

## 下一步优化

部署成功后，考虑以下优化:

### 1. 性能优化
- [ ] 添加 Redis 缓存层
- [ ] 启用 CDN
- [ ] 图片优化
- [ ] 代码分割

### 2. 功能增强
- [ ] 邮件验证
- [ ] 忘记密码
- [ ] 社交登录
- [ ] 用户资料页

### 3. 商业化
- [ ] 集成支付系统 (Stripe)
- [ ] 实现订阅管理
- [ ] 使用量统计
- [ ] 发票生成

### 4. 用户体验
- [ ] 添加引导教程
- [ ] 完善错误提示
- [ ] 添加帮助文档
- [ ] 客服支持

---

## 检查清单总结

### 必须完成 (Critical)
- ✅ 环境变量配置
- ✅ 数据库连接
- ✅ JWT 密钥设置
- ✅ HTTPS 启用
- ✅ 基本功能测试

### 推荐完成 (Recommended)
- ⬜ 自定义域名
- ⬜ 错误监控
- ⬜ 性能优化
- ⬜ 备份策略
- ⬜ 文档完善

### 可选完成 (Optional)
- ⬜ 邮件服务
- ⬜ 支付集成
- ⬜ 社交登录
- ⬜ 分析工具
- ⬜ SEO 优化

---

**最后更新**: 2025-10-31
**版本**: 1.0.0

祝部署顺利! 🎉

