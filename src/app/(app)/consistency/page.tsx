import { prisma } from "@/lib/prisma";
import { addDays, endOfWeek, formatDateShortEs, startOfWeek, todayStart } from "@/lib/dates";
import { computeConsistency } from "@/lib/calculations/consistency";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatTile } from "@/components/dashboard/stat-tile";
import { InsufficientData } from "@/components/dashboard/insufficient-data";

export default async function ConsistencyPage() {
  const today = todayStart();
  const weeks = Array.from({ length: 6 }, (_, i) => startOfWeek(addDays(today, -7 * (5 - i))));

  const rows = await Promise.all(
    weeks.map(async (weekStart) => {
      const weekEnd = endOfWeek(weekStart);
      const [plannedGym, completedGym, plannedFootball, completedFootball, restDays] = await Promise.all([
        prisma.calendarEvent.count({ where: { type: "GYM", date: { gte: weekStart, lte: weekEnd } } }),
        prisma.workout.count({ where: { date: { gte: weekStart, lte: weekEnd } } }),
        prisma.calendarEvent.count({ where: { type: "FOOTBALL", date: { gte: weekStart, lte: weekEnd } } }),
        prisma.footballSession.count({ where: { date: { gte: weekStart, lte: weekEnd } } }),
        prisma.calendarEvent.count({ where: { type: "REST", date: { gte: weekStart, lte: weekEnd } } }),
      ]);
      const consistency = computeConsistency({
        plannedGym, completedGym, plannedFootball, completedFootball,
        plannedRestDays: restDays, takenRestDays: restDays,
      });
      return { weekStart, weekEnd, plannedGym, completedGym, plannedFootball, completedFootball, restDays, consistency };
    }),
  );

  const withData = rows.filter((r) => r.plannedGym + r.plannedFootball > 0);
  const overallPct =
    withData.length > 0
      ? Math.round(withData.reduce((a, r) => a + (r.consistency.overallCompliancePct ?? 0), 0) / withData.length)
      : null;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Consistencia</h1>
        <p className="text-sm text-muted">El descanso programado no cuenta como incumplimiento.</p>
      </div>

      <Card>
        <CardContent className="pt-4">
          <StatTile label="Cumplimiento promedio (6 semanas)" value={overallPct != null ? `${overallPct}%` : "Sin datos"} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Por semana</CardTitle>
          <CardDescription>Comparado contra lo agendado en el Calendario.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {rows.every((r) => r.plannedGym + r.plannedFootball === 0) ? (
            <InsufficientData reason="Agendá sesiones en el Calendario para poder medir consistencia." />
          ) : (
            rows.map((r) => (
              <div key={r.weekStart.toISOString()} className="flex items-center justify-between border-b border-border py-2 text-sm last:border-0">
                <span className="text-muted">{formatDateShortEs(r.weekStart)}</span>
                <span>Gym {r.completedGym}/{Math.max(r.plannedGym, r.completedGym)}</span>
                <span>Fútbol {r.completedFootball}/{Math.max(r.plannedFootball, r.completedFootball)}</span>
                <span className="text-muted-2">Descanso {r.restDays}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
