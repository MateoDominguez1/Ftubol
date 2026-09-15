/**
 * Volumen de entrenamiento (sección 10): sets x reps x peso.
 */

export interface VolumeSet {
  date: Date;
  exerciseId: string;
  exerciseName: string;
  weightKg: number | null;
  reps: number | null;
  muscleGroups: { group: string; factor: number }[];
}

export function setVolume(weightKg: number | null, reps: number | null): number {
  if (weightKg == null || reps == null) return 0;
  return weightKg * reps;
}

export interface VolumeByExercise {
  exerciseId: string;
  exerciseName: string;
  totalVolume: number;
  setCount: number;
}

export function volumeByExercise(sets: VolumeSet[]): VolumeByExercise[] {
  const map = new Map<string, VolumeByExercise>();
  for (const s of sets) {
    const v = setVolume(s.weightKg, s.reps);
    if (!map.has(s.exerciseId)) {
      map.set(s.exerciseId, { exerciseId: s.exerciseId, exerciseName: s.exerciseName, totalVolume: 0, setCount: 0 });
    }
    const entry = map.get(s.exerciseId)!;
    entry.totalVolume += v;
    entry.setCount += 1;
  }
  return Array.from(map.values()).sort((a, b) => b.totalVolume - a.totalVolume);
}

export interface VolumeByMuscleGroup {
  group: string;
  totalVolume: number;
}

export function volumeByMuscleGroup(sets: VolumeSet[]): VolumeByMuscleGroup[] {
  const map = new Map<string, number>();
  for (const s of sets) {
    const v = setVolume(s.weightKg, s.reps);
    if (v === 0) continue;
    for (const mg of s.muscleGroups) {
      map.set(mg.group, (map.get(mg.group) ?? 0) + v * mg.factor);
    }
  }
  return Array.from(map.entries())
    .map(([group, totalVolume]) => ({ group, totalVolume: Math.round(totalVolume) }))
    .sort((a, b) => b.totalVolume - a.totalVolume);
}

function weekKey(d: Date): string {
  const day = new Date(d);
  const dow = (day.getDay() + 6) % 7;
  day.setDate(day.getDate() - dow);
  return day.toISOString().slice(0, 10);
}

export interface VolumeTimePoint {
  periodStart: string;
  totalVolume: number;
}

export function volumeOverTime(sets: VolumeSet[], granularity: "week" | "month" = "week"): VolumeTimePoint[] {
  const map = new Map<string, number>();
  for (const s of sets) {
    const key =
      granularity === "week"
        ? weekKey(s.date)
        : `${s.date.getFullYear()}-${String(s.date.getMonth() + 1).padStart(2, "0")}-01`;
    map.set(key, (map.get(key) ?? 0) + setVolume(s.weightKg, s.reps));
  }
  return Array.from(map.entries())
    .map(([periodStart, totalVolume]) => ({ periodStart, totalVolume: Math.round(totalVolume) }))
    .sort((a, b) => a.periodStart.localeCompare(b.periodStart));
}
