import { CARE_CATEGORIES } from "@/lib/care-logs/constants";

export const DEFAULT_REFLECTION_TIME_ZONE = "Asia/Seoul";
export type ReflectionPeriod = "week" | "month";

type CareLogForReflection = { category: string | null };

function getZonedDateParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value);
  return { year: value("year"), month: value("month"), day: value("day"), hour: value("hour"), minute: value("minute"), second: value("second") };
}

function localMidnightToUtc(year: number, month: number, day: number, timeZone: string) {
  const localAsUtc = Date.UTC(year, month - 1, day);
  let candidate = localAsUtc;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const parts = getZonedDateParts(new Date(candidate), timeZone);
    const representedAsUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
    candidate = localAsUtc - (representedAsUtc - candidate);
  }
  return new Date(candidate);
}

export function getReflectionRange(period: ReflectionPeriod, now = new Date(), timeZone = DEFAULT_REFLECTION_TIME_ZONE) {
  const local = getZonedDateParts(now, timeZone);
  if (period === "month") {
    const lastDay = new Date(Date.UTC(local.year, local.month, 0)).getUTCDate();
    return {
      start: localMidnightToUtc(local.year, local.month, 1, timeZone),
      end: now,
      displayEnd: localMidnightToUtc(local.year, local.month, lastDay, timeZone),
      label: "이번 달",
    };
  }
  const localDate = new Date(Date.UTC(local.year, local.month - 1, local.day));
  const daysSinceMonday = (localDate.getUTCDay() + 6) % 7;
  localDate.setUTCDate(localDate.getUTCDate() - daysSinceMonday);
  const weekEnd = new Date(localDate);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
  return {
    start: localMidnightToUtc(localDate.getUTCFullYear(), localDate.getUTCMonth() + 1, localDate.getUTCDate(), timeZone),
    end: now,
    displayEnd: localMidnightToUtc(weekEnd.getUTCFullYear(), weekEnd.getUTCMonth() + 1, weekEnd.getUTCDate(), timeZone),
    label: "이번 주",
  };
}

export function getReflectionPeriodDisplay(period: ReflectionPeriod, range: ReturnType<typeof getReflectionRange>, timeZone = DEFAULT_REFLECTION_TIME_ZONE) {
  const formatDate = (date: Date) => new Intl.DateTimeFormat("ko-KR", { timeZone, month: "long", day: "numeric" }).format(date);
  const start = getZonedDateParts(range.start, timeZone);

  return {
    dateRange: `${formatDate(range.start)} — ${formatDate(range.displayEnd)}`,
    detail: period === "week" ? `${start.month}월 ${Math.floor((start.day - 1) / 7) + 1}주차` : `${start.year}년 ${start.month}월`,
  };
}

export function getCategoryCounts(careLogs: CareLogForReflection[]) {
  const counts = new Map<string, number>();
  let uncategorized = 0;
  for (const careLog of careLogs) {
    if (careLog.category === null) uncategorized += 1;
    else counts.set(careLog.category, (counts.get(careLog.category) ?? 0) + 1);
  }
  const categoryOrder = new Map<string, number>(CARE_CATEGORIES.map((category, index) => [category, index]));
  const categories = [...counts].sort(([left], [right]) => (categoryOrder.get(left) ?? Number.MAX_SAFE_INTEGER) - (categoryOrder.get(right) ?? Number.MAX_SAFE_INTEGER));
  return { categories, uncategorized };
}

export function formatCareLogDate(value: string, timeZone = DEFAULT_REFLECTION_TIME_ZONE) {
  return new Intl.DateTimeFormat("ko-KR", { timeZone, year: "numeric", month: "long", day: "numeric", weekday: "short", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}
