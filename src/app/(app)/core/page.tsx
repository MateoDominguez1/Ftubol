import Link from "next/link";
import { getExerciseHistoryByCategory } from "@/lib/data/exercise-history";
import { formatDateShortEs } from "@/lib/dates";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { InsufficientData } from "@/components/dashboard/insufficient-data";
import { Button } from "@/components/ui/button";
import { SimpleLineChart } from "@/components/dashboard/simple-line-chart";

export default async function CorePage() {
  const exercises = await getExerciseHistoryByCategory("CORE");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Core / Abdomen</h1>
          <p className="text-sm text-muted">
            El objetivo no es solo hacer más repeticiones: progresá en rango, palanca, carga, tiempo bajo tensión y control técnico (anotalo en las notas de cada set).
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/gym/new">Registrar</Link>
        </Button>
      </div>

      {exercises.length === 0 ? (
        <InsufficientData reason="No hay ejercicios de core en la biblioteca todavía." />
      ) : (
        exercises.map((ex) => (
          <Card key={ex.exerciseId}>
            <CardHeader>
              <CardTitle className="text-base text-foreground">{ex.exerciseName}</CardTitle>
              <CardDescription>
                {ex.lastPerformed ? `Última vez: ${formatDateShortEs(ex.lastPerformed)}` : "Sin registros"} · {ex.sessionCount8w} sesiones en 8 semanas
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {ex.lastSetSummary ? <p className="text-sm">Último set: {ex.lastSetSummary}</p> : null}
              {ex.volumeTrend.length >= 2 ? (
                <SimpleLineChart
                  data={ex.volumeTrend.map((p) => ({ label: p.periodStart.slice(5), volumen: p.totalVolume }))}
                  dataKey="volumen"
                />
              ) : (
                <InsufficientData reason="Hacen falta más semanas registradas para ver una tendencia." />
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
