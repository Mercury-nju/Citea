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
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  // Magic Link 模式：移除了验证码相关的状态

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam)
      // Magic Link 模式：用户点击邮件中的链接即可验证，无需输入验证码
      setMessage('📧 验证邮件已发送到您的邮箱，请点击邮件中的链接完成验证。')
    }
  }, [emailParam, t])

  // Magic Link 模式：不再需要验证码验证
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('📧 Magic Link 模式：请检查您的邮箱并点击验证链接完成注册。')
  }

  // Magic Link 模式：重新发送验证邮件
  const handleResend = async () => {
    if (!email) {
      setError(t.auth.verifyEmail.enterEmail)
      return
    }

    setIsResending(true)
    setError('')
    setMessage('')

    try {
      const res = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        const errorMsg = data.message || data.error || t.auth.verifyEmail.resendError
        setError(`❌ ${errorMsg}`)
        setIsResending(false)
        return
      }

      setMessage('✅ 验证邮件已重新发送，请检查您的邮箱并点击链接完成验证。')
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

          {/* Magic Link 模式说明 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Mail className="text-blue-600 mt-0.5" size={20} />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">📧 Magic Link 验证模式</p>
                <p>请检查您的邮箱并点击邮件中的验证链接完成注册。无需输入验证码。</p>
              </div>
            </div>
          </div>

          {/* Resend Code */}
          <div className="text-center">
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

          {/* Help Text */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>📧 请检查您的邮箱并点击验证链接</p>
            <p>如果未收到邮件，请检查垃圾邮件文件夹</p>
          </div>

          {/* Back to Sign In */}
          <div className="mt-6 text-center">
            <Link href="/auth/signin" className="text-gray-600 hover:text-gray-800 text-sm">
              {t.auth.verifyEmail.backToSignIn}
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm">
            返回首页
          </Link>
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

