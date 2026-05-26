"use client";
import { useStore } from "@/lib/store";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

export default function ThemeToggle() {
  const { setTheme } = useStore();

  const toggle = () => {
    if (typeof window === "undefined") return;
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-150"
      aria-label="Toggle theme"
    >
      <SunIcon className="w-4 h-4 hidden dark:block" />
      <MoonIcon className="w-4 h-4 block dark:hidden" />
    </button>
  );
}
