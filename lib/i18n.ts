// 国际化配置和翻译内容

export type Language = 'en' | 'zh'

export const translations = {
  en: {
    detailedFeatures: {
      title1: 'Everything you need for',
      title2: 'reliable research',
      subtitle: 'Comprehensive citation verification and source validation tools to ensure your academic work meets the highest standards.',
      aiPowered: 'AI Powered',
      realTime: 'Real-time',
      sourceFinder: 'Source Finder',
      sourceFinderDesc: 'Find credible academic sources for your research topics automatically. Advanced search algorithms help you discover relevant, peer-reviewed sources from trusted academic databases.',
      startSearching: 'Start searching',
      citationChecker: 'Citation Checker',
      citationCheckerDesc: 'Instantly verify the authenticity of academic references and citations. Our AI-powered system cross-references citations against authoritative academic databases.',
      verifyCitations: 'Verify citations',
      verified: 'Verified',
      notFound: 'Not Found',
      checking: 'Checking...',
      researchAssistant: 'Research Assistant',
      researchAssistantDesc: 'AI-powered chat assistant for citation verification and source analysis. Ask questions about your references and get real-time guidance on source authenticity.',
      chatWithAI: 'Chat with AI',
    },
    // Header
    header: {
      features: 'Features',
      testimonials: 'Testimonials',
      pricing: 'Pricing',
      faq: 'FAQ',
      getStarted: 'Get Started',
      startFree: 'Start Free',
    },
    
    // Hero
    hero: {
      title1: 'Find Sources in Seconds.',
      title2: 'Cite Only What\'s Real.',
      subtitle: 'AI citation checker and source finder tool. Check fake citations, verify references, and find original sources — so your research stays credible.',
      free: 'Completely Free Forever!',
      findSources: 'Find Sources',
      checkCitations: 'Check Citations',
      watchDemo: 'Watch Demo',
      databases: 'Integrated with leading academic databases',
    },
    
    // Features
    features: {
      title: 'Powerful citation tools for serious researchers.',
      subtitle: 'Advanced features to streamline your research workflow and maintain academic integrity.',
      sourceFinder: {
        title: 'AI Source Finder',
        description: 'Find original source of citation instantly. Direct integration with major academic databases including CrossRef, PubMed, arXiv, and Google Scholar for comprehensive source validation.',
      },
      citationChecker: {
        title: 'Citation Checker Online',
        description: 'Check fake citations and verify reference authenticity. Advanced AI algorithms analyze your text and automatically identify citations that need verification.',
      },
      aiAssistant: {
        title: 'AI Research Assistant',
        description: 'Chat with our AI assistant about your research questions, citation verification, and source validation. Get instant guidance on reference authenticity and maintain academic integrity in real-time.',
      },
    },
    
    // Tools
    tools: {
      title: 'Start verifying citations today',
      subtitle: 'Ready to ensure every citation in your research is authentic? Start using Citea\'s powerful tools now.',
      
      finder: {
        tab: 'Source Finder',
        title: 'Find Academic Sources',
        subtitle: 'Enter your research topic or keywords to find credible academic sources from major databases.',
        placeholder: 'e.g., machine learning in healthcare, climate change impacts...',
        search: 'Search',
        examples: 'Try these examples:',
        noResults: 'No sources found. Try different keywords or check your spelling.',
        error: 'Unable to search sources. Please check your internet connection and try again.',
      },
      
      checker: {
        tab: 'Citation Checker',
        title: 'Check Citations',
        subtitle: 'Paste your text with citations to verify their authenticity against academic databases.',
        placeholder: 'Paste your text with citations here...',
        loadExample: 'Load example text',
        verify: 'Verify Citations',
        confidence: 'Confidence',
        noInput: 'Please paste text containing citations',
        error: 'Unable to verify citations. Please try again.',
      },
      
      assistant: {
        tab: 'AI Assistant',
        title: 'AI Research Assistant',
        subtitle: 'Chat with our AI assistant about citation verification, source validation, and research questions.',
        placeholder: 'Ask me anything about citations or research...',
        send: 'Send',
        startConversation: 'Start a conversation! Ask me about citations, sources, or research questions.',
        tryQuestions: 'Try these questions:',
        error: 'Unable to reach AI assistant. Please try again.',
      },
    },
    
    // Pricing
    pricing: {
      title: 'Get your research to a new level with',
      freeAccess: 'Free Access',
      forEveryone: 'for everyone.',
      planTitle: 'Free for Everyone',
      price: '$0',
      subtitle: 'No credit card required. No hidden fees.',
      features: {
        unlimited: 'Unlimited citation checks',
        sourceFinding: 'Unlimited source finding',
        aiVerification: 'Advanced AI verification',
        databases: 'Access to all academic databases',
        chatAssistant: 'AI Research Assistant chat',
        formats: 'All citation formats (APA, MLA, Chicago, etc.)',
        realtime: 'Real-time verification',
        export: 'Citation export functionality',
        support: 'Email support',
        noLimits: 'No character limits',
        noRestrictions: 'No usage restrictions',
      },
      cta: 'Start Using Citea Free',
      noRegistration: '✨ No registration required to start',
      contact: 'Questions about our free service? Contact us at',
    },
    
    // Testimonials
    testimonials: {
      title: 'Trusted by researchers worldwide.',
      subtitle: 'See how Citea is helping students, academics, and researchers maintain the highest standards of citation integrity in their work.',
    },
    
    // FAQ
    faq: {
      title: 'Frequently asked questions',
      subtitle: 'Have questions about citation verification? Find answers to common questions about Citea\'s research tools.',
    },
    
    // Footer
    footer: {
      description: 'Your research integrity guardian. Citea traces citations back to their original sources and detects AI-generated fake literature, helping researchers maintain credibility in the age of artificial intelligence.',
      product: 'Product',
      tools: 'Tools',
      contact: 'Contact',
      sourceFinder: 'Source Finder',
      citationChecker: 'Citation Checker',
      aiAssistant: 'AI Assistant',
      backToTop: 'Back to Top ↑',
      copyright: 'Copyright © 2025 Citea. All rights reserved.',
    },
  },
  
  zh: {
    // Header
    header: {
      features: '功能特性',
      testimonials: '用户评价',
      pricing: '定价',
      faq: '常见问题',
      getStarted: '开始使用',
      startFree: '免费开始',
    },
    
    // Hero
    hero: {
      title1: '秒级查找文献来源',
      title2: '只引用真实文献',
      subtitle: 'AI 驱动的引用验证和文献查找工具。检测虚假引用，验证参考文献，查找原始来源——让您的研究保持可信。',
      free: '永久完全免费！',
      findSources: '查找文献',
      checkCitations: '验证引用',
      watchDemo: '观看演示',
      databases: '集成主流学术数据库',
    },
    
    // Features
    features: {
      title: '为认真的研究者提供强大的引用工具',
      subtitle: '先进的功能简化您的研究工作流程，维护学术诚信。',
      sourceFinder: {
        title: 'AI 文献查找器',
        description: '即时查找引用的原始来源。直接集成 CrossRef、PubMed、arXiv 和 Google Scholar 等主要学术数据库，提供全面的来源验证。',
      },
      citationChecker: {
        title: '在线引用检查器',
        description: '检查虚假引用并验证参考文献的真实性。先进的 AI 算法分析您的文本，自动识别需要验证的引用。',
      },
      aiAssistant: {
        title: 'AI 研究助手',
        description: '与我们的 AI 助手讨论您的研究问题、引用验证和来源确认。实时获得关于参考文献真实性的即时指导，维护学术诚信。',
      },
    },
    
    // Tools
    tools: {
      title: '立即开始验证引用',
      subtitle: '准备好确保您研究中的每个引用都是真实的了吗？现在开始使用 Citea 的强大工具。',
      
      finder: {
        tab: '文献查找',
        title: '查找学术文献',
        subtitle: '输入您的研究主题或关键词，从主要数据库中查找可信的学术来源。',
        placeholder: '例如：机器学习在医疗中的应用、气候变化影响...',
        search: '搜索',
        examples: '试试这些例子：',
        noResults: '未找到文献。请尝试不同的关键词或检查拼写。',
        error: '无法搜索文献。请检查您的网络连接后重试。',
      },
      
      checker: {
        tab: '引用验证',
        title: '检查引用',
        subtitle: '粘贴包含引用的文本，根据学术数据库验证其真实性。',
        placeholder: '在此粘贴包含引用的文本...',
        loadExample: '加载示例文本',
        verify: '验证引用',
        confidence: '可信度',
        noInput: '请粘贴包含引用的文本',
        error: '无法验证引用。请重试。',
      },
      
      assistant: {
        tab: 'AI 助手',
        title: 'AI 研究助手',
        subtitle: '与我们的 AI 助手讨论引用验证、来源确认和研究问题。',
        placeholder: '询问关于引用或研究的任何问题...',
        send: '发送',
        startConversation: '开始对话！询问关于引用、文献来源或研究问题。',
        tryQuestions: '试试这些问题：',
        error: '无法连接 AI 助手。请重试。',
      },
    },
    
    // Pricing
    pricing: {
      title: '通过',
      freeAccess: '免费访问',
      forEveryone: '将您的研究提升到新水平，面向所有人。',
      planTitle: '面向所有人免费',
      price: '¥0',
      subtitle: '无需信用卡。没有隐藏费用。',
      features: {
        unlimited: '无限次引用检查',
        sourceFinding: '无限次文献查找',
        aiVerification: '高级 AI 验证',
        databases: '访问所有学术数据库',
        chatAssistant: 'AI 研究助手对话',
        formats: '所有引用格式（APA、MLA、Chicago 等）',
        realtime: '实时验证',
        export: '引用导出功能',
        support: '邮件支持',
        noLimits: '无字符限制',
        noRestrictions: '无使用限制',
      },
      cta: '免费开始使用 Citea',
      noRegistration: '✨ 无需注册即可开始',
      contact: '关于我们的免费服务有疑问？联系我们：',
    },
    
    // Testimonials
    testimonials: {
      title: '受到全球研究者信赖',
      subtitle: '看看 Citea 如何帮助学生、学者和研究人员在工作中保持最高的引用诚信标准。',
    },
    
    // FAQ
    faq: {
      title: '常见问题',
      subtitle: '对引用验证有疑问？在这里找到关于 Citea 研究工具的常见问题答案。',
    },
    
    // Footer
    footer: {
      description: '您的研究诚信守护者。Citea 将引用追溯到原始来源，检测 AI 生成的虚假文献，帮助研究人员在人工智能时代保持可信度。',
      product: '产品',
      tools: '工具',
      contact: '联系我们',
      sourceFinder: '文献查找器',
      citationChecker: '引用检查器',
      aiAssistant: 'AI 助手',
      backToTop: '返回顶部 ↑',
      copyright: '版权所有 © 2025 Citea。保留所有权利。',
    },
  },
}

export function getTranslation(lang: Language) {
  return translations[lang] || translations.en
}

