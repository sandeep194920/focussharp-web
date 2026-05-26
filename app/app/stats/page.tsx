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
  const { sessions, isPro } = useStore();
  const [period, setPeriod] = useState<Period>("week");

  const filtered = filterSessionsByPeriod(sessions, period, isPro);
  const prevFiltered = getPreviousPeriodSessions(sessions, period);

  const totalMins = filtered.reduce((s, x) => s + x.durationMins, 0);
  const sessionCount = filtered.length;
  const prevTotalMins = prevFiltered.reduce((s, x) => s + x.durationMins, 0);
  const pctChange = percentChange(totalMins, prevTotalMins);

  const byCat = aggregateByCategory(filtered);
  const byDay = aggregateByDay(filtered, BAR_DAYS[period]);

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
            </div>
          </div>

          {/* Donut chart */}
          {byCat.length > 0 && (
            <div className="card p-4">
              <p className="label-sm mb-4">By category</p>
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
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: cat.catColor }}
                            />
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate max-w-[80px]">
                              {cat.catName}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {pct}%
                          </span>
                        </div>
                        <div className="h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, backgroundColor: cat.catColor }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Bar chart */}
          {period !== "today" && (
            <div className="card p-4">
              <p className="label-sm mb-4">Daily focus time</p>
              <div style={{ height: 160 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byDay} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 10, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => (v >= 60 ? `${Math.round(v / 60)}h` : `${v}m`)}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--tw-prose-body, #fff)",
                        border: "1px solid #e5e7eb",
                        borderRadius: 10,
                        fontSize: 12,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      }}
                      formatter={(value) => [formatDuration(Number(value)), "Focus"]}
                      labelStyle={{ color: "#374151", fontWeight: 500 }}
                      cursor={{ fill: "rgba(79,70,229,0.05)" }}
                    />
                    <Bar
                      dataKey="totalMins"
                      fill="#4f46e5"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Category breakdown */}
          <div className="card p-4">
            <p className="label-sm mb-3">Category breakdown</p>
            <div className="flex flex-col gap-3">
              {byCat.map((cat) => (
                <div key={cat.catId} className="flex items-center gap-3">
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
                        {formatDuration(cat.totalMins)}
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
                  <span className="text-xs text-gray-400 w-8 text-right flex-shrink-0">
                    {cat.count}x
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
