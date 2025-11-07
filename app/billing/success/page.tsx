'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Loader2 } from 'lucide-react'

export default function SuccessPage() {
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(true)
  const [userUpdated, setUserUpdated] = useState(false)

  useEffect(() => {
    // 刷新用户数据以确保会员权益立即生效
    const refreshUserData = async () => {
      try {
        const token = localStorage.getItem('citea_auth_token')
        const savedUser = localStorage.getItem('citea_user')
        let userEmail: string | null = null
        
        // 如果已登录，使用 token
        if (token) {
          const res = await fetch('/api/auth/me', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          const data = await res.json()
          if (data.user) {
            localStorage.setItem('citea_user', JSON.stringify(data.user))
            setUserUpdated(true)
            console.log('✅ User data refreshed:', data.user)
            return
          }
        }
        
        // 如果未登录，尝试从 URL 参数或 localStorage 获取邮箱
        if (savedUser) {
          try {
            const user = JSON.parse(savedUser)
            userEmail = user.email
          } catch (e) {
            console.error('Error parsing saved user:', e)
          }
        }
        
        // 从 URL 参数获取邮箱（支付页面可能传递）
        const urlParams = new URLSearchParams(window.location.search)
        const emailParam = urlParams.get('email')
        if (emailParam) {
          userEmail = emailParam
        }
        
        // 如果有邮箱但未登录，提示用户登录
        if (userEmail && !token) {
          console.log('Payment completed for:', userEmail)
          console.log('Please login with this email to access your subscription')
        }
      } catch (error) {
        console.error('Error refreshing user data:', error)
      } finally {
        setIsRefreshing(false)
      }
    }

    // 立即刷新一次
    refreshUserData()

    // 每2秒刷新一次，最多刷新10次（20秒），给 webhook 更多时间处理
    let refreshCount = 0
    const interval = setInterval(() => {
      refreshCount++
      if (refreshCount < 10) {
        refreshUserData()
      } else {
        clearInterval(interval)
        setIsRefreshing(false)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="max-w-lg text-center">
        {isRefreshing ? (
          <>
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Payment successful</h1>
            <p className="text-gray-600 mb-6">Activating your subscription... Please wait a moment.</p>
          </>
        ) : (
          <>
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Payment successful!</h1>
            <p className="text-gray-600 mb-4">
              {userUpdated 
                ? 'Your subscription is now active. All premium features are available.'
                : 'Your subscription is being activated. Please wait a moment...'}
            </p>
            {!userUpdated && (
              <p className="text-sm text-gray-500 mb-6">
                If you paid with an email that hasn't been registered, your account has been automatically created. 
                You can login with that email to access your subscription.
              </p>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  // 再次刷新用户数据
                  const token = localStorage.getItem('citea_auth_token')
                  if (token) {
                    fetch('/api/auth/me', {
                      method: 'GET',
                      headers: {
                        'Authorization': `Bearer ${token}`
                      }
                    })
                    .then(res => res.json())
                    .then(data => {
                      if (data.user) {
                        localStorage.setItem('citea_user', JSON.stringify(data.user))
                      }
                      router.push('/dashboard')
                    })
                  } else {
                    router.push('/dashboard')
                  }
                }}
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => router.push('/auth/signin')}
                className="inline-block bg-gray-200 text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Login
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  )
}


