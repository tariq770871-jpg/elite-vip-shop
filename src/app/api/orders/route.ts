import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendOrderNotification } from "@/lib/telegram";
import { verifyAuthToken } from "@/lib/supabase-server";
import { rateLimitResponse } from "@/lib/rate-limit";

// POST: Save a new order to Supabase
export async function POST(request: Request) {
  const blocked = rateLimitResponse(request, "api");
  if (blocked) return blocked;
  try {
    // Auth check: verify user is authenticated
    const { user, error: authError } = await verifyAuthToken(request);
    if (authError || !user) {
      return NextResponse.json({ error: "غير مصرح به" }, { status: 401 });
    }

    const body = await request.json();
    const { items, notes, paymentMethod, customerName, customerPhone, customerAddress, discount, couponCode } = body;

    // Use authenticated user's ID instead of client-sent userId
    const userId = user.id;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "بيانات غير مكتملة" }, { status: 400 });
    }

    if (!supabase) {
      return NextResponse.json({ success: true, orderId: "local", orderNumber: "N/A" });
    }

    // Generate order number using crypto.randomUUID() for uniqueness
    const orderNumber = `ORD-${crypto.randomUUID().substring(0, 8).toUpperCase()}`;

    // Calculate total server-side from items instead of trusting client-sent total
    // TODO: Server-side price calculation should be implemented when product prices are available from DB
    const calculatedTotal = items.reduce((sum: number, item: { id: string; name: string; quantity: number; price: number; salePrice?: number }) => {
      const effectivePrice = item.salePrice && item.salePrice < item.price ? item.salePrice : item.price;
      return sum + effectivePrice * item.quantity;
    }, 0);

    // Insert order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        user_id: userId,
        status: "new",
        total_amount: calculatedTotal,
        notes: notes || `طريقة الدفع: ${paymentMethod === "whatsapp" ? "واتساب" : "رسالة نصية"}${customerName ? ` | العميل: ${customerName}` : ""}${customerPhone ? ` | الهاتف: ${customerPhone}` : ""}${customerAddress ? ` | العنوان: ${customerAddress}` : ""}${discount ? ` | خصم: ${discount} ر.ي` : ""}${couponCode ? ` | كود: ${couponCode}` : ""}`,
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order insert error:", orderError);
      return NextResponse.json({ error: "فشل في حفظ الطلب" }, { status: 500 });
    }

    // Insert order items
    const orderItems = items.map((item: { id: string; name: string; quantity: number; price: number; salePrice?: number }) => {
      const effectivePrice = item.salePrice && item.salePrice < item.price ? item.salePrice : item.price;
      return {
        order_id: order.order_id,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        price: effectivePrice,
      };
    });

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Order items insert error:", itemsError);
      return NextResponse.json({ error: "فشل في حفظ بنود الطلب" }, { status: 500 });
    }

    // Send Telegram notification (non-blocking)
    sendOrderNotification({
      orderNumber: order.order_number,
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      customerAddress: customerAddress || undefined,
      total: calculatedTotal,
      items: orderItems.map((i: { product_name: string; quantity: number; price: number }) => ({
        name: i.product_name,
        quantity: i.quantity,
        price: i.price,
      })),
      paymentMethod,
      couponCode: couponCode || undefined,
      discount: discount || undefined,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      orderId: order.order_id,
      orderNumber: order.order_number,
    });
  } catch (error) {
    console.error("Order API error:", error);
    return NextResponse.json({ error: "حدث خطأ في حفظ الطلب" }, { status: 500 });
  }
}

// GET: Fetch orders for a user
export async function GET(request: Request) {
  const blocked = rateLimitResponse(request, "api");
  if (blocked) return blocked;
  try {
    // Auth check: verify user is authenticated
    const { user, error: authError } = await verifyAuthToken(request);
    if (authError || !user) {
      return NextResponse.json({ error: "غير مصرح به" }, { status: 401 });
    }

    // Use authenticated user's ID — users can only access their own orders
    const userId = user.id;

    if (!supabase) {
      return NextResponse.json({ orders: [] });
    }

    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Orders fetch error:", error);
      return NextResponse.json({ error: "فشل في جلب الطلبات" }, { status: 500 });
    }

    // Fetch order items for each order
    if (orders && orders.length > 0) {
      const orderIds = orders.map((o) => o.order_id);
      const { data: allItems, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .in("order_id", orderIds);

      if (!itemsError && allItems) {
        const itemsMap: Record<string, Array<{ name: string; quantity: number; price: number }>> = {};
        for (const item of allItems) {
          if (!itemsMap[item.order_id]) {
            itemsMap[item.order_id] = [];
          }
          itemsMap[item.order_id].push({
            name: item.product_name,
            quantity: item.quantity,
            price: item.price,
          });
        }
        // Attach items to orders
        for (const order of orders) {
          (order as Record<string, unknown>).items = itemsMap[order.order_id] || [];
        }
      }
    }

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Orders API error:", error);
    return NextResponse.json({ error: "حدث خطأ في جلب الطلبات" }, { status: 500 });
  }
}
