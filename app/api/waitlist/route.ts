import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import * as Sentry from "@sentry/nextjs";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { email, source } = await request.json();

  if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

  const { error } = await supabase
    .from("waitlist")
    .upsert({ email, source: source ?? null }, { onConflict: "email" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Notify founder
  await resend.emails.send({
    from: "FocusSharp <noreply@staarsolutions.ca>",
    to: "sandeepamarnath@staarsolutions.ca",
    subject: `New waitlist signup — ${email}`,
    html: `<p><strong>${email}</strong> just joined the waitlist${source ? ` from <strong>${source}</strong>` : ""}.</p>`,
  }).catch((err) => { console.error("[waitlist] founder notify failed", err); Sentry.captureException(err); });

  return NextResponse.json({ ok: true });
}
