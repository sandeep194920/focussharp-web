import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export const STRIPE_PRICES = {
  monthly: process.env.STRIPE_PRICE_MONTHLY!,
  annual: process.env.STRIPE_PRICE_ANNUAL!,
  lifetime: process.env.STRIPE_PRICE_LIFETIME!,
} as const;

export type PlanKey = keyof typeof STRIPE_PRICES;
