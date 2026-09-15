import { toDateInputValue, todayStart } from "@/lib/dates";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { NumberField } from "@/components/ui/number-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createMatchAction } from "@/lib/actions/football-actions";

export default async function NewMatchPage() {
  const today = toDateInputValue(todayStart());

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Registrar partido</h1>
        <p className="text-sm text-muted">Todos los campos son opcionales — completá lo que tengas.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Datos del partido</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createMatchAction} className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="date">Fecha</Label>
                <Input id="date" name="date" type="date" defaultValue={today} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="opponent">Rival</Label>
                <Input id="opponent" name="opponent" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="competition">Competencia</Label>
                <Input id="competition" name="competition" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Local / Visitante</Label>
                <Select name="isHome">
                  <SelectTrigger>
                    <SelectValue placeholder="Sin especificar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Local</SelectItem>
                    <SelectItem value="away">Visitante</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>¿Titular?</Label>
              <Select name="starter">
                <SelectTrigger className="sm:w-48">
                  <SelectValue placeholder="Sin especificar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Titular</SelectItem>
                  <SelectItem value="no">Suplente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <NumberField name="minutesPlayed" label="Minutos jugados" min={0} />
              <NumberField name="rpe" label="RPE (1-10)" min={1} max={10} />
              <NumberField name="personalRating" label="Valoración (1-10)" min={1} max={10} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <NumberField name="performance" label="Rendimiento (1-5)" min={1} max={5} />
              <NumberField name="fatigue" label="Fatiga (1-5)" min={1} max={5} />
              <NumberField name="legFeel" label="Piernas (1-5)" min={1} max={5} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumberField name="goals" label="Goles" min={0} />
              <NumberField name="assists" label="Asistencias" min={0} />
            </div>

            <div>
              <CardDescription className="mb-2">Métricas de central (opcional)</CardDescription>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <NumberField name="duelsWon" label="Duelos ganados" min={0} />
                <NumberField name="duelsLost" label="Duelos perdidos" min={0} />
                <NumberField name="aerialDuelsWon" label="Aéreos ganados" min={0} />
                <NumberField name="aerialDuelsLost" label="Aéreos perdidos" min={0} />
                <NumberField name="clearances" label="Despejes" min={0} />
                <NumberField name="interceptions" label="Intercepciones" min={0} />
                <NumberField name="passes" label="Pases" min={0} />
                <NumberField name="passesCompleted" label="Pases completados" min={0} />
                <NumberField name="longPasses" label="Pases largos" min={0} />
                <NumberField name="longPassesOk" label="Pases largos OK" min={0} />
                <NumberField name="accelerations" label="Aceleraciones" min={0} />
                <NumberField name="directionChanges" label="Cambios de dirección" min={0} />
                <NumberField name="sprintRecovery" label="Recup. tras sprint (1-5)" min={1} max={5} />
                <NumberField name="concentration" label="Concentración (1-5)" min={1} max={5} />
                <NumberField name="positioning" label="Posicionamiento (1-5)" min={1} max={5} />
                <NumberField name="buildupPlay" label="Salida de balón (1-5)" min={1} max={5} />
                <NumberField name="defensiveErrors" label="Errores defensivos" min={0} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea id="notes" name="notes" />
            </div>

            <Button type="submit" size="lg">
              Guardar partido
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
