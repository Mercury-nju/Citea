import { NextResponse } from 'next/server'
import { clearAdminCookie } from '@/lib/adminAuth'

export async function POST() {
  try {
    await clearAdminCookie()
    return NextResponse.json({ success: true, message: '已退出登录' })
  } catch (error) {
    return NextResponse.json({ error: '退出失败' }, { status: 500 })
  }
}

