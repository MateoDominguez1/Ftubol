import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createExerciseAction } from "@/lib/actions/gym-actions";
import { ExerciseLibraryList, CATEGORY_LABEL } from "./exercise-library-list";

const MUSCLE_GROUPS = [
  "QUADS", "HAMSTRINGS", "GLUTES", "ADDUCTORS", "CALVES", "CORE",
  "CHEST", "BACK", "SHOULDERS", "BICEPS", "TRICEPS", "POWER_PLYO",
];

export default async function ExerciseLibraryPage() {
  const exercises = await prisma.exercise.findMany({
    include: { muscleGroups: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Ejercicios</h1>
        <p className="text-sm text-muted">La app funciona con cualquier ejercicio — agregá los que necesites.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agregar ejercicio</CardTitle>
          <CardDescription>Elegí los grupos musculares que trabaja (podés elegir varios).</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createExerciseAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" name="name" required placeholder="Ej: Zancadas con mancuernas" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Categoría</Label>
              <Select name="category" defaultValue="STRENGTH">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABEL).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="muscleGroups">Grupos musculares (separados por coma)</Label>
              <Input id="muscleGroups" name="muscleGroups" placeholder="QUADS, GLUTES" />
              <p className="text-[11px] text-muted-2">Opciones: {MUSCLE_GROUPS.join(", ")}</p>
            </div>
            <Button type="submit">Agregar</Button>
          </form>
        </CardContent>
      </Card>

      <ExerciseLibraryList exercises={exercises} />
    </div>
  );
}
