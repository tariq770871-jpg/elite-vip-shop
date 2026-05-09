import { NextResponse } from "next/server";
import { verifyAuthToken, getSupabaseServiceClient } from "@/lib/supabase-server";
import { rateLimitResponse } from "@/lib/rate-limit";

// GET: Fetch all orders for admin (with user info and items)
export async function GET(request: Request) {
  const blocked = rateLimitResponse(request, "api");
  if (blocked) return blocked;
  try {
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

    // Fetch order items for all orders at once
    const orderIds = orders.map((o) => o.order_id);
    const { data: allItems } = await serviceClient
      .from("order_items")
      .select("order_id, product_name, quantity, price")
      .in("order_id", orderIds);

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

    // Fetch users info
    const userIds = [...new Set(orders.map((o) => o.user_id))];
    const { data: usersData } = await serviceClient
      .from("users")
      .select("user_id, name, email, phone")
      .in("user_id", userIds);

    const usersMap: Record<string, { name: string; email: string; phone?: string }> = {};
    if (usersData) {
      for (const u of usersData) {
        usersMap[u.user_id] = { name: u.name, email: u.email, phone: u.phone };
      }
    }

    const enrichedOrders = orders.map((o) => {
      const user = usersMap[o.user_id];
      // Use dedicated columns first, fallback to notes parsing
      let customerName = (o as any).customer_name || user?.name || "عميل";
      let customerPhone = (o as any).customer_phone || user?.phone || "";

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
        delivery_type: (o as any).delivery_type || null,
        province: (o as any).province || null,
        district: (o as any).district || null,
        street: (o as any).street || null,
        landmark: (o as any).landmark || null,
        seller_id: (o as any).seller_id || null,
        product_id: (o as any).product_id || null,
        product_name_snapshot: (o as any).product_name_snapshot || null,
        unit_price: (o as any).unit_price || null,
        quantity: (o as any).quantity || null,
        total_price: (o as any).total_price || null,
        items: itemsMap[o.order_id] || [],
        items_count: (itemsMap[o.order_id] || []).length,
      };
    });

    // Get total count for stats
    const { count: totalCount } = await serviceClient
      .from("orders")
      .select("*", { count: "exact", head: true });

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

    // Admin auth check
    const { errorResponse: adminErr } = await (async () => {
      const { user, error: authError } = await verifyAuthToken(request);
      if (authError || !user) return { errorResponse: NextResponse.json({ error: "غير مصرح به" }, { status: 401 }) };
      const sc = getSupabaseServiceClient();
      if (!sc) return { errorResponse: NextResponse.json({ error: "خدمة المصادقة غير متاحة" }, { status: 503 }) };
      const { data: profile } = await sc.from("users").select("role_id, roles(role_name)").eq("email", user.email).single();
      const rn = (profile?.roles as { role_name?: string } | null)?.role_name;
      if (rn !== "admin") return { errorResponse: NextResponse.json({ error: "ممنوع" }, { status: 403 }) };
      return { errorResponse: null };
    })();
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
