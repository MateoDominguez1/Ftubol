import { prisma } from "@/lib/prisma";
import { todayStart, toDateInputValue } from "@/lib/dates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScalePicker } from "@/components/ui/scale-picker";
import { submitSleepAction } from "@/lib/actions/quick-log-actions";

const QUALITY_OPTIONS = [1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: String(n) }));

export default async function NewSleepEntryPage() {
  const today = todayStart();
  const existing = await prisma.sleepEntry.findUnique({ where: { date: today } });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Sueño</h1>
        <p className="text-sm text-muted">Registro de la noche de hoy.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Anoche</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={submitSleepAction} className="flex flex-col gap-5">
            <input type="hidden" name="date" value={toDateInputValue(today)} />

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="bedTime">Hora de acostarse</Label>
                <Input id="bedTime" name="bedTime" type="time" defaultValue={existing?.bedTime ?? ""} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="wakeTime">Hora de levantarse</Label>
                <Input id="wakeTime" name="wakeTime" type="time" defaultValue={existing?.wakeTime ?? ""} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="hoursSlept">Horas dormidas</Label>
                <Input
                  id="hoursSlept"
                  name="hoursSlept"
                  type="number"
                  step="0.1"
                  min="0"
                  max="16"
                  placeholder="7.5"
                  defaultValue={existing?.hoursSlept ?? ""}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="wakeups">Despertares</Label>
                <Input id="wakeups" name="wakeups" type="number" min="0" defaultValue={existing?.wakeups ?? ""} />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Calidad (1-5)</Label>
              <ScalePicker name="quality" options={QUALITY_OPTIONS} defaultValue={existing?.quality != null ? String(existing.quality) : undefined} />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Sensación al despertar (1-5)</Label>
              <ScalePicker name="wakeFeeling" options={QUALITY_OPTIONS} defaultValue={existing?.wakeFeeling != null ? String(existing.wakeFeeling) : undefined} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea id="notes" name="notes" defaultValue={existing?.notes ?? ""} />
            </div>

            <Button type="submit" size="lg">
              Guardar sueño
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
