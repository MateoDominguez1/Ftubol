import { prisma } from "@/lib/prisma";
import { addDays, todayStart } from "@/lib/dates";
import { volumeOverTime, setVolume, type VolumeSet } from "@/lib/calculations/volume";

export interface ExerciseHistorySummary {
  exerciseId: string;
  exerciseName: string;
  injuryZones: string[];
  lastPerformed: Date | null;
  sessionCount8w: number;
  lastSetSummary: string | null;
  volumeTrend: { periodStart: string; totalVolume: number }[];
}

export async function getExerciseHistoryByCategory(category: "CORE" | "INJURY_PREVENTION"): Promise<ExerciseHistorySummary[]> {
  const since = addDays(todayStart(), -56); // 8 semanas

  const exercises = await prisma.exercise.findMany({
    where: { category },
    orderBy: { name: "asc" },
    include: {
      workoutExercises: {
        where: { workout: { date: { gte: since } } },
        include: { sets: true, workout: { select: { date: true } } },
        orderBy: { workout: { date: "desc" } },
      },
    },
  });

  return exercises.map((ex) => {
    const volumeSets: VolumeSet[] = ex.workoutExercises.flatMap((we) =>
      we.sets.map((s) => ({
        date: we.workout.date,
        exerciseId: ex.id,
        exerciseName: ex.name,
        weightKg: s.weightKg,
        reps: s.reps,
        muscleGroups: [],
      })),
    );

    const lastWE = ex.workoutExercises[0];
    const lastSet = lastWE?.sets[0];
    const lastSetSummary = lastSet
      ? `${lastSet.weightKg != null ? `${lastSet.weightKg}kg × ` : ""}${lastSet.reps ?? "-"} reps${lastSet.difficulty != null ? ` · dif. ${lastSet.difficulty}/5` : ""}`
      : null;

    return {
      exerciseId: ex.id,
      exerciseName: ex.name,
      injuryZones: ex.injuryZones,
      lastPerformed: lastWE?.workout.date ?? null,
      sessionCount8w: ex.workoutExercises.length,
      lastSetSummary,
      volumeTrend: volumeOverTime(volumeSets, "week"),
    };
  });
}

export function totalSessionVolume(sets: { weightKg: number | null; reps: number | null }[]): number {
  return sets.reduce((acc, s) => acc + setVolume(s.weightKg, s.reps), 0);
}
