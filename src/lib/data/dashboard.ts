import { prisma } from "@/lib/prisma";
import { addDays, startOfWeek, endOfWeek, todayStart } from "@/lib/dates";
import { computeFatigueZone, type FatigueZoneResult } from "@/lib/calculations/fatigue";
import { computeRecoveryScore, type RecoveryScoreResult } from "@/lib/calculations/recoveryScore";
import { computePerformanceScore, type PerformanceScoreResult, type PerformanceComponents } from "@/lib/calculations/performanceScore";
import { rollingAverage, weekOverWeekWeightChange, waistTrend, evaluateWeightLossRate } from "@/lib/calculations/bodyComposition";
import { averageHours, currentUnderThresholdStreak } from "@/lib/calculations/sleep";
import { acuteChronicRatio, type LoadEntry } from "@/lib/calculations/trainingLoad";
import { estimate1RM, hasConsecutiveStrengthDrop, strengthTrend } from "@/lib/calculations/strength";
import { computeConsistency } from "@/lib/calculations/consistency";
import { evaluateRules, type Recommendation, type RuleContext } from "@/lib/calculations/rulesEngine";
import { computeMDLabel, type MDLabel } from "@/lib/calculations/matchDay";
import { isDeloadDueBySchedule, weeksSinceLastDeload } from "@/lib/calculations/deload";
import { defaultPhaseForWeek, weekNumberSince, PHASE_INFO, type PhaseName } from "@/lib/calculations/phase";
import { getMatchContext } from "@/lib/data/match-context";
import { Result } from "@/lib/calculations/result";

export interface DashboardData {
  profile: Awaited<ReturnType<typeof prisma.profile.findFirst>>;
  today: Date;
  checkinZone: FatigueZoneResult | null;
  recovery: Result<RecoveryScoreResult>;
  performance: Result<PerformanceScoreResult>;
  latestWeightKg: number | null;
  weeklyAvgWeight: Result<number>;
  weightChange: ReturnType<typeof weekOverWeekWeightChangeSafe>;
  latestWaistCm: number | null;
  waistChangeCm: number | null;
  sleepAvgHours: Result<number>;
  nextMatchDate: Date | null;
  daysToNextMatch: number | null;
  mdLabel: MDLabel;
  sessionsThisWeek: { gymDone: number; gymPlanned: number; footballDone: number; footballPlanned: number };
  recommendations: Recommendation[];
  currentPhase: PhaseName;
  weekNumber: number;
}

function weekOverWeekWeightChangeSafe(entries: { date: Date; weightKg: number }[], asOf: Date) {
  return weekOverWeekWeightChange(entries, asOf);
}

