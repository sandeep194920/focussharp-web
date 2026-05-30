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

export type TimerPhase = "idle" | "running" | "paused" | "open-running" | "open-paused" | "break" | "open-break";

export interface TimerState {
  phase: TimerPhase;
  activeCatId: string | null;
  durationMins: number; // 0 = open session (no target)
  secsLeft: number;
  totalSecs: number;
  sessionStart: number | null;
  pausedAt: number | null;
  secsElapsed: number; // for open sessions: total elapsed excluding pauses
  breakSecsLeft: number;
  breakDurationSecs: number;
  breakStart: number | null;
  breakType: "timed" | "open" | null;
}

export interface AuthUser {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
}

interface AppState {
  // Settings
  isPro: boolean;
  theme: "light" | "dark" | "system";
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;

  // Auth (NOT persisted to localStorage)
  user: AuthUser | null;
  isSyncing: boolean;
  authModal: "closed" | "sign-in" | "sign-up";

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
  startOpenSession: () => void;
  pauseOpenSession: () => void;
  resumeOpenSession: () => void;
  tickOpenSession: () => void;
  endOpenSession: () => void;
  startBreak: (type: "timed", mins: number) => void;
  startOpenBreak: () => void;
  endBreak: () => void;
  skipBreak: () => void;
  tickBreak: () => void;
  resetTimer: () => void;

  // Theme
  setTheme: (theme: "light" | "dark" | "system") => void;

  // Auth actions
  setUser: (user: AuthUser | null) => void;
  setIsPro: (val: boolean) => void;
  openAuthModal: (mode: "sign-in" | "sign-up") => void;
  closeAuthModal: () => void;
  signOut: () => Promise<void>;
  syncOnLogin: () => Promise<void>;

  // Internal sync helpers (fire-and-forget)
  _pushCategory: (cat: Category) => void;
  _pushSession: (session: Session) => void;
  _deleteRemoteCategory: (id: string) => void;
}

