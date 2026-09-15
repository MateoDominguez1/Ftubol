import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getDashboardData } from "@/lib/data/dashboard";
import { PERFORMANCE_COMPONENT_LABELS } from "@/lib/calculations/performanceScore";
import { PHASE_INFO } from "@/lib/calculations/phase";
import { formatDateEs } from "@/lib/dates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatTile } from "@/components/dashboard/stat-tile";
import { ScoreRing } from "@/components/dashboard/score-ring";
import { ZoneBadge } from "@/components/dashboard/zone-badge";
import { InsufficientData } from "@/components/dashboard/insufficient-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info, ShieldAlert } from "lucide-react";

const SEVERITY_ICON = { critical: ShieldAlert, warning: AlertTriangle, info: Info } as const;
const SEVERITY_COLOR = { critical: "text-danger", warning: "text-zone-yellow", info: "text-accent" } as const;

export default async function DashboardPage() {
  const data = await getDashboardData();
  const todayEvents = await prisma.calendarEvent.findMany({ where: { date: data.today } });

  const TYPE_LABEL: Record<string, string> = {
    GYM: "Gimnasio", FOOTBALL: "Fútbol", MATCH: "Partido", REST: "Descanso", WALK: "Caminata", OTHER: "Otro",
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted">{formatDateEs(data.today)}</p>
        </div>
        {data.checkinZone ? (
          <ZoneBadge zone={data.checkinZone.zone} />
        ) : (
          <Button asChild size="sm">
            <Link href="/checkin">Hacer check-in</Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Score</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-around">
          {data.performance.status === "ok" ? (
            <ScoreRing value={data.performance.data.score} label="Score" />
          ) : (
            <div className="flex h-[132px] w-[132px] items-center justify-center rounded-full border border-dashed border-border text-center text-xs text-muted-2">
              Sin datos suficientes
            </div>
          )}
          <div className="grid w-full grid-cols-2 gap-3 sm:w-auto">
            {(["recovery", "strength", "football", "bodyComposition", "consistency"] as const).map((key) => {
              const value = data.performance.status === "ok" ? data.performance.data.components[key] : null;
              return (
                <div key={key} className="flex flex-col">
                  <span className="text-[11px] text-muted">{PERFORMANCE_COMPONENT_LABELS[key]}</span>
                  <span className="text-lg font-semibold">{value != null ? Math.round(value) : "—"}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {data.recovery.status === "ok" ? (
        <Card>
          <CardContent className="flex items-center justify-between pt-4">
            <div>
              <p className="text-xs text-muted">Recovery Score</p>
              <p className="text-2xl font-bold">
                {data.recovery.data.bandEmoji} {data.recovery.data.score}
              </p>
              <p className="text-xs text-muted-2">{data.recovery.data.bandLabel}</p>
            </div>
            <p className="max-w-[55%] text-right text-[11px] text-muted-2">
              Basado en: {data.recovery.data.usedSources.join(", ")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <InsufficientData reason={data.recovery.reason} />
      )}

      <Card>
        <CardContent className="grid grid-cols-2 gap-4 pt-4 sm:grid-cols-4">
          <StatTile label="Peso" value={data.latestWeightKg != null ? `${data.latestWeightKg} kg` : "Sin datos"} />
          <StatTile
            label="Promedio semanal"
            value={data.weeklyAvgWeight.status === "ok" ? `${data.weeklyAvgWeight.data.toFixed(1)} kg` : "Sin datos"}
            trend={data.weightChange.status === "ok" ? (data.weightChange.data.deltaKg < 0 ? "down" : data.weightChange.data.deltaKg > 0 ? "up" : "flat") : null}
            trendGood={false}
          />
          <StatTile label="Cintura" value={data.latestWaistCm != null ? `${data.latestWaistCm} cm` : "Sin datos"} trend={data.waistChangeCm != null ? (data.waistChangeCm < 0 ? "down" : "up") : null} trendGood={false} />
          <StatTile label="Sueño (7d)" value={data.sleepAvgHours.status === "ok" ? `${data.sleepAvgHours.data.toFixed(1)}h` : "Sin datos"} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Próximo partido</CardTitle>
        </CardHeader>
        <CardContent>
          {data.nextMatchDate ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{formatDateEs(data.nextMatchDate)}</p>
                <p className="text-xs text-muted-2">
                  {data.daysToNextMatch === 0 ? "Hoy" : `Faltan ${data.daysToNextMatch} día${data.daysToNextMatch === 1 ? "" : "s"}`}
                </p>
              </div>
              {data.mdLabel ? <Badge variant="outline">{data.mdLabel}</Badge> : null}
            </div>
          ) : (
            <InsufficientData reason="No hay ningún partido agendado. Cargalo en el Calendario." />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hoy</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {todayEvents.length === 0 ? (
            <InsufficientData reason="No hay eventos programados para hoy." />
          ) : (
            todayEvents.map((e) => (
              <div key={e.id} className="flex items-center justify-between text-sm">
                <span>{TYPE_LABEL[e.type]}</span>
                <span className="text-muted-2">{e.time ?? ""}</span>
              </div>
            ))
          )}
          <p className="text-xs text-muted-2">
            {PHASE_INFO[data.currentPhase].label} · Semana {data.weekNumber}
          </p>
        </CardContent>
      </Card>

      {data.recommendations.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Recomendaciones</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {data.recommendations.map((r) => {
              const Icon = SEVERITY_ICON[r.severity];
              return (
                <div key={r.id} className="flex items-start gap-2 text-sm">
                  <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${SEVERITY_COLOR[r.severity]}`} />
                  <span>{r.message}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <StatTile
          label="Gimnasio esta semana"
          value={`${data.sessionsThisWeek.gymDone}/${Math.max(data.sessionsThisWeek.gymPlanned, data.sessionsThisWeek.gymDone)}`}
        />
        <StatTile
          label="Fútbol esta semana"
          value={`${data.sessionsThisWeek.footballDone}/${Math.max(data.sessionsThisWeek.footballPlanned, data.sessionsThisWeek.footballDone)}`}
        />
      </div>
    </div>
  );
}
