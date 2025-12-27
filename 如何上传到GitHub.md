# 📤 如何将 Citea 上传到 GitHub

## ✅ 当前状态

Git 仓库已初始化并完成首次提交：

```
✅ Git 初始化完成
✅ 36 个文件已提交
✅ 7744 行代码已保存
✅ 提交信息: "Initial commit: Citea - Free Citation Verification Tool"
```

---

## 🚀 上传到 GitHub（3 步）

### 步骤 1: 在 GitHub 创建新仓库

1. **访问 GitHub**: https://github.com/new

2. **填写仓库信息**:
   - **Repository name**: `citea` 或 `citea-free-citation-tool`
   - **Description**: `完全免费的 AI 引用验证和文献查找工具 - Free Citation Verification & Source Finder Tool`
   - **Visibility**: 
     - 选择 `Public` (公开) 或 
     - 选择 `Private` (私有)
   - **不要勾选** "Initialize this repository with a README"
   - **不要添加** .gitignore 或 license（我们已经有了）

3. **点击 "Create repository"**

---

### 步骤 2: 连接到 GitHub 仓库

创建完成后，GitHub 会显示命令。在您的项目目录中运行：

```bash
# 添加远程仓库（将 YOUR-USERNAME 替换为您的 GitHub 用户名）
git remote add origin https://github.com/YOUR-USERNAME/citea.git

# 或者使用 SSH（如果已配置 SSH key）
git remote add origin git@github.com:YOUR-USERNAME/citea.git
```

**示例**:
```bash
# 如果您的用户名是 john-doe
git remote add origin https://github.com/john-doe/citea.git
```

---

### 步骤 3: 推送代码到 GitHub

```bash
# 将代码推送到 GitHub
git branch -M main
git push -u origin main
```

**完成！** 🎉 您的代码现在已经在 GitHub 上了！

---

## 📋 完整命令清单（复制粘贴）

```bash
# 1. 添加远程仓库（替换 YOUR-USERNAME）
git remote add origin https://github.com/YOUR-USERNAME/citea.git

# 2. 重命名分支为 main
git branch -M main

# 3. 推送代码
git push -u origin main
```

---

## 🔧 常见问题解决

### 问题 1: 提示需要登录

**解决方案**:
```bash
# Windows 会弹出登录窗口
# 输入您的 GitHub 用户名和密码（或 Personal Access Token）
```

**如果需要 Personal Access Token**:
1. 访问: https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 勾选 `repo` 权限
4. 生成并复制 token
5. 在推送时用 token 替代密码

---

### 问题 2: remote origin already exists

```bash
# 删除现有的 remote
git remote remove origin

# 重新添加
git remote add origin https://github.com/YOUR-USERNAME/citea.git
```

---

### 问题 3: 推送被拒绝

```bash
# 强制推送（第一次推送时安全）
git push -u origin main --force
```

---

### 问题 4: SSL 证书错误

```bash
# 临时禁用 SSL 验证（仅用于解决问题）
git config --global http.sslVerify false

# 推送后记得重新启用
git config --global http.sslVerify true
```

---

## 📝 后续更新代码

### 当您修改代码后，使用以下命令更新：

```bash
# 1. 查看修改的文件
git status

# 2. 添加所有修改
git add .

# 3. 提交修改
git commit -m "描述您的修改"

# 4. 推送到 GitHub
git push
```

### 示例工作流程：

```bash
# 修改了某些功能
git add .
git commit -m "优化了文献搜索功能"
git push

# 修复了 bug
git add .
git commit -m "修复了引用验证的显示问题"
git push

# 添加了新功能
git add .
git commit -m "添加了 PDF 导出功能"
git push
```

---

## 🌟 推荐的仓库设置

### 1. 添加仓库描述

在 GitHub 仓库页面：
- 点击右上角的 ⚙️ "Settings"
- 在 "About" 部分添加：
  - **Description**: `完全免费的 AI 引用验证和文献查找工具 | Free Citation Verification & Source Finder`
  - **Website**: 部署后的网址（如 Vercel 链接）
  - **Topics**: `citation-checker`, `academic-research`, `ai`, `nextjs`, `free`, `open-source`

---

### 2. 创建精美的 README 展示

您的 `README.md` 已经很完善了！GitHub 会自动在仓库首页显示。

---

### 3. 添加 GitHub Topics（标签）

建议添加以下标签方便别人发现：
- `citation-checker`
- `academic-research`
- `source-finder`
- `ai-assistant`
- `nextjs`
- `typescript`
- `tailwindcss`
- `free-tool`
- `education`
- `research-tool`

