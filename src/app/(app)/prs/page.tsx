import { prisma } from "@/lib/prisma";
import { estimate1RM } from "@/lib/calculations/strength";
import { setVolume } from "@/lib/calculations/volume";
import { formatDateEs } from "@/lib/dates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InsufficientData } from "@/components/dashboard/insufficient-data";
import { Trophy } from "lucide-react";

export default async function PersonalRecordsPage() {
  const workoutExercises = await prisma.workoutExercise.findMany({
    include: { sets: true, exercise: true, workout: { select: { date: true } } },
  });

  const byExercise = new Map<
    string,
    { name: string; maxWeight: { value: number; date: Date } | null; maxEst1RM: { value: number; date: Date } | null; maxVolume: { value: number; date: Date } | null }
  >();

  for (const we of workoutExercises) {
    if (!byExercise.has(we.exerciseId)) {
      byExercise.set(we.exerciseId, { name: we.exercise.name, maxWeight: null, maxEst1RM: null, maxVolume: null });
    }
    const entry = byExercise.get(we.exerciseId)!;
    let sessionVolume = 0;
    for (const s of we.sets) {
      if (s.weightKg != null) {
        if (!entry.maxWeight || s.weightKg > entry.maxWeight.value) {
          entry.maxWeight = { value: s.weightKg, date: we.workout.date };
        }
        if (s.reps != null) {
          const est = estimate1RM(s.weightKg, s.reps);
          if (!entry.maxEst1RM || est > entry.maxEst1RM.value) {
            entry.maxEst1RM = { value: est, date: we.workout.date };
          }
        }
      }
      sessionVolume += setVolume(s.weightKg, s.reps);
    }
    if (sessionVolume > 0 && (!entry.maxVolume || sessionVolume > entry.maxVolume.value)) {
      entry.maxVolume = { value: sessionVolume, date: we.workout.date };
    }
  }

  const rows = Array.from(byExercise.values()).filter((e) => e.maxWeight || e.maxEst1RM || e.maxVolume);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Récords personales</h1>
        <p className="text-sm text-muted">Calculados automáticamente a partir de tus sesiones.</p>
      </div>

      {rows.length === 0 ? (
        <InsufficientData reason="Todavía no hay suficientes sets registrados para calcular PRs." />
      ) : (
        rows.map((r) => (
          <Card key={r.name}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-foreground">
                <Trophy className="h-4 w-4 text-brand" /> {r.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {r.maxWeight ? (
                <div>
                  <p className="text-xs text-muted">Mayor peso</p>
                  <p className="text-lg font-semibold">{r.maxWeight.value} kg</p>
                  <p className="text-[11px] text-muted-2">{formatDateEs(r.maxWeight.date)}</p>
                </div>
              ) : null}
              {r.maxEst1RM ? (
                <div>
                  <p className="text-xs text-muted">Mayor 1RM estimado</p>
                  <p className="text-lg font-semibold">{Math.round(r.maxEst1RM.value)} kg</p>
                  <p className="text-[11px] text-muted-2">{formatDateEs(r.maxEst1RM.date)}</p>
                </div>
              ) : null}
              {r.maxVolume ? (
                <div>
                  <p className="text-xs text-muted">Mayor volumen (sesión)</p>
                  <p className="text-lg font-semibold">{Math.round(r.maxVolume.value)} kg</p>
                  <p className="text-[11px] text-muted-2">{formatDateEs(r.maxVolume.date)}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
