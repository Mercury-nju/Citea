'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/Logo'
import { Mail, ArrowRight } from 'lucide-react'

function VerifyEmailContent() {
  const router = useRouter()
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
      // 如果通过应急模式携带了验证码，直接填入并提示
      if (codeParam) {
        setCode(codeParam)
        setMessage('✅ 验证码已生成并自动填入，请直接点击“验证邮箱”。')
      } else {
        setMessage('✅ 注册成功！验证码已发送到您的邮箱，请查收。')
      }
    }
  }, [emailParam])

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
        setError(data.error || '验证失败')
        setIsLoading(false)
        return
      }

      setMessage('验证成功！正在跳转...')
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 1500)
    } catch (err) {
      setError('验证失败，请重试')
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) {
      setError('请输入邮箱')
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
        const errorMsg = data.message || data.error || '重新发送失败，请稍后重试'
        setError(`❌ ${errorMsg}${data.code ? `\n\n验证码（仅开发环境）: ${data.code}` : ''}`)
        setIsResending(false)
        return
      }

      setMessage(`✅ ${data.message || '验证码已重新发送！请检查您的邮箱。'}${data.code ? `\n\n验证码（仅开发环境）: ${data.code}` : ''}`)
      setIsResending(false)
    } catch (err) {
      setError('重新发送失败，请重试')
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
              验证您的邮箱
            </h1>
            {emailParam ? (
              <p className="text-gray-600">
                验证码已发送至 <span className="font-semibold text-blue-600">{emailParam}</span>
              </p>
            ) : (
              <p className="text-gray-600">
                请输入您的邮箱和收到的 6 位验证码
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
                邮箱地址
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
                验证码
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-center text-2xl font-bold tracking-widest"
                placeholder="000000"
                maxLength={6}
              />
              <p className="mt-2 text-sm text-gray-500 text-center">
                验证码有效期：10 分钟
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
                  验证邮箱
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* Resend Code */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm mb-2">
              没有收到验证码？
            </p>
            <button
              onClick={handleResend}
              disabled={isResending}
              className="text-blue-600 hover:text-blue-700 font-semibold text-sm disabled:opacity-50"
            >
              {isResending ? '发送中...' : '重新发送验证码'}
            </button>
          </div>

          {/* Back to Sign In */}
          <div className="mt-6 text-center">
            <Link href="/auth/signin" className="text-gray-600 hover:text-gray-800 text-sm">
              返回登录
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>检查邮件可能需要几分钟时间</p>
          <p>请同时查看垃圾邮件文件夹</p>
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
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}

