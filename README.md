# Citea - Free Citation Verification & Source Finder

<div align="center">

![Citea Logo](https://img.shields.io/badge/Citea-Free_Citation_Tool-blue?style=for-the-badge)

**Find Sources in Seconds. Cite Only What's Real.**

🎉 **Completely Free Forever** 🎉

[Start Using Citea](#getting-started) • [Features](#features) • [Documentation](#documentation)

</div>

## 🌟 Overview

Citea is a completely free AI-powered citation verification and source finding tool designed for researchers, students, and academics. Our mission is to make academic integrity tools accessible to everyone, at no cost.

### Why Citea?

- ✅ **100% Free** - No subscriptions, no hidden fees, no limits
- 🔍 **Source Finder** - Find credible academic sources instantly
- ✓ **Citation Checker** - Verify citations against major databases
- 💬 **AI Assistant** - Get research help powered by advanced AI
- 🌐 **Multi-Database** - Integration with CrossRef, PubMed, arXiv, Semantic Scholar
- 📚 **All Formats** - Support for APA, MLA, Chicago, and more

## 🚀 Features

### 1. AI Source Finder
Find original sources of citations instantly. Direct integration with major academic databases including:
- CrossRef
- PubMed
- arXiv
- Semantic Scholar
- Google Scholar

### 2. Citation Checker
Check fake citations and verify reference authenticity. Advanced AI algorithms analyze your text and automatically identify citations that need verification.

### 3. AI Research Assistant
Chat with our AI assistant about your research questions, citation verification, and source validation. Get instant guidance on reference authenticity and maintain academic integrity in real-time.

## 📦 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/citea.git
cd citea
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Environment Variables

#### For Local Development

Create an `.env.local` file:

```bash
JWT_SECRET=your-strong-secret-here
# KV is optional for local dev (will use local file storage)
```

#### For Production (Vercel)

**⚠️ 重要：生产环境必须配置 Vercel KV，否则用户注册/登录功能无法使用！**

按以下步骤配置：

**步骤 1: 创建 Vercel KV 数据库**
1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. 点击 **Storage** 标签
4. 点击 **Create Database**
5. 选择 **KV (Redis)**
6. 输入数据库名称（如 `citea-production`）
7. 选择区域（建议选择离用户最近的区域）
8. 点击 **Create**

**步骤 2: 连接到项目**
1. 创建完成后，点击 **Connect Project**
2. 选择你的 Citea 项目
3. 确认连接

这将自动添加以下环境变量：
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_URL`

**步骤 3: 添加 JWT Secret**
1. 进入项目 → **Settings** → **Environment Variables**
2. 添加新变量：
   - **Name**: `JWT_SECRET`
   - **Value**: 生成一个强随机字符串（至少 32 字符）
   ```bash
   # 你可以用这个命令生成：
   openssl rand -base64 32
   ```
3. 选择 **Production**, **Preview**, **Development** 全部环境
4. 点击 **Save**

**步骤 4: 重新部署**
```bash
git commit --allow-empty -m "chore: trigger redeploy with KV"
git push
```

或在 Vercel Dashboard 点击 **Deployments** → **Redeploy**

**验证配置：**
- 部署成功后，访问 `/auth/signup` 尝试注册
- 如果仍然显示"数据库未配置"，检查：
  1. KV 数据库是否已连接到项目
  2. 环境变量是否已正确设置
  3. 是否已重新部署

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **AI**: Tongyi Qianwen (通义千问)
- **APIs**: CrossRef, PubMed, Semantic Scholar, arXiv
- **Icons**: Lucide React

## 📖 How to Use

### Finding Sources

1. Navigate to the **Source Finder** tab
2. Enter your research topic or keywords
3. Click "Search" to find credible academic sources
4. Export citations in APA, MLA, or Chicago format

### Checking Citations

1. Go to the **Citation Checker** tab
2. Paste your text containing citations
3. Click "Verify Citations"
4. Review the verification results with confidence scores

### AI Assistant

1. Open the **AI Assistant** tab
2. Type your research question or citation query
3. Get instant AI-powered assistance
4. Continue the conversation for detailed help

## 🌍 Academic Database Integration

Citea integrates with leading academic databases:

- **CrossRef** - The citation linking backbone of scholarly literature
- **PubMed** - Biomedical and life sciences database
- **arXiv** - Physics, mathematics, computer science preprints
- **Semantic Scholar** - AI-powered research tool
- **Google Scholar** - Comprehensive scholarly search

## 🔒 Privacy & Security

- Your research data is encrypted and stored securely
- We never share your work with third parties
- You maintain full ownership of your content
- No tracking or data selling

## 📝 Citation Formats Supported

- APA (American Psychological Association)
- MLA (Modern Language Association)
- Chicago
- Harvard
- IEEE
- Vancouver
- And many more...

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 📧 Contact

Have questions or feedback? Reach out to us:

- Email: support@citea.com
- Website: https://citea.com

## 🙏 Acknowledgments

- Thanks to all the academic databases for providing API access
- Tongyi Qianwen for AI capabilities
- The open-source community for amazing tools

---

<div align="center">

**Made with ❤️ for the research community**

*Citea - Making Academic Integrity Accessible to Everyone*

</div>

