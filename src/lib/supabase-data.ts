import { supabase } from '@/lib/supabase'
import { products, categories, appsData, aiToolsData, academyData, earningData } from '@/lib/mock-data'
import type { Product } from '@/lib/mock-data'

/* ============================================================
   Shared Types — Supabase row mappers
   ============================================================ */

interface SupabaseProductRow {
  product_id: string
  name: string
  description: string
  price: number
  sale_price: number | null
  availability: boolean
  images: string[] | null
  categories?: { name_ar: string }
}

function mapProductRow(p: SupabaseProductRow): Product {
  return {
    id: p.product_id,
    name: p.name,
    description: p.description,
    price: Number(p.price),
    salePrice: p.sale_price ? Number(p.sale_price) : undefined,
    category: p.categories?.name_ar || 'أخرى',
    images: Array.isArray(p.images) && p.images.length > 0 ? p.images : ['/products/product-1.webp'],
    availability: p.availability,
    seller: 'متجر النخبة',
  }
}

interface SupabaseCategoryRow {
  name_ar: string
}

interface SupabaseAppRow {
  app_id: string
  title: string
  description: string
  link?: string
}

interface SupabaseToolRow {
  tool_id: string
  title: string
  description: string
  link?: string
}

interface SupabaseCourseRow {
  course_id: string
  title: string
  description: string
}

interface SupabaseMethodRow {
  method_id: string
  title: string
  description: string
}

/* ============================================================
   Fetch with fallback to mock data
   ============================================================ */

// ── In-memory cache for getProducts() — prevents redundant Supabase calls ──
// Multiple components (HomeSection, ProductsSection, FlashDealsSection, SearchBar)
// all call getProducts() on mount. Without caching, the home page alone fires
// 3+ identical queries. This deduplicates them within a short TTL window.
let productsCache: Product[] | null = null;
let productsCacheTime = 0;
const PRODUCTS_CACHE_TTL = 30_000; // 30 seconds — stale data is acceptable for product listings

export async function getProducts() {
  try {
    // Return cached data if still fresh
    if (productsCache && (Date.now() - productsCacheTime) < PRODUCTS_CACHE_TTL) {
      return productsCache;
    }

    if (!supabase) return products
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name_ar)')
      .eq('availability', true)
      .order('created_at', { ascending: false })
    
    if (error || !data || data.length === 0) return products
    const result = data.map((p: SupabaseProductRow) => mapProductRow(p));

    // Update cache
    productsCache = result;
    productsCacheTime = Date.now();
    return result;
  } catch {
    return products
  }
}

// ── Fetch a single product by ID — avoids fetching ALL products for detail pages ──
// Previously, product-detail-section.tsx called getProducts() then .find(),
// transferring the entire products table to display a single item.
export async function getProductById(id: string) {
  try {
    if (!supabase) {
      // Fallback: search in mock data
      return products.find((p) => p.id === id) || null;
    }
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name_ar)')
      .eq('product_id', id)
      .single();

    if (error || !data) return null;
    return {
      id: data.product_id,
      name: data.name,
      description: data.description,
      price: Number(data.price),
      salePrice: data.sale_price ? Number(data.sale_price) : undefined,
      category: data.categories?.name_ar || 'أخرى',
      images: Array.isArray(data.images) && data.images.length > 0 ? data.images : ['/products/product-1.webp'],
      availability: data.availability,
      seller: 'متجر النخبة',
    };
  } catch {
    return null;
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
    return ['الكل', ...data.map((c: SupabaseCategoryRow) => c.name_ar)]
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
    return data.map((a: SupabaseAppRow) => ({
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
    return data.map((t: SupabaseToolRow) => ({
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
    return data.map((c: SupabaseCourseRow) => ({
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
    return data.map((m: SupabaseMethodRow) => ({
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
   DEPRECATED: getAllProducts() has been removed.
   Use /api/admin/products GET endpoint instead — the old
   function used the browser anon client without auth checks.
   ============================================================ */

/** Invalidate the products cache — call after admin product CRUD operations */
export function invalidateProductsCache(): void {
  productsCache = null;
  productsCacheTime = 0;
}

/* ============================================================
   App Management (Dashboard)
   ⚠️ REMOVED: These functions were insecure — they used the
   browser anon client with NO authentication or validation.
   Use secure server-side API routes instead.
   ============================================================ */
