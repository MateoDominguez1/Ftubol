import { prisma } from "@/lib/prisma";
import { todayStart, toDateInputValue } from "@/lib/dates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { submitNutritionAction } from "@/lib/actions/quick-log-actions";

export default async function NewNutritionEntryPage() {
  const today = todayStart();
  const existing = await prisma.nutritionEntry.findUnique({ where: { date: today } });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Nutrición</h1>
        <p className="text-sm text-muted">No hace falta registrar cada comida — con el total del día alcanza.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Hoy</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={submitNutritionAction} className="flex flex-col gap-4">
            <input type="hidden" name="date" value={toDateInputValue(today)} />
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="calories">Calorías (kcal)</Label>
                <Input id="calories" name="calories" type="number" defaultValue={existing?.calories ?? ""} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="proteinG">Proteína (g)</Label>
                <Input id="proteinG" name="proteinG" type="number" defaultValue={existing?.proteinG ?? ""} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="carbsG">Carbohidratos (g)</Label>
                <Input id="carbsG" name="carbsG" type="number" defaultValue={existing?.carbsG ?? ""} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="fatG">Grasas (g)</Label>
                <Input id="fatG" name="fatG" type="number" defaultValue={existing?.fatG ?? ""} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea id="notes" name="notes" defaultValue={existing?.notes ?? ""} />
            </div>
            <Button type="submit" size="lg">
              Guardar nutrición
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