export async function getDashboardData(): Promise<DashboardData> {
  const today = todayStart();
  const weekStart = startOfWeek(today);
  const weekEnd = endOfWeek(today);
  const since90 = addDays(today, -90);
  const since30 = addDays(today, -30);

  const [
    profile,
    checkin,
    measurements,
    sleepEntries,
    matchContext,
    calendarEventsThisWeek,
    workoutsThisWeek,
    footballSessionsThisWeek,
    recentPain,
    squatExercise,
    lastDeloadWorkout,
    allGymLoadSource,
    footballLoadSource,
    matchLoadSource,
  ] = await Promise.all([
    prisma.profile.findFirst(),
    prisma.dailyCheckin.findUnique({ where: { date: today } }),
    prisma.bodyMeasurement.findMany({ where: { date: { gte: since90 } }, orderBy: { date: "asc" } }),
    prisma.sleepEntry.findMany({ where: { date: { gte: since30 } }, orderBy: { date: "desc" } }),
    getMatchContext(weekStart, weekEnd),
    prisma.calendarEvent.findMany({ where: { date: { gte: weekStart, lte: weekEnd } } }),
    prisma.workout.findMany({ where: { date: { gte: weekStart, lte: weekEnd } } }),
    prisma.footballSession.findMany({ where: { date: { gte: weekStart, lte: weekEnd } } }),
    prisma.painEntry.findMany({ where: { date: { gte: addDays(today, -10) } }, orderBy: { date: "desc" } }),
    prisma.exercise.findFirst({ where: { name: { contains: "entadilla" } } }),
    prisma.workout.findFirst({ where: { type: "DELOAD" }, orderBy: { date: "desc" } }),
    prisma.workout.findMany({ where: { date: { gte: addDays(today, -28) } }, select: { date: true, sessionRPE: true, durationMin: true } }),
    prisma.footballSession.findMany({ where: { date: { gte: addDays(today, -28) } }, select: { date: true, rpe: true, durationMin: true } }),
    prisma.match.findMany({ where: { date: { gte: addDays(today, -28) } }, select: { date: true, rpe: true, minutesPlayed: true } }),
  ]);

  // --- Composición corporal ---
  const weighIns = measurements.filter((m) => m.weightKg != null).map((m) => ({ date: m.date, weightKg: m.weightKg! }));
  const waistEntries = measurements.filter((m) => m.waistCm != null).map((m) => ({ date: m.date, waistCm: m.waistCm! }));
  const weeklyAvgWeight = rollingAverage(weighIns, today, 7);
  const weightChange = weekOverWeekWeightChangeSafe(weighIns, today);
  const waist = waistTrend(waistEntries);
  const latestWeightKg = weighIns.at(-1)?.weightKg ?? null;
  const latestWaistCm = waistEntries.at(-1)?.waistCm ?? null;

  // --- Sueño ---
  const sleepSamples = sleepEntries.map((s) => ({ date: s.date, hoursSlept: s.hoursSlept }));
  const sleepAvgHours = averageHours(sleepSamples.filter((s) => s.date >= addDays(today, -6)));
  const nightsUnder6hSleepStreak = currentUnderThresholdStreak(sleepSamples, 6);
  const lastNightSleep = sleepEntries.find((s) => s.date.toDateString() === today.toDateString()) ?? sleepEntries[0] ?? null;

  // --- Carga de entrenamiento (últimos 28 días) ---
  const loadEntries: LoadEntry[] = [
    ...allGymLoadSource.map((w) => ({ date: w.date, category: "GYM" as const, rpe: w.sessionRPE, durationMin: w.durationMin })),
    ...footballLoadSource.map((f) => ({ date: f.date, category: "FOOTBALL" as const, rpe: f.rpe, durationMin: f.durationMin })),
    ...matchLoadSource.map((m) => ({ date: m.date, category: "MATCH" as const, rpe: m.rpe, durationMin: m.minutesPlayed })),
  ];
  const acRatio = acuteChronicRatio(loadEntries, today);

  // --- Check-in / recovery ---
  const checkinZone = checkin ? computeFatigueZone(checkin.sleepScore, checkin.legsScore, checkin.motivationScore) : null;
  const maxRecentPain = recentPain.length > 0 ? Math.max(...recentPain.slice(0, 3).map((p) => p.painLevel)) : null;

  const recovery = computeRecoveryScore({
    checkinTotalScore: checkin?.totalScore ?? null,
    sleepHours: lastNightSleep?.hoursSlept ?? null,
    sleepQuality: lastNightSleep?.quality ?? null,
    acuteChronicRatio: acRatio,
    daysToNextMatch: matchContext.nextMatchDate
      ? Math.round((matchContext.nextMatchDate.getTime() - today.getTime()) / 86400000)
      : null,
    maxRecentPainLevel: maxRecentPain,
  });

  // --- Fuerza: sentadilla como referencia + heurística general ---
  let squatConsecutiveDrop = false;
  if (squatExercise) {
    const workoutExercises = await prisma.workoutExercise.findMany({
      where: { exerciseId: squatExercise.id },
      include: { sets: true, workout: { select: { date: true } } },
      orderBy: { workout: { date: "asc" } },
    });
    const perSessionBest = workoutExercises.map((we) => {
      let best = 0;
      for (const s of we.sets) {
        if (s.weightKg != null && s.reps != null) best = Math.max(best, estimate1RM(s.weightKg, s.reps));
      }
      return best;
    }).filter((v) => v > 0);
    squatConsecutiveDrop = hasConsecutiveStrengthDrop(perSessionBest);
  }

  const strengthSubscore = await computeStrengthSubscore();
  const footballSubscore = await computeFootballSubscore(since30);
  const bodyCompSubscore = computeBodyCompSubscore(profile, waist, weightChange);

  // --- Consistencia (aproximada: eventos programados vs registros de la semana) ---
  const gymPlanned = calendarEventsThisWeek.filter((e) => e.type === "GYM").length;
  const footballPlanned = calendarEventsThisWeek.filter((e) => e.type === "FOOTBALL").length;
  const consistency = computeConsistency({
    plannedGym: gymPlanned,
    completedGym: workoutsThisWeek.length,
    plannedFootball: footballPlanned,
    completedFootball: footballSessionsThisWeek.length,
    plannedRestDays: calendarEventsThisWeek.filter((e) => e.type === "REST").length,
    takenRestDays: calendarEventsThisWeek.filter((e) => e.type === "REST").length,
  });

  const components: PerformanceComponents = {
    recovery: recovery.status === "ok" ? recovery.data.score : null,
    strength: strengthSubscore,
    football: footballSubscore,
    bodyComposition: bodyCompSubscore,
    consistency: consistency.overallCompliancePct,
  };
  const performance = computePerformanceScore(components);

  // --- Pain persistente (misma zona, días consecutivos con dolor relevante) ---
  const painPersistentDaysAnyZone = computePainPersistentStreak(recentPain);
  const pubisPainLevel = recentPain.find((p) => p.zone === "PUBIS")?.painLevel ?? null;
  const hamstringPainLevel = recentPain.find((p) => p.zone === "HAMSTRING")?.painLevel ?? null;

  // --- Weekly weight loss para alertas ---
  const weeklyDeltas: number[] = [];
  for (let w = 3; w >= 0; w--) {
    const asOf = addDays(today, -w * 7);
    const change = weekOverWeekWeightChangeSafe(weighIns, asOf);
    if (change.status === "ok") weeklyDeltas.push(-change.data.deltaKg); // positivo = pérdida
  }

  const tomorrow = addDays(today, 1);
  const tomorrowGymPlanned = calendarEventsThisWeek.some((e) => e.type === "GYM" && e.date.toDateString() === tomorrow.toDateString());
  const daysToNextMatchNum = matchContext.nextMatchDate
    ? Math.round((matchContext.nextMatchDate.getTime() - today.getTime()) / 86400000)
    : null;

  const deloadWeeks = weeksSinceLastDeload(lastDeloadWorkout?.date ?? null, today, profile?.programStartDate ?? today);

  const ruleContext: RuleContext = {
    matchesThisWeek: matchContext.matchesThisWeek,
    daysToNextMatch: daysToNextMatchNum,
    nextMatchWeekday: matchContext.nextMatchWeekday,
    nightsUnder6hSleepStreak,
    squatConsecutiveDrop,
    pubisPainLevel,
    hamstringPainLevel,
    painPersistentDaysAnyZone,
    acuteChronicLoadRatio: acRatio,
    weeklyWeightLossKg: weeklyDeltas,
    isDeloadDue: isDeloadDueBySchedule(deloadWeeks),
    hasGymPlannedTomorrowMatch: daysToNextMatchNum === 1 && tomorrowGymPlanned,
    hasGymPlannedDayBeforeSaturdayMatch: matchContext.nextMatchWeekday === 6 && daysToNextMatchNum === 1 && tomorrowGymPlanned,
  };

  const recommendations = evaluateRules(ruleContext);

  const weekNumber = weekNumberSince(profile?.programStartDate ?? today, today);
  const activePhaseRow = await prisma.phase.findFirst({ where: { isActive: true } });
  const currentPhase = (activePhaseRow?.name as PhaseName) ?? defaultPhaseForWeek(weekNumber);

  return {
    profile,
    today,
    checkinZone,
    recovery,
    performance,
    latestWeightKg,
    weeklyAvgWeight,
    weightChange,
    latestWaistCm,
    waistChangeCm: waist.status === "ok" ? waist.data.deltaCm : null,
    sleepAvgHours,
    nextMatchDate: matchContext.nextMatchDate,
    daysToNextMatch: daysToNextMatchNum,
    mdLabel: computeMDLabel(today, matchContext.nextMatchDate, matchContext.lastMatchDate),
    sessionsThisWeek: {
      gymDone: workoutsThisWeek.length,
      gymPlanned,
      footballDone: footballSessionsThisWeek.length,
      footballPlanned,
    },
    recommendations,
    currentPhase,
    weekNumber,
  };
}

