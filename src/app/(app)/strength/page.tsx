import { prisma } from "@/lib/prisma";
import { strengthTrend, bestSet, type SetSample } from "@/lib/calculations/strength";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatTile } from "@/components/dashboard/stat-tile";
import { InsufficientData } from "@/components/dashboard/insufficient-data";
import { SimpleLineChart } from "@/components/dashboard/simple-line-chart";
import { ExerciseSelect } from "./exercise-select";

export default async function StrengthPage({
  searchParams,
}: {
  searchParams: Promise<{ exercise?: string }>;
}) {
  const { exercise: exerciseIdParam } = await searchParams;

  const exercises = await prisma.exercise.findMany({
    where: { workoutExercises: { some: {} } },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  if (exercises.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-semibold">Fuerza</h1>
        <InsufficientData reason="Todavía no registraste sets de gimnasio. Cargá una sesión para ver progresión de fuerza." />
      </div>
    );
  }

  const exerciseId = exerciseIdParam && exercises.some((e) => e.id === exerciseIdParam) ? exerciseIdParam : exercises[0].id;

  const workoutExercises = await prisma.workoutExercise.findMany({
    where: { exerciseId },
    include: { sets: true, workout: { select: { date: true } } },
  });

  const samples: SetSample[] = workoutExercises.flatMap((we) =>
    we.sets.map((s) => ({ date: we.workout.date, weightKg: s.weightKg, reps: s.reps })),
  );

  const weeklyTrend = strengthTrend(samples, "week");
  const best = bestSet(samples);

  const chartData =
    weeklyTrend.status === "ok"
      ? weeklyTrend.data.map((p) => ({ label: p.periodStart.slice(5), est1RM: p.bestEst1RM }))
      : [];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Fuerza</h1>
        <p className="text-sm text-muted">1RM estimado y evolución por ejercicio.</p>
      </div>

      <ExerciseSelect exercises={exercises} value={exerciseId} />

      <Card>
        <CardContent className="grid grid-cols-2 gap-4 pt-4">
          <StatTile label="Mejor 1RM estimado" value={best ? `${Math.round(best.est1RM)} kg` : "Sin datos"} />
          <StatTile label="Mejor peso registrado" value={best ? `${best.weightKg} kg × ${best.reps}` : "Sin datos"} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Evolución semanal (1RM estimado)</CardTitle>
          <CardDescription>Fórmula de Epley, orientativa.</CardDescription>
        </CardHeader>
        <CardContent>
          {weeklyTrend.status === "ok" ? (
            <SimpleLineChart data={chartData} dataKey="est1RM" unit=" kg" />
          ) : (
            <InsufficientData reason={weeklyTrend.reason} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
