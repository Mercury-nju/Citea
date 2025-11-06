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
  Sparkles,
  X
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
    const savedDocs = JSON.parse(localStorage.getItem('citea_documents') || '[]')
    setDocuments(savedDocs)
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
          ? `请根据以下主题生成一个学术文档的标题和大纲。主题：${writePrompt}\n\n请按以下格式返回：\n标题：[标题内容]\n大纲：\n1. [章节1]\n2. [章节2]\n3. [章节3]\n4. [章节4]\n5. [章节5]`
          : `Generate a title and outline for an academic document based on this topic: ${writePrompt}\n\nPlease return in this format:\nTitle: [title content]\nOutline:\n1. [Section 1]\n2. [Section 2]\n3. [Section 3]\n4. [Section 4]\n5. [Section 5]`

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
          throw new Error('Failed to generate outline')
        }

        const data = await response.json()
        const aiResponse = data.response || ''

        // Parse AI response
        const titleMatch = aiResponse.match(/(?:Title|标题)[：:]\s*(.+?)(?:\n|$)/i)
        title = titleMatch ? titleMatch[1].trim() : `Document about ${writePrompt}`

        // Extract outline sections
        const outlineMatches = aiResponse.match(/(?:Outline|大纲)[：:]?\s*\n([\s\S]+)/i)
        if (outlineMatches) {
          const outlineText = outlineMatches[1]
          const lines = outlineText.split('\n').filter(line => line.trim())
          outline = lines
            .map(line => line.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '').trim())
            .filter(line => line.length > 0)
            .slice(0, 6) // Limit to 6 sections
        }

        // Fallback if outline extraction failed
        if (outline.length === 0) {
          outline = [
            'Introduction',
            'Background and Context',
            'Main Analysis',
            'Key Findings',
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
      
      const savedDocs = JSON.parse(localStorage.getItem('citea_documents') || '[]')
      savedDocs.unshift(newDoc)
      localStorage.setItem('citea_documents', JSON.stringify(savedDocs.slice(0, 50)))
      
      setIsModalOpen(false)
      setWritePrompt('')
      router.push(`/dashboard/write/${newDoc.id}`)
    } catch (error) {
      console.error('Generation error:', error)
      alert('Failed to generate document. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDeleteDocument = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this document?')) {
      const savedDocs = JSON.parse(localStorage.getItem('citea_documents') || '[]')
      const filtered = savedDocs.filter((d: Document) => d.id !== id)
      localStorage.setItem('citea_documents', JSON.stringify(filtered))
      loadDocuments()
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
          <div className="flex items-center gap-3 mb-2">
            <Edit3 size={24} className="text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Write</h1>
          </div>
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
        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-8 max-w-4xl">
          {/* New Document Card */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="group bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-lg transition-all text-left"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition">
                <Edit3 size={24} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">New document</h3>
                <p className="text-sm text-gray-600">Get AI help as you write</p>
              </div>
            </div>
          </button>

          {/* Generate Draft Card */}
          <button
            onClick={() => {
              setWriteStartMode('outline')
              setIsModalOpen(true)
            }}
            className="group bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-purple-500 hover:shadow-lg transition-all text-left"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition">
                <Sparkles size={24} className="text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Generate a draft</h3>
                <p className="text-sm text-gray-600">Create a draft using AI</p>
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
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-cyan-400 mb-4">
                  <Edit3 className="text-white" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  What are you writing today? <span className="text-red-500">*</span>
                </h2>
              </div>

              <div className="bg-gray-50 rounded-xl border-2 border-gray-200 p-4 mb-4">
                <textarea
                  value={writePrompt}
                  onChange={(e) => setWritePrompt(e.target.value)}
                  placeholder="e.g., write an essay about history of the United States"
                  className="w-full h-32 p-3 bg-transparent border-0 focus:ring-0 resize-none text-gray-900 placeholder-gray-400"
                  maxLength={500}
                  autoFocus
                />
                <div className="pt-3 border-t border-gray-200">
                  <span className="text-sm text-gray-500">
                    {writePrompt.length}/500
                  </span>
                </div>
              </div>

              {writePrompt.length > 0 && writePrompt.length < 20 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 bg-gray-200 h-1 rounded-full">
                      <div className="bg-orange-500 h-1 rounded-full" style={{ width: '20%' }} />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Weak Prompt: add more context for higher quality generations
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => setWriteStartMode('heading')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    writeStartMode === 'heading'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Edit3 className={writeStartMode === 'heading' ? 'text-blue-600' : 'text-gray-400'} size={20} />
                    <div>
                      <h3 className="font-semibold text-sm text-gray-900 mb-1">Start with Heading</h3>
                      <p className="text-xs text-gray-600">Generate title, and write upon it</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setWriteStartMode('outline')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    writeStartMode === 'outline'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <FileText className={writeStartMode === 'outline' ? 'text-blue-600' : 'text-gray-400'} size={20} />
                    <div>
                      <h3 className="font-semibold text-sm text-gray-900 mb-1">Start with Outline</h3>
                      <p className="text-xs text-gray-600">AI will generate outline for you</p>
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
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? 'Generating...' : 'Create Document'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

