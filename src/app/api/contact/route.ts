import { verifyAuthToken } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// POST: إرسال رسالة اتصال (مفتوح للجميع)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "الاسم والبريد الإلكتروني والرسالة مطلوبة" }, { status: 400 });
    }

    if (!supabase) {
      return NextResponse.json({ success: true, local: true });
    }

    const { error } = await supabase.from("contact_messages").insert({
      name,
      email,
      phone: phone || null,
      message,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Contact insert error:", error);
      return NextResponse.json({ error: "فشل في إرسال الرسالة" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "حدث خطأ في إرسال الرسالة" }, { status: 500 });
  }
}

// GET: جلب رسائل الاتصال (للمدير فقط)
export async function GET(request: NextRequest) {
  const { user, error } = await verifyAuthToken(request);
  if (error || !user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const role = user.user_metadata?.role || "user";
  if (role !== "admin" && role !== "owner") {
    return NextResponse.json({ error: "غير مصرح: صلاحيات مدير مطلوبة" }, { status: 403 });
  }

  if (!supabase) {
    return NextResponse.json({ messages: [] });
  }

  try {
    const { data, error: fetchError } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (fetchError) {
      console.error("Fetch contact error:", fetchError);
      return NextResponse.json({ error: "فشل في جلب الرسائل" }, { status: 500 });
    }

    return NextResponse.json({ messages: data || [] });
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}