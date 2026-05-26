"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const CATEGORY_COLORS = [
  "#4f46e5", // indigo
  "#0ea5e9", // sky
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#14b8a6", // teal
];

export const FREE_CATEGORY_LIMIT = 3;
export const FREE_HISTORY_DAYS = 7;

export interface Category {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

export interface Session {
  id: string;
  catId: string;
  catName: string;
  catColor: string;
  durationMins: number;
  startedAt: number;
  completedAt: number;
  completed: boolean; // true = natural end, false = ended early
  type: "focus" | "break";
}

export type TimerPhase = "idle" | "running" | "paused" | "break" | "open-break";

export interface TimerState {
  phase: TimerPhase;
  activeCatId: string | null;
  durationMins: number;
  secsLeft: number;
  totalSecs: number;
  sessionStart: number | null;
  breakSecsLeft: number;
  breakType: "timed" | "open" | null;
}

interface AppState {
  // Settings
  isPro: boolean;
  theme: "light" | "dark" | "system";

  // Categories
  categories: Category[];
  addCategory: (name: string, color: string) => void;
  updateCategory: (id: string, name: string, color: string) => void;
  deleteCategory: (id: string) => void;

  // Sessions
  sessions: Session[];
  addSession: (session: Omit<Session, "id">) => void;
  clearSessions: () => void;

  // Timer
  timer: TimerState;
  setTimerDuration: (mins: number) => void;
  setActiveCat: (catId: string | null) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  tickTimer: () => void;
  endSessionEarly: () => void;
  startBreak: (type: "timed", mins: number) => void;
  startOpenBreak: () => void;
  endBreak: () => void;
  skipBreak: () => void;
  tickBreak: () => void;
  resetTimer: () => void;

