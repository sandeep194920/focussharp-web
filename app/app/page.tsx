"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { formatTime } from "@/lib/utils";
import CircularProgress from "@/components/timer/CircularProgress";
import Link from "next/link";
import { playSessionEndSound, playBreakEndSound, stopAllSounds } from "@/lib/sounds";

const QUICK_DURATIONS = [25, 40, 60, 90];
const BREAK_DURATIONS = [5, 10, 15];

export default function AppPage() {
  const {
    categories,
    timer,
    isPro,
    soundEnabled,
    setSoundEnabled,
    setActiveCat,
    setTimerDuration,
    startTimer,
    pauseTimer,
    resumeTimer,
    tickTimer,
    endSessionEarly,
    startOpenSession,
    pauseOpenSession,
    resumeOpenSession,
    tickOpenSession,
    endOpenSession,
    startBreak,
    startOpenBreak,
    endBreak,
    skipBreak,
    tickBreak,
  } = useStore();

  const prevPhaseRef = useRef(timer.phase);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickTimerRef = useRef(tickTimer);
  const tickBreakRef = useRef(tickBreak);
  const tickOpenRef = useRef(tickOpenSession);
  tickTimerRef.current = tickTimer;
  tickBreakRef.current = tickBreak;
  tickOpenRef.current = tickOpenSession;

  // Play sounds on phase transitions
  useEffect(() => {
    const prev = prevPhaseRef.current;
    prevPhaseRef.current = timer.phase;
    if (!soundEnabled) return;
    const wasRunning = prev === "running" || prev === "open-running";
    const wasBreak = prev === "break" || prev === "open-break";
    if (wasRunning && (timer.phase === "break" || timer.phase === "open-break")) {
      playSessionEndSound();
    } else if (wasBreak && timer.phase === "idle") {
      playBreakEndSound();
      setBreakJustEnded(true);
      setTimeout(() => setBreakJustEnded(false), 10000);
    }
  }, [timer.phase, soundEnabled]);

  useEffect(() => { setConfirmEnd(false); setConfirmEndOpen(false); }, [timer.phase]);

  useEffect(() => {
    const isActive = ["running", "open-running", "paused", "open-paused"].includes(timer.phase);
    if (!isActive) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [timer.phase]);

  useEffect(() => {
    if (timer.phase === "running") {
      intervalRef.current = setInterval(() => tickTimerRef.current(), 1000);
    } else if (timer.phase === "open-running") {
      intervalRef.current = setInterval(() => tickOpenRef.current(), 1000);
    } else if (timer.phase === "break" && timer.breakType === "timed") {
      intervalRef.current = setInterval(() => tickBreakRef.current(), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timer.phase, timer.breakType]);

  const [confirmEnd, setConfirmEnd] = useState(false);
  const [confirmEndOpen, setConfirmEndOpen] = useState(false);
  const [breakJustEnded, setBreakJustEnded] = useState(false);

  // Track whether confirmEnd was triggered before the 1-min mark (the "won't be counted" case)
  const confirmEndWasEarlyRef = useRef(false);

  // Auto-dismiss only when the early warning crosses 1 min — not the partial session confirmation
  useEffect(() => {
    if (confirmEnd && timer.totalSecs - timer.secsLeft >= 60 && confirmEndWasEarlyRef.current) {
      setConfirmEnd(false);
      confirmEndWasEarlyRef.current = false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer.secsLeft]);

  useEffect(() => {
    if (confirmEndOpen && timer.secsElapsed >= 60) {
      setConfirmEndOpen(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer.secsElapsed]);

  const activeCat = categories.find((c) => c.id === timer.activeCatId);
  const isOpenMode = timer.durationMins === 0;
  const progress = timer.totalSecs > 0 ? 1 - timer.secsLeft / timer.totalSecs : 0;
  // For open sessions: fill the ring slowly — cap visual at 120 min worth of seconds
  const OPEN_CAP_SECS = 120 * 60;
  const openProgress = Math.min(timer.secsElapsed / OPEN_CAP_SECS, 1);

  const SoundToggle = () => (
    <button
      onClick={() => { if (soundEnabled) stopAllSounds(); setSoundEnabled(!soundEnabled); }}
      className="p-2.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      title={soundEnabled ? "Mute sounds" : "Unmute sounds"}
    >
      {soundEnabled ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path d="M10 3.75a.75.75 0 0 0-1.264-.546L4.703 7H3.167a.75.75 0 0 0-.7.48A6.985 6.985 0 0 0 2 10c0 .887.165 1.737.468 2.52.111.29.39.48.7.48h1.535l4.033 3.796A.75.75 0 0 0 10 16.25V3.75ZM15.95 5.05a.75.75 0 0 0-1.06 1.061 5.5 5.5 0 0 1 0 7.778.75.75 0 0 0 1.06 1.06 7 7 0 0 0 0-9.899ZM13.829 7.172a.75.75 0 0 0-1.061 1.06 2.5 2.5 0 0 1 0 3.536.75.75 0 0 0 1.06 1.06 4 4 0 0 0 0-5.656Z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path d="M9.547 3.062A.75.75 0 0 1 10 3.75v12.5a.75.75 0 0 1-1.264.546L4.703 13H3.167a.75.75 0 0 1-.7-.48A6.985 6.985 0 0 1 2 10c0-.887.165-1.737.468-2.52a.75.75 0 0 1 .7-.48h1.535l4.033-3.796a.75.75 0 0 1 .811-.142ZM13.28 7.22a.75.75 0 1 0-1.06 1.06L13.94 10l-1.72 1.72a.75.75 0 0 0 1.06 1.06L15 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L16.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L15 8.94l-1.72-1.72Z" />
        </svg>
      )}
    </button>
  );

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
          <div className="self-end"><SoundToggle /></div>
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
        <div className="flex justify-end"><SoundToggle /></div>
        {breakJustEnded && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="card px-4 py-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center"
          >
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              Your break ended! Time to focus again.
            </p>
          </motion.div>
        )}
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
                {isOpenMode ? "Flow" : `${timer.durationMins} min`}
              </span>
            </div>
            {/* Duration chips */}
            <div className="flex gap-2 mb-2">
              {QUICK_DURATIONS.map((m) => (
                <button
                  key={m}
                  onClick={() => setTimerDuration(m)}
                  className={`chip flex-1 ${!isOpenMode && timer.durationMins === m ? "chip-active" : ""}`}
                >
                  {m}m
                </button>
              ))}
            </div>
            {/* Flow chip — full width */}
            <button
              onClick={() => setTimerDuration(0)}
              className={`chip w-full flex items-center gap-3 px-4 py-3 mb-3 text-left ${isOpenMode ? "chip-active" : ""}`}
            >
              <span className="text-base leading-none">∞</span>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Flow session</span>
                <span className={`text-xs font-normal mt-0.5 ${isOpenMode ? "text-indigo-200" : "text-gray-400 dark:text-gray-500"}`}>
                  Focus until you&apos;re done — no target time
                </span>
              </div>
            </button>
            {/* Slider — hidden in open mode */}
            {!isOpenMode && (
              <>
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
              </>
            )}
          </div>
        )}

        {/* Circular timer — countdown mode */}
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
              <span className="text-sm text-gray-400 dark:text-gray-400 mt-1 tabular-nums">
                / {timer.durationMins}m
              </span>
              {activeCat && (
                <span className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 flex items-center gap-1.5">
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

        {/* Circular timer — flow session count-up mode */}
        {(timer.phase === "open-running" || timer.phase === "open-paused") && (
          <div className="flex justify-center py-2">
            <CircularProgress
              progress={openProgress}
              size={240}
              strokeWidth={10}
              color={activeCat?.color ?? "#4f46e5"}
              fillUp
            >
              <span className="text-5xl font-medium tabular-nums tracking-tight text-gray-900 dark:text-white">
                {formatTime(timer.secsElapsed)}
              </span>
              <span className="text-xs font-medium tracking-wide uppercase text-gray-400 dark:text-gray-500 mt-1">
                Flow
              </span>
              {activeCat && (
                <span className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: activeCat.color }}
                  />
                  {activeCat.name}
                </span>
              )}
              {timer.phase === "open-paused" && (
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
            <CircularProgress
              progress={0}
              size={200}
              strokeWidth={8}
              color={activeCat ? activeCat.color : "#374151"}
              fillUp={isOpenMode}
            >
              {isOpenMode ? (
                <div className="flex flex-col items-center gap-1">
                  <span className={`text-4xl font-light transition-colors duration-300 ${activeCat ? "text-gray-100 dark:text-gray-100" : "text-gray-400 dark:text-gray-500"}`}>∞</span>
                  <span className={`text-xs font-medium tracking-wide uppercase transition-colors duration-300 ${activeCat ? "text-gray-400 dark:text-gray-400" : "text-gray-400 dark:text-gray-500"}`}>Flow</span>
                </div>
              ) : (
                <span className={`text-4xl font-medium tabular-nums tracking-tight transition-colors duration-300 ${activeCat ? "text-gray-100 dark:text-gray-100" : "text-gray-400 dark:text-gray-600"}`}>
                  {String(timer.durationMins).padStart(2, "0")}:00
                </span>
              )}
            </CircularProgress>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col gap-2">
          {timer.phase === "idle" && (
            <button
              onClick={isOpenMode ? startOpenSession : startTimer}
              disabled={!timer.activeCatId}
              className="btn-primary w-full py-3.5 text-base font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {!timer.activeCatId ? "Select a category to start" : "Start Session"}
            </button>
          )}

          {timer.phase === "running" && !confirmEnd && (
            <div className="flex gap-2">
              <button onClick={pauseTimer} className="btn-secondary flex-1 py-3">
                Pause
              </button>
              <button onClick={() => { confirmEndWasEarlyRef.current = timer.totalSecs - timer.secsLeft < 60; setConfirmEnd(true); }} className="btn-danger flex-1 py-3">
                End Session
              </button>
            </div>
          )}

          {timer.phase === "paused" && !confirmEnd && (
            <div className="flex gap-2">
              <button onClick={resumeTimer} className="btn-primary flex-1 py-3">
                Resume
              </button>
              <button onClick={() => { confirmEndWasEarlyRef.current = timer.totalSecs - timer.secsLeft < 60; setConfirmEnd(true); }} className="btn-danger flex-1 py-3">
                End Session
              </button>
            </div>
          )}

          {(timer.phase === "running" || timer.phase === "paused") && confirmEnd && (
            <div className="flex flex-col gap-2">
              <div className="card p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300 text-center">
                  {timer.totalSecs - timer.secsLeft < 60
                    ? "Less than 1 minute logged — this session won't be counted."
                    : `${Math.floor((timer.totalSecs - timer.secsLeft) / 60)}m will be recorded as a partial session.`}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setConfirmEnd(false)} className="btn-secondary flex-1 py-3">
                  Keep going
                </button>
                <button onClick={() => { endSessionEarly(); setConfirmEnd(false); }} className="btn-danger flex-1 py-3">
                  End anyway
                </button>
              </div>
            </div>
          )}

          {timer.phase === "open-running" && !confirmEndOpen && (
            <div className="flex gap-2">
              <button onClick={pauseOpenSession} className="btn-secondary flex-1 py-3">
                Pause
              </button>
              <button
                onClick={() => timer.secsElapsed < 60 ? setConfirmEndOpen(true) : endOpenSession()}
                className="btn-primary flex-1 py-3"
              >
                Done
              </button>
            </div>
          )}

          {timer.phase === "open-running" && confirmEndOpen && (
            <div className="flex flex-col gap-2">
              <div className="card p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300 text-center">
                  Less than 1 minute logged — this session won&apos;t be counted.
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setConfirmEndOpen(false)} className="btn-secondary flex-1 py-3">
                  Keep going
                </button>
                <button onClick={() => { endOpenSession(); setConfirmEndOpen(false); }} className="btn-danger flex-1 py-3">
                  End anyway
                </button>
              </div>
            </div>
          )}

          {timer.phase === "open-paused" && (
            <div className="flex gap-2">
              <button onClick={resumeOpenSession} className="btn-primary flex-1 py-3">
                Resume
              </button>
              <button
                onClick={() => timer.secsElapsed < 60 ? setConfirmEndOpen(true) : endOpenSession()}
                className="btn-secondary flex-1 py-3"
              >
                Done
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
