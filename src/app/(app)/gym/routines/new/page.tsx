import { prisma } from "@/lib/prisma";
import { RoutineBuilder } from "./routine-builder";

export default async function NewRoutinePage() {
  const exercises = await prisma.exercise.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Nueva rutina</h1>
        <p className="text-sm text-muted">Definí qué hacer — después vas a poder empezar una sesión desde esta rutina.</p>
      </div>
      <RoutineBuilder exercises={exercises} />
    </div>
  );
}
