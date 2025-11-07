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
          }
        }
      } catch (error) {
        console.error('Error refreshing user data:', error)
      } finally {
        setIsRefreshing(false)
      }
    }

    // 立即刷新一次
    refreshUserData()

    // 每2秒刷新一次，最多刷新5次（10秒）
    let refreshCount = 0
    const interval = setInterval(() => {
      refreshCount++
      if (refreshCount < 5) {
        refreshUserData()
      } else {
        clearInterval(interval)
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
            <p className="text-gray-600 mb-6">
              {userUpdated 
                ? 'Your subscription is now active. All premium features are available.'
                : 'Your subscription is being activated. If you don\'t see the changes, please refresh the page.'}
            </p>
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
          </>
        )}
      </div>
    </main>
  )
}


