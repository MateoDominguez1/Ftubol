import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { addDays, formatDateShortEs, todayStart } from "@/lib/dates";
import { rollingAverage, weekOverWeekWeightChange, evaluateWeightLossRate, waistTrend } from "@/lib/calculations/bodyComposition";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatTile } from "@/components/dashboard/stat-tile";
import { InsufficientData } from "@/components/dashboard/insufficient-data";
import { Button } from "@/components/ui/button";
import { WeightChart, type WeightChartPoint } from "@/components/dashboard/weight-chart";

export default async function BodyCompositionPage() {
  const today = todayStart();
  const since = addDays(today, -60);
  const measurements = await prisma.bodyMeasurement.findMany({
    where: { date: { gte: since } },
    orderBy: { date: "asc" },
  });
  const profile = await prisma.profile.findFirst();

  const weighIns = measurements.filter((m) => m.weightKg != null).map((m) => ({ date: m.date, weightKg: m.weightKg! }));
  const waistEntries = measurements.filter((m) => m.waistCm != null).map((m) => ({ date: m.date, waistCm: m.waistCm! }));

  const currentAvg = rollingAverage(weighIns, today, 7);
  const wow = weekOverWeekWeightChange(weighIns, today);
  const waist = waistTrend(waistEntries);

  // Serie diaria + promedio móvil para el gráfico
  const chartData: WeightChartPoint[] = [];
  const dayCount = 60;
  for (let i = dayCount; i >= 0; i--) {
    const d = addDays(today, -i);
    const key = formatDateShortEs(d);
    const dayEntry = weighIns.find((w) => w.date.toDateString() === d.toDateString());
    const avg = rollingAverage(weighIns, d, 7);
    chartData.push({
      date: key,
      daily: dayEntry ? dayEntry.weightKg : null,
      rollingAvg: avg.status === "ok" ? Math.round(avg.data * 10) / 10 : null,
    });
  }

  // Últimas semanas de delta para evaluar ritmo de pérdida
  const weeklyDeltas: number[] = [];
  for (let w = 3; w >= 0; w--) {
    const asOf = addDays(today, -w * 7);
    const change = weekOverWeekWeightChange(weighIns, asOf);
    if (change.status === "ok") weeklyDeltas.push(change.data.deltaKg);
  }
  const rate = evaluateWeightLossRate(weeklyDeltas);

  const latestWeight = weighIns.at(-1)?.weightKg ?? null;
  const latestWaist = waistEntries.at(-1)?.waistCm ?? null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Composición corporal</h1>
          <p className="text-sm text-muted">El progreso se mide en promedios semanales, nunca en el peso de un solo día.</p>
        </div>
        <Button asChild size="sm">
          <Link href="/body/new">Registrar</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="grid grid-cols-2 gap-4 pt-4 sm:grid-cols-4">
          <StatTile label="Peso de hoy" value={latestWeight != null ? `${latestWeight} kg` : "Sin datos"} />
          <StatTile
            label="Promedio 7 días"
            value={currentAvg.status === "ok" ? `${currentAvg.data.toFixed(1)} kg` : "Sin datos"}
          />
          <StatTile
            label="Cambio semanal"
            value={wow.status === "ok" ? `${wow.data.deltaKg > 0 ? "+" : ""}${wow.data.deltaKg.toFixed(1)} kg` : "Sin datos"}
            trend={wow.status === "ok" ? (wow.data.deltaKg > 0 ? "up" : wow.data.deltaKg < 0 ? "down" : "flat") : null}
            trendGood={false}
          />
          <StatTile label="Cintura" value={latestWaist != null ? `${latestWaist} cm` : "Sin datos"} />
        </CardContent>
      </Card>

      {profile?.targetWeightMinKg && profile?.targetWeightMaxKg ? (
        <Card>
          <CardContent className="flex items-center justify-between pt-4 text-sm">
            <span className="text-muted">Objetivo orientativo de peso</span>
            <span className="font-medium">{profile.targetWeightMinKg}-{profile.targetWeightMaxKg} kg</span>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Peso diario vs. promedio móvil (7 días)</CardTitle>
          <CardDescription>La línea clara es el registro diario; la verde es la que importa para evaluar progreso.</CardDescription>
        </CardHeader>
        <CardContent>
          {weighIns.length === 0 ? <InsufficientData reason="Todavía no registraste peso." /> : <WeightChart data={chartData} />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ritmo de pérdida de peso</CardTitle>
          <CardDescription>Objetivo: 0.4-0.6 kg/semana.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {weeklyDeltas.length === 0 ? (
            <InsufficientData reason="Hacen falta al menos dos semanas de registros de peso para evaluar el ritmo." />
          ) : (
            <>
              <p className="text-sm">
                {rate.flag === "on_track" && "Vas dentro del objetivo de pérdida semanal. 🟢"}
                {rate.flag === "too_fast" && "La pérdida de esta semana fue más rápida que el objetivo. Prestá atención al déficit."}
                {rate.flag === "too_slow_or_gaining" && "Esta semana no hubo pérdida de peso (o hubo aumento)."}
                {rate.flag === "unknown" && "Sin datos suficientes."}
              </p>
              {rate.consecutiveTooFast ? (
                <div className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                  La pérdida de peso está siendo demasiado rápida durante dos semanas seguidas. Revisá el déficit calórico.
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cintura</CardTitle>
        </CardHeader>
        <CardContent>
          {waist.status === "ok" ? (
            <p className="text-sm">
              De {waist.data.startCm} cm a {waist.data.latestCm} cm ({waist.data.deltaCm > 0 ? "+" : ""}
              {waist.data.deltaCm.toFixed(1)} cm) desde {formatDateShortEs(waist.data.startDate)}.
            </p>
          ) : (
            <InsufficientData reason={waist.reason} />
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button asChild variant="outline" size="sm">
          <Link href="/body/photos">Ver fotos de progreso</Link>
        </Button>
      </div>
    </div>
  );
}
