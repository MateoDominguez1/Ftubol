import { toDateInputValue, todayStart } from "@/lib/dates";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { NumberField } from "@/components/ui/number-field";
import { createFootballSessionAction } from "@/lib/actions/football-actions";

export default async function NewFootballSessionPage() {
  const today = toDateInputValue(todayStart());

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Entrenamiento de fútbol</h1>
        <p className="text-sm text-muted">Todos los campos son opcionales — completá lo que tengas.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createFootballSessionAction} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="date">Fecha</Label>
              <Input id="date" name="date" type="date" defaultValue={today} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumberField name="durationMin" label="Duración (min)" min={0} />
              <NumberField name="rpe" label="RPE (1-10)" min={1} max={10} />
              <NumberField name="minutesPlayed" label="Minutos jugados" min={0} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <NumberField name="performance" label="Rendimiento (1-5)" min={1} max={5} />
              <NumberField name="fatigue" label="Fatiga (1-5)" min={1} max={5} />
              <NumberField name="legFeel" label="Piernas (1-5)" min={1} max={5} />
            </div>

            <div>
              <CardDescription className="mb-2">Métricas de central (opcional)</CardDescription>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <NumberField name="duels" label="Duelos" min={0} />
                <NumberField name="duelsWon" label="Duelos ganados" min={0} />
                <NumberField name="aerialDuels" label="Duelos aéreos" min={0} />
                <NumberField name="aerialDuelsWon" label="Aéreos ganados" min={0} />
                <NumberField name="accelerations" label="Aceleraciones" min={0} />
                <NumberField name="directionChanges" label="Cambios de dirección" min={0} />
                <NumberField name="sprintRecovery" label="Recup. tras sprint (1-5)" min={1} max={5} />
                <NumberField name="concentration" label="Concentración (1-5)" min={1} max={5} />
                <NumberField name="positioning" label="Posicionamiento (1-5)" min={1} max={5} />
                <NumberField name="buildupPlay" label="Salida de balón (1-5)" min={1} max={5} />
                <NumberField name="longPasses" label="Pases largos" min={0} />
                <NumberField name="longPassesOk" label="Pases largos OK" min={0} />
                <NumberField name="defensiveErrors" label="Errores defensivos" min={0} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea id="notes" name="notes" />
            </div>

            <Button type="submit" size="lg">
              Guardar entrenamiento
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
