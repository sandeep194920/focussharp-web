import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const { email, source } = await request.json();

  if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

  const { error } = await supabase
    .from("waitlist")
    .upsert({ email, source: source ?? null }, { onConflict: "email" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
