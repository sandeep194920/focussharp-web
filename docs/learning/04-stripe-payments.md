# 04 — Stripe Payments

How FocusSharp takes payments using Stripe — what it is, why we built it this way, and how every piece connects.

---

## What is Stripe?

Stripe is a payments company. When someone on your website wants to pay you money, Stripe handles all the hard stuff: collecting the card number securely, charging the bank, handling failures, calculating taxes, and sending the money to your bank account.

You never touch the card number. Stripe does. This is important because handling card data yourself requires passing a very difficult security certification (PCI DSS). Stripe takes on that burden so you don't have to.

**You signed up with your business email (Staar Solutions / your DBA) so that payouts go to your business bank account and you can later connect your incorporation details (BN, DUNS) for tax reporting.**

---

## The three plans

| Plan | Price | Type |
|---|---|---|
| Pro Monthly | $2.99/month | Recurring subscription |
| Pro Annual | $19.99/year | Recurring subscription |
| Lifetime | $49 (one-time) | Single payment |

In Stripe, these are called **Products** (what you're selling) and **Prices** (how much and how often). A Product can have many Prices — for example the "FocusSharp Pro" product has both a monthly price and an annual price.

---

## Sandbox vs Live mode

Stripe gives you two completely separate environments:

- **Sandbox (test mode)** — fake money, fake cards, no real charges. This is where we are now. You can use test card `4242 4242 4242 4242` to simulate a payment.
- **Live mode** — real money, real customers. You switch to this when you're ready to launch by completing Stripe's business verification.

The API keys are different for each mode. Sandbox keys start with `pk_test_` and `sk_test_`. Live keys start with `pk_live_` and `sk_live_`.

---

## How checkout works (the full flow)

Here's what happens when a user clicks "Get Pro" on the pricing page:

```
User clicks "Get Pro"
  ↓
CheckoutButton.tsx calls POST /api/checkout { plan: "monthly" }
  ↓
/api/checkout/route.ts runs on the server:
  1. Checks the user is logged in (via Supabase session)
  2. Looks up their stripe_customer_id in the profiles table
  3. If they don't have one yet, creates a Stripe Customer and saves the ID
  4. Creates a Stripe Checkout Session (a temporary, secure payment page hosted by Stripe)
  5. Returns the Checkout Session URL
  ↓
Browser redirects to Stripe's hosted checkout page (stripe.com/...)
  ↓
User enters card details on Stripe's page (we never see the card)
  ↓
Payment succeeds → Stripe redirects user to /app?upgraded=1
  ↓
Stripe ALSO sends a webhook event to /api/webhooks/stripe
  ↓
Webhook handler sets is_pro = true in Supabase profiles table
  ↓
Next time the app loads, /api/profile returns is_pro: true
  ↓
Store sets isPro = true → Pro features unlock
```

---

## What is a webhook?

A webhook is Stripe calling *your* server to tell you something happened. Think of it like a phone call from Stripe saying "hey, that payment went through."

Without a webhook, you'd have to keep asking Stripe "did they pay yet? did they pay yet?" — that's inefficient. Instead, Stripe calls you the moment something happens.

Our webhook at `/api/webhooks/stripe` listens for these events:

| Event | What it means | What we do |
|---|---|---|
| `checkout.session.completed` | Someone just paid | Set `is_pro = true` |
| `invoice.paid` | Subscription renewed successfully | Keep `is_pro = true` |
| `customer.subscription.deleted` | Subscription cancelled | Set `is_pro = false` |
| `invoice.payment_failed` | Card declined on renewal | Set `is_pro = false` |

The webhook uses the **service role key** (not the normal user key) to write to Supabase directly, bypassing Row Level Security. This is safe because the webhook only runs server-side and the request is verified with a signature.

### Webhook signature verification

Anyone on the internet could send a fake POST request to `/api/webhooks/stripe`. To prevent that, Stripe signs every webhook with a secret (`STRIPE_WEBHOOK_SECRET`). Our code verifies this signature before trusting the event. If the signature is wrong, we return a 400 error and ignore it.

---

## What is a Stripe Customer?

In Stripe, a **Customer** is a record that represents one of your users. It stores their email, payment methods, and subscription history.

We create one Customer per FocusSharp user and save the Customer ID (`cus_...`) in the `stripe_customer_id` column of our `profiles` table. This links your Supabase user to their Stripe billing history.

Why save it? Because if they upgrade, cancel, and re-upgrade later, we can reuse the same Customer record. Stripe also needs the Customer ID to open the billing portal.

---

## The Stripe Customer Portal

Pro users can manage their own subscription without ever contacting you. The **Customer Portal** is a Stripe-hosted page where they can:
- View invoices
- Update their payment method
- Cancel their subscription

When a user clicks "Manage billing" in the UserMenu:
1. `POST /api/portal` is called
2. We look up their `stripe_customer_id`
3. We create a **Portal Session** — a temporary, secure URL for that specific customer
4. We redirect them to that URL

The portal URL expires after a few minutes for security, which is why we generate a fresh one each time.

---

## The `stripe_customer_id` column

We added this column to the `profiles` table in Supabase. Here's the SQL to run (once in Supabase SQL Editor):

```sql
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id text;
```

This is the bridge between your Supabase world and your Stripe world.

---

## Files we built

| File | Purpose |
|---|---|
| `lib/stripe.ts` | Stripe client singleton + price ID map |
| `app/api/checkout/route.ts` | Creates a Stripe Checkout Session |
| `app/api/webhooks/stripe/route.ts` | Handles Stripe events, toggles `is_pro` |
| `app/api/portal/route.ts` | Opens Stripe Customer Portal |
| `components/ui/CheckoutButton.tsx` | Client button that hits `/api/checkout` |
| `app/pricing/page.tsx` | Updated to use CheckoutButton |
| `components/ui/UserMenu.tsx` | Added "Manage billing" / "Upgrade to Pro" |

---

## Environment variables needed

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...   # Used client-side (safe to expose)
STRIPE_SECRET_KEY=sk_test_...                     # Server-only — never expose
STRIPE_WEBHOOK_SECRET=whsec_...                   # Webhook signature verification
STRIPE_PRICE_MONTHLY=price_...                    # Price ID for $2.99/month
STRIPE_PRICE_ANNUAL=price_...                     # Price ID for $19.99/year
STRIPE_PRICE_LIFETIME=price_...                   # Price ID for $49 one-time
NEXT_PUBLIC_APP_URL=http://localhost:3000          # Success/cancel redirect base URL
```

The publishable key is safe to put in the browser (it's prefixed `NEXT_PUBLIC_`). The secret key and webhook secret must **never** leave the server.

---

## How to create products in Stripe

1. In the Stripe dashboard → **Product catalog** → **+ Add product**
2. Create "FocusSharp Pro":
   - Add a **Monthly** price: $2.99, recurring, monthly
   - Add an **Annual** price: $19.99, recurring, yearly
3. Create "FocusSharp Lifetime":
   - Add a **one-time** price: $49
4. Copy each price's ID (looks like `price_1ABC...`) into `.env.local`

---

## How to set up the webhook locally (for testing)

Stripe can't call `localhost` directly. Use the Stripe CLI to forward events to your local server:

```bash
# Install Stripe CLI (Mac)
brew install stripe/stripe-cli/stripe

# Log in
stripe login

# Forward webhook events to your local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

The CLI will print your local webhook secret — paste it into `.env.local` as `STRIPE_WEBHOOK_SECRET`.

---

## How Stripe knows where to send webhook events

This is a critical piece that's easy to miss: **Stripe has no idea your webhook URL exists until you tell it.**

There are two ways to register your webhook URL — one for local dev, one for production. You must do one of these or payments will complete on Stripe's side but your app will never know about them. `is_pro` will never be set.

### Local dev — Stripe CLI as a tunnel

Stripe cannot call `localhost:3000` directly (it's your laptop, not a public server). The Stripe CLI solves this by acting as a middleman:

```
Stripe servers → Stripe CLI (running on your laptop) → localhost:3000/api/webhooks/stripe
```

When you run:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Stripe processes the payment on their servers first, then sends the event to the Stripe CLI. The CLI then forwards it to your local server. You must keep this terminal running the entire time you're testing payments locally.

### Production — register the URL in Stripe dashboard

Once you deploy to Vercel, you register the URL once manually:

1. Stripe dashboard → **Developers** → **Webhooks** → **Add endpoint**
2. URL: `https://focussharp.app/api/webhooks/stripe`
3. Events to listen for: `checkout.session.completed`, `invoice.paid`, `customer.subscription.deleted`, `invoice.payment_failed`
4. Copy the **Signing secret** (`whsec_...`) → add to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

After this, the data flow for every payment looks like this:

```
User pays on Stripe checkout page
  ↓
Stripe processes the payment on their servers
  ↓
Stripe sends a POST request to https://focussharp.app/api/webhooks/stripe
  ↓
Our webhook code runs on Vercel:
  1. Verifies the request signature (proves it really came from Stripe, not a fake)
  2. Reads the event type (e.g. checkout.session.completed)
  3. Extracts the Stripe customer ID (cus_...) from the event
  4. Looks up that customer ID in our Supabase profiles table
  5. Sets is_pro = true for that user
  ↓
Next time the user's app loads, /api/profile returns is_pro: true → Pro unlocks
```

No CLI needed in production — Stripe calls your live URL directly forever once registered.

### Summary

| Environment | How Stripe finds your webhook |
|---|---|
| Local dev | `stripe listen` CLI creates a tunnel |
| Production | You register the URL manually in Stripe dashboard |

---

## Testing a payment

Once the dev server is running and the Stripe CLI is forwarding:

1. Go to `http://localhost:3000/pricing`
2. Click "Get Pro" — you'll be redirected to Stripe Checkout
3. Use test card: `4242 4242 4242 4242`, any future date, any CVC
4. On success, you land back at `/app?upgraded=1`
5. The webhook fires → `is_pro = true` in Supabase → Pro features unlock

---

## Going live

When you're ready to launch:
1. Complete Stripe's business verification (provide BN, banking details)
2. In Stripe dashboard, switch from **Sandbox** to **Live** mode
3. Re-create the same 3 products in live mode (they don't carry over)
4. Copy the live API keys and price IDs into your Vercel environment variables
5. Set up the webhook endpoint in Stripe dashboard → Developers → Webhooks → Add endpoint: `https://focussharp.app/api/webhooks/stripe`
6. Copy the live webhook secret into Vercel env vars
