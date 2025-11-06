'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Edit3, FileText, Sparkles, Save, Download, MessageSquare, X } from 'lucide-react'
import Logo from '@/components/Logo'

type Step = 'prompt' | 'editor'
type StartMode = 'heading' | 'outline'

interface Document {
  id: string
  title: string
  outline: string[]
  content: string
  createdAt: number
  updatedAt: number
}

export default function DocumentAssistantPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('prompt')
  const [startMode, setStartMode] = useState<StartMode>('heading')
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [document, setDocument] = useState<Document | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([])
  const [chatInput, setChatInput] = useState('')
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    
    try {
      // Simulate AI generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newDoc: Document = {
        id: Date.now().toString(),
        title: startMode === 'heading' ? prompt : `Document about ${prompt}`,
        outline: [
          'Introduction',
          'Background and Context',
          'Main Analysis',
          'Key Findings',
          'Conclusion'
        ],
        content: '',
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      
      setDocument(newDoc)
      setStep('editor')
      
      // Save to localStorage
      const savedDocs = JSON.parse(localStorage.getItem('citea_documents') || '[]')
      savedDocs.unshift(newDoc)
      localStorage.setItem('citea_documents', JSON.stringify(savedDocs.slice(0, 50)))
    } catch (error) {
      console.error('Generation error:', error)
      alert('Failed to generate document. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

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

  const handleExport = (format: 'pdf' | 'md' | 'latex' | 'docx' | 'html') => {
    if (!document) return
    
    // In a real implementation, you would convert and download the document
    alert(`Exporting as ${format.toUpperCase()}...`)
    setIsExportMenuOpen(false)
  }

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return
    
    const userMessage = chatInput.trim()
    setChatInput('')
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }])
    
    // Simulate AI response
    setTimeout(() => {
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I can help you with your writing. What would you like to improve?' 
      }])
    }, 1000)
  }

  // Prompt Step
  if (step === 'prompt') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft size={20} />
            </button>
            <Logo />
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-cyan-400 mb-4">
              <Edit3 className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              What are you writing today? <span className="text-red-500">*</span>
            </h1>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Skip ⏭
            </button>
          </div>

          {/* Input Area */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 mb-6">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., write an essay about history of the United States"
              className="w-full h-40 p-4 border-0 focus:ring-0 resize-none text-gray-900 placeholder-gray-400"
              maxLength={500}
            />
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {prompt.length}/500
                </span>
              </div>
            </div>
          </div>

          {/* Weak Prompt Notice */}
          {prompt.length > 0 && prompt.length < 20 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 text-orange-600 text-sm mb-2">
                <div className="w-full bg-gray-200 h-1 rounded-full">
                  <div className="bg-orange-500 h-1 rounded-full" style={{ width: '20%' }} />
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Weak Prompt: add more context for higher quality generations
              </p>
            </div>
          )}

          {/* Start Mode Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => setStartMode('heading')}
              className={`p-6 rounded-xl border-2 transition-all text-left ${
                startMode === 'heading'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <Edit3 className={startMode === 'heading' ? 'text-blue-600' : 'text-gray-400'} size={24} />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Start with Heading</h3>
                  <p className="text-sm text-gray-600">Generate title, and write upon it</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setStartMode('outline')}
              className={`p-6 rounded-xl border-2 transition-all text-left ${
                startMode === 'outline'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <FileText className={startMode === 'outline' ? 'text-blue-600' : 'text-gray-400'} size={24} />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Start with Outline</h3>
                  <p className="text-sm text-gray-600">AI will generate outline for you</p>
                </div>
              </div>
            </button>
          </div>

          {/* Next Button */}
          <div className="flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isGenerating ? 'Generating...' : 'Next'}
            </button>
          </div>
        </main>
      </div>
    )
  }

  // Editor Step
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={20} />
          </button>
          <Logo />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition text-sm"
          >
            <Save size={16} />
            Save
          </button>
          
          <div className="relative">
            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition text-sm"
            >
              <Download size={16} />
              Export
            </button>
            
            {isExportMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm"
                >
                  <FileText size={16} />
                  PDF (.PDF)
                </button>
                <button
                  onClick={() => handleExport('md')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm"
                >
                  <FileText size={16} />
                  Markdown (.MD)
                </button>
                <button
                  onClick={() => handleExport('latex')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm"
                >
                  <FileText size={16} />
                  Latex (.TEX)
                </button>
                <button
                  onClick={() => handleExport('docx')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm"
                >
                  <FileText size={16} />
                  WORD (.DOCX)
                </button>
                <button
                  onClick={() => handleExport('html')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm"
                >
                  <FileText size={16} />
                  HTML (.HTML)
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
          >
            <MessageSquare size={16} />
            Chat
          </button>
        </div>
      </header>

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Content */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Title */}
            <h1 className="text-4xl font-bold text-gray-900 mb-8 focus:outline-none" contentEditable>
              {document?.title}
            </h1>

            {/* Outline */}
            <div className="mb-8">
              {document?.outline.map((section, index) => (
                <div key={index} className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    {section}
                  </h2>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {section === 'Introduction' && (
                      <>
                        <li>Background information</li>
                        <li>Research objectives</li>
                      </>
                    )}
                    {section === 'Background and Context' && (
                      <>
                        <li>Historical perspective</li>
                        <li>Current state of research</li>
                      </>
                    )}
                    {section === 'Main Analysis' && (
                      <>
                        <li>Methodology</li>
                        <li>Data analysis</li>
                      </>
                    )}
                    {section === 'Key Findings' && (
                      <>
                        <li>Primary results</li>
                        <li>Secondary observations</li>
                      </>
                    )}
                    {section === 'Conclusion' && (
                      <>
                        <li>Summary of findings</li>
                        <li>Future directions</li>
                      </>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Sidebar */}
        {isChatOpen && (
          <div className="w-96 border-l border-gray-200 bg-gray-50 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">AI Writing Assistant</h3>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1 hover:bg-gray-200 rounded transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <MessageSquare className="mx-auto mb-2" size={48} />
                  <p className="text-sm">Ask me anything about your writing</p>
                </div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && chatInput.trim()) {
                      handleChatSubmit()
                    }
                  }}
                  placeholder="Ask for help..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <button
                  onClick={handleChatSubmit}
                  disabled={!chatInput.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  <Sparkles size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