/**
 * Heurística del sub-score de fuerza (0-100): variación promedio del 1RM estimado
 * semana a semana entre ejercicios con al menos dos semanas de datos.
 * 50 = estable, 100 = +10% o más, 0 = -10% o más.
 */
async function computeStrengthSubscore(): Promise<number | null> {
  const exercises = await prisma.exercise.findMany({ where: { workoutExercises: { some: {} } }, select: { id: true } });
  const changes: number[] = [];

  for (const ex of exercises) {
    const workoutExercises = await prisma.workoutExercise.findMany({
      where: { exerciseId: ex.id },
      include: { sets: true, workout: { select: { date: true } } },
    });
    const samples = workoutExercises.flatMap((we) => we.sets.map((s) => ({ date: we.workout.date, weightKg: s.weightKg, reps: s.reps })));
    const trend = strengthTrend(samples, "week");
    if (trend.status === "ok" && trend.data.length >= 2) {
      const first = trend.data[0].bestEst1RM;
      const last = trend.data[trend.data.length - 1].bestEst1RM;
      if (first > 0) changes.push(((last - first) / first) * 100);
    }
  }

  if (changes.length === 0) return null;
  const avgChangePct = changes.reduce((a, c) => a + c, 0) / changes.length;
  return Math.max(0, Math.min(100, 50 + avgChangePct * 5));
}

