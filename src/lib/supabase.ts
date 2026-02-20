import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// للاستخدام العام (المنيو للزوار)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// للداشبورد - يُستخدم فقط في API Routes (server-side)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
