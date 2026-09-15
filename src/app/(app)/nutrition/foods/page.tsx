import { prisma } from "@/lib/prisma";
import { isFatSecretConfigured } from "@/lib/fatsecret";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InsufficientData } from "@/components/dashboard/insufficient-data";
import { createCustomFoodAction } from "@/lib/actions/food-actions";

export default async function FoodLibraryPage() {
  const foods = await prisma.food.findMany({ orderBy: { name: "asc" } });
  const configured = isFatSecretConfigured();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Alimentos</h1>
        <p className="text-sm text-muted">
          Biblioteca local{configured ? " + búsqueda externa (FatSecret) cuando no está en la biblioteca" : ""}.
        </p>
      </div>

      {!configured ? (
        <InsufficientData reason="La búsqueda externa de alimentos (FatSecret) no está configurada — se usa solo la biblioteca local." />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Agregar alimento personalizado</CardTitle>
          <CardDescription>Cargá los macros por cada 100g.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createCustomFoodAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" name="name" required placeholder="Ej: Milanesa de soja" />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="caloriesPer100g">Kcal/100g</Label>
                <Input id="caloriesPer100g" name="caloriesPer100g" type="number" step="0.1" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="proteinPer100g">Prot./100g</Label>
                <Input id="proteinPer100g" name="proteinPer100g" type="number" step="0.1" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="carbsPer100g">Carb./100g</Label>
                <Input id="carbsPer100g" name="carbsPer100g" type="number" step="0.1" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="fatPer100g">Grasa/100g</Label>
                <Input id="fatPer100g" name="fatPer100g" type="number" step="0.1" required />
              </div>
            </div>
            <Button type="submit">Agregar</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Biblioteca ({foods.length})</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {foods.map((f) => (
            <div key={f.id} className="flex items-center justify-between border-b border-border py-2 text-sm last:border-0">
              <span className="flex items-center gap-2">
                {f.name}
                {f.isCustom ? <Badge variant="secondary">custom</Badge> : null}
                {f.source === "fatsecret" ? <Badge variant="outline">FatSecret</Badge> : null}
              </span>
              <span className="text-muted-2">
                {Math.round(f.caloriesPer100g)} kcal · {f.proteinPer100g}g P · {f.carbsPer100g}g C · {f.fatPer100g}g G (/100g)
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
