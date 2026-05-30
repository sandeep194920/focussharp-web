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

  // Map snake_case DB columns → camelCase client shape
  const sessions: Session[] = (data ?? []).map((r) => ({
    id: r.id,
    catId: r.cat_id,
    catName: r.cat_name,
    catColor: r.cat_color,
    durationMins: r.duration_mins,
    startedAt: r.started_at,
    completedAt: r.completed_at,
    completed: r.completed,
    type: r.type,
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

  const { error } = await supabase
    .from("sessions")
    .upsert(
      {
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
      },
      { onConflict: "id" }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
