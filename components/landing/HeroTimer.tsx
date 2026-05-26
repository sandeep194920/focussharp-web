"use client";
import { useState, useEffect, useRef } from "react";
import CircularProgress from "@/components/timer/CircularProgress";

const DEMO_DURATION = 25 * 60;

export default function HeroTimer() {
  const [secsLeft, setSecsLeft] = useState(DEMO_DURATION);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecsLeft((s) => {
          if (s <= 1) {
            setRunning(false);
            return DEMO_DURATION;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const progress = 1 - secsLeft / DEMO_DURATION;
  const m = Math.floor(secsLeft / 60);
  const s = secsLeft % 60;
  const display = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

  return (
    <div className="flex flex-col items-center gap-6">
      <CircularProgress progress={progress} size={200} strokeWidth={8} color="#4f46e5">
        <span className="text-4xl font-medium tabular-nums tracking-tight text-gray-900 dark:text-white">
          {display}
        </span>
        <span className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-indigo-500" />
          Deep Work
        </span>
      </CircularProgress>
      <button
        onClick={() => {
          if (!running) setSecsLeft(DEMO_DURATION);
          setRunning((r) => !r);
        }}
        className={`px-8 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 active:scale-[0.97] ${
          running
            ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
            : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
        }`}
      >
        {running ? "Pause demo" : "Try it live"}
      </button>
    </div>
  );
}
