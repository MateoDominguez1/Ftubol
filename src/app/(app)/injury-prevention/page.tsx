import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getExerciseHistoryByCategory } from "@/lib/data/exercise-history";
import { addDays, formatDateShortEs, todayStart } from "@/lib/dates";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { InsufficientData } from "@/components/dashboard/insufficient-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ZONE_LABEL: Record<string, string> = {
  HAMSTRING: "Isquiotibial", ADDUCTOR: "Aductor", PUBIS: "Pubis", ANKLE: "Tobillo", KNEE: "Rodilla",
  SOLEUS: "Sóleo", ACHILLES: "Aquiles", SHOULDER: "Hombro", BACK: "Espalda", OTHER: "Otra",
};

export default async function InjuryPreventionPage() {
  const [exercises, recentPain] = await Promise.all([
    getExerciseHistoryByCategory("INJURY_PREVENTION"),
    prisma.painEntry.findMany({ where: { date: { gte: addDays(todayStart(), -30) } }, orderBy: { date: "desc" } }),
  ]);

  const painByZone = new Map<string, number>();
  for (const p of recentPain) {
    painByZone.set(p.zone, Math.max(painByZone.get(p.zone) ?? 0, p.painLevel));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Prevención de lesiones</h1>
          <p className="text-sm text-muted">Frecuencia y progresión de los ejercicios prioritarios.</p>
        </div>
        <Button asChild size="sm">
          <Link href="/gym/new">Registrar</Link>
        </Button>
      </div>

      {exercises.length === 0 ? (
        <InsufficientData reason="No hay ejercicios de prevención en la biblioteca todavía." />
      ) : (
        exercises.map((ex) => (
          <Card key={ex.exerciseId}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-foreground">{ex.exerciseName}</CardTitle>
                <div className="flex gap-1">
                  {ex.injuryZones.map((z) => {
                    const pain = painByZone.get(z);
                    return (
                      <Badge key={z} variant={pain != null && pain >= 4 ? "danger" : "outline"}>
                        {ZONE_LABEL[z] ?? z}
                        {pain != null ? ` (${pain}/10)` : ""}
                      </Badge>
                    );
                  })}
                </div>
              </div>
              <CardDescription>
                {ex.lastPerformed ? `Última vez: ${formatDateShortEs(ex.lastPerformed)}` : "Sin registros"} · {ex.sessionCount8w} veces en 8 semanas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ex.lastSetSummary ? <p className="text-sm text-muted">Último set: {ex.lastSetSummary}</p> : null}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
