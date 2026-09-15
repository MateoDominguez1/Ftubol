import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { addDays, formatDateShortEs, todayStart } from "@/lib/dates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatTile } from "@/components/dashboard/stat-tile";
import { InsufficientData } from "@/components/dashboard/insufficient-data";
import { Button } from "@/components/ui/button";

export default async function HydrationPage() {
  const today = todayStart();
  const entries = await prisma.hydrationEntry.findMany({
    where: { date: { gte: addDays(today, -13) } },
    orderBy: { date: "desc" },
  });

  const withWater = entries.filter((e) => e.waterMl != null);
  const avgWeekly = withWater.length > 0 ? Math.round(withWater.reduce((a, e) => a + e.waterMl!, 0) / withWater.length) : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Hidratación</h1>
          <p className="text-sm text-muted">Últimos 14 días</p>
        </div>
        <Button asChild size="sm">
          <Link href="/hydration/new">Registrar</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-4">
          {avgWeekly != null ? (
            <StatTile label="Promedio diario" value={`${(avgWeekly / 1000).toFixed(1)} L`} />
          ) : (
            <InsufficientData reason="Todavía no registraste hidratación." />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {entries.length === 0 ? (
            <InsufficientData reason="Sin registros todavía." />
          ) : (
            entries.map((e) => (
              <div key={e.id} className="flex items-center justify-between border-b border-border py-2 text-sm last:border-0">
                <span className="text-muted">{formatDateShortEs(e.date)}</span>
                <span>{e.waterMl != null ? `${(e.waterMl / 1000).toFixed(1)} L` : "Sin datos"}</span>
                <span className="text-muted-2">{e.electrolytes ? "Electrolitos ✓" : ""}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
