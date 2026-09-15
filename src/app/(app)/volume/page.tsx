import { prisma } from "@/lib/prisma";
import { addDays, todayStart } from "@/lib/dates";
import { volumeByExercise, volumeByMuscleGroup, volumeOverTime, type VolumeSet } from "@/lib/calculations/volume";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { InsufficientData } from "@/components/dashboard/insufficient-data";
import { SimpleBarChart } from "@/components/dashboard/simple-bar-chart";
import { SimpleLineChart } from "@/components/dashboard/simple-line-chart";

export default async function VolumePage() {
  const since = addDays(todayStart(), -84); // 12 semanas
  const workoutExercises = await prisma.workoutExercise.findMany({
    where: { workout: { date: { gte: since } } },
    include: {
      sets: true,
      exercise: { include: { muscleGroups: true } },
      workout: { select: { date: true } },
    },
  });

  const volumeSets: VolumeSet[] = workoutExercises.flatMap((we) =>
    we.sets.map((s) => ({
      date: we.workout.date,
      exerciseId: we.exerciseId,
      exerciseName: we.exercise.name,
      weightKg: s.weightKg,
      reps: s.reps,
      muscleGroups: we.exercise.muscleGroups.map((mg) => ({ group: mg.muscleGroup, factor: mg.factor })),
    })),
  );

  if (volumeSets.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-semibold">Volumen</h1>
        <InsufficientData reason="Todavía no hay sets registrados para calcular volumen." />
      </div>
    );
  }

  const byExercise = volumeByExercise(volumeSets).slice(0, 10);
  const byGroup = volumeByMuscleGroup(volumeSets);
  const overTime = volumeOverTime(volumeSets, "week").map((p) => ({ label: p.periodStart.slice(5), volumen: p.totalVolume }));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Volumen</h1>
        <p className="text-sm text-muted">Series × repeticiones × peso — últimas 12 semanas.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Volumen semanal total</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleLineChart data={overTime} dataKey="volumen" unit=" kg" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Por grupo muscular</CardTitle>
          <CardDescription>Ponderado por la contribución de cada ejercicio.</CardDescription>
        </CardHeader>
        <CardContent>
          <SimpleBarChart data={byGroup.map((g) => ({ label: g.group, volumen: g.totalVolume }))} dataKey="volumen" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top ejercicios por volumen</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {byExercise.map((e) => (
            <div key={e.exerciseId} className="flex items-center justify-between border-b border-border py-2 text-sm last:border-0">
              <span>{e.exerciseName}</span>
              <span className="text-muted">{Math.round(e.totalVolume)} kg · {e.setCount} sets</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
