import Link from "next/link";
import { addDays, formatDateShortEs, parseDateInput, startOfWeek, todayStart, toDateInputValue } from "@/lib/dates";
import { getOrCreateWeeklyReview } from "@/lib/data/weekly-review";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatTile } from "@/components/dashboard/stat-tile";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";

const EVAL_VARIANT: Record<string, "success" | "default" | "warning" | "danger"> = {
  Excelente: "success", Normal: "default", Fatiga: "warning", "Recuperación insuficiente": "danger",
};

export default async function WeeklyReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  const today = todayStart();
  const currentWeekStart = startOfWeek(today);
  const lastCompletedWeekStart = addDays(currentWeekStart, -7);

  const weekStart = week ? startOfWeek(parseDateInput(week)) : lastCompletedWeekStart;
  const isPastWeek = weekStart < currentWeekStart;

  const summary = await getOrCreateWeeklyReview(weekStart, isPastWeek);

  const prevWeek = toDateInputValue(addDays(weekStart, -7));
  const nextWeek = toDateInputValue(addDays(weekStart, 7));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Revisión semanal</h1>
          <p className="text-sm text-muted">
            {formatDateShortEs(parseDateInput(summary.weekStart))} — {formatDateShortEs(parseDateInput(summary.weekEnd))}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button asChild variant="outline" size="icon">
            <Link href={`/weekly-review?week=${prevWeek}`}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="icon">
            <Link href={`/weekly-review?week=${nextWeek}`}>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="flex items-center justify-between pt-4">
          <span className="text-sm text-muted">Evaluación</span>
          <Badge variant={EVAL_VARIANT[summary.evaluation]}>{summary.evaluation}</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Esta semana</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatTile label="Peso promedio" value={summary.avgWeightKg != null ? `${summary.avgWeightKg} kg` : "Sin datos"} />
          <StatTile label="Cintura" value={summary.avgWaistCm != null ? `${summary.avgWaistCm.toFixed(1)} cm` : "Sin datos"} />
          <StatTile label="Sueño" value={summary.avgSleepHours != null ? `${summary.avgSleepHours}h` : "Sin datos"} />
          <StatTile label="Gimnasio" value={`${summary.gymDone}/${summary.gymPlanned}`} />
          <StatTile label="Fútbol" value={`${summary.footballDone}/${summary.footballPlanned}`} />
          <StatTile label="Rendimiento" value={summary.avgPerformance != null ? `${summary.avgPerformance}/5` : "Sin datos"} />
          <StatTile label="Carga total" value={String(summary.totalLoad)} />
        </CardContent>
      </Card>
    </div>
  );
}
