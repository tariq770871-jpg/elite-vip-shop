import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET: Fetch all orders for admin (with user info and items)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    const status = searchParams.get("status");

    if (!supabase) {
      return NextResponse.json({ orders: [], total: 0 });
    }

    let query = supabase
      .from("orders")
      .select("order_id, order_number, user_id, status, total_amount, notes, created_at, updated_at")
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
    const { data: allItems } = await supabase
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
    const { data: usersData } = await supabase
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
      // Try to parse customer name from notes if not in users table
      let customerName = user?.name || "عميل";
      let customerPhone = user?.phone || "";
      if (o.notes) {
        const nameMatch = o.notes.match(/العميل:\s*([^|]+)/);
        const phoneMatch = o.notes.match(/الهاتف:\s*([^|]+)/);
        if (nameMatch) customerName = nameMatch[1].trim();
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
        items: itemsMap[o.order_id] || [],
        items_count: (itemsMap[o.order_id] || []).length,
      };
    });

    // Get total count for stats
    const { count: totalCount } = await supabase
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
  try {
    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json({ error: "معرف الطلب والحالة مطلوبان" }, { status: 400 });
    }

    const validStatuses = ["new", "reviewing", "confirmed", "shipped", "delivered", "cancelled", "refunded"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "حالة غير صالحة" }, { status: 400 });
    }

    if (!supabase) {
      return NextResponse.json({ success: true });
    }

    const { data, error } = await supabase
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
