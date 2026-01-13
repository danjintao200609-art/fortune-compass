import { createClient } from '@supabase/supabase-js'

// 添加默认值，确保即使环境变量加载失败也能正常初始化
// 使用类型断言绕过 TypeScript 的 import.meta.env 类型检查
const supabaseUrl = (import.meta as any).env.VITE_MEMFIRE_URL || ''
const supabaseAnonKey = (import.meta as any).env.VITE_MEMFIRE_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
