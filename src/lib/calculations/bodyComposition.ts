/**
 * Composición corporal (secciones 13 y 20).
 * Regla de oro: nunca usar solo el peso del día para determinar progreso, siempre promedio móvil.
 */
import { Result, ok, insufficient } from "./result";

export interface WeighIn {
  date: Date;
  weightKg: number;
}

export interface WaistEntry {
  date: Date;
  waistCm: number;
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / 86400000);
}

/** Promedio móvil de los últimos N días (por defecto 7) hasta `asOf` inclusive. */
export function rollingAverage(entries: WeighIn[], asOf: Date, windowDays = 7): Result<number> {
  const inWindow = entries.filter((e) => {
    const diff = daysBetween(asOf, e.date);
    return diff >= 0 && diff < windowDays;
  });
  if (inWindow.length === 0) {
    return insufficient(`No hay registros de peso en los últimos ${windowDays} días.`);
  }
  const sum = inWindow.reduce((acc, e) => acc + e.weightKg, 0);
  return ok(sum / inWindow.length);
}

export interface WeekOverWeekChange {
  currentAvg: number;
  previousAvg: number;
  deltaKg: number;
  deltaPct: number;
}

/** Compara el promedio móvil de esta semana contra el de la semana anterior. */
export function weekOverWeekWeightChange(entries: WeighIn[], asOf: Date): Result<WeekOverWeekChange> {
  const current = rollingAverage(entries, asOf, 7);
  const previousAsOf = new Date(asOf);
  previousAsOf.setDate(previousAsOf.getDate() - 7);
  const previous = rollingAverage(entries, previousAsOf, 7);
  if (current.status !== "ok" || previous.status !== "ok") {
    return insufficient("Hace falta al menos dos semanas de registros de peso para comparar.");
  }
  const deltaKg = current.data - previous.data;
  return ok({
    currentAvg: current.data,
    previousAvg: previous.data,
    deltaKg,
    deltaPct: (deltaKg / previous.data) * 100,
  });
}

export type WeightLossRateFlag = "on_track" | "too_fast" | "too_slow_or_gaining" | "unknown";

/**
 * Evalúa si el ritmo de pérdida semanal está dentro del objetivo (0.4-0.6 kg/semana, sección 20).
 * Alerta si se pierde más de 1kg/semana durante 2 semanas seguidas.
 */
export function evaluateWeightLossRate(
  weeklyDeltasKg: number[], // más reciente al final
  targetMinKgPerWeek = 0.4,
  targetMaxKgPerWeek = 0.6,
): { flag: WeightLossRateFlag; consecutiveTooFast: boolean } {
  if (weeklyDeltasKg.length === 0) return { flag: "unknown", consecutiveTooFast: false };
  const last = weeklyDeltasKg[weeklyDeltasKg.length - 1];
  const loss = -last; // pérdida positiva
  let flag: WeightLossRateFlag = "unknown";
  if (loss > targetMaxKgPerWeek) flag = "too_fast";
  else if (loss >= targetMinKgPerWeek) flag = "on_track";
  else flag = "too_slow_or_gaining";

  const consecutiveTooFast =
    weeklyDeltasKg.length >= 2 &&
    weeklyDeltasKg.slice(-2).every((d) => -d > 1.0);

  return { flag, consecutiveTooFast };
}

/** Tendencia de cintura: delta entre la medición más reciente y la más antigua dentro del rango. */
export function waistTrend(entries: WaistEntry[]): Result<{ startCm: number; latestCm: number; deltaCm: number; startDate: Date; latestDate: Date }> {
  if (entries.length < 2) return insufficient("Hacen falta al menos dos mediciones de cintura para ver una tendencia.");
  const sorted = [...entries].sort((a, b) => a.date.getTime() - b.date.getTime());
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  return ok({
    startCm: first.waistCm,
    latestCm: last.waistCm,
    deltaCm: last.waistCm - first.waistCm,
    startDate: first.date,
    latestDate: last.date,
  });
}
