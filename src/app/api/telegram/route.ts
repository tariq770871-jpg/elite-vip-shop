import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyAuthToken, getSupabaseServiceClient } from "@/lib/supabase-server";
import { rateLimitResponse } from "@/lib/rate-limit";

/** Verify the authenticated user has admin role */
async function verifyAdmin(request: Request) {
  const { user, error: authError } = await verifyAuthToken(request);
  if (authError || !user) {
    return { user: null, errorResponse: NextResponse.json({ error: "غير مصرح به" }, { status: 401 }) };
  }
  const serviceClient = getSupabaseServiceClient();
  if (serviceClient) {
    const { data: profile } = await serviceClient
      .from("users")
      .select("role_id, roles(role_name)")
      .eq("email", user.email)
      .single();
    const roleName = (profile?.roles as { role_name?: string } | null)?.role_name;
    if (roleName !== "admin") {
      return { user: null, errorResponse: NextResponse.json({ error: "ممنوع — يتطلب صلاحية المدير" }, { status: 403 }) };
    }
  }
  return { user, errorResponse: null };
}

// GET: Check if Telegram bot is configured
export async function GET(request: Request) {
  const blocked = rateLimitResponse(request, "api");
  if (blocked) return blocked;
  try {
    if (!supabase) return NextResponse.json({ configured: false });

    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["telegram_bot_token", "telegram_chat_id"]);

    const tokenRow = data?.find((r) => r.key === "telegram_bot_token");
    const chatRow = data?.find((r) => r.key === "telegram_chat_id");

    const configured = !!(tokenRow?.value && chatRow?.value);

    return NextResponse.json({
      configured,
      chatId: chatRow?.value ? `***${chatRow.value.slice(-4)}` : null,
    });
  } catch {
    return NextResponse.json({ configured: false });
  }
}

// POST: Save config and optionally send a test message (admin only)
export async function POST(request: Request) {
  const blocked = rateLimitResponse(request, "api");
  if (blocked) return blocked;
  try {
    // Admin authorization check — only admins can configure Telegram bot
    const { user, errorResponse } = await verifyAdmin(request);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { botToken, chatId, testOnly } = body;

    if (!botToken || !chatId) {
      return NextResponse.json({ error: "رمز البوت ومعرف المحادثة مطلوبان" }, { status: 400 });
    }

    // Test the bot token first by sending a test message
    const testMsg = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: "✅ <b>تم ربط المتجر بتيليجرام بنجاح!</b>\n\nستصلك إشعارات فورية عند كل طلب جديد 🛒",
          parse_mode: "HTML",
        }),
      }
    );

    if (!testMsg.ok) {
      const err = await testMsg.json();
      return NextResponse.json(
        { error: `خطأ من تيليجرام: ${err.description || "رمز خاطئ أو Chat ID غير صحيح"}` },
        { status: 400 }
      );
    }

    // If only testing, don't save
    if (testOnly) {
      return NextResponse.json({ success: true, message: "تم إرسال رسالة الاختبار" });
    }

    // Save to Supabase site_settings
    if (supabase) {
      await supabase.from("site_settings").upsert(
        [
          { key: "telegram_bot_token", value: botToken, type: "secret" },
          { key: "telegram_chat_id", value: chatId, type: "string" },
        ],
        { onConflict: "key" }
      );
    }

    return NextResponse.json({ success: true, message: "تم الحفظ وإرسال رسالة تجريبية!" });
  } catch (error) {
    console.error("Telegram configure error:", error);
    return NextResponse.json({ error: "حدث خطأ في الإعداد" }, { status: 500 });
  }
}

// DELETE: Remove Telegram configuration (admin only)
export async function DELETE(request: Request) {
  const blocked = rateLimitResponse(request, "api");
  if (blocked) return blocked;
  try {
    // Admin authorization check — only admins can delete Telegram config
    const { errorResponse } = await verifyAdmin(request);
    if (errorResponse) return errorResponse;
    if (supabase) {
      await supabase
        .from("site_settings")
        .delete()
        .in("key", ["telegram_bot_token", "telegram_chat_id"]);
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "فشل في حذف الإعدادات" }, { status: 500 });
  }
}
