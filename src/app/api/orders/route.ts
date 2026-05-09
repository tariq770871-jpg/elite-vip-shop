import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendOrderNotification } from "@/lib/telegram";
import { verifyAuthToken, getSupabaseServiceClient } from "@/lib/supabase-server";
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

    // ── Server-side price verification ──
    // Extract only product IDs and quantities from client — ignore client-provided prices
    const productIds = items.map((item: { id: string }) => item.id);

    // Validate quantities before proceeding
    for (const item of items) {
      const qty = Number(item.quantity);
      if (!Number.isInteger(qty) || qty < 1 || qty > 100) {
        return NextResponse.json(
          { error: `كمية غير صالحة للمنتج: ${item.name || item.id}` },
          { status: 400 }
        );
      }
    }

    // Fetch real prices from the products table
    const { data: dbProducts, error: dbError } = await supabase
      .from("products")
      .select("product_id, price, sale_price, name, availability")
      .in("product_id", productIds);

    if (dbError) {
      console.error("Product lookup error:", dbError);
      return NextResponse.json({ error: "فشل في التحقق من المنتجات" }, { status: 500 });
    }

    // Build a lookup map for quick access
    const productMap = new Map(
      (dbProducts || []).map((p: { product_id: string; price: number; sale_price: number | null; name: string; availability: boolean }) => [p.product_id, p])
    );

    // Validate all products exist and are available, then calculate total from DB prices
    let calculatedTotal = 0;
    const validatedItems: Array<{ productId: string; productName: string; quantity: number; price: number }> = [];

    for (const item of items) {
      const dbProduct = productMap.get(item.id);
      if (!dbProduct) {
        return NextResponse.json({ error: `المنتج غير موجود: ${item.name || item.id}` }, { status: 400 });
      }
      if (!dbProduct.availability) {
        return NextResponse.json({ error: `المنتج غير متوفر: ${dbProduct.name}` }, { status: 400 });
      }
      // Use DB price — sale_price if valid, otherwise regular price
      const effectivePrice = dbProduct.sale_price != null && dbProduct.sale_price < dbProduct.price
        ? Number(dbProduct.sale_price)
        : Number(dbProduct.price);

      calculatedTotal += effectivePrice * item.quantity;
      validatedItems.push({
        productId: dbProduct.product_id,
        productName: dbProduct.name,
        quantity: item.quantity,
        price: effectivePrice,
      });
    }

    // Insert order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        user_id: userId,
        status: "new",
        total_amount: calculatedTotal,
        notes: (() => {
          const sanitize = (val: string | undefined | null) => (val || "").replace(/\|/g, "│");
          const paymentNames: Record<string, string> = {
            jeeb: "جيب", jawaly: "جوالي", easy_fulusk: "ايزي فلوسك", saltef: "سلطيف",
            local_transfer: "حوالة شبكة محلية", whatsapp: "واتساب", sms: "رسالة نصية", in_app: "طلب عبر الموقع",
          };
          const pmLabel = paymentNames[paymentMethod] || paymentMethod || "غير محدد";
          return notes || `طريقة الدفع: ${pmLabel}${customerName ? ` | العميل: ${sanitize(customerName)}` : ""}${customerPhone ? ` | الهاتف: ${sanitize(customerPhone)}` : ""}${customerAddress ? ` | العنوان: ${sanitize(customerAddress)}` : ""}${discount ? ` | خصم: ${discount} ر.ي` : ""}${couponCode ? ` | كود: ${sanitize(couponCode)}` : ""}`;
        })(),
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order insert error:", orderError);
      return NextResponse.json({ error: "فشل في حفظ الطلب" }, { status: 500 });
    }

    // Insert order items with server-verified prices only
    const orderItems = validatedItems.map((vi) => ({
      order_id: order.order_id,
      product_id: vi.productId,
      product_name: vi.productName,
      quantity: vi.quantity,
      price: vi.price,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Order items insert error:", itemsError);
      return NextResponse.json({ error: "فشل في حفظ بنود الطلب" }, { status: 500 });
    }

    // Increment coupon used_count if a coupon was applied (now that order is confirmed)
    if (couponCode) {
      try {
        const serviceClient = getSupabaseServiceClient();
        if (serviceClient) {
          const { data: couponData } = await serviceClient
            .from("coupons")
            .select("used_count, max_uses")
            .eq("code", couponCode.toUpperCase())
            .single();

          if (couponData) {
            const newCount = (couponData.used_count || 0) + 1;
            // Only increment if below max_uses (or unlimited)
            if (!couponData.max_uses || newCount <= couponData.max_uses) {
              await serviceClient
                .from("coupons")
                .update({ used_count: newCount })
                .eq("code", couponCode.toUpperCase());
            }
          }
        }
      } catch {
        // Non-critical: coupon usage tracking should not block order creation
      }
    }

    // Send Telegram notification (non-blocking) — uses server-verified prices
    sendOrderNotification({
      orderNumber: order.order_number,
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      customerAddress: customerAddress || undefined,
      total: calculatedTotal,
      items: orderItems.map((i) => ({
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
