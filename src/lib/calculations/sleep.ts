/**
 * Sueño (sección 17).
 */
import { Result, ok, insufficient } from "./result";

export interface SleepSample {
  date: Date;
  hoursSlept: number | null;
}

export function averageHours(entries: SleepSample[]): Result<number> {
  const valid = entries.filter((e) => e.hoursSlept != null) as { date: Date; hoursSlept: number }[];
  if (valid.length === 0) return insufficient("No hay registros de sueño en este período.");
  return ok(valid.reduce((acc, e) => acc + e.hoursSlept, 0) / valid.length);
}

export function countUnder(entries: SleepSample[], thresholdHours: number): number {
  return entries.filter((e) => e.hoursSlept != null && e.hoursSlept < thresholdHours).length;
}

export function countInRange(entries: SleepSample[], minHours: number, maxHours: number): number {
  return entries.filter((e) => e.hoursSlept != null && e.hoursSlept >= minHours && e.hoursSlept <= maxHours).length;
}

/** Racha actual de noches consecutivas (más recientes primero) con menos de `thresholdHours`. */
export function currentUnderThresholdStreak(entriesDescByDate: SleepSample[], thresholdHours = 6): number {
  let streak = 0;
  for (const e of entriesDescByDate) {
    if (e.hoursSlept != null && e.hoursSlept < thresholdHours) streak++;
    else break;
  }
  return streak;
}
