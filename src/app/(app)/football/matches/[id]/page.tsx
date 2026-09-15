import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDateEs } from "@/lib/dates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function Stat({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value == null) return null;
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="text-base font-semibold">{value}</p>
    </div>
  );
}

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const match = await prisma.match.findUnique({ where: { id } });
  if (!match) notFound();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">{match.opponent || "Partido"}</h1>
        <p className="text-sm text-muted">
          {formatDateEs(match.date)} {match.competition ? `· ${match.competition}` : ""}
        </p>
        <div className="mt-1 flex gap-1.5">
          {match.isHome != null ? <Badge variant="outline">{match.isHome ? "Local" : "Visitante"}</Badge> : null}
          {match.starter != null ? <Badge variant="outline">{match.starter ? "Titular" : "Suplente"}</Badge> : null}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Minutos" value={match.minutesPlayed} />
          <Stat label="RPE" value={match.rpe} />
          <Stat label="Valoración" value={match.personalRating != null ? `${match.personalRating}/10` : null} />
          <Stat label="Rendimiento" value={match.performance != null ? `${match.performance}/5` : null} />
          <Stat label="Fatiga" value={match.fatigue != null ? `${match.fatigue}/5` : null} />
          <Stat label="Piernas" value={match.legFeel != null ? `${match.legFeel}/5` : null} />
          <Stat label="Goles" value={match.goals} />
          <Stat label="Asistencias" value={match.assists} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Métricas de central</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Duelos ganados" value={match.duelsWon} />
          <Stat label="Duelos perdidos" value={match.duelsLost} />
          <Stat label="Aéreos ganados" value={match.aerialDuelsWon} />
          <Stat label="Aéreos perdidos" value={match.aerialDuelsLost} />
          <Stat label="Despejes" value={match.clearances} />
          <Stat label="Intercepciones" value={match.interceptions} />
          <Stat label="Pases" value={match.passes} />
          <Stat label="Pases completados" value={match.passesCompleted} />
          <Stat label="Pases largos" value={match.longPasses} />
          <Stat label="Pases largos OK" value={match.longPassesOk} />
          <Stat label="Aceleraciones" value={match.accelerations} />
          <Stat label="Cambios de dirección" value={match.directionChanges} />
          <Stat label="Recup. tras sprint" value={match.sprintRecovery != null ? `${match.sprintRecovery}/5` : null} />
          <Stat label="Concentración" value={match.concentration != null ? `${match.concentration}/5` : null} />
          <Stat label="Posicionamiento" value={match.positioning != null ? `${match.positioning}/5` : null} />
          <Stat label="Salida de balón" value={match.buildupPlay != null ? `${match.buildupPlay}/5` : null} />
          <Stat label="Errores defensivos" value={match.defensiveErrors} />
        </CardContent>
      </Card>

      {match.notes ? (
        <Card>
          <CardHeader>
            <CardTitle>Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted">{match.notes}</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
