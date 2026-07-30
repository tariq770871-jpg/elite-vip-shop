import { NextResponse } from "next/server";
import { sendOrderNotification } from "@/lib/telegram";
import { verifyAuthToken, getSupabaseServiceClient } from "@/lib/supabase-server";
import { rateLimitResponse } from "@/lib/rate-limit";
import { PAYMENT_METHOD_NAMES } from "@/lib/site-config";
import { getEffectivePrice } from "@/lib/utils";
import { MAX_QUANTITY_PER_ITEM, ORDERS_DEFAULT_LIMIT, ORDERS_MAX_LIMIT, generateOrderNumber } from "@/lib/constants";
import type { SupabaseProductRow, SupabaseOrderRow, OrderInsertPayload } from "@/types/db";

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

    // Use service client for operations that bypass RLS (after auth verification)
    const serviceClient = getSupabaseServiceClient();

    if (!serviceClient) {
      // Database unavailable — return explicit error instead of fake success
      return NextResponse.json(
        { error: "خدمة قاعدة البيانات غير متاحة حالياً" },
        { status: 503 }
      );
    }

    // Generate order number
    const orderNumber = generateOrderNumber();

    // ── Server-side price verification ──
    const productIds = items.map((item: { id: string }) => item.id);

    // Validate quantities
    for (const item of items) {
      const qty = Number(item.quantity);
      if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QUANTITY_PER_ITEM) {
        return NextResponse.json(
          { error: `كمية غير صالحة للمنتج: ${item.name || item.id}` },
          { status: 400 }
        );
      }
    }

    // Fetch real prices from the products table (service client bypasses RLS)
    const { data: dbProducts, error: dbError } = await serviceClient
      .from("products")
      .select("product_id, price, sale_price, name, availability, seller_id")
      .in("product_id", productIds);

    if (dbError) {
      console.error("Product lookup error:", dbError);
      return NextResponse.json({ error: "فشل في التحقق من المنتجات" }, { status: 500 });
    }

    // Build a lookup map
    const productMap = new Map<string, SupabaseProductRow>(
      (dbProducts || []).map((p: SupabaseProductRow) => [p.product_id, p])
    );

    // Validate all products exist and are available, then calculate total from DB prices
    let calculatedTotal = 0;
    const validatedItems: Array<{ productId: string; productName: string; quantity: number; price: number; sellerId: string | null }> = [];

    for (const item of items) {
      const dbProduct = productMap.get(item.id);
      if (!dbProduct) {
        return NextResponse.json({ error: `المنتج غير موجود: ${item.name || item.id}` }, { status: 400 });
      }
      if (!dbProduct.availability) {
        return NextResponse.json({ error: `المنتج غير متوفر: ${dbProduct.name}` }, { status: 400 });
      }
      const effectivePrice = getEffectivePrice(Number(dbProduct.price), dbProduct.sale_price != null ? Number(dbProduct.sale_price) : null);

      calculatedTotal += effectivePrice * item.quantity;
      validatedItems.push({
        productId: dbProduct.product_id,
        productName: dbProduct.name,
        quantity: item.quantity,
        price: effectivePrice,
        sellerId: dbProduct.seller_id || null,
      });
    }

    // Build notes with delivery info
    const sanitize = (val: string | undefined | null) => (val || "").replace(/\|/g, "│");
    const pmLabel = PAYMENT_METHOD_NAMES[paymentMethod] || paymentMethod || "غير محدد";

    let notesContent = notes || "";
    if (!notesContent) {
      notesContent = `طريقة الدفع: ${pmLabel}`;
    }
    if (customerName) notesContent += ` | العميل: ${sanitize(customerName)}`;
    if (customerPhone) notesContent += ` | الهاتف: ${sanitize(customerPhone)}`;
    if (customerAddress) notesContent += ` | العنوان: ${sanitize(customerAddress)}`;

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

    // Get the first product's seller_id for the order (primary seller)
    const primarySellerId = validatedItems.length > 0 ? validatedItems[0].sellerId : null;
    // Get the first product info for the order snapshot
    const primaryProduct = validatedItems.length > 0 ? validatedItems[0] : null;

    // Insert order with ALL new columns
    const orderInsert: OrderInsertPayload = {
      order_number: orderNumber,
      user_id: userId,
      status: "new",
      total_amount: calculatedTotal,
      notes: notesContent,
      // New chat-based ordering columns
      delivery_type: deliveryType || "pickup",
      customer_name: customerName || null,
      customer_phone: customerPhone || null,
      customer_address: customerAddress || null,
      province: province || null,
      district: district || null,
      street: street || null,
      landmark: landmark || null,
      seller_id: primarySellerId,
      // Product snapshot columns
      product_id: primaryProduct?.productId || null,
      product_name_snapshot: primaryProduct?.productName || null,
      unit_price: primaryProduct?.price || null,
      quantity: primaryProduct?.quantity || 1,
      total_price: primaryProduct ? primaryProduct.price * primaryProduct.quantity : calculatedTotal,
    };

    // Try extended insert first, fallback to basic if migration not run yet
    let order: SupabaseOrderRow | null = null;
    let orderError: { message?: string } | null = null;

    const extendedResult = await serviceClient
      .from("orders")
      .insert(orderInsert)
      .select()
      .single();

    if (extendedResult.error && (
      extendedResult.error.message?.includes("column") ||
      extendedResult.error.message?.includes("Could not find")
    )) {
      // Fallback: new columns don't exist yet, insert without them
      // All delivery/customer info is already captured in notesContent
      console.warn("Extended columns not yet migrated, using basic insert with notes fallback");
      const basicInsert: Partial<OrderInsertPayload> = {
        order_number: orderNumber,
        user_id: userId,
        status: "new",
        total_amount: calculatedTotal,
        notes: notesContent,
      };
      const basicResult = await serviceClient
        .from("orders")
        .insert(basicInsert)
        .select()
        .single();
      order = basicResult.data;
      orderError = basicResult.error;
    } else {
      order = extendedResult.data;
      orderError = extendedResult.error;
    }

    if (orderError || !order) {
      console.error("Order insert error:", orderError);
      return NextResponse.json({ error: "فشل في حفظ الطلب" }, { status: 500 });
    }

    // Insert order items with server-verified prices only
    const orderId = order.order_id;
    const insertedOrderNumber = order.order_number;
    const orderItems = validatedItems.map((vi) => ({
      order_id: orderId,
      product_id: vi.productId,
      product_name: vi.productName,
      quantity: vi.quantity,
      price: vi.price,
    }));

    const { error: itemsError } = await serviceClient
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Order items insert error:", itemsError);
      return NextResponse.json({ error: "فشل في حفظ بنود الطلب" }, { status: 500 });
    }

    // Increment coupon used_count atomically (prevents race condition)
    // Reuses the already-instantiated serviceClient — no need to fetch a new one
    if (couponCode) {
      try {
        const { data: rpcResult } = await serviceClient.rpc("increment_coupon_usage", {
          p_code: couponCode.toUpperCase(),
        });
        // rpcResult returns { success: boolean, new_count: number | null }
        if (rpcResult && !rpcResult.success) {
          console.warn("Coupon usage limit reached:", couponCode);
        }
      } catch (couponErr) {
        // Non-critical — order was already placed, but log for monitoring
        console.warn("Coupon usage increment failed:", couponErr instanceof Error ? couponErr.message : String(couponErr));
      }
    }

    // Send Telegram notification (non-blocking)
    sendOrderNotification({
      orderNumber: insertedOrderNumber,
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
    }).catch((err) => { console.warn("Telegram notification failed:", err instanceof Error ? err.message : String(err)); });

    return NextResponse.json({
      success: true,
      orderId: orderId,
      orderNumber: insertedOrderNumber,
    });
  } catch (error) {
    console.error("Order API error:", error);
    return NextResponse.json({ error: "حدث خطأ في حفظ الطلب" }, { status: 500 });
  }
}

