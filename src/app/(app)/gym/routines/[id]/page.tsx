import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { deleteRoutineAction } from "@/lib/actions/routine-actions";
import { Trash2 } from "lucide-react";

export default async function RoutineDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const routine = await prisma.routine.findUnique({
    where: { id },
    include: { exercises: { orderBy: { order: "asc" }, include: { exercise: true } } },
  });
  if (!routine) notFound();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">{routine.name}</h1>
          {routine.notes ? <p className="text-sm text-muted">{routine.notes}</p> : null}
        </div>
        <form action={deleteRoutineAction}>
          <input type="hidden" name="id" value={routine.id} />
          <button type="submit" className="text-muted-2 hover:text-danger">
            <Trash2 className="h-4 w-4" />
          </button>
        </form>
      </div>

      <Button asChild size="lg">
        <Link href={`/gym/new?routine=${routine.id}`}>Empezar sesión desde esta rutina</Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Qué hacer</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {routine.exercises.map((re, i) => (
            <div key={re.id} className="flex items-center justify-between border-b border-border py-2 text-sm last:border-0">
              <span className="flex items-center gap-2">
                <span className="text-muted-2">{i + 1}.</span> {re.exercise.name}
              </span>
              <span className="text-muted-2">
                {re.targetSets ? `${re.targetSets} series` : ""}
                {re.targetReps ? ` × ${re.targetReps}` : ""}
                {re.targetRIR != null ? ` · RIR ${re.targetRIR}` : ""}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
