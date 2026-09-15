import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { todayStart, toDateInputValue } from "@/lib/dates";
import { computeFoodMacros, sumFoodMacros } from "@/lib/calculations/nutrition";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FoodLogForm } from "./food-log-form";
import { submitNutritionAction } from "@/lib/actions/quick-log-actions";
import { deleteFoodLogEntryAction } from "@/lib/actions/food-actions";
import { Trash2 } from "lucide-react";

export default async function NewNutritionEntryPage() {
  const today = todayStart();
  const dateStr = toDateInputValue(today);
  const [existing, foodLogs] = await Promise.all([
    prisma.nutritionEntry.findUnique({ where: { date: today } }),
    prisma.foodLogEntry.findMany({ where: { date: today }, include: { food: true }, orderBy: { createdAt: "asc" } }),
  ]);

  const computedEntries = foodLogs.map((entry) => ({
    id: entry.id,
    foodName: entry.food.name,
    quantityGrams: entry.quantityGrams,
    macros: computeFoodMacros(entry.food, entry.quantityGrams),
  }));
  const totals = sumFoodMacros(computedEntries.map((e) => e.macros));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Nutrición</h1>
          <p className="text-sm text-muted">Buscá el alimento y la cantidad — el resto se calcula solo.</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/nutrition/foods">Alimentos</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agregar alimento</CardTitle>
        </CardHeader>
        <CardContent>
          <FoodLogForm date={dateStr} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hoy</CardTitle>
          <CardDescription>
            {totals.calories} kcal · {totals.proteinG}g proteína · {totals.carbsG}g carbohidratos · {totals.fatG}g grasas
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {computedEntries.length === 0 ? (
            <p className="text-sm text-muted-2">Todavía no agregaste alimentos hoy.</p>
          ) : (
            computedEntries.map((e) => (
              <div key={e.id} className="flex items-center justify-between border-b border-border py-2 text-sm last:border-0">
                <span>
                  {e.foodName} <span className="text-muted-2">· {e.quantityGrams}g</span>
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-muted-2">{e.macros.calories} kcal</span>
                  <form action={deleteFoodLogEntryAction}>
                    <input type="hidden" name="id" value={e.id} />
                    <button type="submit" className="text-muted-2 hover:text-danger">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>O ingresá el total manualmente</CardTitle>
          <CardDescription>Útil si no sabés exactamente qué comiste pero tenés una estimación del total.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={submitNutritionAction} className="flex flex-col gap-4">
            <input type="hidden" name="date" value={dateStr} />
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
            <Button type="submit" variant="outline">
              Guardar total manual
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
