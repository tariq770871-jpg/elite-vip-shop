import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase-server";
import { verifyAdmin } from "@/lib/admin-auth";
import { rateLimitResponse } from "@/lib/rate-limit";

/** Shape of an order row including chat-based ordering migration columns */
interface AdminOrderRow {
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
}

// GET: Fetch all orders for admin (with user info and items)
export async function GET(request: Request) {
  const blocked = rateLimitResponse(request, "api");
  if (blocked) return blocked;
  try {
    // Admin authorization check — only admins can view all orders (PII data)
    const { errorResponse } = await verifyAdmin(request);
    if (errorResponse) return errorResponse;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "100"), 1), 200);
    const status = searchParams.get("status");

    const serviceClient = getSupabaseServiceClient();
    if (!serviceClient) {
      return NextResponse.json({ orders: [], total: 0 });
    }

    let query = serviceClient
      .from("orders")
      .select("order_id, order_number, user_id, status, total_amount, notes, created_at, updated_at, delivery_type, customer_name, customer_phone, customer_address, province, district, street, landmark, seller_id, product_id, product_name_snapshot, unit_price, quantity, total_price")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error("Admin orders fetch error:", error);
      return NextResponse.json({ error: "فشل في جلب الطلبات" }, { status: 500 });
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({ orders: [], total: 0 });
    }

    // Fetch order items, users, and total count IN PARALLEL — they're independent
    const orderIds = orders.map((o) => o.order_id);
    const userIds = [...new Set(orders.map((o) => o.user_id))];

    const [itemsResult, usersResult, countResult] = await Promise.all([
      serviceClient
        .from("order_items")
        .select("order_id, product_name, quantity, price")
        .in("order_id", orderIds),
      serviceClient
        .from("users")
        .select("user_id, name, email, phone")
        .in("user_id", userIds),
      serviceClient
        .from("orders")
        .select("*", { count: "exact", head: true }),
    ]);

    const allItems = itemsResult.data;
    const usersData = usersResult.data;
    const totalCount = countResult.count;

    const itemsMap: Record<string, Array<{ name: string; quantity: number; price: number }>> = {};
    if (allItems) {
      for (const item of allItems) {
        if (!itemsMap[item.order_id]) itemsMap[item.order_id] = [];
        itemsMap[item.order_id].push({
          name: item.product_name,
          quantity: item.quantity,
          price: Number(item.price),
        });
      }
    }

    const usersMap: Record<string, { name: string; email: string; phone?: string }> = {};
    if (usersData) {
      for (const u of usersData) {
        usersMap[u.user_id] = { name: u.name, email: u.email, phone: u.phone };
      }
    }

    const enrichedOrders = orders.map((o: AdminOrderRow) => {
      const user = usersMap[o.user_id];
      // Use dedicated columns first, fallback to notes parsing
      let customerName = o.customer_name || user?.name || "عميل";
      let customerPhone = o.customer_phone || user?.phone || "";

      // If still no data, try parsing from notes
      if ((!customerName || customerName === "عميل") && o.notes) {
        const nameMatch = o.notes.match(/العميل:\s*([^|]+)/);
        if (nameMatch) customerName = nameMatch[1].trim();
      }
      if (!customerPhone && o.notes) {
        const phoneMatch = o.notes.match(/الهاتف:\s*([^|]+)/);
        if (phoneMatch) customerPhone = phoneMatch[1].trim();
      }

      return {
        order_id: o.order_id,
        order_number: o.order_number,
        user_id: o.user_id,
        customer_name: customerName,
        customer_email: user?.email || "",
        customer_phone: customerPhone,
        status: o.status,
        total_amount: Number(o.total_amount),
        notes: o.notes,
        created_at: o.created_at,
        updated_at: o.updated_at,
        // New fields from chat-based ordering
        delivery_type: o.delivery_type || null,
        province: o.province || null,
        district: o.district || null,
        street: o.street || null,
        landmark: o.landmark || null,
        seller_id: o.seller_id || null,
        product_id: o.product_id || null,
        product_name_snapshot: o.product_name_snapshot || null,
        unit_price: o.unit_price || null,
        quantity: o.quantity || null,
        total_price: o.total_price || null,
        items: itemsMap[o.order_id] || [],
        items_count: (itemsMap[o.order_id] || []).length,
      };
    });

    // Total count was already fetched in parallel above (countResult)
    const totalRevenue = enrichedOrders.reduce((sum, o) => sum + o.total_amount, 0);

    return NextResponse.json({
      orders: enrichedOrders,
      total: totalCount || 0,
      revenue: totalRevenue,
    });
  } catch (error) {
    console.error("Admin orders API error:", error);
    return NextResponse.json({ error: "حدث خطأ في جلب الطلبات" }, { status: 500 });
  }
}

// PATCH: Update order status
export async function PATCH(request: Request) {
  const blocked = rateLimitResponse(request, "api");
  if (blocked) return blocked;
  try {
    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json({ error: "معرف الطلب والحالة مطلوبان" }, { status: 400 });
    }

    // Updated valid statuses for chat-based ordering system
    const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "حالة غير صالحة" }, { status: 400 });
    }

    // Admin auth check — consistent with other admin routes
    const { errorResponse: adminErr } = await verifyAdmin(request);
    if (adminErr) return adminErr;

    const serviceClient = getSupabaseServiceClient();
    if (!serviceClient) {
      return NextResponse.json({ success: true });
    }

    const { data, error } = await serviceClient
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("order_id", orderId)
      .select()
      .single();

    if (error) {
      console.error("Order status update error:", error);
      return NextResponse.json({ error: "فشل في تحديث حالة الطلب" }, { status: 500 });
    }

    return NextResponse.json({ success: true, order: data });
  } catch (error) {
    console.error("Admin order patch error:", error);
    return NextResponse.json({ error: "حدث خطأ في تحديث الطلب" }, { status: 500 });
  }
}
