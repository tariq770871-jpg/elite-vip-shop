import { verifyAuthToken } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

// إعدادات البوت (تخزين مؤقت، يُفضل نقله إلى قاعدة البيانات)
let botToken: string | null = null;
let chatId: string | null = null;

// POST: تعيين إعدادات البوت
export async function POST(request: NextRequest) {
  const { user, error } = await verifyAuthToken(request);
  if (error || !user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  // التحقق من أن المستخدم أدمن
  const role = user.user_metadata?.role || "user";
  if (role !== "admin" && role !== "owner") {
    return NextResponse.json({ error: "غير مصرح: صلاحيات أدمن مطلوبة" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { token, chat_id } = body;

    if (!token || !chat_id) {
      return NextResponse.json({ error: "التوكيل ومعرف الدردشة مطلوبان" }, { status: 400 });
    }

    botToken = token;
    chatId = chat_id;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Telegram setup error:", error);
    return NextResponse.json({ error: "حدث خطأ في حفظ الإعدادات" }, { status: 500 });
  }
}

// DELETE: حذف إعدادات البوت
export async function DELETE(request: NextRequest) {
  const { user, error } = await verifyAuthToken(request);
  if (error || !user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const role = user.user_metadata?.role || "user";
  if (role !== "admin" && role !== "owner") {
    return NextResponse.json({ error: "غير مصرح: صلاحيات أدمن مطلوبة" }, { status: 403 });
  }

  botToken = null;
  chatId = null;

  return NextResponse.json({ success: true });
}

// GET: التحقق من حالة البوت (اختياري)
export async function GET(request: NextRequest) {
  const { user, error } = await verifyAuthToken(request);
  if (error || !user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const role = user.user_metadata?.role || "user";
  if (role !== "admin" && role !== "owner") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  return NextResponse.json({
    configured: !!botToken && !!chatId,
  });
}