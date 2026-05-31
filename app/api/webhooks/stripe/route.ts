import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

// Use service role to bypass RLS for webhook updates
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function setIsPro(supabaseUid: string, isPro: boolean) {
  await supabaseAdmin
    .from("profiles")
    .update({ is_pro: isPro })
    .eq("id", supabaseUid);
}

async function getUidFromCustomer(customerId: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();
  return data?.id ?? null;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    // Subscription created or renewed
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const uid =
        session.subscription
          ? (await stripe.subscriptions.retrieve(session.subscription as string))
              .metadata?.supabase_uid
          : session.payment_intent
          ? (await stripe.paymentIntents.retrieve(session.payment_intent as string))
              .metadata?.supabase_uid
          : null;
      if (uid) await setIsPro(uid, true);
      break;
    }

    // Subscription renewed (annual/monthly)
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const sub = invoice.subscription
        ? await stripe.subscriptions.retrieve(invoice.subscription as string)
        : null;
      const uid = sub?.metadata?.supabase_uid;
      if (uid) await setIsPro(uid, true);
      break;
    }

    // Subscription cancelled / payment failed
    case "customer.subscription.deleted":
    case "invoice.payment_failed": {
      const obj = event.data.object as Stripe.Subscription | Stripe.Invoice;
      const customerId =
        "customer" in obj ? (obj.customer as string) : null;
      if (customerId) {
        const uid = await getUidFromCustomer(customerId);
        if (uid) await setIsPro(uid, false);
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
