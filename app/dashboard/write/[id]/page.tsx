'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Home, 
  Edit3, 
  FileText, 
  Square, 
  Circle,
  Save,
  Download,
  MessageSquare,
  X,
  Sparkles,
  Moon,
  Maximize,
  RotateCcw,
  Printer,
  Menu
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
    
    if (index >= 0) {
      savedDocs[index] = { ...document, updatedAt: Date.now() }
    } else {
      savedDocs.unshift({ ...document, updatedAt: Date.now() })
    }
    
    localStorage.setItem('citea_documents', JSON.stringify(savedDocs.slice(0, 50)))
    alert('Document saved successfully!')
  }

  const handleExport = (format: string) => {
    if (!document) return
    alert(`Exporting as ${format.toUpperCase()}...`)
    setIsExportMenuOpen(false)
  }

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return
    
    const userMessage = chatInput.trim()
    setChatInput('')
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }])
    
    setTimeout(() => {
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I can help you with your writing. What would you like to improve?' 
      }])
    }, 1000)
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
      <aside className={`${isSidebarOpen ? 'w-14' : 'w-0'} bg-gray-50 border-r border-gray-200 flex flex-col items-center py-4 transition-all`}>
        {isSidebarOpen && (
          <>
            <button className="p-3 hover:bg-gray-200 rounded-lg transition mb-2">
              <Menu size={20} className="text-gray-700" />
            </button>
            <button 
              onClick={() => router.push('/dashboard')}
              className="p-3 hover:bg-blue-100 rounded-lg transition mb-2"
            >
              <Home size={20} className="text-gray-700" />
            </button>
            <button className="p-3 hover:bg-gray-200 rounded-lg transition mb-2">
              <Edit3 size={20} className="text-gray-700" />
            </button>
            <button className="p-3 hover:bg-gray-200 rounded-lg transition mb-2">
              <FileText size={20} className="text-gray-700" />
            </button>
            <button className="p-3 hover:bg-gray-200 rounded-lg transition mb-2">
              <Square size={20} className="text-gray-700" />
            </button>
            <button className="p-3 hover:bg-gray-200 rounded-lg transition mb-2">
              <Circle size={20} className="text-gray-700" />
            </button>
          </>
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
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        Hello! I am your AI research assistant. I have access to <span className="font-semibold">your sources</span> and <span className="font-semibold">the web</span>. Try asking me some questions about your research topic or try some of these prompts.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <button 
                        onClick={() => setChatInput('What is Write Feature?')}
                        className="w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition text-sm flex items-center gap-2"
                      >
                        <Edit3 size={14} className="text-gray-500" />
                        <span>What is Write Feature?</span>
                      </button>

                      <button 
                        onClick={() => setChatInput('How to use Write Feature?')}
                        className="w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition text-sm flex items-center gap-2"
                      >
                        <span className="text-gray-500">?</span>
                        <span>How to use Write Feature?</span>
                      </button>

                      <button 
                        onClick={() => setChatInput('Summarize in a paragraph')}
                        className="w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition text-sm flex items-center gap-2"
                      >
                        <FileText size={14} className="text-gray-500" />
                        <span>Summarize in a paragraph</span>
                      </button>
                    </div>

                    <div className="text-center text-sm text-gray-500">
                      or explore these options
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition text-sm font-medium">
                        view sources ↗
                      </button>
                      <button className="flex-1 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition text-sm font-medium">
                        add sources ↗
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
                          className={`max-w-[80%] rounded-lg px-4 py-3 ${
                            msg.role === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                        </div>
                      </div>
                    ))}
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
                      if (e.key === 'Enter' && chatInput.trim()) {
                        handleChatSubmit()
                      }
                    }}
                    placeholder="Ask here or type @ to search sources"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <button
                    onClick={handleChatSubmit}
                    disabled={!chatInput.trim()}
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

