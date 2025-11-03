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

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900">{t?.documentAssistant?.title || 'Document Assistant'}</h1>
        <p className="text-gray-600 mt-2">{t?.documentAssistant?.subtitle || 'Generate paragraphs and get live edit suggestions for academic writing.'}</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
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
        </div>

        <div className="p-4 grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
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
            </div>

            {error && (
              <div className="mt-3 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">{error}</div>
            )}
          </div>

          <div>
            {/* Feedback cards */}
            {(feedback.grammar || feedback.logic || feedback.clarity || feedback.overall) && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                {feedback.overall && (
                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-700">{language === 'zh' ? '总体建议' : 'Overall'}</p>
                    <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">{feedback.overall}</p>
                  </div>
                )}
                {feedback.grammar && (
                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-700">{language === 'zh' ? '语法' : 'Grammar'}</p>
                    <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">{feedback.grammar}</p>
                  </div>
                )}
                {feedback.logic && (
                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-700">{language === 'zh' ? '逻辑' : 'Logic'}</p>
                    <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">{feedback.logic}</p>
                  </div>
                )}
                {feedback.clarity && (
                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-700">{language === 'zh' ? '清晰度' : 'Clarity'}</p>
                    <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">{feedback.clarity}</p>
                  </div>
                )}
              </div>
            )}
            <div className="rounded-xl border border-gray-200">
              <div className="px-4 py-2 border-b border-gray-100 flex items-center gap-2">
                <Lightbulb size={16} className="text-amber-500" />
                <span className="text-sm font-semibold text-gray-800">{t?.documentAssistant?.suggestions || 'Suggestions'}</span>
              </div>
              <div className="p-3 max-h-[380px] overflow-y-auto space-y-2">
                {suggestions.length === 0 && (
                  <p className="text-sm text-gray-500">{t?.documentAssistant?.noSuggestions || 'No suggestions yet. Switch to Suggest mode to get edits.'}</p>
                )}
                {suggestions.map((s) => (
                  <div key={s.id} className="border border-gray-200 rounded-lg p-3 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        {s.type}
                      </span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => applySuggestion(s)} className="inline-flex items-center gap-1 text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 px-2 py-1 rounded text-xs">
                          <Check size={12} /> {t?.documentAssistant?.apply || 'Apply'}
                        </button>
                        <button onClick={() => rejectSuggestion(s.id)} className="inline-flex items-center gap-1 text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-2 py-1 rounded text-xs">
                          <X size={12} /> {t?.documentAssistant?.reject || 'Reject'}
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{s.text}</p>
                    {s.target && (
                      <p className="mt-2 text-xs text-gray-500">Target: <span className="font-mono">{s.target}</span></p>
                    )}
                    {s.position && (
                      <p className="mt-1 text-xs text-gray-500">Position: {s.position}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


