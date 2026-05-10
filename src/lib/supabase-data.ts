import { supabase } from '@/lib/supabase'
import { products, categories, appsData, aiToolsData, academyData, earningData } from '@/lib/mock-data'

/* ============================================================
   Fetch with fallback to mock data
   ============================================================ */

export async function getProducts() {
  try {
    if (!supabase) return products
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name_ar)')
      .eq('availability', true)
      .order('created_at', { ascending: false })
    
    if (error || !data || data.length === 0) return products
    return data.map((p: any) => ({
      id: p.product_id,
      name: p.name,
      description: p.description,
      price: Number(p.price),
      salePrice: p.sale_price ? Number(p.sale_price) : undefined,
      category: p.categories?.name_ar || 'أخرى',
      images: Array.isArray(p.images) && p.images.length > 0 ? p.images : ['/products/product-1.webp'],
      availability: p.availability,
      seller: 'متجر النخبة',
    }))
  } catch {
    return products
  }
}

export async function getCategories() {
  try {
    if (!supabase) return categories
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    
    if (error || !data || data.length === 0) return categories
    return ['الكل', ...data.map((c: any) => c.name_ar)]
  } catch {
    return categories
  }
}

export async function getApps() {
  try {
    if (!supabase) return appsData
    const { data, error } = await supabase
      .from('apps')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    
    if (error || !data || data.length === 0) return appsData
    return data.map((a: any) => ({
      id: a.app_id,
      title: a.title,
      description: a.description,
      icon: '',
      link: a.link || '#',
    }))
  } catch {
    return appsData
  }
}

export async function getAiTools() {
  try {
    if (!supabase) return aiToolsData
    const { data, error } = await supabase
      .from('ai_tools')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    
    if (error || !data || data.length === 0) return aiToolsData
    return data.map((t: any) => ({
      id: t.tool_id,
      title: t.title,
      description: t.description,
      icon: '',
      link: t.link || '#',
    }))
  } catch {
    return aiToolsData
  }
}

export async function getAcademyCourses() {
  try {
    if (!supabase) return academyData
    const { data, error } = await supabase
      .from('academy_courses')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    
    if (error || !data || data.length === 0) return academyData
    return data.map((c: any) => ({
      id: c.course_id,
      title: c.title,
      description: c.description,
      icon: '',
    }))
  } catch {
    return academyData
  }
}

export async function getEarningMethods() {
  try {
    if (!supabase) return earningData
    const { data, error } = await supabase
      .from('earning_methods')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    
    if (error || !data || data.length === 0) return earningData
    return data.map((m: any) => ({
      id: m.method_id,
      title: m.title,
      description: m.description,
      icon: '',
    }))
  } catch {
    return earningData
  }
}

/* ============================================================
   Fetch All Products (Admin Dashboard)
   ⚠️ DEPRECATED: Use /api/admin/products GET endpoint instead.
   This function uses the anon client with no auth checks.
   ============================================================ */

/** @deprecated Use fetch('/api/admin/products') instead — this uses the anon client without auth */
export async function getAllProducts() {
  console.warn('[DEPRECATED] getAllProducts() — use /api/admin/products GET endpoint instead');
  try {
    if (!supabase) return []
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name_ar)')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error || !data) return []
    return data.map((p: any) => ({
      id: p.product_id,
      name: p.name,
      description: p.description,
      price: Number(p.price),
      salePrice: p.sale_price ? Number(p.sale_price) : undefined,
      category: p.categories?.name_ar || 'أخرى',
      images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [],
      availability: p.availability,
      seller: 'متجر النخبة',
      raw: p,
    }))
  } catch {
    return []
  }
}

/* ============================================================
   Product Management (Dashboard)
   ⚠️ REMOVED: These functions were insecure — they used the
   browser anon client with NO authentication or validation.
   Use the secure /api/admin/products endpoints instead:
     - POST /api/admin/products  → addProduct
     - PUT /api/admin/products   → updateProduct
     - DELETE /api/admin/products → deleteProduct
   ============================================================ */

/* ============================================================
   App Management (Dashboard)
   ⚠️ REMOVED: These functions were insecure — they used the
   browser anon client with NO authentication or validation.
   Use secure server-side API routes instead.
   ============================================================ */
