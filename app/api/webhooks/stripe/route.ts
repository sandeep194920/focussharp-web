import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import Stripe from "stripe";

// Use service role to bypass RLS for webhook updates
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);
const FOUNDER_EMAIL = "sandeepamarnath@staarsolutions.ca";
const FROM_EMAIL = "FocusSharp <noreply@staarsolutions.ca>";

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

async function getEmailFromUid(uid: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("email")
    .eq("id", uid)
    .single();
  return data?.email ?? null;
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
      if (uid) {
        await setIsPro(uid, true);
        const userEmail = await getEmailFromUid(uid);
        const planLabel = session.subscription ? "Pro subscription" : "Lifetime access";

        // Email the user
        if (userEmail) {
          await resend.emails.send({
            from: FROM_EMAIL,
            to: userEmail,
            subject: "Welcome to FocusSharp Pro 🎉",
            html: `
              <p>Hi,</p>
              <p>Your <strong>${planLabel}</strong> is now active. Thanks for supporting FocusSharp!</p>
              <p>You now have unlimited categories, full session history, and cloud sync across all your devices.</p>
              <p>If you ever need to manage your billing, you can do that from the app — click your avatar → Manage billing.</p>
              <p>Happy focusing,<br/>Sandeep<br/>FocusSharp</p>
            `,
          });
        }

        // Notify founder
        await resend.emails.send({
          from: FROM_EMAIL,
          to: FOUNDER_EMAIL,
          subject: `New Pro signup — ${userEmail ?? uid}`,
          html: `<p>New ${planLabel} purchase by <strong>${userEmail ?? uid}</strong>.</p>`,
        });
      }
      break;
    }

    // Subscription renewed (annual/monthly)
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice & { subscription?: string | null };
      const sub = invoice.subscription
        ? await stripe.subscriptions.retrieve(invoice.subscription)
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
        if (uid) {
          await setIsPro(uid, false);
          const userEmail = await getEmailFromUid(uid);
          if (userEmail) {
            await resend.emails.send({
              from: FROM_EMAIL,
              to: userEmail,
              subject: "Your FocusSharp Pro subscription has ended",
              html: `
                <p>Hi,</p>
                <p>Your FocusSharp Pro subscription has ended. You've been moved to the free plan.</p>
                <p>Your data is safe — you'll still have access to your last 7 days of history and up to 3 categories.</p>
                <p>If you'd like to resubscribe, you can do so anytime at <a href="https://focussharp.app/pricing">focussharp.app/pricing</a>.</p>
                <p>Sandeep<br/>FocusSharp</p>
              `,
            });
          }
        }
      }
      break;
    }

    // Refund issued
    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const customerEmail = typeof charge.billing_details?.email === "string"
        ? charge.billing_details.email
        : null;
      const amount = ((charge.amount_refunded ?? 0) / 100).toFixed(2);
      const currency = charge.currency.toUpperCase();

      if (customerEmail) {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: customerEmail,
          subject: "Your FocusSharp refund has been processed",
          html: `
            <p>Hi,</p>
            <p>Your refund of <strong>${currency} $${amount}</strong> has been processed and will appear on your card within 5–10 business days.</p>
            <p>If you have any questions, reply to this email or reach us at <a href="mailto:${FOUNDER_EMAIL}">${FOUNDER_EMAIL}</a>.</p>
            <p>Sandeep<br/>FocusSharp</p>
          `,
        });
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
