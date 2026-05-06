import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nssmnftpcnkrcbtzjpuf.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_cA-v6NV8vwpaNefAgXmUNA_cQ-iIJuG'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
