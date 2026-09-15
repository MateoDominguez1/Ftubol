import { prisma } from "@/lib/prisma";
import { addDays, endOfWeek } from "@/lib/dates";
import { rollingAverage } from "@/lib/calculations/bodyComposition";
import { averageHours } from "@/lib/calculations/sleep";
import { sessionLoad } from "@/lib/calculations/trainingLoad";

export interface WeeklyReviewSummary {
  weekStart: string;
  weekEnd: string;
  avgWeightKg: number | null;
  avgWaistCm: number | null;
  avgSleepHours: number | null;
  gymDone: number;
  gymPlanned: number;
  footballDone: number;
  footballPlanned: number;
  avgPerformance: number | null;
  totalLoad: number;
  evaluation: "Excelente" | "Normal" | "Fatiga" | "Recuperación insuficiente";
}

export async function computeWeeklyReviewSummary(weekStart: Date): Promise<WeeklyReviewSummary> {
  const weekEnd = endOfWeek(weekStart);

  const [measurements, sleepEntries, gymPlanned, gymDone, footballPlanned, footballDone, footballSessions, matches, workouts, footballLoadSrc] =
    await Promise.all([
      prisma.bodyMeasurement.findMany({ where: { date: { gte: addDays(weekStart, -6), lte: weekEnd } } }),
      prisma.sleepEntry.findMany({ where: { date: { gte: weekStart, lte: weekEnd } } }),
      prisma.calendarEvent.count({ where: { type: "GYM", date: { gte: weekStart, lte: weekEnd } } }),
      prisma.workout.count({ where: { date: { gte: weekStart, lte: weekEnd } } }),
      prisma.calendarEvent.count({ where: { type: "FOOTBALL", date: { gte: weekStart, lte: weekEnd } } }),
      prisma.footballSession.count({ where: { date: { gte: weekStart, lte: weekEnd } } }),
      prisma.footballSession.findMany({ where: { date: { gte: weekStart, lte: weekEnd } } }),
      prisma.match.findMany({ where: { date: { gte: weekStart, lte: weekEnd } } }),
      prisma.workout.findMany({ where: { date: { gte: weekStart, lte: weekEnd } }, select: { sessionRPE: true, durationMin: true } }),
      prisma.footballSession.findMany({ where: { date: { gte: weekStart, lte: weekEnd } }, select: { rpe: true, durationMin: true } }),
    ]);

  const weighIns = measurements.filter((m) => m.weightKg != null).map((m) => ({ date: m.date, weightKg: m.weightKg! }));
  const avgWeight = rollingAverage(weighIns, weekEnd, 7);
  const waistValues = measurements.filter((m) => m.waistCm != null).map((m) => m.waistCm!);
  const avgWaist = waistValues.length > 0 ? waistValues.reduce((a, v) => a + v, 0) / waistValues.length : null;
  const sleepAvg = averageHours(sleepEntries.map((s) => ({ date: s.date, hoursSlept: s.hoursSlept })));

  const perfValues = [...footballSessions, ...matches].map((s) => s.performance).filter((v): v is number => v != null);
  const avgPerformance = perfValues.length > 0 ? perfValues.reduce((a, v) => a + v, 0) / perfValues.length : null;

  const totalLoad =
    workouts.reduce((a, w) => a + sessionLoad(w.sessionRPE, w.durationMin), 0) +
    footballLoadSrc.reduce((a, f) => a + sessionLoad(f.rpe, f.durationMin), 0);

  let evaluation: WeeklyReviewSummary["evaluation"] = "Normal";
  const sleepOk = sleepAvg.status === "ok" && sleepAvg.data >= 7;
  const perfOk = avgPerformance != null && avgPerformance >= 3.5;
  if (sleepOk && perfOk) evaluation = "Excelente";
  else if (sleepAvg.status === "ok" && sleepAvg.data < 6) evaluation = "Recuperación insuficiente";
  else if (avgPerformance != null && avgPerformance < 2.5) evaluation = "Fatiga";

  return {
    weekStart: weekStart.toISOString().slice(0, 10),
    weekEnd: weekEnd.toISOString().slice(0, 10),
    avgWeightKg: avgWeight.status === "ok" ? Math.round(avgWeight.data * 10) / 10 : null,
    avgWaistCm: avgWaist,
    avgSleepHours: sleepAvg.status === "ok" ? Math.round(sleepAvg.data * 10) / 10 : null,
    gymDone,
    gymPlanned: Math.max(gymPlanned, gymDone),
    footballDone,
    footballPlanned: Math.max(footballPlanned, footballDone),
    avgPerformance: avgPerformance != null ? Math.round(avgPerformance * 10) / 10 : null,
    totalLoad: Math.round(totalLoad),
    evaluation,
  };
}

export async function getOrCreateWeeklyReview(weekStart: Date, isPastWeek: boolean) {
  const cached = await prisma.weeklyReview.findUnique({ where: { weekStart } });
  if (cached) return cached.summaryJson as unknown as WeeklyReviewSummary;

  const summary = await computeWeeklyReviewSummary(weekStart);
  if (isPastWeek) {
    await prisma.weeklyReview.create({
      data: { weekStart, weekEnd: endOfWeek(weekStart), summaryJson: summary as never, evaluation: summary.evaluation },
    });
  }
  return summary;
}
