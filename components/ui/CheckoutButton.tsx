"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import type { PlanKey } from "@/lib/stripe";

interface Props {
  plan: PlanKey | "free";
  className?: string;
  children: React.ReactNode;
}

export default function CheckoutButton({ plan, className, children }: Props) {
  const { user, openAuthModal } = useStore();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (plan === "free") {
      window.location.href = "/app";
      return;
    }

    if (!user) {
      openAuthModal("sign-up");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={handleClick} disabled={loading} className={className}>
      {loading ? "Redirecting…" : children}
    </button>
  );
}
