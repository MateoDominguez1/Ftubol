import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDateEs, todayStart } from "@/lib/dates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InsufficientData } from "@/components/dashboard/insufficient-data";
import { Badge } from "@/components/ui/badge";

export default async function MatchesPage() {
  const today = todayStart();
  const [upcoming, past] = await Promise.all([
    prisma.match.findMany({ where: { date: { gte: today } }, orderBy: { date: "asc" } }),
    prisma.match.findMany({ where: { date: { lt: today } }, orderBy: { date: "desc" }, take: 20 }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Partidos</h1>
        </div>
        <Button asChild size="sm">
          <Link href="/football/matches/new">Registrar</Link>
        </Button>
      </div>

      {upcoming.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Próximo</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {upcoming.map((m) => (
              <div key={m.id} className="flex items-center justify-between text-sm">
                <span>{m.opponent || "Rival por definir"}</span>
                <span className="text-muted">{formatDateEs(m.date)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Historial</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {past.length === 0 ? (
            <InsufficientData reason="Todavía no registraste partidos." />
          ) : (
            past.map((m) => (
              <Link key={m.id} href={`/football/matches/${m.id}`} className="flex items-center justify-between border-b border-border py-2 text-sm last:border-0">
                <span>{m.opponent || "Rival sin especificar"}</span>
                <span className="text-muted">{formatDateEs(m.date)}</span>
                <div className="flex gap-1.5">
                  {m.goals ? <Badge variant="success">{m.goals} gol{m.goals === 1 ? "" : "es"}</Badge> : null}
                  {m.personalRating != null ? <Badge>{m.personalRating}/10</Badge> : null}
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
