import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDateEs } from "@/lib/dates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InsufficientData } from "@/components/dashboard/insufficient-data";
import { StatTile } from "@/components/dashboard/stat-tile";

export default async function FootballPage() {
  const sessions = await prisma.footballSession.findMany({ orderBy: { date: "desc" }, take: 30 });

  const withPerf = sessions.filter((s) => s.performance != null);
  const avgPerf = withPerf.length > 0 ? withPerf.reduce((a, s) => a + s.performance!, 0) / withPerf.length : null;
  const withFatigue = sessions.filter((s) => s.fatigue != null);
  const avgFatigue = withFatigue.length > 0 ? withFatigue.reduce((a, s) => a + s.fatigue!, 0) / withFatigue.length : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Fútbol</h1>
          <p className="text-sm text-muted">Entrenamientos</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/football/matches">Partidos</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/football/new">Registrar</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="grid grid-cols-2 gap-4 pt-4">
          <StatTile label="Rendimiento promedio" value={avgPerf != null ? `${avgPerf.toFixed(1)}/5` : "Sin datos"} />
          <StatTile label="Fatiga promedio" value={avgFatigue != null ? `${avgFatigue.toFixed(1)}/5` : "Sin datos"} trendGood={false} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {sessions.length === 0 ? (
            <InsufficientData reason="Todavía no registraste entrenamientos de fútbol." />
          ) : (
            sessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between border-b border-border py-2 text-sm last:border-0">
                <span className="text-muted">{formatDateEs(s.date)}</span>
                <span>{s.performance != null ? `Rendimiento ${s.performance}/5` : "Sin datos"}</span>
                <span className="text-muted-2">{s.rpe != null ? `RPE ${s.rpe}` : ""}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
