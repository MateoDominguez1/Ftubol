import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { addDays, formatDateShortEs, todayStart } from "@/lib/dates";
import { averageHours, countUnder, countInRange } from "@/lib/calculations/sleep";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatTile } from "@/components/dashboard/stat-tile";
import { InsufficientData } from "@/components/dashboard/insufficient-data";
import { Button } from "@/components/ui/button";

export default async function SleepPage() {
  const since30 = addDays(todayStart(), -30);
  const entries = await prisma.sleepEntry.findMany({
    where: { date: { gte: since30 } },
    orderBy: { date: "desc" },
  });

  const samples = entries.map((e) => ({ date: e.date, hoursSlept: e.hoursSlept }));
  const last7 = samples.filter((s) => s.date >= addDays(todayStart(), -6));

  const avg7 = averageHours(last7);
  const avg30 = averageHours(samples);
  const under6 = countUnder(samples, 6);
  const goodRange = countInRange(samples, 7.5, 8);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Sueño</h1>
          <p className="text-sm text-muted">Últimos 30 días</p>
        </div>
        <Button asChild size="sm">
          <Link href="/sleep/new">Registrar</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Promedios</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          {avg7.status === "ok" ? (
            <StatTile label="Promedio 7 días" value={`${avg7.data.toFixed(1)}h`} />
          ) : (
            <InsufficientData reason={avg7.reason} />
          )}
          {avg30.status === "ok" ? (
            <StatTile label="Promedio 30 días" value={`${avg30.data.toFixed(1)}h`} />
          ) : (
            <InsufficientData reason={avg30.reason} />
          )}
          <StatTile label="Noches < 6h (30d)" value={String(under6)} trend={under6 > 0 ? "up" : "flat"} trendGood={false} />
          <StatTile label="Noches 7.5-8h (30d)" value={String(goodRange)} trend={goodRange > 0 ? "up" : "flat"} trendGood={true} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial reciente</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {entries.length === 0 ? (
            <InsufficientData reason="Todavía no registraste noches de sueño." />
          ) : (
            entries.slice(0, 14).map((e) => (
              <div key={e.id} className="flex items-center justify-between border-b border-border py-2 text-sm last:border-0">
                <span className="text-muted">{formatDateShortEs(e.date)}</span>
                <span>{e.hoursSlept != null ? `${e.hoursSlept}h` : "Sin datos"}</span>
                <span className="text-muted-2">{e.quality != null ? `Calidad ${e.quality}/5` : ""}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
