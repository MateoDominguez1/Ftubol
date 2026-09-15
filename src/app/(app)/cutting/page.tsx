import { prisma } from "@/lib/prisma";
import { addDays, formatDateShortEs, todayStart } from "@/lib/dates";
import { rollingAverage, weekOverWeekWeightChange, waistTrend, evaluateWeightLossRate } from "@/lib/calculations/bodyComposition";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatTile } from "@/components/dashboard/stat-tile";
import { InsufficientData } from "@/components/dashboard/insufficient-data";

export default async function CuttingProgressPage() {
  const today = todayStart();
  const profile = await prisma.profile.findFirst();
  const measurements = await prisma.bodyMeasurement.findMany({ where: { date: { gte: addDays(today, -60) } }, orderBy: { date: "asc" } });

  const weighIns = measurements.filter((m) => m.weightKg != null).map((m) => ({ date: m.date, weightKg: m.weightKg! }));
  const waistEntries = measurements.filter((m) => m.waistCm != null).map((m) => ({ date: m.date, waistCm: m.waistCm! }));

  const currentAvg = rollingAverage(weighIns, today, 7);
  const change = weekOverWeekWeightChange(weighIns, today);
  const waist = waistTrend(waistEntries);

  const weeklyLossKg: number[] = [];
  for (let w = 3; w >= 0; w--) {
    const asOf = addDays(today, -w * 7);
    const c = weekOverWeekWeightChange(weighIns, asOf);
    if (c.status === "ok") weeklyLossKg.push(-c.data.deltaKg);
  }
  const rate = evaluateWeightLossRate(weeklyLossKg);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Cutting Progress</h1>
        <p className="text-sm text-muted">Objetivo: 0.4-0.6 kg/semana, sin sacrificar fuerza ni rendimiento.</p>
      </div>

      <Card>
        <CardContent className="grid grid-cols-2 gap-4 pt-4">
          <StatTile label="Promedio semanal" value={currentAvg.status === "ok" ? `${currentAvg.data.toFixed(1)} kg` : "Sin datos"} />
          <StatTile
            label="Cambio semanal"
            value={change.status === "ok" ? `${change.data.deltaKg > 0 ? "+" : ""}${change.data.deltaKg.toFixed(1)} kg` : "Sin datos"}
          />
          <StatTile label="Cintura" value={waist.status === "ok" ? `${waist.data.deltaCm > 0 ? "+" : ""}${waist.data.deltaCm.toFixed(1)} cm` : "Sin datos"} />
          {profile?.targetWeightMinKg ? (
            <StatTile label="Objetivo de peso" value={`${profile.targetWeightMinKg}-${profile.targetWeightMaxKg} kg`} />
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Evaluación</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {weeklyLossKg.length === 0 ? (
            <InsufficientData reason="Hacen falta al menos dos semanas de pesajes para evaluar el ritmo del déficit." />
          ) : (
            <>
              {rate.flag === "on_track" && <p className="text-sm text-zone-green">🟢 Ritmo de pérdida dentro del objetivo.</p>}
              {rate.flag === "too_fast" && <p className="text-sm text-zone-orange">🟠 La pérdida está siendo más rápida que el objetivo.</p>}
              {rate.flag === "too_slow_or_gaining" && <p className="text-sm text-muted">Esta semana no hubo pérdida de peso.</p>}
              {rate.consecutiveTooFast ? (
                <div className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                  La pérdida de peso está siendo demasiado rápida. Revisá el déficit.
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Relación peso / cintura / fuerza</CardTitle>
          <CardDescription>Cruce de variables (sección 21).</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm text-muted">
          {change.status === "ok" && waist.status === "ok" ? (
            <p>
              {change.data.deltaKg < 0 && waist.data.deltaCm < 0
                ? "Peso ↓ y cintura ↓: buena señal de recomposición. Revisá la página de Fuerza para confirmar que se mantiene o sube."
                : change.data.deltaKg < 0 && waist.data.deltaCm >= 0
                  ? "El peso bajó pero la cintura no acompaña: puede ser pérdida de agua o masa muscular, no solo grasa."
                  : change.data.deltaKg >= 0 && waist.data.deltaCm < 0
                    ? "Peso estable y cintura bajando: excelente recomposición corporal."
                    : "Sin cambios claros esta semana."}
            </p>
          ) : (
            <InsufficientData reason="Hacen falta registros de peso y cintura en el mismo período para cruzar variables." />
          )}
          <p className="text-xs text-muted-2">Última cintura registrada: {waist.status === "ok" ? formatDateShortEs(waist.data.latestDate) : "sin datos"}</p>
        </CardContent>
      </Card>
    </div>
  );
}
