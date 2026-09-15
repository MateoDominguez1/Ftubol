import { todayStart, toDateInputValue } from "@/lib/dates";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { submitBodyMeasurementAction } from "@/lib/actions/quick-log-actions";

export default async function NewBodyMeasurementPage() {
  const today = toDateInputValue(todayStart());

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Medidas</h1>
        <p className="text-sm text-muted">Podés cargar solo peso, solo cintura, o ambos.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Nueva medición</CardTitle>
          <CardDescription>El progreso se mide con el promedio semanal, no con un solo registro.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={submitBodyMeasurementAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="date">Fecha</Label>
              <Input id="date" name="date" type="date" defaultValue={today} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="weightKg">Peso (kg)</Label>
                <Input id="weightKg" name="weightKg" type="number" step="0.1" placeholder="88.4" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="waistCm">Cintura (cm)</Label>
                <Input id="waistCm" name="waistCm" type="number" step="0.1" placeholder="86" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bodyFatPct">% Grasa corporal (opcional)</Label>
              <Input id="bodyFatPct" name="bodyFatPct" type="number" step="0.1" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="conditions">Condiciones de medición (opcional)</Label>
              <Textarea id="conditions" name="conditions" placeholder="En ayunas, al despertar, sin ropa..." />
            </div>
            <Button type="submit" size="lg">
              Guardar medición
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
