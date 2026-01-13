import { createClient } from '@supabase/supabase-js'

// 添加默认值，确保即使环境变量加载失败也能正常初始化
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vmnzlweewtzadycwnojg.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY || 'sb_publishable_WzU9-gRbJU2_g3A6nuPClA_YmcYUGY9'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
