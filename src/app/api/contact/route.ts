import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !message) {
      return NextResponse.json({ error: "يرجى ملء الاسم والرسالة" }, { status: 400 });
    }

    const { error } = await supabase.from("contact_messages").insert({
      name,
      email: email || null,
      phone: phone || null,
      subject: subject || "رسالة عامة",
      message,
    });

    if (error) {
      console.log("Contact save (table may not exist):", error.message);
    }

    try {
      await fetch("/notify?XTransformPort=3005", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "contact_message",
          data: { name, email, phone, subject, message },
        }),
      });
    } catch {
      // Telegram bot may not be running
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) return NextResponse.json({ messages: [] });
    return NextResponse.json({ messages: data });
  } catch {
    return NextResponse.json({ messages: [] });
  }
}
