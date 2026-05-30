"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export default function AuthModal() {
  const { authModal, closeAuthModal, openAuthModal, setUser, syncOnLogin } = useStore();
  const isOpen = authModal !== "closed";
  const mode = authModal === "sign-up" ? "sign-up" : "sign-in";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const supabase = typeof window !== "undefined" ? getSupabaseBrowserClient() : null;

  const reset = () => {
    setError(null);
    setSuccess(null);
    setEmail("");
    setPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === "sign-up") {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email ?? email,
            displayName: data.user.user_metadata?.full_name ?? null,
            avatarUrl: data.user.user_metadata?.avatar_url ?? null,
          });
          syncOnLogin();
          closeAuthModal();
          reset();
        } else {
          setSuccess("Check your email to confirm your account.");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email ?? email,
            displayName: data.user.user_metadata?.full_name ?? null,
            avatarUrl: data.user.user_metadata?.avatar_url ?? null,
          });
          syncOnLogin();
          closeAuthModal();
          reset();
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/app`,
      },
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="auth-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center px-4"
          onClick={(e) => { if (e.target === e.currentTarget) { closeAuthModal(); reset(); } }}
        >
          <motion.div
            key="auth-panel"
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="mt-20 w-full max-w-sm card p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {mode === "sign-in" ? "Welcome back" : "Create account"}
            </h2>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-5">
              {mode === "sign-in"
                ? "Sign in to sync your data across devices."
                : "Free account — your data syncs across devices."}
            </p>

            {/* Google OAuth */}
            <button
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-2.5 border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors mb-4"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
              <span className="text-xs text-gray-400 dark:text-gray-600">or</span>
              <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
            </div>

            {/* Email/password form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="input-field"
              />

              {error && (
                <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
              )}
              {success && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400">{success}</p>
              )}

              <button type="submit" disabled={loading} className="btn-primary py-2.5">
                {loading ? "…" : mode === "sign-in" ? "Sign in" : "Create account"}
              </button>
            </form>

            <p className="text-xs text-center text-gray-400 dark:text-gray-600 mt-4">
              {mode === "sign-in" ? (
                <>
                  No account?{" "}
                  <button
                    onClick={() => { reset(); openAuthModal("sign-up"); }}
                    className="text-indigo-500 hover:underline"
                  >
                    Sign up free
                  </button>
                </>
              ) : (
                <>
                  Already have one?{" "}
                  <button
                    onClick={() => { reset(); openAuthModal("sign-in"); }}
                    className="text-indigo-500 hover:underline"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
