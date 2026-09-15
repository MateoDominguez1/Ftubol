/**
 * Carga de entrenamiento (sección 22): carga = RPE x duración (minutos).
 */

export type LoadCategory = "GYM" | "FOOTBALL" | "MATCH" | "OTHER";

export interface LoadEntry {
  date: Date;
  category: LoadCategory;
  rpe: number | null;
  durationMin: number | null;
}

export interface LoadPoint {
  date: string; // yyyy-mm-dd
  load: number;
  byCategory: Record<LoadCategory, number>;
}

export function sessionLoad(rpe: number | null | undefined, durationMin: number | null | undefined): number {
  if (rpe == null || durationMin == null) return 0;
  return rpe * durationMin;
}

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Agrupa la carga por día calendario, separada por categoría. */
export function dailyLoad(entries: LoadEntry[]): LoadPoint[] {
  const map = new Map<string, LoadPoint>();
  for (const e of entries) {
    const key = dateKey(e.date);
    const load = sessionLoad(e.rpe, e.durationMin);
    if (!map.has(key)) {
      map.set(key, { date: key, load: 0, byCategory: { GYM: 0, FOOTBALL: 0, MATCH: 0, OTHER: 0 } });
    }
    const point = map.get(key)!;
    point.load += load;
    point.byCategory[e.category] += load;
  }
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function sumLoad(entries: LoadEntry[]): number {
  return entries.reduce((acc, e) => acc + sessionLoad(e.rpe, e.durationMin), 0);
}

export function averageDailyLoad(entries: LoadEntry[], windowDays: number): number {
  if (windowDays <= 0) return 0;
  return sumLoad(entries) / windowDays;
}

/**
 * Ratio carga aguda (últimos 3 días) vs carga crónica (promedio diario de los últimos 28 días).
 * >1.5 indica un salto de carga relevante; se usa como señal para el motor de reglas y el recovery score.
 */
export function acuteChronicRatio(entriesLast28Days: LoadEntry[], now: Date): number | null {
  const acuteStart = new Date(now);
  acuteStart.setDate(acuteStart.getDate() - 3);
  const acuteEntries = entriesLast28Days.filter((e) => e.date >= acuteStart && e.date <= now);
  const chronicDailyAvg = averageDailyLoad(entriesLast28Days, 28);
  if (chronicDailyAvg === 0) return null;
  const acuteDailyAvg = averageDailyLoad(acuteEntries, 3);
  return acuteDailyAvg / chronicDailyAvg;
}
