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

### Quick Start (Development)

1. Clone the repository:
```bash
git clone https://github.com/yourusername/citea.git
cd citea
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

**Note**: For local development, user data is stored in `data/users.json` automatically. No database setup required!

### 🚀 Production Deployment

**Ready to deploy for real users? See our comprehensive guides:**

- 📖 **[Quick Deployment Guide](./README_DEPLOYMENT.md)** - 5-minute setup
- 📚 **[Complete Production Guide](./PRODUCTION_GUIDE.md)** - Detailed instructions
- ✅ **[Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)** - Pre-deployment verification
- 🗄️ **[Database Setup](./DATABASE_SETUP.md)** - Database configuration

**Quick Deploy to Vercel (Recommended):**

1. Push code to GitHub
2. Import project to Vercel
3. Add Vercel KV database (Storage → Create Database → KV)
4. Set environment variable: `JWT_SECRET` (generate with `openssl rand -base64 32`)
5. Redeploy

✅ **Done! Users can now register and use your app!**

See [README_DEPLOYMENT.md](./README_DEPLOYMENT.md) for step-by-step instructions.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: JWT, bcryptjs
- **Database**: Redis, Vercel KV (production), File storage (development)
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

