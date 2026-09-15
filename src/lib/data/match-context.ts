import { prisma } from "@/lib/prisma";
import { addDays, todayStart } from "@/lib/dates";

export interface MatchContext {
  nextMatchDate: Date | null;
  nextMatchWeekday: number | null;
  lastMatchDate: Date | null;
  matchesThisWeek: number;
}

/**
 * Próximo/último partido combinando el calendario (partidos programados) y el
 * registro de partidos ya jugados (por si se cargó uno sin haberlo agendado antes).
 */
export async function getMatchContext(weekStart: Date, weekEnd: Date): Promise<MatchContext> {
  const today = todayStart();
  const horizon = addDays(today, 30);

  const [futureEvents, pastEvents, futureMatches, pastMatches, matchesThisWeekEvents, matchesThisWeekRows] =
    await Promise.all([
      prisma.calendarEvent.findMany({ where: { type: "MATCH", date: { gte: today, lte: horizon } }, orderBy: { date: "asc" } }),
      prisma.calendarEvent.findMany({ where: { type: "MATCH", date: { lt: today } }, orderBy: { date: "desc" }, take: 1 }),
      prisma.match.findMany({ where: { date: { gte: today, lte: horizon } }, orderBy: { date: "asc" } }),
      prisma.match.findMany({ where: { date: { lt: today } }, orderBy: { date: "desc" }, take: 1 }),
      prisma.calendarEvent.count({ where: { type: "MATCH", date: { gte: weekStart, lte: weekEnd } } }),
      prisma.match.count({ where: { date: { gte: weekStart, lte: weekEnd } } }),
    ]);

  const futureDates = [...futureEvents.map((e) => e.date), ...futureMatches.map((m) => m.date)].sort(
    (a, b) => a.getTime() - b.getTime(),
  );
  const pastDates = [...pastEvents.map((e) => e.date), ...pastMatches.map((m) => m.date)].sort(
    (a, b) => b.getTime() - a.getTime(),
  );

  const nextMatchDate = futureDates[0] ?? null;
  const lastMatchDate = pastDates[0] ?? null;

  return {
    nextMatchDate,
    nextMatchWeekday: nextMatchDate ? nextMatchDate.getDay() : null,
    lastMatchDate,
    matchesThisWeek: Math.max(matchesThisWeekEvents, matchesThisWeekRows),
  };
}
