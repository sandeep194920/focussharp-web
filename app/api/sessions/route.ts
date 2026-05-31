import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import type { Session } from "@/lib/store";

export async function GET() {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const sessions: Session[] = (data ?? []).map((r: Record<string, unknown>) => ({
    id: r.id as string,
    catId: r.cat_id as string,
    catName: r.cat_name as string,
    catColor: r.cat_color as string,
    durationMins: r.duration_mins as number,
    startedAt: r.started_at as number,
    completedAt: r.completed_at as number,
    completed: r.completed as boolean,
    type: r.type as "focus" | "break",
  }));

  return NextResponse.json(sessions);
}

export async function POST(request: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session: Session = await request.json();

  const { error } = await supabase.from("sessions").upsert(
    [{
      id: session.id,
      user_id: user.id,
      cat_id: session.catId,
      cat_name: session.catName,
      cat_color: session.catColor,
      duration_mins: session.durationMins,
      started_at: session.startedAt,
      completed_at: session.completedAt,
      completed: session.completed,
      type: session.type,
    }],
    { onConflict: "id" }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