async function computeFootballSubscore(since: Date): Promise<number | null> {
  const [sessions, matches] = await Promise.all([
    prisma.footballSession.findMany({ where: { date: { gte: since }, performance: { not: null } }, select: { performance: true } }),
    prisma.match.findMany({ where: { date: { gte: since }, performance: { not: null } }, select: { performance: true } }),
  ]);
  const values = [...sessions, ...matches].map((s) => s.performance!).filter((v): v is number => v != null);
  if (values.length === 0) return null;
  const avg = values.reduce((a, v) => a + v, 0) / values.length;
  return ((avg - 1) / 4) * 100; // 1-5 -> 0-100
}

function computeBodyCompSubscore(
  profile: Awaited<ReturnType<typeof prisma.profile.findFirst>>,
  waist: Result<{ startCm: number; latestCm: number; deltaCm: number }>,
  weightChange: Result<{ deltaKg: number }>,
): number | null {
  if (profile?.targetWaistReductionCm && waist.status === "ok") {
    const progressCm = Math.max(0, -waist.data.deltaCm);
    return Math.max(0, Math.min(100, (progressCm / profile.targetWaistReductionCm) * 100));
  }
  if (weightChange.status === "ok" && profile?.targetWeightMinKg && profile?.targetWeightMaxKg) {
    const rate = evaluateWeightLossRate([weightChange.data.deltaKg]);
    if (rate.flag === "on_track") return 80;
    if (rate.flag === "too_fast") return 55;
    if (rate.flag === "too_slow_or_gaining") return 40;
  }
  return null;
}

function computePainPersistentStreak(entries: { date: Date; zone: string; painLevel: number }[]): number {
  const byZone = new Map<string, { date: Date; painLevel: number }[]>();
  for (const e of entries) {
    if (!byZone.has(e.zone)) byZone.set(e.zone, []);
    byZone.get(e.zone)!.push(e);
  }
  let maxStreak = 0;
  for (const zoneEntries of byZone.values()) {
    const sorted = zoneEntries.sort((a, b) => b.date.getTime() - a.date.getTime());
    let streak = 0;
    let prevDate: Date | null = null;
    for (const e of sorted) {
      if (e.painLevel < 4) break;
      if (prevDate && Math.round((prevDate.getTime() - e.date.getTime()) / 86400000) > 1) break;
      streak++;
      prevDate = e.date;
    }
    maxStreak = Math.max(maxStreak, streak);
  }
  return maxStreak;
}

export { PHASE_INFO };
