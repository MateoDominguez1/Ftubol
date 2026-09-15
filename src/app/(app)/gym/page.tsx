import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDateEs } from "@/lib/dates";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InsufficientData } from "@/components/dashboard/insufficient-data";

const TYPE_LABEL: Record<string, string> = {
  STRENGTH: "Fuerza", POWER: "Potencia", UPPER_BODY: "Tren superior", FULL_BODY: "Cuerpo completo",
  REDUCED: "Reducida", DELOAD: "Descarga", OTHER: "Otra",
};

export default async function GymPage() {
  const workouts = await prisma.workout.findMany({
    orderBy: { date: "desc" },
    take: 30,
    include: { exercises: { include: { exercise: true } } },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Gimnasio</h1>
          <p className="text-sm text-muted">Historial de sesiones</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/gym/exercises">Ejercicios</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/gym/new">Nueva sesión</Link>
          </Button>
        </div>
      </div>

      {workouts.length === 0 ? (
        <InsufficientData reason="Todavía no registraste ninguna sesión de gimnasio." />
      ) : (
        <div className="flex flex-col gap-2">
          {workouts.map((w) => (
            <Link key={w.id} href={`/gym/session/${w.id}`}>
              <Card className="transition-colors hover:border-brand/40">
                <CardContent className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{w.label || TYPE_LABEL[w.type]}</p>
                    <p className="text-xs text-muted-2">
                      {formatDateEs(w.date)} · {w.exercises.length} ejercicio{w.exercises.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <span className="text-xs text-muted">{TYPE_LABEL[w.type]}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
