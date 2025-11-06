'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Home, 
  Edit3, 
  FileText,
  Save,
  Download,
  MessageSquare,
  X,
  Sparkles,
  Moon,
  Maximize,
  RotateCcw,
  Printer,
  Menu,
  Search
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
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([])
  const [chatInput, setChatInput] = useState('')
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isChatLoading, setIsChatLoading] = useState(false)

  useEffect(() => {
    // Load document from localStorage
    const docId = params.id as string
    const savedDocs = JSON.parse(localStorage.getItem('citea_documents') || '[]')
    const doc = savedDocs.find((d: Document) => d.id === docId)
    
    if (doc) {
      setDocument(doc)
    } else {
      router.push('/dashboard')
    }
  }, [params.id, router])

  const handleSave = () => {
    if (!document) return
    
    const savedDocs = JSON.parse(localStorage.getItem('citea_documents') || '[]')
    const index = savedDocs.findIndex((d: Document) => d.id === document.id)
    
    const updatedDoc = { ...document, updatedAt: Date.now() }
    
    if (index >= 0) {
      savedDocs[index] = updatedDoc
    } else {
      savedDocs.unshift(updatedDoc)
    }
    
    localStorage.setItem('citea_documents', JSON.stringify(savedDocs.slice(0, 50)))
    
    // Show success toast
    if (typeof window !== 'undefined') {
      const toast = window.document.createElement('div')
      toast.className = 'fixed top-20 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2'
      toast.innerHTML = '<svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg> Document saved'
      window.document.body.appendChild(toast)
      
      setTimeout(() => {
        toast.style.transition = 'opacity 0.3s'
        toast.style.opacity = '0'
        setTimeout(() => toast.remove(), 300)
      }, 2000)
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

      // Add document context to the message
      const contextMessage = `I'm writing a document titled "${document?.title}". ${userMessage}`

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
      {/* Left Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-16' : 'w-0'} bg-gray-50 border-r border-gray-200 flex flex-col items-center py-4 transition-all`}>
        {isSidebarOpen && (
          <>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-3 hover:bg-gray-200 rounded-lg transition mb-4"
              title="Hide sidebar"
            >
              <Menu size={20} className="text-gray-700" />
            </button>
            
            <div className="border-t border-gray-300 w-10 mb-4" />
            
            <button 
              onClick={() => router.push('/dashboard')}
              className="p-3 hover:bg-blue-100 rounded-lg transition mb-2 group relative"
              title="Back to Dashboard"
            >
              <Home size={20} className="text-gray-700" />
              <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                Dashboard
              </span>
            </button>
            
            <button 
              onClick={() => router.push('/dashboard/write')}
              className="p-3 hover:bg-gray-200 rounded-lg transition mb-2 group relative"
              title="My Documents"
            >
              <FileText size={20} className="text-gray-700" />
              <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                Documents
              </span>
            </button>
            
            <button 
              onClick={handleSave}
              className="p-3 hover:bg-green-100 rounded-lg transition mb-2 group relative"
              title="Save Document"
            >
              <Save size={20} className="text-gray-700" />
              <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                Save
              </span>
            </button>
            
            <div className="border-t border-gray-300 w-10 my-4" />
            
            <button 
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`p-3 rounded-lg transition mb-2 group relative ${
                isChatOpen ? 'bg-blue-100' : 'hover:bg-gray-200'
              }`}
              title="AI Assistant"
            >
              <MessageSquare size={20} className={isChatOpen ? 'text-blue-600' : 'text-gray-700'} />
              <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                AI Chat
              </span>
            </button>
          </>
        )}
        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
            title="Show sidebar"
          >
            <Menu size={16} className="text-gray-700" />
          </button>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="border-b border-gray-200 px-6 py-3 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft size={20} />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition">
              <Moon size={18} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Saved</span>
            
            <button
              onClick={handleSave}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <Save size={18} />
            </button>

            <button className="p-2 hover:bg-gray-100 rounded-lg transition">
              <Printer size={18} />
            </button>
            
            <div className="relative">
              <button
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <Download size={18} />
              </button>
              
              {isExportMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  <button onClick={() => handleExport('pdf')} className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm">
                    <FileText size={16} />PDF (.PDF)
                  </button>
                  <button onClick={() => handleExport('md')} className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm">
                    <FileText size={16} />Markdown (.MD)
                  </button>
                  <button onClick={() => handleExport('latex')} className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm">
                    <FileText size={16} />Latex (.TEX)
                  </button>
                  <button onClick={() => handleExport('docx')} className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm">
                    <FileText size={16} />WORD (.DOCX)
                  </button>
                  <button onClick={() => handleExport('html')} className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm">
                    <FileText size={16} />HTML (.HTML)
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`px-4 py-2 rounded-lg transition text-sm font-medium flex items-center gap-2 ${
                isChatOpen ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <MessageSquare size={16} />
              {isChatOpen ? 'Chat' : 'Chat'}
            </button>

            <button className="p-2 hover:bg-gray-100 rounded-lg transition">
              <Menu size={18} />
            </button>

            <button className="p-2 hover:bg-gray-100 rounded-lg transition">
              <Maximize size={18} />
            </button>

            <button className="p-2 hover:bg-gray-100 rounded-lg transition">
              <RotateCcw size={18} />
            </button>

            <button className="p-2 hover:bg-gray-100 rounded-lg transition">
              <Printer size={18} />
            </button>
          </div>
        </header>

        {/* Editor Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Document Editor */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-12 py-16">
              {/* Title */}
              <h1 
                className="text-5xl font-bold text-gray-900 mb-12 focus:outline-none leading-tight"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => {
                  setDocument(prev => prev ? {...prev, title: e.currentTarget.textContent || prev.title} : null)
                }}
              >
                {document.title}
              </h1>

              {/* Content Sections */}
              <div className="space-y-10">
                {document.outline.map((section, index) => (
                  <div key={index}>
                    <h2 
                      className="text-3xl font-bold text-gray-900 mb-4 focus:outline-none"
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const newOutline = [...document.outline]
                        newOutline[index] = e.currentTarget.textContent || section
                        setDocument(prev => prev ? {...prev, outline: newOutline} : null)
                      }}
                    >
                      {section}
                    </h2>
                    <div 
                      className="text-gray-700 space-y-2 ml-4 leading-relaxed focus:outline-none"
                      contentEditable
                      suppressContentEditableWarning
                    >
                      {section === 'Introduction' && (
                        <ul className="list-disc list-inside">
                          <li>Background information</li>
                          <li>Research objectives</li>
                        </ul>
                      )}
                      {section === 'Background and Context' && (
                        <ul className="list-disc list-inside">
                          <li>Historical perspective</li>
                          <li>Current state of research</li>
                        </ul>
                      )}
                      {section === 'Main Analysis' && (
                        <ul className="list-disc list-inside">
                          <li>Methodology</li>
                          <li>Data analysis</li>
                        </ul>
                      )}
                      {section === 'Key Findings' && (
                        <ul className="list-disc list-inside">
                          <li>Primary results</li>
                          <li>Secondary observations</li>
                        </ul>
                      )}
                      {section === 'Conclusion' && (
                        <ul className="list-disc list-inside">
                          <li>Summary of findings</li>
                          <li>Future directions</li>
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Chat Sidebar */}
          {isChatOpen && (
            <aside className="w-96 border-l border-gray-200 bg-white flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Chat is using: <span className="font-normal">1 item</span></h3>
                </div>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6">
                {chatMessages.length === 0 ? (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
                      <p className="text-sm text-gray-800 leading-relaxed mb-2">
                        👋 <strong>Hello! I'm your AI writing assistant.</strong>
                      </p>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        I can help you improve your writing, suggest sources, check grammar, and answer questions about your document titled "<strong>{document.title}</strong>".
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-3">💡 Quick suggestions:</p>
                      <div className="space-y-2">
                        <button 
                          onClick={() => setChatInput('How can I improve the introduction?')}
                          className="w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition text-sm"
                        >
                          ✍️ Improve introduction
                        </button>

                        <button 
                          onClick={() => setChatInput('Make this more academic and formal')}
                          className="w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition text-sm"
                        >
                          🎓 Make it more academic
                        </button>

                        <button 
                          onClick={() => setChatInput('Suggest some credible sources for this topic')}
                          className="w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition text-sm"
                        >
                          📚 Find credible sources
                        </button>

                        <button 
                          onClick={() => setChatInput('Check this text for grammar and clarity issues')}
                          className="w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition text-sm"
                        >
                          ✅ Check grammar
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => router.push('/dashboard?tab=finder')}
                        className="flex-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition text-xs font-medium"
                      >
                        🔍 Find Sources
                      </button>
                      <button 
                        onClick={() => router.push('/dashboard?tab=checker')}
                        className="flex-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition text-xs font-medium"
                      >
                        ✓ Verify Citations
                      </button>
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
          )}
        </div>
      </div>
    </div>
  )
}

