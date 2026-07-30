import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase-server";
import { verifyAdmin } from "@/lib/admin-auth";
import { rateLimitResponse } from "@/lib/rate-limit";

// Allowed fields for product insert/update — prevents arbitrary column modification
const ALLOWED_PRODUCT_FIELDS = [
  "name", "description", "price", "sale_price", "category_name",
  "category_id", "availability", "images",
];

function sanitizeProductData(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const key of ALLOWED_PRODUCT_FIELDS) {
    if (data[key] !== undefined) {
      sanitized[key] = data[key];
    }
  }
  return sanitized;
}

function validateProductData(data: Record<string, unknown>): string | null {
  if (!data.name || typeof data.name !== "string" || !data.name.trim()) {
    return "اسم المنتج مطلوب";
  }
  if (data.price === undefined || data.price === null || Number(data.price) < 0) {
    return "السعر مطلوب ويجب أن يكون رقماً موجباً";
  }
  if (data.sale_price !== undefined && data.sale_price !== null && Number(data.sale_price) < 0) {
    return "سعر الخصم يجب أن يكون رقماً موجباً";
  }
  if (data.sale_price !== undefined && data.sale_price !== null && Number(data.sale_price) >= Number(data.price)) {
    return "سعر الخصم يجب أن يكون أقل من السعر الأصلي";
  }
  return null;
}

// GET: List all products for admin dashboard (admin only)
export async function GET(request: Request) {
  const blocked = rateLimitResponse(request, "api");
  if (blocked) return blocked;
  try {
    const { errorResponse } = await verifyAdmin(request);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "100"), 1), 500);
    const offset = Math.max(parseInt(searchParams.get("offset") || "0"), 0);
    const includeCount = searchParams.get("count") === "true";

    const serviceClient = getSupabaseServiceClient();
    if (!serviceClient) {
      return NextResponse.json({ error: "خدمة قاعدة البيانات غير متاحة" }, { status: 503 });
    }

    const query = serviceClient
      .from("products")
      .select("*", { count: includeCount ? "exact" : undefined })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Admin products fetch error:", error);
      return NextResponse.json({ error: "فشل في جلب المنتجات" }, { status: 500 });
    }

    return NextResponse.json({
      products: data || [],
      total: count || (data?.length || 0),
    });
  } catch {
    return NextResponse.json({ error: "حدث خطأ في جلب المنتجات" }, { status: 500 });
  }
}

// POST: Add a new product (admin only)
export async function POST(request: Request) {
  const blocked = rateLimitResponse(request, "api");
  if (blocked) return blocked;
  try {
    const { errorResponse } = await verifyAdmin(request);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const validationError = validateProductData(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const sanitizedData = sanitizeProductData(body);
    sanitizedData.availability = body.availability !== undefined ? Boolean(body.availability) : true;

    const serviceClient = getSupabaseServiceClient();
    if (!serviceClient) {
      return NextResponse.json({ error: "خدمة غير متاحة" }, { status: 503 });
    }

    const { data: product, error: insertError } = await serviceClient
      .from("products")
      .insert(sanitizedData)
      .select()
      .single();

    if (insertError) {
      console.error("Product insert error:", insertError);
      return NextResponse.json({ error: "فشل في إضافة المنتج" }, { status: 500 });
    }

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "حدث خطأ في إضافة المنتج" }, { status: 500 });
  }
}

// PUT: Update a product (admin only)
export async function PUT(request: Request) {
  const blocked = rateLimitResponse(request, "api");
  if (blocked) return blocked;
  try {
    const { errorResponse } = await verifyAdmin(request);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "معرّف المنتج مطلوب" }, { status: 400 });
    }

    const sanitizedData = sanitizeProductData(updates);
    if (Object.keys(sanitizedData).length === 0) {
      return NextResponse.json({ error: "لا توجد بيانات للتحديث" }, { status: 400 });
    }

    if (sanitizedData.price !== undefined && Number(sanitizedData.price) < 0) {
      return NextResponse.json({ error: "السعر يجب أن يكون رقماً موجباً" }, { status: 400 });
    }

    const serviceClient = getSupabaseServiceClient();
    if (!serviceClient) {
      return NextResponse.json({ error: "خدمة غير متاحة" }, { status: 503 });
    }

    const { data: product, error: updateError } = await serviceClient
      .from("products")
      .update(sanitizedData)
      .eq("product_id", id)
      .select()
      .single();

    if (updateError || !product) {
      return NextResponse.json({ error: "المنتج غير موجود أو فشل التحديث" }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch {
    return NextResponse.json({ error: "حدث خطأ في تحديث المنتج" }, { status: 500 });
  }
}

// DELETE: Delete a product (admin only)
export async function DELETE(request: Request) {
  const blocked = rateLimitResponse(request, "api");
  if (blocked) return blocked;
  try {
    const { errorResponse } = await verifyAdmin(request);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "معرّف المنتج مطلوب" }, { status: 400 });
    }

    const serviceClient = getSupabaseServiceClient();
    if (!serviceClient) {
      return NextResponse.json({ error: "خدمة غير متاحة" }, { status: 503 });
    }

    const { error: deleteError } = await serviceClient
      .from("products")
      .delete()
      .eq("product_id", id);

    if (deleteError) {
      return NextResponse.json({ error: "فشل في حذف المنتج" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "حدث خطأ في حذف المنتج" }, { status: 500 });
  }
}
