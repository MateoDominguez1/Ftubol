import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { addDays, formatDateShortEs, todayStart } from "@/lib/dates";
import { computeNutritionTargets, DAY_TYPE_LABEL, type DayType } from "@/lib/calculations/nutrition";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { InsufficientData } from "@/components/dashboard/insufficient-data";
import { Button } from "@/components/ui/button";

function targetVsActual(label: string, actual: number | null, min: number | null, max: number | null, unit: string) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 text-sm last:border-0">
      <span className="text-muted">{label}</span>
      <span>
        {actual != null ? `${actual}${unit}` : "Sin datos"}
        {min != null && max != null ? <span className="text-muted-2"> / objetivo {min}-{max}{unit}</span> : null}
      </span>
    </div>
  );
}

export default async function NutritionPage() {
  const today = todayStart();
  const [profile, todayEntry, todayEvents, latestMeasurement, history] = await Promise.all([
    prisma.profile.findFirst(),
    prisma.nutritionEntry.findUnique({ where: { date: today } }),
    prisma.calendarEvent.findMany({ where: { date: today } }),
    prisma.bodyMeasurement.findFirst({ where: { weightKg: { not: null } }, orderBy: { date: "desc" } }),
    prisma.nutritionEntry.findMany({ where: { date: { gte: addDays(today, -13) } }, orderBy: { date: "desc" } }),
  ]);

  const bodyWeight = latestMeasurement?.weightKg ?? profile?.initialWeightKg ?? 85;
  const eventTypes = new Set(todayEvents.map((e) => e.type));
  let dayType: DayType = "REST";
  if (eventTypes.has("MATCH")) dayType = "MATCH";
  else if (eventTypes.has("FOOTBALL")) dayType = "FOOTBALL";
  else if (eventTypes.has("GYM")) dayType = "GYM";

  const targets = profile
    ? computeNutritionTargets(bodyWeight, dayType, {
        calorieTargetMin: profile.calorieTargetMin,
        calorieTargetMax: profile.calorieTargetMax,
        proteinTargetMinG: profile.proteinTargetMinG,
        proteinTargetMaxG: profile.proteinTargetMaxG,
        fatTargetPerKg: profile.fatTargetPerKg,
      })
    : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Nutrición</h1>
          <p className="text-sm text-muted">{DAY_TYPE_LABEL[dayType]} · basado en {bodyWeight} kg</p>
        </div>
        <Button asChild size="sm">
          <Link href="/nutrition/new">Registrar</Link>
        </Button>
      </div>

      {!profile?.calorieTargetMin ? (
        <InsufficientData reason="Configurá tus objetivos de calorías y proteína en Ajustes para ver el comparativo." />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Hoy vs. objetivo</CardTitle>
          <CardDescription>Los carbohidratos se ajustan según el tipo de día.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col">
          {targetVsActual("Calorías", todayEntry?.calories ?? null, targets?.calorieMin ?? null, targets?.calorieMax ?? null, " kcal")}
          {targetVsActual("Proteína", todayEntry?.proteinG ?? null, targets?.proteinMinG ?? null, targets?.proteinMaxG ?? null, "g")}
          {targetVsActual("Carbohidratos", todayEntry?.carbsG ?? null, targets?.carbMinG ?? null, targets?.carbMaxG ?? null, "g")}
          {targetVsActual("Grasas", todayEntry?.fatG ?? null, targets?.fatG ?? null, targets?.fatG ?? null, "g")}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial (14 días)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {history.length === 0 ? (
            <InsufficientData reason="Todavía no registraste comidas." />
          ) : (
            history.map((h) => (
              <div key={h.id} className="flex items-center justify-between border-b border-border py-2 text-sm last:border-0">
                <span className="text-muted">{formatDateShortEs(h.date)}</span>
                <span>{h.calories != null ? `${h.calories} kcal` : "Sin datos"}</span>
                <span className="text-muted-2">{h.proteinG != null ? `${h.proteinG}g prot.` : ""}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
