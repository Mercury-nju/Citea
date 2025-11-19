import { createClient } from '@supabase/supabase-js'

// 环境变量
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Supabase] 警告: Supabase URL 或 Anon Key 未配置')
}

// 客户端 Supabase 实例（用于前端和一般后端操作）
export function createSupabaseClient() {
    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase 配置不完整: 缺少 URL 或 Anon Key')
    }

    return createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
        }
    })
}

// 服务端 Supabase 实例（用于管理员操作，如创建用户）
export function createSupabaseAdmin() {
    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase 管理员配置不完整: 缺少 URL 或 Service Role Key')
    }

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        }
    })
}

// 默认导出客户端实例
export const supabase = supabaseUrl && supabaseAnonKey
    ? createSupabaseClient()
    : null
