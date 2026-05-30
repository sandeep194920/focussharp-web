"use client";
import { useState } from "react";

interface Props {
  placeholder?: string;
  buttonLabel?: string;
  note?: string;
  source?: string;
}

export default function EmailCapture({
  placeholder = "your@email.com",
  buttonLabel = "Notify me",
  note = "No spam. Unsubscribe anytime.",
  source,
}: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Something went wrong");
      }
      setStatus("success");
      setEmail("");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div>
        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
          You&apos;re on the list! We&apos;ll let you know when it launches.
        </p>
      </div>
    );
  }

  return (
    <div>
      <form className="flex gap-2" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder={placeholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input-field flex-1 text-sm"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="btn-primary text-sm px-4 whitespace-nowrap"
        >
          {status === "loading" ? "…" : buttonLabel}
        </button>
      </form>
      {status === "error" && (
        <p className="text-xs text-red-500 mt-1">{errorMsg}</p>
      )}
      {note && status !== "error" && (
        <p className="text-xs text-gray-400 mt-2">{note}</p>
      )}
    </div>
  );
}
