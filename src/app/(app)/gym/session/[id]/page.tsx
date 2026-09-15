import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDateEs } from "@/lib/dates";
import { estimate1RM } from "@/lib/calculations/strength";
import { setVolume } from "@/lib/calculations/volume";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressionPrompt } from "./progression-prompt";

const TYPE_LABEL: Record<string, string> = {
  STRENGTH: "Fuerza", POWER: "Potencia", UPPER_BODY: "Tren superior", FULL_BODY: "Cuerpo completo",
  REDUCED: "Reducida", DELOAD: "Descarga", OTHER: "Otra",
};

const DECISION_LABEL: Record<string, string> = {
  INCREASE_WEIGHT: "Subir peso", MAINTAIN: "Mantener", DECREASE_WEIGHT: "Bajar peso",
  INCREASE_REPS: "Subir repeticiones", MAINTAIN_REPS: "Mantener repeticiones",
};

export default async function GymSessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workout = await prisma.workout.findUnique({
    where: { id },
    include: {
      exercises: {
        orderBy: { order: "asc" },
        include: { exercise: true, sets: { orderBy: { setNumber: "asc" } } },
      },
    },
  });

  if (!workout) notFound();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">{workout.label || TYPE_LABEL[workout.type]}</h1>
        <p className="text-sm text-muted">
          {formatDateEs(workout.date)} · {TYPE_LABEL[workout.type]}
          {workout.durationMin ? ` · ${workout.durationMin} min` : ""}
          {workout.sessionRPE ? ` · RPE ${workout.sessionRPE}` : ""}
        </p>
      </div>

      {workout.exercises.map((we) => {
        const cardio = we.exercise.category === "CARDIO";
        const totalVolume = we.sets.reduce((acc, s) => acc + setVolume(s.weightKg, s.reps), 0);
        const best = we.sets.reduce<{ est: number; weight: number; reps: number } | null>((acc, s) => {
          if (s.weightKg == null || s.reps == null) return acc;
          const est = estimate1RM(s.weightKg, s.reps);
          if (!acc || est > acc.est) return { est, weight: s.weightKg, reps: s.reps };
          return acc;
        }, null);
        const totalCardioMin = we.sets.reduce((acc, s) => acc + (s.durationMin ?? 0), 0);
        const totalCardioKm = we.sets.reduce((acc, s) => acc + (s.distanceKm ?? 0), 0);

        return (
          <Card key={we.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-foreground">{we.exercise.name}</CardTitle>
                {we.painFlag ? <Badge variant="danger">molestia</Badge> : null}
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                {we.sets.map((s) =>
                  cardio ? (
                    <div key={s.id} className="flex items-center gap-3 text-sm text-muted">
                      <span className="w-6 text-muted-2">#{s.setNumber}</span>
                      <span className="font-medium text-foreground">{s.durationMin ?? "-"} min</span>
                      {s.distanceKm != null ? <span>{s.distanceKm} km</span> : null}
                      {s.rir != null ? <span>RPE {s.rir}</span> : null}
                      {s.painFlag ? <Badge variant="danger">dolor</Badge> : null}
                    </div>
                  ) : (
                    <div key={s.id} className="flex items-center gap-3 text-sm text-muted">
                      <span className="w-6 text-muted-2">#{s.setNumber}</span>
                      <span className="font-medium text-foreground">
                        {s.weightKg ?? "-"}kg × {s.reps ?? "-"}
                      </span>
                      {s.rir != null ? <span>RIR {s.rir}</span> : null}
                      {s.difficulty != null ? <span>Dif. {s.difficulty}/5</span> : null}
                      {s.painFlag ? <Badge variant="danger">dolor</Badge> : null}
                    </div>
                  ),
                )}
              </div>
              {cardio ? (
                <div className="flex gap-4 text-xs text-muted-2">
                  <span>Total: {totalCardioMin} min</span>
                  {totalCardioKm > 0 ? <span>{totalCardioKm.toFixed(1)} km</span> : null}
                </div>
              ) : (
                <div className="flex gap-4 text-xs text-muted-2">
                  <span>Volumen: {Math.round(totalVolume)} kg</span>
                  {best ? <span>Mejor 1RM est.: {Math.round(best.est)} kg</span> : null}
                </div>
              )}
              {we.notes ? <p className="text-sm text-muted">{we.notes}</p> : null}

              {we.progressionDecision ? (
                <Badge variant="success">Próxima vez: {DECISION_LABEL[we.progressionDecision]}</Badge>
              ) : (
                <ProgressionPrompt workoutId={workout.id} workoutExerciseId={we.id} />
              )}
            </CardContent>
          </Card>
        );
      })}

      {workout.notes ? (
        <Card>
          <CardHeader>
            <CardTitle>Notas de la sesión</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted">{workout.notes}</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
