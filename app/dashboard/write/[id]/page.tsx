'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Home, 
  FileText,
  Save,
  Download,
  MessageSquare,
  Sparkles,
  Menu,
  CheckCircle
} from 'lucide-react'
import Logo from '@/components/Logo'

interface Document {
  id: string
  title: string
  outline: string[]
  content: string
  createdAt: number
  updatedAt: number
}

export default function WriteEditorPage() {
  const router = useRouter()
  const params = useParams()
  const [document, setDocument] = useState<Document | null>(null)
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([])
  const [chatInput, setChatInput] = useState('')
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  useEffect(() => {
    // Load document from localStorage
    try {
      const user = JSON.parse(localStorage.getItem('citea_user') || '{}')
      if (!user.email) {
        router.push('/dashboard/write')
        return
      }
      
      const docId = params.id as string
      const savedDocs = JSON.parse(localStorage.getItem(`citea_documents_${user.email}`) || '[]')
      const doc = savedDocs.find((d: Document) => d.id === docId)
      
      if (doc) {
        setDocument(doc)
        setSaveStatus('saved')
        setLastSaved(new Date(doc.updatedAt))
      } else {
        router.push('/dashboard/write')
      }
    } catch (error) {
      console.error('Failed to load document:', error)
      router.push('/dashboard/write')
    }
  }, [params.id, router])

  const handleSave = async () => {
    if (!document) return
    
    setSaveStatus('saving')
    
    try {
      const user = JSON.parse(localStorage.getItem('citea_user') || '{}')
      if (!user.email) {
        setSaveStatus('unsaved')
        alert('User not found. Please sign in again.')
        return
      }
      
      const savedDocs = JSON.parse(localStorage.getItem(`citea_documents_${user.email}`) || '[]')
      const index = savedDocs.findIndex((d: Document) => d.id === document.id)
      
      const updatedDoc = { ...document, updatedAt: Date.now() }
      
      if (index >= 0) {
        savedDocs[index] = updatedDoc
      } else {
        savedDocs.unshift(updatedDoc)
      }
      
      localStorage.setItem(`citea_documents_${user.email}`, JSON.stringify(savedDocs.slice(0, 50)))
      
      setSaveStatus('saved')
      setLastSaved(new Date())
      
      // Update document state
      setDocument(updatedDoc)
    } catch (error) {
      console.error('Failed to save document:', error)
      setSaveStatus('unsaved')
      alert('Failed to save document. Please try again.')
    }
  }

  // Auto-save function
  const autoSave = async (updatedDoc: Document) => {
    try {
      const user = JSON.parse(localStorage.getItem('citea_user') || '{}')
      if (!user.email) return
      
      const savedDocs = JSON.parse(localStorage.getItem(`citea_documents_${user.email}`) || '[]')
      const index = savedDocs.findIndex((d: Document) => d.id === updatedDoc.id)
      
      if (index >= 0) {
        savedDocs[index] = { ...updatedDoc, updatedAt: Date.now() }
        localStorage.setItem(`citea_documents_${user.email}`, JSON.stringify(savedDocs.slice(0, 50)))
        setSaveStatus('saved')
        setLastSaved(new Date())
      }
    } catch (error) {
      console.error('Auto-save failed:', error)
      setSaveStatus('unsaved')
    }
  }

  const handleExport = (format: string) => {
    if (!document) return
    alert(`Exporting as ${format.toUpperCase()}...`)
    setIsExportMenuOpen(false)
  }

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || isChatLoading) return
    
    const userMessage = chatInput.trim()
    setChatInput('')
    const newMessages = [...chatMessages, { role: 'user' as const, content: userMessage }]
    setChatMessages(newMessages)
    setIsChatLoading(true)
    
    try {
      // Get auth token
      const token = localStorage.getItem('citea_auth_token')
      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      // Detect language
      const isChinese = /[\u4e00-\u9fa5]/.test(userMessage)
      const language = isChinese ? 'Chinese' : 'English'

      // Add document context to the message with improved prompt
      const documentContext = document ? `
Document Title: "${document.title}"
Document Outline:
${document.outline.map((section: string, idx: number) => `${idx + 1}. ${section}`).join('\n')}
` : ''
      
      const contextMessage = `${documentContext}
I'm working on this academic document. ${userMessage}

Please provide helpful, specific, and actionable advice. If you're suggesting content, make it academic and well-structured.`

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: contextMessage
            }
          ],
          language: language
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Chat failed')
      }

      const data = await response.json()
      
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response || 'Sorry, I could not process your request.' 
      }])
    } catch (error) {
      console.error('Chat error:', error)
      const isChinese = /[\u4e00-\u9fa5]/.test(userMessage)
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: isChinese 
          ? '抱歉，处理您的请求时出现错误。请重试。' 
          : 'Sorry, I encountered an error. Please try again.' 
      }])
    } finally {
      setIsChatLoading(false)
    }
  }

  if (!document) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Sidebar - Simplified */}
      <aside className={`${isSidebarOpen ? 'w-16' : 'w-0'} bg-white border-r border-gray-200 flex flex-col items-center py-4 transition-all`}>
        {isSidebarOpen && (
          <>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-3 hover:bg-blue-50 rounded-lg transition mb-4"
              title="Hide sidebar"
            >
              <Menu size={20} className="text-gray-600" />
            </button>
            
            <div className="border-t border-gray-200 w-10 mb-4" />
            
            <button 
              onClick={() => router.push('/dashboard')}
              className="p-3 hover:bg-blue-50 rounded-lg transition mb-2 group relative"
              title="Back to Dashboard"
            >
              <Home size={20} className="text-gray-600" />
            </button>
            
            <button 
              onClick={() => router.push('/dashboard/write')}
              className="p-3 hover:bg-blue-50 rounded-lg transition mb-2 group relative"
              title="My Documents"
            >
              <FileText size={20} className="text-gray-600" />
            </button>
            
            <button 
              onClick={handleSave}
              className={`p-3 rounded-lg transition mb-2 group relative ${
                saveStatus === 'saving' ? 'bg-blue-100' : 'hover:bg-blue-50'
              }`}
              title="Save Document"
              disabled={saveStatus === 'saving'}
            >
              <Save size={20} className={saveStatus === 'saving' ? 'text-blue-600' : 'text-gray-600'} />
            </button>
            
            <div className="border-t border-gray-200 w-10 my-4" />
            
            <div 
              className="p-3 rounded-lg transition mb-2 group relative bg-blue-100"
              title="AI Assistant"
            >
              <MessageSquare size={20} className="text-blue-600" />
            </div>
          </>
        )}
        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-blue-50 rounded-lg transition"
            title="Show sidebar"
          >
            <Menu size={16} className="text-gray-600" />
          </button>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header - Simplified */}
        <header className="border-b border-gray-200 px-6 py-3 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-blue-50 rounded-lg transition text-gray-600"
            >
              <ArrowLeft size={18} />
            </button>
            <h2 className="text-sm font-medium text-gray-700">Document Editor</h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Save Status */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50">
              {saveStatus === 'saving' && (
                <>
                  <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-gray-600">Saving...</span>
                </>
              )}
              {saveStatus === 'saved' && (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-xs text-gray-600">
                    {lastSaved ? `Saved ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Saved'}
                  </span>
                </>
              )}
              {saveStatus === 'unsaved' && (
                <>
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  <span className="text-xs text-gray-600">Unsaved</span>
                </>
              )}
            </div>
            
            <button
              onClick={handleSave}
              className={`px-4 py-2 rounded-lg transition text-sm font-medium flex items-center gap-2 ${
                saveStatus === 'saving' 
                  ? 'bg-blue-100 text-blue-600 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              disabled={saveStatus === 'saving'}
            >
              <Save size={16} />
              Save
            </button>
            
            <div className="relative">
              <button
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className="p-2 hover:bg-blue-50 rounded-lg transition text-gray-600"
              >
                <Download size={18} />
              </button>
              
              {isExportMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  <button onClick={() => handleExport('pdf')} className="w-full px-4 py-2 text-left hover:bg-blue-50 flex items-center gap-3 text-sm text-gray-700">
                    <FileText size={16} />PDF (.PDF)
                  </button>
                  <button onClick={() => handleExport('md')} className="w-full px-4 py-2 text-left hover:bg-blue-50 flex items-center gap-3 text-sm text-gray-700">
                    <FileText size={16} />Markdown (.MD)
                  </button>
                  <button onClick={() => handleExport('docx')} className="w-full px-4 py-2 text-left hover:bg-blue-50 flex items-center gap-3 text-sm text-gray-700">
                    <FileText size={16} />WORD (.DOCX)
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => router.push('/dashboard?tab=finder')}
              className="px-4 py-2 rounded-lg transition text-sm font-medium flex items-center gap-2 bg-gray-100 hover:bg-blue-50 text-gray-700"
            >
              <Sparkles size={16} />
              Find Sources
            </button>

            <button
              onClick={() => router.push('/dashboard?tab=checker')}
              className="px-4 py-2 rounded-lg transition text-sm font-medium flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
            >
              <CheckCircle size={16} />
              Verify Citations
            </button>
          </div>
        </header>

        {/* Editor Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Document Editor */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-8 py-8">
              {/* Title - Smaller font */}
              <h1 
                className="text-2xl font-bold text-gray-900 mb-8 focus:outline-none leading-tight border-b border-transparent focus:border-blue-300 pb-3 transition-colors"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => {
                  const newTitle = e.currentTarget.textContent || document.title
                  if (newTitle !== document.title) {
                    setDocument(prev => prev ? {...prev, title: newTitle} : null)
                    setSaveStatus('unsaved')
                    autoSave({ ...document, title: newTitle })
                  }
                }}
                style={{ minHeight: '40px' }}
              >
                {document.title}
              </h1>

              {/* Content Sections - Smaller fonts */}
              <div className="space-y-8">
                {document.outline.map((section, index) => (
                  <div key={index} className="group">
                    <h2 
                      className="text-xl font-semibold text-gray-900 mb-4 focus:outline-none border-b border-transparent focus:border-blue-300 pb-2 transition-colors"
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const newOutline = [...document.outline]
                        newOutline[index] = e.currentTarget.textContent || section
                        if (newOutline[index] !== section) {
                          setDocument(prev => prev ? {...prev, outline: newOutline} : null)
                          setSaveStatus('unsaved')
                          autoSave({ ...document, outline: newOutline })
                        }
                      }}
                      style={{ minHeight: '32px' }}
                    >
                      {section}
                    </h2>
                    <div 
                      className="text-gray-700 text-base leading-relaxed focus:outline-none min-h-[150px] p-4 rounded-lg border border-transparent focus-within:border-blue-200 focus-within:bg-blue-50/30 transition-all relative"
                      contentEditable
                      suppressContentEditableWarning
                      spellCheck={true}
                      data-placeholder="Start writing here... Use the AI assistant for help."
                      onInput={(e) => {
                        setSaveStatus('unsaved')
                      }}
                      onBlur={(e) => {
                        // Auto-save content changes
                        const content = e.currentTarget.textContent || ''
                        autoSave({ ...document, content })
                      }}
                      style={{ 
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        lineHeight: '1.6',
                        wordBreak: 'break-word'
                      }}
                    />
                    <style jsx global>{`
                      div[contenteditable][data-placeholder]:empty:before {
                        content: attr(data-placeholder);
                        color: #9ca3af;
                        font-style: italic;
                        pointer-events: none;
                        position: absolute;
                        top: 1rem;
                        left: 1rem;
                      }
                    `}</style>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Chat Sidebar */}
          <aside className="w-96 border-l border-gray-200 bg-white flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-blue-50">
              <h3 className="font-semibold text-gray-900 text-sm">AI Writing Assistant</h3>
              <p className="text-xs text-gray-600 mt-0.5">Document: {document.title}</p>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6">
              {chatMessages.length === 0 ? (
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 bg-blue-600 rounded-lg">
                        <Sparkles size={18} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 leading-relaxed mb-1">
                          AI Writing Assistant
                        </p>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          I can help you improve your writing, suggest sources, check grammar, and answer questions about your document.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-3">💡 Quick suggestions:</p>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setChatInput('How can I improve the introduction section?')
                          setTimeout(() => handleChatSubmit(), 100)
                        }}
                        className="w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition text-sm text-gray-700"
                      >
                        ✍️ Improve introduction
                      </button>

                      <button
                        onClick={() => {
                          setChatInput('Make this section more academic and formal')
                          setTimeout(() => handleChatSubmit(), 100)
                        }}
                        className="w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition text-sm text-gray-700"
                      >
                        🎓 Make it more academic
                      </button>

                      <button
                        onClick={() => {
                          setChatInput('Suggest some credible sources for this topic')
                          setTimeout(() => handleChatSubmit(), 100)
                        }}
                        className="w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition text-sm text-gray-700"
                      >
                        📚 Find credible sources
                      </button>

                      <button
                        onClick={() => {
                          setChatInput('Check this text for grammar and clarity issues')
                          setTimeout(() => handleChatSubmit(), 100)
                        }}
                        className="w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition text-sm text-gray-700"
                      >
                        ✅ Check grammar
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 bg-white border border-dashed border-gray-300 rounded-lg p-3">
                    <p className="leading-relaxed">
                      提示：顶部工具栏提供了「Find Sources」及「Verify Citations」快捷入口，随时可在同一页面完成资料检索与引用验证。
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-xl px-4 py-3 ${
                          msg.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 border border-gray-200'
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}

                  {isChatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && chatInput.trim() && !isChatLoading) {
                      e.preventDefault()
                      handleChatSubmit()
                    }
                  }}
                  placeholder="Ask me anything about your writing..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-50"
                  disabled={isChatLoading}
                />
                <button
                  onClick={handleChatSubmit}
                  disabled={!chatInput.trim() || isChatLoading}
                  className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles size={18} />
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

