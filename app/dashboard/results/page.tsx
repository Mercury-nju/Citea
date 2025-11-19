'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, ExternalLink, CheckCircle, X, Copy } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function ResultsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useLanguage()
  const [type, setType] = useState<'finder' | 'checker'>('finder')
  const [results, setResults] = useState<any>(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    const typeParam = searchParams.get('type')
    const resultsParam = searchParams.get('results')
    const queryParam = searchParams.get('query')

    if (typeParam) setType(typeParam as 'finder' | 'checker')
    if (queryParam) setQuery(decodeURIComponent(queryParam))
    if (resultsParam) {
      try {
        setResults(JSON.parse(decodeURIComponent(resultsParam)))
      } catch (e) {
        console.error('Failed to parse results:', e)
      }
    }
  }, [searchParams])

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    // 可以添加一个 toast 提示
  }

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">{t.dashboard?.loading}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">
                {type === 'finder' ? t.dashboard?.searchResults : t.dashboard?.verificationResults}
              </h1>
              {query && (
                <p className="text-sm text-gray-600 mt-1 truncate max-w-2xl">
                  {query}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {type === 'finder' && results.sources && (
          <div className="space-y-4">
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                {t.dashboard?.foundSources} <span className="font-semibold text-gray-900">{results.sources.length}</span> {t.dashboard?.relatedSources}
              </p>
            </div>

            {results.sources.map((source: any, index: number) => (
              <div
                key={source.id || index}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {source.title}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><span className="font-medium">{t.dashboard?.author}:</span> {source.authors || t.dashboard?.unknown}</p>
                      <p><span className="font-medium">{t.dashboard?.journal}:</span> {source.journal || t.dashboard?.unknown}</p>
                      <p><span className="font-medium">{t.dashboard?.year}:</span> {source.year || t.dashboard?.unknown}</p>
                      {source.doi && (
                        <p><span className="font-medium">DOI:</span> {source.doi}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {source.verified && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                        {t.dashboard?.verified}
                      </span>
                    )}
                    {source.link && (
                      <a
                        href={source.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                      >
                        <ExternalLink size={18} className="text-blue-600" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {type === 'checker' && results.citations && (
          <div className="space-y-4">
            <div className="mb-6 bg-white rounded-xl border border-gray-200 p-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{results.totalFound || 0}</p>
                  <p className="text-sm text-gray-600 mt-1">{t.dashboard?.totalCitations}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{results.verified || 0}</p>
                  <p className="text-sm text-gray-600 mt-1">{t.dashboard?.verified}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{results.verificationRate || 0}%</p>
                  <p className="text-sm text-gray-600 mt-1">{t.dashboard?.verificationRate}</p>
                </div>
              </div>
            </div>

            {results.citations.map((citation: any, index: number) => (
              <div
                key={citation.id || index}
                className={`bg-white rounded-xl border-2 p-6 ${
                  citation.verified
                    ? 'border-green-200 bg-green-50/50'
                    : 'border-red-200 bg-red-50/50'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {citation.verified ? (
                        <CheckCircle className="text-green-600" size={20} />
                      ) : (
                        <X className="text-red-600" size={20} />
                      )}
                      <span className={`font-semibold ${
                        citation.verified ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {citation.verified ? t.dashboard?.verified : t.dashboard?.unverified}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-4">{citation.text}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(citation.text)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <Copy size={18} className="text-gray-600" />
                  </button>
                </div>

                {citation.bestMatch && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">{t.dashboard?.bestMatch}:</p>
                    <div className="bg-white rounded-lg p-4 space-y-2">
                      <p className="text-sm"><span className="font-medium">{t.dashboard?.title}:</span> {citation.bestMatch.title}</p>
                      <p className="text-sm"><span className="font-medium">{t.dashboard?.author}:</span> {citation.bestMatch.authors}</p>
                      <p className="text-sm"><span className="font-medium">{t.dashboard?.date}:</span> {citation.bestMatch.date}</p>
                      {citation.bestMatch.link && (
                        <a
                          href={citation.bestMatch.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                        >
                          {t.dashboard?.viewOriginal} <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {!citation.verified && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">{t.dashboard?.titleSimilarity}</p>
                        <p className="font-semibold text-gray-900">{citation.titleSimilarity || 0}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">{t.dashboard?.authorSimilarity}</p>
                        <p className="font-semibold text-gray-900">{citation.authorsSimilarity || 0}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">{t.dashboard?.dateSimilarity}</p>
                        <p className="font-semibold text-gray-900">{citation.dateSimilarity || 0}%</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

