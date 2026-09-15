import { toDateInputValue, todayStart } from "@/lib/dates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createCalendarEventAction } from "@/lib/actions/calendar-actions";

export default async function NewCalendarEventPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const defaultDate = date || toDateInputValue(todayStart());

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Nuevo evento</h1>
      <Card>
        <CardHeader>
          <CardTitle>Detalle</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createCalendarEventAction} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="date">Fecha</Label>
                <Input id="date" name="date" type="date" defaultValue={defaultDate} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="time">Hora</Label>
                <Input id="time" name="time" type="time" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Tipo</Label>
              <Select name="type" defaultValue="GYM">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GYM">Gimnasio</SelectItem>
                  <SelectItem value="FOOTBALL">Fútbol</SelectItem>
                  <SelectItem value="MATCH">Partido</SelectItem>
                  <SelectItem value="REST">Descanso</SelectItem>
                  <SelectItem value="WALK">Caminata</SelectItem>
                  <SelectItem value="OTHER">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="durationMin">Duración (min)</Label>
                <Input id="durationMin" name="durationMin" type="number" min={0} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="intensityRPE">Intensidad (RPE 1-10)</Label>
                <Input id="intensityRPE" name="intensityRPE" type="number" min={1} max={10} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea id="notes" name="notes" />
            </div>
            <Button type="submit" size="lg">
              Guardar evento
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