---

## 🚀 一键部署到 Vercel

### 从 GitHub 部署到 Vercel

1. **访问 Vercel**: https://vercel.com

2. **导入 Git 仓库**:
   - 点击 "New Project"
   - 选择 "Import Git Repository"
   - 选择您的 `citea` 仓库
   - 点击 "Import"

3. **配置项目**:
   - Framework Preset: `Next.js` (自动检测)
   - Root Directory: `./` (默认)
   - Build Command: `npm run build` (默认)
   - Output Directory: `.next` (默认)

4. **环境变量** (可选):
   - 目前不需要，API key 已在代码中

5. **点击 "Deploy"**

6. **等待部署** (约 2-3 分钟)

7. **完成！** 您会得到一个类似的网址：
   ```
   https://citea.vercel.app
   或
   https://citea-your-username.vercel.app
   ```

---

## 📊 GitHub 仓库结构预览

上传后，您的 GitHub 仓库会显示：

```
citea/
├── 📄 README.md                    (首页展示)
├── 📁 app/                         (Next.js 应用)
├── 📁 components/                  (React 组件)
├── 📁 public/                      (静态资源)
├── 📁 scripts/                     (安装脚本)
├── 📚 文档文件                     (11个 .md 文件)
└── ⚙️ 配置文件                    (package.json, etc.)

36 files | 7,744 lines | TypeScript, TSX, CSS, Markdown
```

---

## 🎯 GitHub 仓库亮点

### Badges（徽章）推荐

可以在 README.md 顶部添加：

```markdown
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Free](https://img.shields.io/badge/Price-FREE-success)
![Status](https://img.shields.io/badge/Status-Production_Ready-brightgreen)
```

---

## 📱 分享您的项目

### GitHub 仓库链接格式：
```
https://github.com/YOUR-USERNAME/citea
```

### 部署后的网站链接：
```
https://citea.vercel.app
```

### 可以分享到：
- 社交媒体（Twitter, LinkedIn, 微博）
- 学术论坛
- Reddit (r/AcademicPsychology, r/webdev)
- Product Hunt
- 您的个人网站

---

## 🔒 保护敏感信息

### ⚠️ 注意：API Key 安全

当前 API key 在代码中是硬编码的。如果您想要更安全：

1. **创建 `.env.local`** (已在 .gitignore 中，不会上传):
   ```
   TONGYI_API_KEY=sk-9bf19547ddbd4be1a87a7a43cf251097
   ```

2. **修改 API 路由**:
   ```typescript
   const TONGYI_API_KEY = process.env.TONGYI_API_KEY
   ```

3. **在 Vercel 中设置环境变量**:
   - Project Settings → Environment Variables
   - 添加 `TONGYI_API_KEY`

---

## ✅ 上传检查清单

完成以下步骤确保上传成功：

- [ ] GitHub 仓库已创建
- [ ] 远程仓库已添加 (`git remote add origin`)
- [ ] 代码已推送 (`git push -u origin main`)
- [ ] README.md 在 GitHub 上正确显示
- [ ] 所有文件都已上传（36 个文件）
- [ ] 代码在 GitHub 上可以查看
- [ ] （可选）已部署到 Vercel
- [ ] （可选）已添加 Topics 标签
- [ ] （可选）已设置仓库描述

---

## 🎊 恭喜！

当您完成上传后：

✅ **代码已安全备份到 GitHub**  
✅ **可以与他人分享您的项目**  
✅ **可以从任何地方访问代码**  
✅ **可以一键部署到 Vercel**  
✅ **版本控制已建立**  

---

## 📞 需要帮助？

### Git 相关问题
- Git 官方文档: https://git-scm.com/doc
- GitHub 帮助: https://docs.github.com

### 部署相关问题
- Vercel 文档: https://vercel.com/docs
- Next.js 部署: https://nextjs.org/docs/deployment

---

## 🚀 下一步建议

1. **立即上传**: 按照上面的步骤上传到 GitHub
2. **部署上线**: 连接 Vercel 让全世界都能访问
3. **分享项目**: 告诉朋友和同事
4. **持续改进**: 添加新功能，修复 bug
5. **接受贡献**: 开启 Issues 和 Pull Requests

---

<div align="center">

**准备好上传您的 Citea 项目了吗？**

**按照上面的步骤，3 分钟内完成上传！**

🚀 **Let's Go!**

</div>

