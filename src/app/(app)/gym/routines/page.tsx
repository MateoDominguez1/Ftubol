import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InsufficientData } from "@/components/dashboard/insufficient-data";
import { Badge } from "@/components/ui/badge";

export default async function RoutinesPage() {
  const routines = await prisma.routine.findMany({
    orderBy: { createdAt: "desc" },
    include: { exercises: true },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Rutinas</h1>
          <p className="text-sm text-muted">Plantillas de qué hacer — separadas del registro de lo que hiciste.</p>
        </div>
        <Button asChild size="sm">
          <Link href="/gym/routines/new">Nueva rutina</Link>
        </Button>
      </div>

      {routines.length === 0 ? (
        <InsufficientData reason="Todavía no armaste ninguna rutina." />
      ) : (
        <div className="flex flex-col gap-2">
          {routines.map((r) => (
            <Link key={r.id} href={`/gym/routines/${r.id}`}>
              <Card className="transition-colors hover:border-brand/40">
                <CardContent className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{r.name}</p>
                    <p className="text-xs text-muted-2">{r.exercises.length} ejercicios</p>
                  </div>
                  {!r.isActive ? <Badge variant="secondary">archivada</Badge> : null}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
