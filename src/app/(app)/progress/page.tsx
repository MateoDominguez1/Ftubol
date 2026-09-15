import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { addDays, formatDateShortEs, todayStart } from "@/lib/dates";
import { sessionLoad } from "@/lib/calculations/trainingLoad";
import { volumeOverTime, type VolumeSet } from "@/lib/calculations/volume";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InsufficientData } from "@/components/dashboard/insufficient-data";
import { SimpleLineChart } from "@/components/dashboard/simple-line-chart";
import { Button } from "@/components/ui/button";
import { FilterTabs } from "./filter-tabs";

function weekKey(d: Date): string {
  const c = new Date(d);
  const dow = (c.getDay() + 6) % 7;
  c.setDate(c.getDate() - dow);
  return c.toISOString().slice(0, 10);
}

export default async function ProgressPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const { days: daysParam } = await searchParams;
  const days = Number(daysParam ?? "30") || 30;
  const today = todayStart();
  const since = addDays(today, -days);

  const [measurements, sleepEntries, checkins, footballSessions, matches, workouts, footballLoadSrc, nutrition, volumeSetsRaw] =
    await Promise.all([
      prisma.bodyMeasurement.findMany({ where: { date: { gte: since } }, orderBy: { date: "asc" } }),
      prisma.sleepEntry.findMany({ where: { date: { gte: since } }, orderBy: { date: "asc" } }),
      prisma.dailyCheckin.findMany({ where: { date: { gte: since } }, orderBy: { date: "asc" } }),
      prisma.footballSession.findMany({ where: { date: { gte: since }, performance: { not: null } }, orderBy: { date: "asc" } }),
      prisma.match.findMany({ where: { date: { gte: since }, performance: { not: null } }, orderBy: { date: "asc" } }),
      prisma.workout.findMany({ where: { date: { gte: since } }, select: { date: true, sessionRPE: true, durationMin: true } }),
      prisma.footballSession.findMany({ where: { date: { gte: since } }, select: { date: true, rpe: true, durationMin: true } }),
      prisma.nutritionEntry.findMany({ where: { date: { gte: since } }, orderBy: { date: "asc" } }),
      prisma.workoutExercise.findMany({
        where: { workout: { date: { gte: since } } },
        include: { sets: true, exercise: { include: { muscleGroups: true } }, workout: { select: { date: true } } },
      }),
    ]);

  const weightData = measurements.filter((m) => m.weightKg != null).map((m) => ({ label: formatDateShortEs(m.date), peso: m.weightKg! }));
  const waistData = measurements.filter((m) => m.waistCm != null).map((m) => ({ label: formatDateShortEs(m.date), cintura: m.waistCm! }));
  const sleepData = sleepEntries.filter((s) => s.hoursSlept != null).map((s) => ({ label: formatDateShortEs(s.date), horas: s.hoursSlept! }));
  const fatigueData = checkins.map((c) => ({ label: formatDateShortEs(c.date), fatiga: c.totalScore }));
  const perfData = [...footballSessions, ...matches]
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((s) => ({ label: formatDateShortEs(s.date), rendimiento: s.performance! }));
  const caloriesData = nutrition.filter((n) => n.calories != null).map((n) => ({ label: formatDateShortEs(n.date), calorias: n.calories! }));
  const proteinData = nutrition.filter((n) => n.proteinG != null).map((n) => ({ label: formatDateShortEs(n.date), proteina: n.proteinG! }));

  const loadByWeek = new Map<string, number>();
  for (const w of workouts) loadByWeek.set(weekKey(w.date), (loadByWeek.get(weekKey(w.date)) ?? 0) + sessionLoad(w.sessionRPE, w.durationMin));
  for (const f of footballLoadSrc) loadByWeek.set(weekKey(f.date), (loadByWeek.get(weekKey(f.date)) ?? 0) + sessionLoad(f.rpe, f.durationMin));
  const loadData = Array.from(loadByWeek.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([week, carga]) => ({ label: week.slice(5), carga: Math.round(carga) }));

  const volumeSets: VolumeSet[] = volumeSetsRaw.flatMap((we) =>
    we.sets.map((s) => ({
      date: we.workout.date, exerciseId: we.exerciseId, exerciseName: we.exercise.name,
      weightKg: s.weightKg, reps: s.reps, muscleGroups: we.exercise.muscleGroups.map((mg) => ({ group: mg.muscleGroup, factor: mg.factor })),
    })),
  );
  const volumeData = volumeOverTime(volumeSets, "week").map((p) => ({ label: p.periodStart.slice(5), volumen: p.totalVolume }));

  const charts: { title: string; data: Record<string, string | number>[]; dataKey: string; unit?: string }[] = [
    { title: "Peso", data: weightData, dataKey: "peso", unit: " kg" },
    { title: "Cintura", data: waistData, dataKey: "cintura", unit: " cm" },
    { title: "Sueño", data: sleepData, dataKey: "horas", unit: "h" },
    { title: "Fatiga (check-in)", data: fatigueData, dataKey: "fatiga" },
    { title: "Rendimiento fútbol", data: perfData, dataKey: "rendimiento" },
    { title: "Carga semanal", data: loadData, dataKey: "carga" },
    { title: "Volumen semanal", data: volumeData, dataKey: "volumen", unit: " kg" },
    { title: "Calorías", data: caloriesData, dataKey: "calorias", unit: " kcal" },
    { title: "Proteína", data: proteinData, dataKey: "proteina", unit: "g" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Progreso</h1>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/body/photos">Fotos</Link>
        </Button>
      </div>

      <FilterTabs current={String(days)} />

      {charts.map((c) => (
        <Card key={c.title}>
          <CardHeader>
            <CardTitle>{c.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {c.data.length >= 2 ? (
              <SimpleLineChart data={c.data} dataKey={c.dataKey} unit={c.unit} />
            ) : (
              <InsufficientData reason={`No hay suficientes datos de "${c.title.toLowerCase()}" en este período.`} />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
