/**
 * Supabase Browser Client
 *
 * Uses @supabase/ssr createBrowserClient which automatically
 * syncs auth sessions to cookies. This enables:
 *   - Middleware to read sessions from cookies
 *   - Server Components to read sessions from cookies
 *   - Fallback auth for API routes when Authorization header is missing
 *
 * The client is a drop-in replacement for createClient from @supabase/supabase-js.
 * All existing code using `supabase.auth.*` continues to work unchanged.
 */

import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ [Supabase Browser] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
    'The Supabase client will be null — features relying on Supabase will use fallback data. ' +
    'Please set these environment variables. See .env.example for reference.'
  )
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createBrowserClient(supabaseUrl, supabaseAnonKey)
  : null