  // Theme
  setTheme: (theme: "light" | "dark" | "system") => void;
}

const defaultTimer: TimerState = {
  phase: "idle",
  activeCatId: null,
  durationMins: 40,
  secsLeft: 40 * 60,
  totalSecs: 40 * 60,
  sessionStart: null,
  breakSecsLeft: 0,
  breakType: null,
};

const defaultCategories: Category[] = [
  { id: "cat-1", name: "Deep Work", color: "#4f46e5", createdAt: Date.now() - 3000 },
  { id: "cat-2", name: "Reading", color: "#10b981", createdAt: Date.now() - 2000 },
  { id: "cat-3", name: "Admin", color: "#f59e0b", createdAt: Date.now() - 1000 },
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      isPro: false,
      theme: "system",
      categories: defaultCategories,
      sessions: [],
      timer: defaultTimer,

      addCategory: (name, color) => {
        const { categories, isPro } = get();
        if (!isPro && categories.length >= FREE_CATEGORY_LIMIT) return;
        set((s) => ({
          categories: [
            ...s.categories,
            {
              id: `cat-${Date.now()}`,
              name,
              color,
              createdAt: Date.now(),
            },
          ],
        }));
      },

      updateCategory: (id, name, color) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === id ? { ...c, name, color } : c
          ),
        })),

      deleteCategory: (id) =>
        set((s) => ({
          categories: s.categories.filter((c) => c.id !== id),
          timer:
            s.timer.activeCatId === id
              ? { ...defaultTimer }
              : s.timer,
        })),

      addSession: (session) =>
        set((s) => ({
          sessions: [
            ...s.sessions,
            { ...session, id: `sess-${Date.now()}-${Math.random()}` },
          ],
        })),

      clearSessions: () => set({ sessions: [] }),

      setTimerDuration: (mins) =>
        set((s) => ({
          timer: {
            ...s.timer,
            durationMins: mins,
            secsLeft: mins * 60,
            totalSecs: mins * 60,
          },
        })),

      setActiveCat: (catId) =>
        set((s) => ({ timer: { ...s.timer, activeCatId: catId } })),

      startTimer: () => {
        const { timer, categories } = get();
        if (!timer.activeCatId) return;
        const cat = categories.find((c) => c.id === timer.activeCatId);
        if (!cat) return;
        set((s) => ({
          timer: {
            ...s.timer,
            phase: "running",
            secsLeft: s.timer.durationMins * 60,
            totalSecs: s.timer.durationMins * 60,
            sessionStart: Date.now(),
          },
        }));
      },

      pauseTimer: () =>
        set((s) => ({ timer: { ...s.timer, phase: "paused" } })),

      resumeTimer: () =>
        set((s) => ({ timer: { ...s.timer, phase: "running" } })),

      tickTimer: () => {
        const { timer, categories, addSession } = get();
        if (timer.phase !== "running") return;
        const newSecs = timer.secsLeft - 1;
        if (newSecs <= 0) {
          // Session complete
          const cat = categories.find((c) => c.id === timer.activeCatId);
          if (cat && timer.sessionStart) {
            addSession({
              catId: cat.id,
              catName: cat.name,
              catColor: cat.color,
              durationMins: timer.durationMins,
              startedAt: timer.sessionStart,
              completedAt: Date.now(),
              completed: true,
              type: "focus",
            });
          }
          set((s) => ({
            timer: { ...s.timer, phase: "break", secsLeft: 0, breakSecsLeft: 0, breakType: null },
          }));
        } else {
          set((s) => ({ timer: { ...s.timer, secsLeft: newSecs } }));
        }
      },

      endSessionEarly: () => {
        const { timer, categories, addSession } = get();
        const cat = categories.find((c) => c.id === timer.activeCatId);
        const elapsed = Math.floor((timer.totalSecs - timer.secsLeft) / 60);
        if (cat && timer.sessionStart && elapsed >= 1) {
          addSession({
            catId: cat.id,
            catName: cat.name,
            catColor: cat.color,
            durationMins: elapsed,
            startedAt: timer.sessionStart,
            completedAt: Date.now(),
            completed: false,
            type: "focus",
          });
        }
        set((s) => ({
          timer: { ...s.timer, phase: "break", secsLeft: 0, breakSecsLeft: 0, breakType: null },
        }));
      },

      startBreak: (type, mins) =>
        set((s) => ({
          timer: {
            ...s.timer,
            phase: "break",
            breakSecsLeft: mins * 60,
            breakType: type,
          },
        })),

      startOpenBreak: () =>
        set((s) => ({
          timer: { ...s.timer, phase: "open-break", breakType: "open" },
        })),

      endBreak: () =>
        set((s) => ({
          timer: {
            ...s.timer,
            phase: "idle",
            breakSecsLeft: 0,
            breakType: null,
            secsLeft: s.timer.durationMins * 60,
            totalSecs: s.timer.durationMins * 60,
            sessionStart: null,
          },
        })),

      skipBreak: () =>
        set((s) => ({
          timer: {
            ...s.timer,
            phase: "idle",
            breakSecsLeft: 0,
            breakType: null,
            secsLeft: s.timer.durationMins * 60,
            totalSecs: s.timer.durationMins * 60,
            sessionStart: null,
          },
        })),

      tickBreak: () => {
        const { timer } = get();
        if (timer.phase !== "break" || timer.breakType !== "timed") return;
        const newSecs = timer.breakSecsLeft - 1;
        if (newSecs <= 0) {
          get().endBreak();
        } else {
          set((s) => ({ timer: { ...s.timer, breakSecsLeft: newSecs } }));
        }
      },

      resetTimer: () =>
        set((s) => ({
          timer: { ...defaultTimer, activeCatId: s.timer.activeCatId, durationMins: s.timer.durationMins, secsLeft: s.timer.durationMins * 60, totalSecs: s.timer.durationMins * 60 },
        })),

      setTheme: (theme) => {
        set({ theme });
        if (typeof window !== "undefined") {
          const root = document.documentElement;
          if (theme === "dark") {
            root.classList.add("dark");
            localStorage.setItem("focussharp-theme", "dark");
          } else if (theme === "light") {
            root.classList.remove("dark");
            localStorage.setItem("focussharp-theme", "light");
          } else {
            localStorage.removeItem("focussharp-theme");
            if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
              root.classList.add("dark");
            } else {
              root.classList.remove("dark");
            }
          }
        }
      },
    }),
    {
      name: "focussharp-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        isPro: s.isPro,
        theme: s.theme,
        categories: s.categories,
        sessions: s.sessions,
      }),
    }
  )
);
