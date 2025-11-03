'use client'

import { useMemo, useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { Sparkles, Check, X, Lightbulb, Loader2 } from 'lucide-react'

type Suggestion = {
  id: string
  type: 'replace' | 'add' | 'delete'
  target?: string
  position?: string
  text: string
}

export default function DocumentAssistant() {
  const { t, language } = useLanguage()
  const [started, setStarted] = useState(true)
  const [operation, setOperation] = useState<'generate' | 'suggest'>('generate')
  const [editorText, setEditorText] = useState('')
  const [instructions, setInstructions] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [feedback, setFeedback] = useState<{grammar?: string; logic?: string; clarity?: string; overall?: string}>({})
  const [showHelp, setShowHelp] = useState(true)
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])
  const [chatInput, setChatInput] = useState('')
  const examplePrompts = useMemo(() => (
    language === 'zh'
      ? [
          '为“生成式AI在医学影像中的应用”撰写研究背景与意义',
          '围绕“气候变化与农业产量”写一段相关工作综述（学术风格）',
          '根据提纲：1.问题定义 2.方法 3.实验 4.结论，生成摘要',
        ]
      : [
          'Write background for "Generative AI in medical imaging" (academic tone)',
          'Survey paragraph on "Climate change and crop yield" with citations placeholders',
          'Generate an abstract using outline: 1. Problem 2. Method 3. Experiments 4. Conclusion',
        ]
  ), [language])

  const handleStart = () => setStarted(true)

  const callAssistant = async () => {
    setLoading(true)
    setError('')
    setSuggestions([])
    setFeedback({})
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('citea_auth_token') : null
      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch('/api/document-assistant', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          operation,
          inputText: editorText,
          instructions,
          language,
        })
      })
      if (!res.ok) throw new Error('Request failed')
      const data = await res.json()
      const content: string = data.content || ''

      if (operation === 'generate') {
        // Insert generated content to the editor (append with spacing)
        const spacer = editorText && !editorText.endsWith('\n\n') ? '\n\n' : ''
        setEditorText(prev => `${prev}${spacer}${content}`)
      } else {
        // Try parse strict JSON object { suggestions, feedback }
        let parsed: Suggestion[] | null = null
        try {
          const objStart = content.indexOf('{')
          const objEnd = content.lastIndexOf('}')
          if (objStart !== -1 && objEnd !== -1) {
            const parsedObj = JSON.parse(content.substring(objStart, objEnd + 1))
            const arr = Array.isArray(parsedObj?.suggestions) ? parsedObj.suggestions : []
            parsed = arr.map((s: any, idx: number) => ({
              id: `${Date.now()}-${idx}`,
              type: (s.type as 'replace'|'add'|'delete') || 'replace',
              target: s.target,
              position: s.position,
              text: s.text || s.replacement || '',
            }))
            if (parsedObj?.feedback) setFeedback(parsedObj.feedback)
          } else {
            // legacy: array only
            const jsonStart = content.indexOf('[')
            const jsonEnd = content.lastIndexOf(']')
            if (jsonStart !== -1 && jsonEnd !== -1) {
              parsed = JSON.parse(content.substring(jsonStart, jsonEnd + 1)).map((s: any, idx: number) => ({
                id: `${Date.now()}-${idx}`,
                type: (s.type as 'replace'|'add'|'delete') || 'replace',
                target: s.target,
                position: s.position,
                text: s.replacement || s.text || '',
              }))
            }
          }
        } catch (_) {
          parsed = null
        }
        if (parsed && parsed.length > 0) {
          setSuggestions(parsed)
        } else {
          // Fallback: split lines as suggestions
          const items = content.split(/\n+/).filter(Boolean).map((line, idx) => ({
            id: `${Date.now()}-${idx}`,
            type: 'replace' as const,
            text: line.replace(/^[-*\s]+/, ''),
          }))
          setSuggestions(items)
        }
      }
    } catch (e) {
      setError(language === 'zh' ? '请求失败，请重试。' : 'Request failed, please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSendChat = async () => {
    if (!chatInput.trim()) return
    const userMsg = { role: 'user' as const, content: chatInput.trim() }
    setChatMessages(prev => [...prev, userMsg])
    setChatInput('')
    // Use generate operation with chat intent
    const prevOp = operation
    if (operation !== 'generate') setOperation('generate')
    setInstructions(userMsg.content)
    await callAssistant()
    // Append assistant message echo for history
    const added = editorText.split('\n').slice(-3).join('\n')
    setChatMessages(prev => [...prev, { role: 'assistant', content: added || (language === 'zh' ? '已生成内容，请在右侧查看。' : 'Content generated. See the document on the right.') }])
    if (prevOp !== 'generate') setOperation(prevOp)
  }

  const escapeHtml = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')

  const previewHtml = useMemo(() => {
    let html = escapeHtml(editorText)
    // apply highlight markers for suggestions without mutating editor content
    suggestions.forEach((s) => {
      if (s.type === 'delete' && s.target) {
        const targetEsc = escapeHtml(s.target)
        html = html.replace(targetEsc, `<span class="bg-red-100 text-red-700 line-through">${targetEsc}</span>`)
      } else if (s.type === 'replace' && s.target) {
        const targetEsc = escapeHtml(s.target)
        const newEsc = escapeHtml(s.text)
        html = html.replace(
          targetEsc,
          `<span class="bg-yellow-100 line-through">${targetEsc}</span> <span class="bg-green-100 text-green-800">${newEsc}</span>`
        )
      } else if (s.type === 'add') {
        const newEsc = escapeHtml(s.text)
        if (s.target) {
          const targetEsc = escapeHtml(s.target)
          html = html.replace(
            targetEsc,
            `${targetEsc} <span class="bg-green-100 text-green-800">${newEsc}</span>`
          )
        } else {
          html = `${html}${html.endsWith('\n') ? '' : ' '}<span class="bg-green-100 text-green-800">${newEsc}</span>`
        }
      }
    })
    return html.replace(/\n/g, '<br/>')
  }, [editorText, suggestions])

  const applySuggestion = (s: Suggestion) => {
    if (s.type === 'add') {
      const spacer = editorText && !editorText.endsWith('\n\n') ? '\n\n' : ''
      setEditorText(prev => `${prev}${spacer}${s.text}`)
    } else if (s.type === 'delete' && s.target) {
      setEditorText(prev => prev.replace(s.target!, ''))
    } else if (s.type === 'replace' && s.target) {
      setEditorText(prev => prev.replace(s.target!, s.text))
    } else if (s.type === 'replace' && !s.target) {
      // No explicit target: append as improved sentence
      const spacer = editorText && !editorText.endsWith('\n') ? '\n' : ''
      setEditorText(prev => `${prev}${spacer}${s.text}`)
    }
    setSuggestions(prev => prev.filter(i => i.id !== s.id))
  }

  const rejectSuggestion = (id: string) => setSuggestions(prev => prev.filter(i => i.id !== id))

  const saveDocument = () => {
    const title = editorText.trim().split('\n')[0]?.slice(0, 80) || (language === 'zh' ? '未命名文档' : 'Untitled Document')
    const entry = { id: Date.now().toString(), title, content: editorText, createdAt: new Date().toISOString() }
    try {
      const key = 'citea_docs'
      const existing = JSON.parse(localStorage.getItem(key) || '[]') as any[]
      existing.unshift(entry)
      localStorage.setItem(key, JSON.stringify(existing.slice(0, 100)))
      alert(language === 'zh' ? '已保存到本地' : 'Saved locally')
    } catch (e) {
      alert(language === 'zh' ? '保存失败' : 'Save failed')
    }
  }

  const downloadDocument = () => {
    const blob = new Blob([editorText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const name = (editorText.trim().split('\n')[0] || 'document').replace(/[^\w\u4e00-\u9fa5\- ]+/g, '').slice(0, 60)
    a.href = url
    a.download = `${name || 'document'}.txt`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900">{t?.documentAssistant?.title || 'Document Assistant'}</h1>
        <p className="text-gray-600 mt-2">{t?.documentAssistant?.subtitle || 'Generate paragraphs and get live edit suggestions for academic writing.'}</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        {/* Onboarding helper */}
        {showHelp && (
          <div className="px-4 py-3 border-b border-gray-100 bg-blue-50/60 flex flex-col gap-1 text-sm">
            <div className="flex items-center justify-between">
              <p className="font-medium text-blue-900">{language === 'zh' ? '如何使用：' : 'How to use:'}</p>
              <button onClick={() => setShowHelp(false)} className="text-xs text-blue-700 hover:underline">{language === 'zh' ? '我知道了' : 'Got it'}</button>
            </div>
            <p className="text-blue-900/90">1. {language === 'zh' ? '在下方“写作需求”中描述你要写的内容（主题、结构、字数）' : 'Describe your writing needs below (topic, structure, length).'} </p>
            <p className="text-blue-900/90">2. {language === 'zh' ? '点击“生成”得到首版文本；可直接在左侧编辑区修改' : 'Click Generate to get the first draft; edit it in the left editor.'}</p>
            <p className="text-blue-900/90">3. {language === 'zh' ? '切换到“建议模式”获取逐条修改建议，点击“应用/忽略”' : 'Switch to Suggest to get edit suggestions, then Apply/Reject them.'}</p>
          </div>
        )}
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
          <span className="text-xs text-gray-500">{language === 'zh' ? '左边与 AI 对话，右边生成与编辑论文内容。' : 'Chat on the left; compose and edit paper on the right.'}</span>
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={saveDocument} className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
              {language === 'zh' ? '保存' : 'Save'}
            </button>
            <button onClick={downloadDocument} className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
              {language === 'zh' ? '下载' : 'Download'}
            </button>
          </div>
        </div>

        <div className="p-4 grid lg:grid-cols-2 gap-6">
          <div>
            <div className="rounded-2xl border border-gray-200 bg-white h-full flex flex-col">
              <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800">{language === 'zh' ? 'AI 对话' : 'AI Chat'}</span>
                <span className="text-xs text-gray-500">{language === 'zh' ? '在此描述需求，右侧生成论文内容' : 'Describe needs; right side shows the paper'}</span>
              </div>
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {chatMessages.length === 0 && (
                  <div className="text-sm text-gray-500">
                    {language === 'zh' ? '示例：为“联邦学习在医疗中的挑战”写研究背景（300字）。' : 'Example: Write background for "Federated learning in healthcare" (300 words).'}
                  </div>
                )}
                {chatMessages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'} rounded-lg px-3 py-2 max-w-[80%] whitespace-pre-wrap text-sm`}>
                      {m.content}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-gray-100">
                <div className="flex gap-2">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendChat(); } }}
                    placeholder={language === 'zh' ? '输入写作需求，例如：撰写相关工作...' : 'Enter writing need, e.g., draft related work...'}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg"
                  />
                  <button onClick={handleSendChat} disabled={!chatInput.trim() || loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">
                    {language === 'zh' ? '发送' : 'Send'}
                  </button>
                </div>
                {/* Quick prompts */}
                <div className="mt-2 flex flex-wrap gap-2">
                  {examplePrompts.map((p, idx) => (
                    <button key={idx} onClick={() => setChatInput(p)} className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-100">{p}</button>
                  ))}
                </div>
              </div>
            </div>
            {error && (
              <div className="mt-3 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">{error}</div>
            )}
          </div>

          <div>
            <div className="rounded-2xl border border-gray-200 bg-white">
              <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800">{language === 'zh' ? '文档预览' : 'Document Preview'}</span>
                <span className="text-xs text-gray-500">{language === 'zh' ? '右侧为渲染预览，包含建议高亮' : 'Rendered preview with suggestion highlights'}</span>
              </div>
              <div className="p-4 max-h-[520px] overflow-y-auto">
                <div className="prose prose-sm max-w-none text-gray-900" dangerouslySetInnerHTML={{ __html: previewHtml }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


