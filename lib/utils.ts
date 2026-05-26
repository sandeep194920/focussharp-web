import { Session, FREE_HISTORY_DAYS } from "./store";

export function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function formatDuration(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getDateRange(period: "today" | "week" | "month"): {
  start: Date;
  end: Date;
} {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  if (period === "today") {
    const start = startOfDay(now);
    return { start, end };
  } else if (period === "week") {
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  } else {
    const start = new Date(now);
    start.setDate(now.getDate() - 29);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }
}

export function filterSessionsByPeriod(
  sessions: Session[],
  period: "today" | "week" | "month",
  isPro: boolean
): Session[] {
  const { start, end } = getDateRange(period);
  const cutoff = isPro
    ? 0
    : Date.now() - FREE_HISTORY_DAYS * 24 * 60 * 60 * 1000;

  return sessions.filter(
    (s) =>
      s.type === "focus" &&
      s.completedAt >= Math.max(start.getTime(), cutoff) &&
      s.completedAt <= end.getTime()
  );
}

export function aggregateByCategory(sessions: Session[]): {
  catId: string;
  catName: string;
  catColor: string;
  totalMins: number;
  count: number;
}[] {
  const map = new Map<string, { catName: string; catColor: string; totalMins: number; count: number }>();
  for (const s of sessions) {
    const existing = map.get(s.catId);
    if (existing) {
      existing.totalMins += s.durationMins;
      existing.count++;
    } else {
      map.set(s.catId, {
        catName: s.catName,
        catColor: s.catColor,
        totalMins: s.durationMins,
        count: 1,
      });
    }
  }
  return Array.from(map.entries())
    .map(([catId, v]) => ({ catId, ...v }))
    .sort((a, b) => b.totalMins - a.totalMins);
}

export function aggregateByDay(
  sessions: Session[],
  days: number
): { date: string; label: string; totalMins: number }[] {
  const result: { date: string; label: string; totalMins: number }[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const start = startOfDay(d).getTime();
    const end = start + 24 * 60 * 60 * 1000 - 1;
    const totalMins = sessions
      .filter((s) => s.completedAt >= start && s.completedAt <= end)
      .reduce((sum, s) => sum + s.durationMins, 0);
    result.push({
      date: d.toISOString().split("T")[0],
      label: days <= 7
        ? d.toLocaleDateString("en", { weekday: "short" })
        : d.toLocaleDateString("en", { month: "short", day: "numeric" }),
      totalMins,
    });
  }
  return result;
}

export function getPreviousPeriodSessions(
  sessions: Session[],
  period: "today" | "week" | "month"
): Session[] {
  const { start, end } = getDateRange(period);
  const duration = end.getTime() - start.getTime();
  const prevEnd = start.getTime() - 1;
  const prevStart = prevEnd - duration;
  return sessions.filter(
    (s) =>
      s.type === "focus" &&
      s.completedAt >= prevStart &&
      s.completedAt <= prevEnd
  );
}

export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}
