# Stripe Payments — How It Actually Works

A plain-English explanation of how Stripe processes payments, handles fees, refunds, and
payouts — written from real experience building FocusSharp.

---

## The Flow of a Single Payment

When a customer pays $2.99 USD on focussharp.app, here's exactly what happens:

1. **Customer enters card details** on the Stripe-hosted checkout page
2. **Stripe charges their card** — the full $2.99 USD (or equivalent in their currency)
3. **Stripe takes their fee** — 2.9% + $0.30 per transaction (for US cards)
   - On $2.99: fee = $0.39, you net = $2.60
4. **Net amount sits in your Stripe balance** — not in your bank yet
5. **Stripe pays out** to your bank account on a schedule (usually 2 business days after the charge)

---

## Stripe's Fee Structure

| Fee | Amount |
|---|---|
| Processing fee | 2.9% of the charge |
| Fixed fee | $0.30 per transaction |
| Currency conversion | +1.5% if currency conversion is involved |

**Example — CA$4.17 charge (converted from $2.99 USD):**
- Processing: 2.9% × $4.17 = ~$0.12
- Fixed: $0.30
- Currency conversion: 1.5% × $4.17 = ~$0.06
- **Total Stripe fee: ~$0.48–0.50**
- **You net: ~$3.67 CAD**

---

## Test Mode vs Live Mode

Stripe has two completely separate modes:

| | Test Mode | Live Mode |
|---|---|---|
| Card numbers | Fake test cards only | Real cards |
| Money | No real money moves | Real charges |
| Keys | `pk_test_...` / `sk_test_...` | `pk_live_...` / `sk_live_...` |
| Use for | Development, testing | Real customers |

**Test card numbers:**
- `4242 4242 4242 4242` — successful charge
- `4000 0000 0000 0002` — declined card
- Any future expiry, any 3-digit CVC, any 5-digit ZIP

Always test in test mode first. Switch to live keys only when ready for real customers.

---

## Refunds — What Actually Happens

This is the part that surprises most people.

**When you refund a customer:**
- The customer gets back the full amount they paid — Stripe processes this from your Stripe balance
- **Stripe does NOT refund their processing fee to you**
- So your Stripe balance goes down by the full charge amount, but you never get the fee back

**Example:**
- Customer paid CA$4.17
- You refund CA$4.17 → customer gets CA$4.17 back on their card ✓
- Your Stripe balance: -CA$0.50 (the fee Stripe kept)
- That negative balance is deducted from your next real payout

**The customer is never affected by this** — they get their full refund. The fee loss is purely between you and Stripe.

**Key takeaway:** Every live test you do with a real card costs you ~$0.40–0.50 in fees even if you refund immediately. Use test mode for development.

---

## Subscriptions vs One-Time Payments

FocusSharp has both:

| Plan | Type | Stripe handles |
|---|---|---|
| Pro Monthly ($2.99/mo) | Recurring subscription | Auto-charges every month |
| Pro Annual ($19.99/yr) | Recurring subscription | Auto-charges every year |
| Lifetime ($49) | One-time payment | Single charge, never again |

For subscriptions, Stripe automatically:
- Retries failed payments (card expired, insufficient funds)
- Sends payment receipts to customers
- Notifies you via webhook when a subscription renews or cancels

---

## Webhooks — How Your App Knows a Payment Happened

When a payment succeeds, Stripe doesn't just silently collect money — it sends a **webhook**:
an HTTP POST to your server with the payment details.

FocusSharp has a webhook endpoint at `/api/webhooks/stripe`. When Stripe fires it:
1. Payment succeeds → Stripe sends `checkout.session.completed` event
2. Your webhook handler receives it, verifies the signature
3. Updates `is_pro = true` in Supabase for that user
4. User now has Pro access

Without the webhook, the payment would go through but the user's account wouldn't upgrade.
**The webhook is what connects money → feature access.**

---

## Stripe Balance vs Bank Account

These are two different things:

- **Stripe balance** — money Stripe is holding for you (after fees). Not in your bank yet.
- **Bank account** — where Stripe pays out your balance on a schedule

Stripe pays out automatically on a rolling basis (usually 2 business days after each charge
for most countries). You can also trigger manual payouts from the dashboard.

If you have a negative Stripe balance (e.g. after a refund), it's automatically covered by
your next incoming payment — Stripe never charges your bank account to cover it.

---

## Currency Conversion

If your Stripe account is in CAD but a customer pays in USD:
- Stripe converts at the market rate + 1.5% conversion fee
- You receive CAD in your balance
- The customer is charged in their currency (USD)

FocusSharp is priced in USD ($2.99) but the Stripe account is Canadian, so every payment
involves a small conversion fee. This is normal for Canadian businesses charging in USD.

---

## Key Things to Know as a Founder

1. **Stripe fees are non-refundable** — every refund costs you the original processing fee
2. **Test in test mode** — live tests cost real money even if you refund
3. **Webhooks are critical** — without them, payments don't unlock features
4. **Stripe balance ≠ bank account** — there's a 2-day delay before money hits your bank
5. **Negative balance is fine** — it clears automatically from the next payment, no interest charged
6. **The customer never sees your fee situation** — refunds are always full amount to them

---

## FocusSharp-Specific Setup

| Item | Value |
|---|---|
| Stripe account | Staar Solutions |
| Currency | CAD (charges in USD, converted) |
| Products | FocusSharp Pro (2 prices), FocusSharp Lifetime |
| Webhook endpoint | `/api/webhooks/stripe` |
| Live keys | Set in Vercel environment variables |
| Test keys | Set in `.env.local` |