const defaultTimer: TimerState = {
  phase: "idle",
  activeCatId: null,
  durationMins: 40,
  secsLeft: 40 * 60,
  totalSecs: 40 * 60,
  sessionStart: null,
  pausedAt: null,
  secsElapsed: 0,
  breakSecsLeft: 0,
  breakDurationSecs: 0,
  breakStart: null,
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
      soundEnabled: true,
      setSoundEnabled: (val) => set({ soundEnabled: val }),
      categories: defaultCategories,
      sessions: [],
      timer: defaultTimer,

      // Auth state (not persisted)
      user: null,
      isSyncing: false,
      authModal: "closed",

      addCategory: (name, color) => {
        const { categories, isPro, user, _pushCategory } = get();
        if (!isPro && categories.length >= FREE_CATEGORY_LIMIT) return;
        const newCat: Category = {
          id: `cat-${Date.now()}`,
          name,
          color,
          createdAt: Date.now(),
        };
        set((s) => ({ categories: [...s.categories, newCat] }));
        if (user) _pushCategory(newCat);
      },

      updateCategory: (id, name, color) => {
        const { user, _pushCategory } = get();
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === id ? { ...c, name, color } : c
          ),
        }));
        if (user) {
          const updated = get().categories.find((c) => c.id === id);
          if (updated) _pushCategory(updated);
        }
      },

      deleteCategory: (id) => {
        const { user, _deleteRemoteCategory } = get();
        set((s) => ({
          categories: s.categories.filter((c) => c.id !== id),
          timer:
            s.timer.activeCatId === id
              ? { ...defaultTimer }
              : s.timer,
        }));
        if (user) _deleteRemoteCategory(id);
      },

      addSession: (session) => {
        const id = `sess-${Date.now()}-${Math.random()}`;
        const newSession: Session = { ...session, id };
        set((s) => ({ sessions: [...s.sessions, newSession] }));
        const { user, _pushSession } = get();
        if (user) _pushSession(newSession);
      },

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
        set((s) => ({ timer: { ...s.timer, phase: "paused", pausedAt: Date.now() } })),

      resumeTimer: () =>
        set((s) => {
          const pauseDuration = s.timer.pausedAt ? Date.now() - s.timer.pausedAt : 0;
          return {
            timer: {
              ...s.timer,
              phase: "running",
              pausedAt: null,
              sessionStart: s.timer.sessionStart ? s.timer.sessionStart + pauseDuration : Date.now(),
            },
          };
        }),

      tickTimer: () => {
        const { timer, categories, addSession } = get();
        if (timer.phase !== "running" || !timer.sessionStart) return;
        const elapsed = Math.floor((Date.now() - timer.sessionStart) / 1000);
        const newSecs = Math.max(0, timer.totalSecs - elapsed);
        if (newSecs <= 0) {
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

      startOpenSession: () => {
        const { timer, categories } = get();
        if (!timer.activeCatId) return;
        const cat = categories.find((c) => c.id === timer.activeCatId);
        if (!cat) return;
        set((s) => ({
          timer: {
            ...s.timer,
            phase: "open-running",
            sessionStart: Date.now(),
            secsElapsed: 0,
            pausedAt: null,
          },
        }));
      },

      pauseOpenSession: () =>
        set((s) => ({
          timer: {
            ...s.timer,
            phase: "open-paused",
            pausedAt: Date.now(),
            sessionStart: null,
          },
        })),

      resumeOpenSession: () =>
        set((s) => ({
          timer: {
            ...s.timer,
            phase: "open-running",
            sessionStart: Date.now(),
            pausedAt: null,
          },
        })),

      tickOpenSession: () => {
        const { timer } = get();
        if (timer.phase !== "open-running") return;
        set((s) => ({ timer: { ...s.timer, secsElapsed: s.timer.secsElapsed + 1 } }));
      },

      endOpenSession: () => {
        const { timer, categories, addSession } = get();
        const cat = categories.find((c) => c.id === timer.activeCatId);
        const durationMins = Math.floor(timer.secsElapsed / 60);
        if (cat && durationMins >= 1) {
          addSession({
            catId: cat.id,
            catName: cat.name,
            catColor: cat.color,
            durationMins,
            startedAt: Date.now() - timer.secsElapsed * 1000,
            completedAt: Date.now(),
            completed: true,
            type: "focus",
          });
        }
        set((s) => ({
          timer: {
            ...s.timer,
            phase: "break",
            secsElapsed: 0,
            sessionStart: null,
            pausedAt: null,
            breakSecsLeft: 0,
            breakType: null,
          },
        }));
      },

      startBreak: (type, mins) =>
        set((s) => ({
          timer: {
            ...s.timer,
            phase: "break",
            breakDurationSecs: mins * 60,
            breakSecsLeft: mins * 60,
            breakStart: Date.now(),
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
            activeCatId: null,
            breakSecsLeft: 0,
            breakDurationSecs: 0,
            breakStart: null,
            breakType: null,
            secsLeft: s.timer.durationMins * 60,
            totalSecs: s.timer.durationMins * 60,
            sessionStart: null,
            pausedAt: null,
            secsElapsed: 0,
          },
        })),

      skipBreak: () =>
        set((s) => ({
          timer: {
            ...s.timer,
            phase: "idle",
            activeCatId: null,
            breakSecsLeft: 0,
            breakDurationSecs: 0,
            breakStart: null,
            breakType: null,
            secsLeft: s.timer.durationMins * 60,
            totalSecs: s.timer.durationMins * 60,
            sessionStart: null,
            pausedAt: null,
            secsElapsed: 0,
          },
        })),

      tickBreak: () => {
        const { timer } = get();
        if (timer.phase !== "break" || timer.breakType !== "timed" || !timer.breakStart) return;
        const elapsed = Math.floor((Date.now() - timer.breakStart) / 1000);
        const newSecs = Math.max(0, timer.breakDurationSecs - elapsed);
        if (newSecs <= 0) {
          get().endBreak();
        } else {
          set((s) => ({ timer: { ...s.timer, breakSecsLeft: newSecs } }));
        }
      },

      resetTimer: () =>
        set((s) => ({
          timer: {
            ...defaultTimer,
            activeCatId: s.timer.activeCatId,
            durationMins: s.timer.durationMins,
            secsLeft: s.timer.durationMins * 60,
            totalSecs: s.timer.durationMins * 60,
            secsElapsed: 0,
          },
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

      // Auth actions
      setUser: (user) => set({ user }),

      setIsPro: (val) => set({ isPro: val }),

      openAuthModal: (mode) => set({ authModal: mode }),

      closeAuthModal: () => set({ authModal: "closed" }),

      signOut: async () => {
        await fetch("/api/auth/signout", { method: "POST" });
        set({ user: null, isPro: false });
      },

      syncOnLogin: async () => {
        set({ isSyncing: true });
        try {
          const [profileRes, categoriesRes, sessionsRes] = await Promise.all([
            fetch("/api/profile"),
            fetch("/api/categories"),
            fetch("/api/sessions"),
          ]);

          if (profileRes.ok) {
            const profile = await profileRes.json();
            get().setIsPro(profile.is_pro ?? false);
          }

          const { categories: localCats, sessions: localSessions } = get();

          if (categoriesRes.ok) {
            const remoteCats: Category[] = (await categoriesRes.json()).map(
              (r: { id: string; name: string; color: string; created_at: number }) => ({
                id: r.id,
                name: r.name,
                color: r.color,
                createdAt: r.created_at,
              })
            );

            // Merge: union by id, remote wins on conflict
            const remoteIds = new Set(remoteCats.map((c) => c.id));
            const localOnly = localCats.filter((c) => !remoteIds.has(c.id));
            const merged = [...remoteCats, ...localOnly];
            set({ categories: merged });

            // Push local-only records to DB
            localOnly.forEach((c) => get()._pushCategory(c));
          }

          if (sessionsRes.ok) {
            const remoteSessions: Session[] = await sessionsRes.json();
            const remoteIds = new Set(remoteSessions.map((s) => s.id));
            const localOnly = localSessions.filter((s) => !remoteIds.has(s.id));
            const merged = [...remoteSessions, ...localOnly];
            set({ sessions: merged });

            localOnly.forEach((s) => get()._pushSession(s));
          }
        } finally {
          set({ isSyncing: false });
        }
      },

      _pushCategory: (cat) => {
        fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: cat.id, name: cat.name, color: cat.color, createdAt: cat.createdAt }),
        }).catch(() => {/* silent — data stays in localStorage */});
      },

      _pushSession: (session) => {
        fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(session),
        }).catch(() => {/* silent */});
      },

      _deleteRemoteCategory: (id) => {
        fetch(`/api/categories?id=${encodeURIComponent(id)}`, { method: "DELETE" })
          .catch(() => {/* silent */});
      },
    }),
    {
      name: "focussharp-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        isPro: s.isPro,
        theme: s.theme,
        soundEnabled: s.soundEnabled,
        categories: s.categories,
        sessions: s.sessions,
      }),
    }
  )
);
