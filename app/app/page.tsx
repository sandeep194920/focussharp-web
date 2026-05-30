"use client";
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { formatTime } from "@/lib/utils";
import CircularProgress from "@/components/timer/CircularProgress";
import Link from "next/link";

const QUICK_DURATIONS = [25, 40, 60, 90];
const BREAK_DURATIONS = [5, 10, 15];

export default function AppPage() {
  const {
    categories,
    timer,
    isPro,
    setActiveCat,
    setTimerDuration,
    startTimer,
    pauseTimer,
    resumeTimer,
    tickTimer,
    endSessionEarly,
    startBreak,
    startOpenBreak,
    endBreak,
    skipBreak,
    tickBreak,
  } = useStore();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickTimerRef = useRef(tickTimer);
  const tickBreakRef = useRef(tickBreak);
  tickTimerRef.current = tickTimer;
  tickBreakRef.current = tickBreak;

  useEffect(() => {
    if (timer.phase === "running") {
      intervalRef.current = setInterval(() => tickTimerRef.current(), 1000);
    } else if (timer.phase === "break" && timer.breakType === "timed") {
      intervalRef.current = setInterval(() => tickBreakRef.current(), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timer.phase, timer.breakType]);

  const activeCat = categories.find((c) => c.id === timer.activeCatId);
  const progress =
    timer.totalSecs > 0 ? 1 - timer.secsLeft / timer.totalSecs : 0;

  // --- BREAK SCREEN ---
  if (timer.phase === "break" || timer.phase === "open-break") {
    const isTimedBreakRunning = timer.phase === "break" && timer.breakType === "timed" && timer.breakSecsLeft > 0;
    const isChoosingBreak = timer.phase === "break" && !timer.breakType;

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="break"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="flex flex-col items-center gap-6 py-4"
        >
          {/* Session done badge */}
          <div className="card px-6 py-4 text-center w-full">
            <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full text-sm font-medium mb-3">
              <span>✓</span>
              <span>Session complete</span>
            </div>
            {activeCat && (
              <div className="flex items-center justify-center gap-2 mt-1">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: activeCat.color }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {activeCat.name}
                </span>
              </div>
            )}
          </div>

          {/* Timed break countdown */}
          {isTimedBreakRunning && (
            <div className="flex flex-col items-center gap-3">
              <p className="label-sm">Break ends in</p>
              <CircularProgress
                progress={timer.breakSecsLeft / (timer.breakSecsLeft + (timer.totalSecs > 0 ? 0 : 0))}
                size={180}
                strokeWidth={6}
                color="#10b981"
              >
                <span className="text-4xl font-medium tabular-nums tracking-tight">
                  {formatTime(timer.breakSecsLeft)}
                </span>
              </CircularProgress>
              <button onClick={endBreak} className="btn-ghost text-sm">
                End break early
              </button>
            </div>
          )}

          {/* Choose break type */}
          {isChoosingBreak && (
            <div className="w-full flex flex-col gap-4">
              <h2 className="text-lg font-semibold text-center text-gray-900 dark:text-white">
                Take a break?
              </h2>
              <div className="card p-4 flex flex-col gap-3">
                <p className="label-sm">Timed break</p>
                <div className="flex gap-2">
                  {BREAK_DURATIONS.map((m) => (
                    <button
                      key={m}
                      onClick={() => startBreak("timed", m)}
                      className="chip"
                    >
                      {m}m
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={startOpenBreak}
                className="card p-4 w-full text-left hover:shadow-md transition-shadow"
              >
                <p className="font-medium text-gray-900 dark:text-white">
                  Open break
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  I&apos;ll decide when I&apos;m back
                </p>
              </button>
              <button onClick={skipBreak} className="btn-secondary w-full">
                Skip break — start next session
              </button>
            </div>
          )}

          {/* Open break */}
          {timer.phase === "open-break" && (
            <div className="flex flex-col items-center gap-6 w-full">
              <div className="card p-8 w-full text-center">
                <p className="text-4xl mb-3">☕</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  Enjoy your break
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Come back whenever you&apos;re ready
                </p>
              </div>
              <button onClick={endBreak} className="btn-primary w-full py-3 text-base">
                I&apos;m back — start next session
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  }

  // --- TIMER SCREEN (idle / running / paused) ---
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="timer"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-5"
      >
        {/* Category picker */}
        <div className="card p-4">
          <p className="label-sm mb-3">Category</p>
          {categories.length === 0 ? (
            <Link
              href="/app/categories"
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              + Create your first category
            </Link>
          ) : (
            <div className="flex flex-col gap-1">
              {categories.map((cat) => {
                const isActive = timer.activeCatId === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => timer.phase === "idle" && setActiveCat(cat.id)}
                    disabled={timer.phase !== "idle"}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-left ${
                      isActive
                        ? "bg-indigo-50 dark:bg-indigo-950/40 ring-1 ring-indigo-200 dark:ring-indigo-800"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800/60"
                    } disabled:opacity-60`}
                  >
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {cat.name}
                    </span>
                    {isActive && (
                      <span className="ml-auto text-indigo-600 dark:text-indigo-400 text-xs font-medium">
                        Selected
                      </span>
                    )}
                  </button>
                );
              })}
              {!isPro && categories.length >= 3 && (
                <p className="text-xs text-gray-400 dark:text-gray-600 mt-1 px-1">
                  Free plan: 3 categories max.{" "}
                  <Link href="/pricing" className="text-indigo-500 hover:underline">
                    Upgrade for unlimited
                  </Link>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Duration */}
        {timer.phase === "idle" && (
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="label-sm">Duration</p>
              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                {timer.durationMins} min
              </span>
            </div>
            {/* Quick chips */}
            <div className="flex gap-2 mb-4">
              {QUICK_DURATIONS.map((m) => (
                <button
                  key={m}
                  onClick={() => setTimerDuration(m)}
                  className={`chip ${timer.durationMins === m ? "chip-active" : ""}`}
                >
                  {m}m
                </button>
              ))}
            </div>
            {/* Slider */}
            <input
              type="range"
              min={5}
              max={120}
              step={5}
              value={timer.durationMins}
              onChange={(e) => setTimerDuration(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>5m</span>
              <span>120m</span>
            </div>
          </div>
        )}

        {/* Circular timer */}
        {(timer.phase === "running" || timer.phase === "paused") && (
          <div className="flex justify-center py-2">
            <CircularProgress
              progress={progress}
              size={240}
              strokeWidth={10}
              color={activeCat?.color ?? "#4f46e5"}
            >
              <span className="text-5xl font-medium tabular-nums tracking-tight text-gray-900 dark:text-white">
                {formatTime(timer.secsLeft)}
              </span>
              {activeCat && (
                <span className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: activeCat.color }}
                  />
                  {activeCat.name}
                </span>
              )}
              {timer.phase === "paused" && (
                <span className="text-xs text-amber-500 font-medium mt-1">
                  Paused
                </span>
              )}
            </CircularProgress>
          </div>
        )}

        {/* Idle duration display */}
        {timer.phase === "idle" && (
          <div className="flex justify-center py-4">
            <CircularProgress progress={0} size={200} strokeWidth={8} color="#4f46e5">
              <span className="text-4xl font-medium tabular-nums tracking-tight text-gray-400 dark:text-gray-600">
                {String(timer.durationMins).padStart(2, "0")}:00
              </span>
            </CircularProgress>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col gap-2">
          {timer.phase === "idle" && (
            <button
              onClick={startTimer}
              disabled={!timer.activeCatId}
              className="btn-primary w-full py-3.5 text-base font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {!timer.activeCatId ? "Select a category to start" : "Start Session"}
            </button>
          )}

          {timer.phase === "running" && (
            <div className="flex gap-2">
              <button onClick={pauseTimer} className="btn-secondary flex-1 py-3">
                Pause
              </button>
              <button onClick={endSessionEarly} className="btn-danger flex-1 py-3">
                End Early
              </button>
            </div>
          )}

          {timer.phase === "paused" && (
            <div className="flex gap-2">
              <button onClick={resumeTimer} className="btn-primary flex-1 py-3">
                Resume
              </button>
              <button onClick={endSessionEarly} className="btn-danger flex-1 py-3">
                End Session
              </button>
            </div>
          )}
        </div>

        {/* Hint when no category */}
        {!timer.activeCatId && timer.phase === "idle" && (
          <p className="text-center text-sm text-gray-400 dark:text-gray-600">
            Pick a category above, set your duration, then start.
          </p>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
