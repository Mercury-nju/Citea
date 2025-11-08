'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/Logo'
import { Mail, ArrowRight } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

function VerifyEmailContent() {
  const router = useRouter()
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const emailParam = searchParams.get('email')
  const codeParam = searchParams.get('code')
  
  const [email, setEmail] = useState(emailParam || '')
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam)
      // 只在明确设置时才显示验证码（生产环境不应暴露验证码）
      // 如果 URL 中有 code 参数，说明是开发/测试环境
      if (codeParam) {
        setCode(codeParam)
        setMessage(t.auth.verifyEmail.codeAutoFilled)
      } else {
        setMessage(t.auth.verifyEmail.codeSent)
      }
    }
  }, [emailParam, codeParam, t])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setMessage('')

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || t.auth.verifyEmail.verifyError)
        setIsLoading(false)
        return
      }

      setMessage(t.auth.verifyEmail.verifySuccess)
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 1500)
    } catch (err) {
      setError(t.auth.verifyEmail.verifyError)
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) {
      setError(t.auth.verifyEmail.enterEmail)
      return
    }

    setIsResending(true)
    setError('')
    setMessage('')

    try {
      setIsResending(true)
      const res = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        const errorMsg = data.message || data.error || t.auth.verifyEmail.resendError
        // 如果后端返回了 code，说明是开发/测试环境
        setError(`❌ ${errorMsg}${data.code ? `\n\n${t.auth.verifyEmail.codeLabel} (Dev only): ${data.code}` : ''}`)
        setIsResending(false)
        return
      }

      // 如果后端返回了 code，说明是开发/测试环境
      setMessage(`✅ ${data.message || t.auth.verifyEmail.resendSuccess}${data.code ? `\n\n${t.auth.verifyEmail.codeLabel} (Dev only): ${data.code}` : ''}`)
      setIsResending(false)
    } catch (err) {
      setError(t.auth.verifyEmail.resendError)
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex justify-center mb-8">
          <Logo />
        </Link>

        {/* Verification Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="text-blue-600" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t.auth.verifyEmail.title}
            </h1>
            {emailParam ? (
              <p className="text-gray-600">
                {t.auth.verifyEmail.subtitle} <span className="font-semibold text-blue-600">{emailParam}</span>
              </p>
            ) : (
              <p className="text-gray-600">
                {t.auth.verifyEmail.subtitleNoEmail}
              </p>
            )}
          </div>

          {message && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm text-center">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.auth.verifyEmail.emailLabel}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="your@email.com"
                disabled={!!emailParam}
              />
            </div>

            {/* Verification Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.auth.verifyEmail.codeLabel}
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-center text-2xl font-bold tracking-widest"
                placeholder={t.auth.verifyEmail.codePlaceholder}
                maxLength={6}
              />
              <p className="mt-2 text-sm text-gray-500 text-center">
                {t.auth.verifyEmail.codeExpiry}
              </p>
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={isLoading || code.length !== 6}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {t.auth.verifyEmail.verifyButton}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* Resend Code */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm mb-2">
              {t.auth.verifyEmail.resendQuestion}
            </p>
            <button
              onClick={handleResend}
              disabled={isResending}
              className="text-blue-600 hover:text-blue-700 font-semibold text-sm disabled:opacity-50"
            >
              {isResending ? t.auth.verifyEmail.resending : t.auth.verifyEmail.resendButton}
            </button>
          </div>

          {/* Back to Sign In */}
          <div className="mt-6 text-center">
            <Link href="/auth/signin" className="text-gray-600 hover:text-gray-800 text-sm">
              {t.auth.verifyEmail.backToSignIn}
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>{t.auth.verifyEmail.helpText1}</p>
          <p>{t.auth.verifyEmail.helpText2}</p>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}

