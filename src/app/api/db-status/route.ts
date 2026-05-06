import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const EXPECTED_TABLES = [
  'roles', 'users', 'categories', 'products', 'apps', 
  'ai_tools', 'academy_courses', 'earning_methods',
  'carts', 'cart_items', 'orders', 'order_items',
  'notifications', 'reviews', 'site_settings'
]

export async function GET() {
  const results: Record<string, { exists: boolean; count?: number; error?: string }> = {}
  
  for (const table of EXPECTED_TABLES) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      results[table] = error 
        ? { exists: false, error: error.message.substring(0, 80) }
        : { exists: true, count }
    } catch (e: any) {
      results[table] = { exists: false, error: e.message?.substring(0, 80) }
    }
  }

  const existing = Object.values(results).filter(r => r.exists).length
  const total = EXPECTED_TABLES.length

  return NextResponse.json({
    status: existing === total ? 'ready' : existing > 0 ? 'partial' : 'empty',
    tables: results,
    summary: { existing, missing: total - existing, total }
  })
}
