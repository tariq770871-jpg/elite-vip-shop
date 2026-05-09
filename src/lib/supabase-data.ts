import { supabase } from '@/lib/supabase'
import { products, categories, appsData, aiToolsData, academyData, earningData } from '@/lib/mock-data'

/* ============================================================
   Fetch with fallback to mock data
   ============================================================ */

export async function getProducts() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('availability', true)
      .order('created_at', { ascending: false })
    
    if (error || !data || data.length === 0) return products
    return data.map((p: any) => ({
      id: p.product_id,
      name: p.name,
      description: p.description,
      price: Number(p.price),
      salePrice: p.sale_price ? Number(p.sale_price) : undefined,
      category: p.category_name || 'أخرى',
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
   ============================================================ */

export async function getAllProducts() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error || !data) return []
    return data.map((p: any) => ({
      id: p.product_id,
      name: p.name,
      description: p.description,
      price: Number(p.price),
      salePrice: p.sale_price ? Number(p.sale_price) : undefined,
      category: p.category_name || 'أخرى',
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
   ============================================================ */

export async function addProduct(product: {
  name: string
  description: string
  price: number
  sale_price?: number
  category_id?: string
  availability?: boolean
}) {
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateProduct(id: string, updates: Record<string, any>) {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('product_id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteProduct(id: string) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('product_id', id)
  
  if (error) throw error
}

/* ============================================================
   App Management (Dashboard)
   ============================================================ */

export async function addApp(app: {
  title: string
  description: string
  link?: string
  platform?: string
}) {
  const { data, error } = await supabase
    .from('apps')
    .insert(app)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateApp(id: string, updates: Record<string, any>) {
  const { data, error } = await supabase
    .from('apps')
    .update(updates)
    .eq('app_id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteApp(id: string) {
  const { error } = await supabase
    .from('apps')
    .delete()
    .eq('app_id', id)
  
  if (error) throw error
}
