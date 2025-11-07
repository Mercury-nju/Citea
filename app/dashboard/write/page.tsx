'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Edit3, 
  FileText, 
  Plus,
  MoreVertical,
  Trash2,
  Star,
  Filter,
  Search,
  X,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import Logo from '@/components/Logo'

interface Document {
  id: string
  title: string
  outline: string[]
  content: string
  preview: string
  createdAt: number
  updatedAt: number
}

export default function WriteDocumentsPage() {
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [writePrompt, setWritePrompt] = useState('')
  const [writeStartMode, setWriteStartMode] = useState<'heading' | 'outline'>('heading')
  const [isGenerating, setIsGenerating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = () => {
    try {
      const user = JSON.parse(localStorage.getItem('citea_user') || '{}')
      if (!user.email) {
        setDocuments([])
        return
      }
      
      const savedDocs = JSON.parse(localStorage.getItem(`citea_documents_${user.email}`) || '[]')
      setDocuments(savedDocs)
    } catch (error) {
      console.error('Failed to load documents:', error)
      setDocuments([])
    }
  }

  const handleGenerate = async () => {
    if (!writePrompt.trim()) return

    setIsGenerating(true)
    
    try {
      let title = ''
      let outline: string[] = []
      
      if (writeStartMode === 'heading') {
        // Start with heading: Use user input as title directly
        title = writePrompt.trim()
        outline = [
          'Introduction',
          'Background and Context',
          'Main Analysis',
          'Key Findings',
          'Conclusion'
        ]
      } else {
        // Start with outline: Generate both title and outline using AI
        const token = localStorage.getItem('citea_auth_token')
        const headers: HeadersInit = { 'Content-Type': 'application/json' }
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }

        // Detect language
        const isChinese = /[\u4e00-\u9fa5]/.test(writePrompt)
        const language = isChinese ? 'Chinese' : 'English'

        const promptMessage = isChinese
          ? `你是一位专业的学术写作助手。请根据以下主题生成一个高质量的学术文档标题和详细大纲。

主题：${writePrompt}

要求：
1. 标题应该准确、简洁，能够概括文档的核心内容
2. 大纲应该包含5-7个主要章节，每个章节都应该有明确的学术价值
3. 大纲应该遵循学术写作的逻辑结构：引言、文献综述、方法论、分析、结论等
4. 每个章节标题应该具体、专业，避免过于宽泛

请严格按照以下格式返回（不要添加任何其他内容）：
标题：[标题内容]

大纲：
1. [章节1标题]
2. [章节2标题]
3. [章节3标题]
4. [章节4标题]
5. [章节5标题]
6. [章节6标题]（可选）
7. [章节7标题]（可选）`
          : `You are a professional academic writing assistant. Please generate a high-quality academic document title and detailed outline based on the following topic.

Topic: ${writePrompt}

Requirements:
1. The title should be accurate, concise, and summarize the core content of the document
2. The outline should include 5-7 main sections, each with clear academic value
3. The outline should follow the logical structure of academic writing: Introduction, Literature Review, Methodology, Analysis, Conclusion, etc.
4. Each section title should be specific and professional, avoiding overly broad terms

Please return strictly in the following format (do not add any other content):
Title: [title content]

Outline:
1. [Section 1 title]
2. [Section 2 title]
3. [Section 3 title]
4. [Section 4 title]
5. [Section 5 title]
6. [Section 6 title] (optional)
7. [Section 7 title] (optional)`

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            messages: [
              {
                role: 'user',
                content: promptMessage
              }
            ],
            language: language
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('API Error:', errorData)
          throw new Error(errorData.error || 'Failed to generate outline')
        }

        const data = await response.json()
        console.log('AI Response:', data)
        const aiResponse = data.response || ''
        
        if (!aiResponse) {
          throw new Error('Empty response from AI')
        }

        // Parse AI response with improved regex
        const titleMatch = aiResponse.match(/(?:Title|标题)[：:]\s*(.+?)(?:\n|$)/i) || 
                          aiResponse.match(/^标题[：:]\s*(.+?)$/im) ||
                          aiResponse.match(/^Title[：:]\s*(.+?)$/im)
        title = titleMatch ? titleMatch[1].trim().replace(/^["']|["']$/g, '') : `Document about ${writePrompt}`

        // Extract outline sections with improved parsing
        const outlineMatches = aiResponse.match(/(?:Outline|大纲)[：:]?\s*\n([\s\S]+)/i) ||
                              aiResponse.match(/大纲[：:]\s*([\s\S]+?)(?:\n\n|$)/i) ||
                              aiResponse.match(/Outline[：:]\s*([\s\S]+?)(?:\n\n|$)/i)
        
        if (outlineMatches) {
          const outlineText = outlineMatches[1]
          const lines = outlineText.split('\n').filter((line: string) => line.trim())
          outline = lines
            .map((line: string) => {
              // Remove numbering (1., 2., etc.) and bullets (-, *, etc.)
              return line
                .replace(/^\d+[\.\)]\s*/, '')
                .replace(/^[-*•]\s*/, '')
                .replace(/^[（(]\d+[）)]\s*/, '')
                .trim()
            })
            .filter((line: string) => line.length > 0 && !line.match(/^(可选|optional)/i))
            .slice(0, 7) // Limit to 7 sections
        }

        // Fallback if outline extraction failed
        if (outline.length === 0) {
          outline = isChinese ? [
            '引言',
            '文献综述',
            '研究方法',
            '结果分析',
            '讨论',
            '结论'
          ] : [
            'Introduction',
            'Literature Review',
            'Methodology',
            'Results and Analysis',
            'Discussion',
            'Conclusion'
          ]
        }
      }
      
      const newDoc: Document = {
        id: Date.now().toString(),
        title: title,
        outline: outline,
        content: '',
        preview: outline.slice(0, 3).join(', ') + '...',
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      
      const user = JSON.parse(localStorage.getItem('citea_user') || '{}')
      if (!user.email) {
        throw new Error('User email not found')
      }
      
      const savedDocs = JSON.parse(localStorage.getItem(`citea_documents_${user.email}`) || '[]')
      savedDocs.unshift(newDoc)
      localStorage.setItem(`citea_documents_${user.email}`, JSON.stringify(savedDocs.slice(0, 50)))
      
      setIsModalOpen(false)
      setWritePrompt('')
      router.push(`/dashboard/write/${newDoc.id}`)
    } catch (error) {
      console.error('Generation error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Failed to generate document: ${errorMessage}\n\nPlease try again or use "Start with Heading" mode.`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDeleteDocument = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this document?')) {
      try {
        const user = JSON.parse(localStorage.getItem('citea_user') || '{}')
        if (!user.email) return
        
        const savedDocs = JSON.parse(localStorage.getItem(`citea_documents_${user.email}`) || '[]')
        const filtered = savedDocs.filter((d: Document) => d.id !== id)
        localStorage.setItem(`citea_documents_${user.email}`, JSON.stringify(filtered))
        loadDocuments()
      } catch (error) {
        console.error('Failed to delete document:', error)
      }
    }
  }

  const filteredDocuments = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content - Full Width */}
      <main className="px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Write</h1>
          <p className="text-gray-600">Create and manage your documents with AI assistance</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
            />
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
            <Filter size={18} />
          </button>
        </div>
        {/* Action Card - New Document Only */}
        <div className="mb-8 max-w-2xl">
          <button
            onClick={() => setIsModalOpen(true)}
            className="group w-full bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-xl transition-all text-left relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
                <Edit3 size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">New document</h3>
                <p className="text-sm text-gray-600">Get AI help as you write</p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight size={20} className="text-blue-600" />
              </div>
            </div>
          </button>
        </div>

        {/* Documents Section */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900">Your Documents</h2>
            <button className="p-1 hover:bg-gray-200 rounded transition">
              <Star size={18} className="text-gray-500" />
            </button>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Filter size={16} />
            <span>Most recent</span>
          </div>
        </div>

        {/* Documents Grid */}
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-16 max-w-2xl mx-auto">
            <FileText className="mx-auto mb-4 text-gray-300" size={64} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents yet</h3>
            <p className="text-gray-600 mb-6">Create your first document to get started</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Create New Document
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
              {filteredDocuments.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => router.push(`/dashboard/write/${doc.id}`)}
                  className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-blue-300 transition-all text-left group"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Edit3 size={16} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition">
                        {doc.title}
                      </h3>
                    </div>
                    <button
                      onClick={(e) => handleDeleteDocument(doc.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition"
                    >
                      <MoreVertical size={16} className="text-gray-500" />
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {doc.preview}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Last edited {formatDate(doc.updatedAt)}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2">
              <button className="p-2 hover:bg-gray-200 rounded transition">
                <span>&lt;</span>
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">Page 1</span>
              <button className="p-2 hover:bg-gray-200 rounded transition">
                <span>&gt;</span>
              </button>
            </div>
          </>
        )}
      </main>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} />
              </button>
              
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 mb-4 shadow-lg">
                  <Edit3 className="text-white" size={36} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  What are you writing today?
                </h2>
                <p className="text-gray-600 text-sm">Describe your topic and let AI create a structured outline for you</p>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl border-2 border-gray-200 p-5 mb-4 focus-within:border-blue-400 transition-colors">
                <textarea
                  value={writePrompt}
                  onChange={(e) => setWritePrompt(e.target.value)}
                  placeholder="e.g., The impact of artificial intelligence on modern healthcare systems and patient outcomes"
                  className="w-full h-36 p-3 bg-transparent border-0 focus:ring-0 resize-none text-gray-900 placeholder-gray-400 text-base leading-relaxed"
                  maxLength={500}
                  autoFocus
                />
                <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {writePrompt.length < 20 ? (
                      <span className="text-orange-600">💡 Add more details for better results</span>
                    ) : (
                      <span className="text-green-600">✓ Good prompt length</span>
                    )}
                  </span>
                  <span className={`text-sm font-medium ${
                    writePrompt.length > 450 ? 'text-red-500' : 
                    writePrompt.length > 300 ? 'text-orange-500' : 
                    'text-gray-500'
                  }`}>
                    {writePrompt.length}/500
                  </span>
                </div>
              </div>

              {writePrompt.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          writePrompt.length < 20 ? 'bg-red-500' :
                          writePrompt.length < 50 ? 'bg-orange-500' :
                          writePrompt.length < 100 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(100, (writePrompt.length / 100) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-600">
                      {writePrompt.length < 20 ? 'Weak' :
                       writePrompt.length < 50 ? 'Fair' :
                       writePrompt.length < 100 ? 'Good' :
                       'Excellent'}
                    </span>
                  </div>
                  {writePrompt.length < 50 && (
                    <p className="text-sm text-gray-600">
                      💡 Tip: Add more details about your research topic, specific questions you want to explore, or key areas of focus for better AI-generated content.
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setWriteStartMode('heading')}
                  className={`p-5 rounded-xl border-2 transition-all text-left group ${
                    writeStartMode === 'heading'
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-md'
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${
                      writeStartMode === 'heading'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500'
                    } transition-colors`}>
                      <Edit3 size={22} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-base text-gray-900 mb-1">Start with Heading</h3>
                      <p className="text-xs text-gray-600 leading-relaxed">Use your input as the title and create a standard academic outline</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setWriteStartMode('outline')}
                  className={`p-5 rounded-xl border-2 transition-all text-left group ${
                    writeStartMode === 'outline'
                      ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 shadow-md'
                      : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${
                      writeStartMode === 'outline'
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-400 group-hover:bg-purple-50 group-hover:text-purple-500'
                    } transition-colors`}>
                      <FileText size={22} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-base text-gray-900 mb-1">Start with Outline</h3>
                      <p className="text-xs text-gray-600 leading-relaxed">AI analyzes your topic and generates a professional academic outline</p>
                    </div>
                  </div>
                </button>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={!writePrompt.trim() || isGenerating}
                  className="px-8 py-3.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Generating outline...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      <span>Create Document</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

