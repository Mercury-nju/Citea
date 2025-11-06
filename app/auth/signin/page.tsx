'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Logo from '@/components/Logo'
import { Mail, Lock, ArrowRight, Check } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function SignInPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      
      const data = await res.json()
      
      if (!res.ok || !data.success || !data.token) {
        setError(data.error || '登录失败')
        setIsLoading(false)
        return
      }
      
      // 保存 token 和用户信息到 localStorage
      localStorage.setItem('citea_auth_token', data.token)
      localStorage.setItem('citea_user', JSON.stringify(data.user))
      
      // 立即跳转
      window.location.href = '/dashboard'
      
    } catch (err) {
      setError('登录失败: ' + (err as Error).message)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Promotional Content */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-12 flex-col justify-between text-white">
        <div>
          <Link href="/">
            <Logo variant="dark" />
          </Link>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-4">
              {t.auth.signIn.heroTitle || 'Welcome Back to Citea'}
            </h1>
            <p className="text-xl text-blue-100">
              {t.auth.signIn.heroSubtitle || 'Continue your research journey with confidence'}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-400 flex items-center justify-center mt-1">
                <Check size={16} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  {t.auth.signIn.feature1Title || 'Instant Citation Verification'}
                </h3>
                <p className="text-blue-100">
                  {t.auth.signIn.feature1Desc || 'Check up to 300 characters of citations at once'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-400 flex items-center justify-center mt-1">
                <Check size={16} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  {t.auth.signIn.feature2Title || 'Powerful Source Discovery'}
                </h3>
                <p className="text-blue-100">
                  {t.auth.signIn.feature2Desc || 'Search up to 5000 characters to find credible sources'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-400 flex items-center justify-center mt-1">
                <Check size={16} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  {t.auth.signIn.feature3Title || 'Smart AI Assistant'}
                </h3>
                <p className="text-blue-100">
                  {t.auth.signIn.feature3Desc || 'Get writing help and generate research outlines'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-blue-100 text-sm">
          © 2024 Citea. All rights reserved.
        </div>
      </div>

      {/* Right Side - Sign In Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link href="/">
              <Logo />
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {t.auth.signIn.title}
              </h2>
              <p className="text-gray-600">
                {t.auth.signIn.subtitle}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.auth.signIn.emailLabel}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder={t.auth.signIn.emailPlaceholder}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t.auth.signIn.passwordLabel}
                  </label>
                  <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
                    {t.auth.signIn.forgotPassword || 'Forgot password?'}
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder={t.auth.signIn.passwordPlaceholder}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {t.auth.signIn.signInButton}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <p className="mt-6 text-center text-sm text-gray-600">
              {t.auth.signIn.noAccount}{' '}
              <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700 font-semibold">
                {t.auth.signIn.signUpLink}
              </Link>
            </p>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            {t.auth.signIn.termsPrefix}{' '}
            <Link href="/terms" className="text-gray-700 hover:underline">{t.auth.signIn.terms}</Link>
            {' '}{t.auth.signIn.and}{' '}
            <Link href="/privacy" className="text-gray-700 hover:underline">{t.auth.signIn.privacy}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
