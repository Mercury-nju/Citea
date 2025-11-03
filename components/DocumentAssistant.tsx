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
  const [started, setStarted] = useState(false)
  const [operation, setOperation] = useState<'generate' | 'suggest'>('generate')
  const [editorText, setEditorText] = useState('')
  const [instructions, setInstructions] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [feedback, setFeedback] = useState<{grammar?: string; logic?: string; clarity?: string; overall?: string}>({})
  const [showHelp, setShowHelp] = useState(true)
  const examplePrompts = useMemo(() => (
    language === 'zh'
      ? [
          '为“生成式AI在医学影像中的应用”撰写研究背景与意义（约300字）',
          '围绕“气候变化与农业产量”写一段相关工作综述（学术风格）',
          '根据提纲：1.问题定义 2.方法 3.实验 4.结论，生成摘要',
        ]
      : [
          'Write a 300-word background on "Generative AI in medical imaging" (academic tone)',
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
          <div className="inline-flex rounded-lg overflow-hidden border border-gray-200">
            <button
              className={`px-4 py-2 text-sm ${operation === 'generate' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'}`}
              onClick={() => setOperation('generate')}
            >{t?.documentAssistant?.generate || 'Generate'}</button>
            <button
              className={`px-4 py-2 text-sm border-l border-gray-200 ${operation === 'suggest' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'}`}
              onClick={() => setOperation('suggest')}
            >{t?.documentAssistant?.suggest || 'Suggest'}</button>
          </div>
          <span className="text-xs text-gray-500">{operation === 'generate' ? (language === 'zh' ? '根据需求生成首版文本' : 'Generate first draft from your prompt') : (language === 'zh' ? '分析当前文本并给出可应用的修改建议' : 'Analyze current text and return actionable suggestions')}</span>

          {!started && (
            <button
              onClick={handleStart}
              className="ml-auto inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
            >
              <Sparkles size={16} /> {t?.documentAssistant?.start || 'Start using document assistant'}
            </button>
          )}

          {started && (
            <button
              onClick={callAssistant}
              disabled={loading}
              className="ml-auto inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
              {operation === 'generate' ? (t?.documentAssistant?.generate || 'Generate') : (t?.documentAssistant?.getSuggestions || 'Get suggestions')}
            </button>
          )}

          {started && (
            <div className="flex items-center gap-2 ml-2">
              <button onClick={saveDocument} className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
                {language === 'zh' ? '保存' : 'Save'}
              </button>
              <button onClick={downloadDocument} className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
                {language === 'zh' ? '下载' : 'Download'}
              </button>
            </div>
          )}
        </div>

        <div className="p-4 grid lg:grid-cols-2 gap-6">
          <div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <textarea
                value={editorText}
                onChange={(e) => setEditorText(e.target.value)}
                placeholder={t?.documentAssistant?.editorPlaceholder || 'Write or paste your text here...'}
                className="w-full min-h-[320px] bg-transparent outline-none resize-y"
              />
            </div>

            {/* Live suggestion preview */}
            {suggestions.length > 0 && (
              <div className="mt-3 border border-dashed border-gray-300 rounded-xl p-4 bg-white">
                <p className="text-xs text-gray-500 mb-2">{language === 'zh' ? '实时建议预览（不改变原文）' : 'Live suggestions preview (non-destructive)'}</p>
                <div className="prose prose-sm max-w-none text-gray-900" dangerouslySetInnerHTML={{ __html: previewHtml }} />
              </div>
            )}

            <div className="mt-3">
              <input
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder={t?.documentAssistant?.instructionPlaceholder || 'Optional: provide topic, outline, or tone preferences'}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              />
              {/* Prompt suggestions */}
              <div className="mt-2 flex flex-wrap gap-2">
                {examplePrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInstructions(p)}
                    className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-100"
                  >
                    {p}
                  </button>
                ))}
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


