'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Logo from '@/components/Logo'
import { Mail, Lock, User, ArrowRight } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function SignUpPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json().catch(() => ({}))
      
      if (!res.ok) {
        let errorMsg = data.error || 'Sign up failed'
        if (errorMsg === 'Internal error' && data.details?.includes('Database not configured')) {
          errorMsg = '⚠️ 数据库未配置。生产环境需要设置 Vercel KV。\n\n请按照 README.md 中的步骤配置数据库。'
        }
        alert(errorMsg)
        setIsLoading(false)
        return
      }
      
      // 注册成功，跳转到验证页面
      if (data.needsVerification) {
        // 直接跳转到验证页面，不显示 alert
        // 验证页面会显示相关提示
        router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`)
      } else {
        // 旧用户或不需要验证
        router.push('/dashboard')
      }
    } catch (err) {
      alert('Sign up failed')
    } finally {
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

        {/* Sign Up Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            {t.auth.signUp.title}
          </h1>
          <p className="text-gray-600 mb-8 text-center">
            {t.auth.signUp.subtitle}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.auth.signUp.nameLabel}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder={t.auth.signUp.namePlaceholder}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.auth.signUp.emailLabel}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder={t.auth.signUp.emailPlaceholder}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.auth.signUp.passwordLabel}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder={t.auth.signUp.passwordPlaceholder}
                  minLength={8}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">{t.auth.signUp.passwordHint}</p>
            </div>

            {/* Terms */}
            <label className="flex items-start">
              <input type="checkbox" required className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1" />
              <span className="ml-2 text-sm text-gray-600">
                {t.auth.signUp.agreePrefix}{' '}
                <Link href="/terms" className="text-blue-600 hover:underline">{t.auth.signUp.termsOfService}</Link>
                {' '}{t.auth.signUp.and}{' '}
                <Link href="/privacy" className="text-blue-600 hover:underline">{t.auth.signUp.privacyPolicy}</Link>
              </span>
            </label>

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
                  {t.auth.signUp.createButton}
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
          </div>

          {/* Sign In Link */}
          <p className="text-center text-gray-600">
            {t.auth.signUp.hasAccount}{' '}
            <Link href="/auth/signin" className="text-blue-600 hover:text-blue-700 font-semibold">
              {t.auth.signUp.signInLink}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
