"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import {
  filterSessionsByPeriod,
  aggregateByCategory,
  aggregateByDay,
  getPreviousPeriodSessions,
  percentChange,
  formatDuration,
} from "@/lib/utils";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import Link from "next/link";

type Period = "today" | "week" | "month";

const PERIOD_LABELS: Record<Period, string> = {
  today: "Today",
  week: "Last 7 days",
  month: "Last 30 days",
};

const BAR_DAYS: Record<Period, number> = {
  today: 1,
  week: 7,
  month: 30,
};

// AD_SLOT: replace with AdSense code when approved (stats sidebar, desktop only)

export default function StatsPage() {
  const { sessions, categories, isPro } = useStore();
  const [period, setPeriod] = useState<Period>("today");

  const filtered = filterSessionsByPeriod(sessions, period, isPro);
  const prevFiltered = getPreviousPeriodSessions(sessions, period);

  const totalMins = filtered.reduce((s, x) => s + x.durationMins, 0);
  const sessionCount = filtered.length;
  const partialCount = filtered.filter((s) => !s.completed).length;
  const prevTotalMins = prevFiltered.reduce((s, x) => s + x.durationMins, 0);
  const pctChange = percentChange(totalMins, prevTotalMins);

  const byCat = aggregateByCategory(filtered, categories);
  const byDay = aggregateByDay(filtered, BAR_DAYS[period]);

  // Group individual sessions by category for the breakdown
  const sessionsByCat = byCat.map((cat) => ({
    ...cat,
    sessions: filtered.filter((s) => s.catId === cat.catId),
  }));

  const isEmpty = filtered.length === 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Stats
        </h1>
        {!isPro && (
          <span className="text-xs text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">
            7-day history •{" "}
            <Link href="/pricing" className="text-indigo-500 hover:underline">
              Upgrade
            </Link>
          </span>
        )}
      </div>

      {/* Period toggle */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800/60 p-1 rounded-xl">
        {(["today", "week", "month"] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`tab ${period === p ? "tab-active" : ""}`}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {isEmpty ? (
        <div className="card p-10 text-center">
          <p className="text-4xl mb-3">📊</p>
          <p className="font-medium text-gray-700 dark:text-gray-300">
            No sessions yet
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-600 mt-1">
            Complete a focus session to see your stats here.
          </p>
          <Link href="/app" className="btn-primary inline-block mt-4 text-sm">
            Start a session
          </Link>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="card p-4">
              <p className="label-sm mb-1">Total focus</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {formatDuration(totalMins)}
              </p>
              {pctChange !== null && (
                <p
                  className={`text-xs mt-1 font-medium ${
                    pctChange >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-500 dark:text-red-400"
                  }`}
                >
                  {pctChange >= 0 ? "↑" : "↓"} {Math.abs(pctChange)}% vs prev
                </p>
              )}
            </div>
            <div className="card p-4">
              <p className="label-sm mb-1">Sessions</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {sessionCount}
              </p>
              {sessionCount > 0 && (
                <p className="text-xs mt-1 text-gray-400 dark:text-gray-500">
                  avg {formatDuration(Math.round(totalMins / sessionCount))} each
                </p>
              )}
              {partialCount > 0 && (
                <p className="text-xs mt-1 text-amber-500 dark:text-amber-400">
                  {partialCount} ended early
                </p>
              )}
            </div>
          </div>

          {/* Category breakdown — shown first so users see details before summary */}
          <div className="card p-4">
            <p className="label-sm mb-3">Category breakdown</p>
            <div className="flex flex-col gap-4">
              {sessionsByCat.map((cat) => (
                <div key={cat.catId}>
                  {/* Category header row */}
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: cat.catColor + "22" }}
                    >
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.catColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                          {cat.catName}
                        </span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white ml-2">
                          {formatDuration(cat.sessions.reduce((sum, s) => sum + s.durationMins, 0))}
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${totalMins > 0 ? (cat.totalMins / totalMins) * 100 : 0}%`,
                            backgroundColor: cat.catColor,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  {/* Individual session chips */}
                  <div className="ml-11 flex flex-wrap gap-1 mt-1">
                    {cat.sessions.map((s) => (
                      <span
                        key={s.id}
                        className={`group relative inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium cursor-default ${
                          s.completed
                            ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                            : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20"
                        }`}
                      >
                        {!s.completed && <span className="w-1 h-1 rounded-full bg-rose-500 dark:bg-rose-400 flex-shrink-0" />}
                        {formatDuration(s.durationMins)}
                        {!s.completed && (
                          <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[180px] rounded-lg bg-gray-900 dark:bg-gray-700 px-2.5 py-1.5 text-[11px] font-normal text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-center leading-snug shadow-lg z-50">
                            Stopped early — timer wasn&apos;t finished
                            <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Donut chart — category split at a glance */}
          {byCat.length > 1 && (
            <div className="card p-4">
              <p className="label-sm mb-4">Time split</p>
              <div className="flex items-center gap-4">
                <div style={{ width: 140, height: 140 }} className="flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={byCat}
                        dataKey="totalMins"
                        nameKey="catName"
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={65}
                        paddingAngle={2}
                        strokeWidth={0}
                      >
                        {byCat.map((entry) => (
                          <Cell key={entry.catId} fill={entry.catColor} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  {byCat.map((cat) => {
                    const pct = totalMins > 0 ? Math.round((cat.totalMins / totalMins) * 100) : 0;
                    return (
                      <div key={cat.catId}>
                        <div className="flex items-center justify-between mb-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.catColor }} />
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate max-w-[80px]">
                              {cat.catName}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{pct}%</span>
                        </div>
                        <div className="h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: cat.catColor }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Bar chart — daily trend */}
          {period !== "today" && (
            <div className="card p-4">
              <p className="label-sm mb-4">Daily focus time</p>
              <div style={{ height: 160 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byDay} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => (v >= 60 ? `${Math.round(v / 60)}h` : `${v}m`)} />
                    <Tooltip
                      contentStyle={{ background: "var(--tw-prose-body, #fff)", border: "1px solid #e5e7eb", borderRadius: 10, fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                      formatter={(value) => [formatDuration(Number(value)), "Focus"]}
                      labelStyle={{ color: "#374151", fontWeight: 500 }}
                      cursor={{ fill: "rgba(79,70,229,0.05)" }}
                    />
                    <Bar dataKey="totalMins" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
