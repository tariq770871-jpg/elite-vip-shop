/**
 * Centralized Database Row Types
 *
 * Single source of truth for Supabase row interfaces.
 * Import from this file instead of redefining types locally.
 */

// ─── Roles ─────────────────────────────────────────────────────
export interface RoleRow {
  role_name?: string;
}

// ─── Users ─────────────────────────────────────────────────────
export interface SupabaseUserRow {
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  role_id?: string;
  /** When joined via `roles(role_name)`, Supabase returns this as an array of { role_name } */
  roles?: RoleRow[] | RoleRow | null;
}

export interface SupabaseProfileRow {
  user_id: string;
  is_admin: boolean;
}

// ─── Products ──────────────────────────────────────────────────
export interface SupabaseProductRow {
  product_id: string;
  name: string;
  description?: string;
  price: number;
  sale_price: number | null;
  availability: boolean;
  images?: string[] | null;
  category_name?: string;
  seller_id?: string | null;
  categories?: { name_ar: string };
}

// ─── Categories ────────────────────────────────────────────────
export interface SupabaseCategoryRow {
  name_ar: string;
}

// ─── Apps / Tools / Courses / Methods ──────────────────────────
export interface SupabaseAppRow {
  app_id: string;
  title: string;
  description: string;
  link?: string;
}

export interface SupabaseToolRow {
  tool_id: string;
  title: string;
  description: string;
  link?: string;
}

export interface SupabaseCourseRow {
  course_id: string;
  title: string;
  description: string;
}

export interface SupabaseMethodRow {
  method_id: string;
  title: string;
  description: string;
}

// ─── Orders ────────────────────────────────────────────────────
export interface SupabaseOrderItemRow {
  order_id: string;
  product_name: string;
  quantity: number;
  price: number;
  product_id?: string;
}

export interface SupabaseOrderRow {
  order_id: string;
  order_number: string;
  user_id: string;
  status: string;
  total_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
  delivery_type?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_address?: string | null;
  province?: string | null;
  district?: string | null;
  street?: string | null;
  landmark?: string | null;
  seller_id?: string | null;
  product_id?: string | null;
  product_name_snapshot?: string | null;
  unit_price?: number | null;
  quantity?: number | null;
  total_price?: number | null;
  /** Attached client-side by the orders GET endpoint (not a DB column) */
  items?: Array<{ name: string; quantity: number; price: number }> | Array<SupabaseOrderItemRow>;
}

// ─── Reviews ───────────────────────────────────────────────────
export interface SupabaseReviewRow {
  review_id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string;
  is_approved: boolean;
  is_verified?: boolean;
  created_at: string;
  customer_name?: string;
  user_name?: string;
  location?: string;
  product_name?: string;
  review_text?: string;
  users?: { name: string } | null;
}

// ─── Coupons ───────────────────────────────────────────────────
export interface SupabaseCouponRow {
  code: string;
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  valid_from: string | null;
  valid_until: string | null;
}

// ─── Order Insert / Update payloads ───────────────────────────
export interface OrderInsertPayload {
  order_number: string;
  user_id: string;
  status: string;
  total_amount: number;
  notes: string;
  delivery_type: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  province: string | null;
  district: string | null;
  street: string | null;
  landmark: string | null;
  seller_id: string | null;
  product_id: string | null;
  product_name_snapshot: string | null;
  unit_price: number | null;
  quantity: number;
  total_price: number;
}

// ─── Admin order row returned to dashboard client ─────────────
export interface AdminEnrichedOrder {
  order_id: string;
  order_number: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  status: string;
  total_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
  delivery_type: string | null;
  province: string | null;
  district: string | null;
  street: string | null;
  landmark: string | null;
  seller_id: string | null;
  product_id: string | null;
  product_name_snapshot: string | null;
  unit_price: number | null;
  quantity: number | null;
  total_price: number | null;
  items: Array<{ name: string; quantity: number; price: number }>;
  items_count: number;
}

// ─── Helper: extract role_name from a profiles/users join ────
export function extractRoleName(roles: unknown): string | undefined {
  if (!roles) return undefined;
  if (typeof roles !== 'object') return undefined;
  // Supabase may return `roles` as a single object or an array (depending on the join)
  if (Array.isArray(roles)) {
    const first = roles[0] as RoleRow | undefined;
    return typeof first?.role_name === 'string' ? first.role_name : undefined;
  }
  const r = roles as RoleRow;
  return typeof r.role_name === 'string' ? r.role_name : undefined;
}
