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
    const {
      items, notes, paymentMethod,
      customerName, customerPhone, customerAddress,
      discount, couponCode,
      // NEW FIELDS for chat-based ordering:
      deliveryType,    // "delivery" or "pickup"
      province,        // المحافظة
      district,        // المديرية
      street,          // الشارع
      landmark,        // جوار أقرب معلم
    } = body;

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

    // Build notes with delivery info
    const sanitize = (val: string | undefined | null) => (val || "").replace(/\|/g, "│");
    const paymentNames: Record<string, string> = {
      jeeb: "جيب", jawaly: "جوالي", easy_fulusk: "ايزي فلوسك", saltef: "سلطيف",
      local_transfer: "حوالة شبكة محلية", whatsapp: "واتساب", sms: "رسالة نصية", in_app: "طلب عبر الموقع",
    };
    const pmLabel = paymentNames[paymentMethod] || paymentMethod || "غير محدد";

    let notesContent = notes || "";
    // Add payment method if no custom notes
    if (!notesContent) {
      notesContent = `طريقة الدفع: ${pmLabel}`;
    }

    // Add customer info
    if (customerName) notesContent += ` | العميل: ${sanitize(customerName)}`;
    if (customerPhone) notesContent += ` | الهاتف: ${sanitize(customerPhone)}`;
    if (customerAddress) notesContent += ` | العنوان: ${sanitize(customerAddress)}`;

    // Add delivery type info
    if (deliveryType === "delivery") {
      notesContent += ` | نوع الاستلام: توصيل`;
      if (province) notesContent += ` | المحافظة: ${sanitize(province)}`;
      if (district) notesContent += ` | المديرية: ${sanitize(district)}`;
      if (street) notesContent += ` | الشارع: ${sanitize(street)}`;
      if (landmark) notesContent += ` | أقرب معلم: ${sanitize(landmark)}`;
    } else if (deliveryType === "pickup") {
      notesContent += ` | نوع الاستلام: استلام شخصي`;
    }

    if (discount) notesContent += ` | خصم: ${discount} ر.ي`;
    if (couponCode) notesContent += ` | كود: ${sanitize(couponCode)}`;

    // Insert order — try with new columns first, fallback to basic columns if migration not run yet
    const orderInsertBase: Record<string, unknown> = {
      order_number: orderNumber,
      user_id: userId,
      status: "pending",
      total_amount: calculatedTotal,
      notes: notesContent,
    };

    // Add new delivery columns (may not exist if migration not yet run)
    const orderInsertExtended: Record<string, unknown> = {
      ...orderInsertBase,
      delivery_type: deliveryType || "pickup",
      customer_name: customerName || null,
      customer_phone: customerPhone || null,
      customer_address: customerAddress || null,
      province: province || null,
      district: district || null,
      street: street || null,
      landmark: landmark || null,
    };

    let order: any = null;
    let orderError: any = null;

    // Try extended insert first (with new columns)
    const extendedResult = await supabase
      .from("orders")
      .insert(orderInsertExtended)
      .select()
      .single();

    if (extendedResult.error && extendedResult.error.message?.includes("column")) {
      // Fallback: columns don't exist yet, insert without them
      console.warn("New columns not yet migrated, using basic insert");
      const basicResult = await supabase
        .from("orders")
        .insert(orderInsertBase)
        .select()
        .single();
      order = basicResult.data;
      orderError = basicResult.error;
    } else {
      order = extendedResult.data;
      orderError = extendedResult.error;
    }

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
      deliveryType: deliveryType || undefined,
      province: province || undefined,
      district: district || undefined,
      street: street || undefined,
      landmark: landmark || undefined,
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
