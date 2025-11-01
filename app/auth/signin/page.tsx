'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Logo from '@/components/Logo'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function SignInPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    console.log('登录尝试:', email)
    
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // 重要：确保包含 cookie
        body: JSON.stringify({ email, password }),
      })
      
      console.log('登录响应状态:', res.status)
      console.log('响应头 Set-Cookie:', res.headers.get('Set-Cookie'))
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        console.error('登录错误:', data)
        
        // 如果需要验证邮箱
        if (data.needsVerification && data.email) {
          if (confirm(data.error + '\n\n点击确定前往验证页面')) {
            router.push(`/auth/verify-email?email=${encodeURIComponent(data.email)}`)
          }
        } else {
          alert(data.error || '登录失败，请检查邮箱和密码')
        }
        setIsLoading(false)
        return
      }
      
      const data = await res.json()
      console.log('✅ 登录成功:', JSON.stringify(data, null, 2))
      
      // 检查响应头中的 Set-Cookie
      const setCookieHeader = res.headers.get('Set-Cookie')
      console.log('📋 Set-Cookie 响应头存在:', setCookieHeader ? '✅ 是' : '❌ 否')
      if (setCookieHeader) {
        console.log('📋 Set-Cookie 完整内容:', setCookieHeader)
        // 检查是否包含我们的 cookie
        if (setCookieHeader.includes('citea_auth')) {
          console.log('✅ Cookie 名称正确 (citea_auth)')
        } else {
          console.warn('⚠️ Cookie 名称不匹配，不包含 citea_auth')
        }
      } else {
        console.error('❌ Set-Cookie 响应头未找到！这是问题所在！')
      }
      
      // 等待一下，然后检查 cookie 是否在浏览器中
      setTimeout(() => {
        const cookies = document.cookie
        const hasCookie = cookies.includes('citea_auth')
        console.log('🍪 跳转前浏览器 Cookie 检查:', {
          hasCiteaAuth: hasCookie,
          allCookies: cookies || '(empty)'
        })
        
        // 直接跳转
        console.log('🚀 跳转到 /dashboard')
        window.location.href = '/dashboard'
      }, 100) // 短暂等待让浏览器处理 cookie
    } catch (err) {
      console.error('登录异常:', err)
      alert('登录失败: ' + (err as Error).message)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex justify-center mb-8">
          <Logo />
        </Link>

        {/* Sign In Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            {t.auth.signIn.title}
          </h1>
          <p className="text-gray-600 mb-8 text-center">
            {t.auth.signIn.subtitle}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.auth.signIn.emailLabel}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder={t.auth.signIn.emailPlaceholder}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.auth.signIn.passwordLabel}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder={t.auth.signIn.passwordPlaceholder}
                />
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-600">{t.auth.signIn.rememberMe}</span>
              </label>
              <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
                {t.auth.signIn.forgotPassword}
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {t.auth.signIn.signInButton}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">{t.auth.signIn.orContinueWith}</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-sm font-medium text-gray-700">{t.auth.signIn.google}</span>
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span className="text-sm font-medium text-gray-700">{t.auth.signIn.github}</span>
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-gray-600">
            {t.auth.signIn.noAccount}{' '}
            <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700 font-semibold">
              {t.auth.signIn.signUpLink}
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-8">
          {t.auth.signIn.termsPrefix}{' '}
          <Link href="/terms" className="text-gray-700 hover:underline">{t.auth.signIn.terms}</Link>
          {' '}{t.auth.signIn.and}{' '}
          <Link href="/privacy" className="text-gray-700 hover:underline">{t.auth.signIn.privacy}</Link>
        </p>
      </div>
    </div>
  )
}