// GET: Fetch orders for a user (or seller's orders)
export async function GET(request: Request) {
  const blocked = rateLimitResponse(request, "api");
  if (blocked) return blocked;
  try {
    // Auth check: verify user is authenticated
    const { user, error: authError } = await verifyAuthToken(request);
    if (authError || !user) {
      return NextResponse.json({ error: "غير مصرح به" }, { status: 401 });
    }

    const userId = user.id;
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role"); // "seller" to fetch seller orders
    // ── Pagination: prevent fetching ALL orders for heavy users ──
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || String(ORDERS_DEFAULT_LIMIT), 10), 1), ORDERS_MAX_LIMIT);
    const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0);

    // Use service client to fetch orders (after auth verification, bypasses RLS)
    const serviceClient = getSupabaseServiceClient();
    if (!serviceClient) {
      return NextResponse.json(
        { error: "خدمة قاعدة البيانات غير متاحة حالياً" },
        { status: 503 }
      );
    }

    let query;

    if (role === "seller") {
      // Seller: fetch orders where seller_id = their user_id
      query = serviceClient
        .from("orders")
        .select("*")
        .eq("seller_id", userId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);
    } else {
      // Regular user: fetch their own orders
      query = serviceClient
        .from("orders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error("Orders fetch error:", error);
      return NextResponse.json({ error: "فشل في جلب الطلبات" }, { status: 500 });
    }

    // Fetch order items for each order
    if (orders && orders.length > 0) {
      const orderIds = orders.map((o) => o.order_id);
      const { data: allItems, error: itemsError } = await serviceClient
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
            price: Number(item.price),
          });
        }
        // Attach items to orders — mutate via Map lookup to keep types clean
        for (const order of orders) {
          (order as SupabaseOrderRow & { items: Array<{ name: string; quantity: number; price: number }> }).items = itemsMap[order.order_id] || [];
        }
      }
    }

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Orders API error:", error);
    return NextResponse.json({ error: "حدث خطأ في جلب الطلبات" }, { status: 500 });
  }
}
