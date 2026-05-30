"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useStore } from "@/lib/store";

export default function UserMenu() {
  const { user, isPro, openAuthModal, signOut } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) {
    return (
      <button
        onClick={() => openAuthModal("sign-in")}
        className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors px-2 py-1"
      >
        Sign in
      </button>
    );
  }

  const initials = (user.displayName ?? user.email)
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center overflow-hidden ring-2 ring-transparent hover:ring-indigo-300 dark:hover:ring-indigo-700 transition-all"
        aria-label="Account menu"
      >
        {user.avatarUrl ? (
          <Image src={user.avatarUrl} alt="avatar" width={32} height={32} className="object-cover" />
        ) : (
          <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">{initials}</span>
        )}
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-52 card p-1 shadow-lg z-50">
          <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
            <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{user.displayName ?? user.email}</p>
            <p className="text-xs text-gray-400 dark:text-gray-600 truncate">{user.email}</p>
            {isPro && (
              <span className="inline-block mt-1 text-[10px] font-semibold bg-indigo-600 text-white rounded-full px-2 py-0.5">
                Pro
              </span>
            )}
          </div>
          <button
            onClick={async () => { setOpen(false); await signOut(); }}
            className="w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
