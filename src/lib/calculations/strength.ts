/**
 * Fuerza (sección 9): 1RM estimado, PRs, tendencias. Funciona con cualquier ejercicio.
 */
import { Result, ok, insufficient } from "./result";

export interface SetSample {
  date: Date;
  weightKg: number | null;
  reps: number | null;
}

/** Fórmula de Epley. Solo tiene sentido para reps <= ~12; por fuera de eso es orientativo. */
export function estimate1RM(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0) return 0;
  if (reps === 1) return weightKg;
  return weightKg * (1 + reps / 30);
}

export interface BestSetOfPeriod {
  date: Date;
  weightKg: number;
  reps: number;
  est1RM: number;
}

/** Mejor set (mayor 1RM estimado) dentro de una lista de sets. */
export function bestSet(sets: SetSample[]): BestSetOfPeriod | null {
  let best: BestSetOfPeriod | null = null;
  for (const s of sets) {
    if (s.weightKg == null || s.reps == null || s.weightKg <= 0 || s.reps <= 0) continue;
    const est = estimate1RM(s.weightKg, s.reps);
    if (!best || est > best.est1RM) {
      best = { date: s.date, weightKg: s.weightKg, reps: s.reps, est1RM: est };
    }
  }
  return best;
}

export interface StrengthTrendPoint {
  periodStart: string; // yyyy-mm-dd
  bestEst1RM: number;
  bestWeightKg: number;
}

function periodKey(d: Date, granularity: "week" | "month"): string {
  if (granularity === "month") {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
  }
  const day = new Date(d);
  const dow = (day.getDay() + 6) % 7; // lunes = 0
  day.setDate(day.getDate() - dow);
  return day.toISOString().slice(0, 10);
}

/** Serie de mejor 1RM estimado por semana o por mes. Requiere al menos 2 sesiones con datos. */
export function strengthTrend(
  sets: SetSample[],
  granularity: "week" | "month",
): Result<StrengthTrendPoint[]> {
  const valid = sets.filter((s) => s.weightKg != null && s.reps != null && s.weightKg > 0 && s.reps > 0);
  if (valid.length < 2) {
    return insufficient("No hay suficientes sets registrados para calcular una tendencia de fuerza.");
  }
  const byPeriod = new Map<string, SetSample[]>();
  for (const s of valid) {
    const key = periodKey(s.date, granularity);
    if (!byPeriod.has(key)) byPeriod.set(key, []);
    byPeriod.get(key)!.push(s);
  }
  const points: StrengthTrendPoint[] = [];
  for (const [key, periodSets] of byPeriod) {
    const best = bestSet(periodSets);
    if (best) points.push({ periodStart: key, bestEst1RM: Math.round(best.est1RM * 10) / 10, bestWeightKg: best.weightKg });
  }
  points.sort((a, b) => a.periodStart.localeCompare(b.periodStart));
  return ok(points);
}

/**
 * Detecta caída de fuerza en dos sesiones consecutivas para un ejercicio
 * (mejor 1RM estimado de la sesión N y N-1 ambos por debajo de la sesión N-2).
 * Usado por el motor de reglas para sugerir descarga (sección 26).
 */
export function hasConsecutiveStrengthDrop(sessionsBestEst1RM: number[]): boolean {
  if (sessionsBestEst1RM.length < 3) return false;
  const n = sessionsBestEst1RM.length;
  const last = sessionsBestEst1RM[n - 1];
  const prev = sessionsBestEst1RM[n - 2];
  const base = sessionsBestEst1RM[n - 3];
  return last < base && prev < base;
}
