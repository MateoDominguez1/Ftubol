import { prisma } from "@/lib/prisma";
import { todayStart, toDateInputValue } from "@/lib/dates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { submitHydrationAction } from "@/lib/actions/quick-log-actions";

export default async function NewHydrationEntryPage() {
  const today = todayStart();
  const existing = await prisma.hydrationEntry.findUnique({ where: { date: today } });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Hidratación</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Hoy</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={submitHydrationAction} className="flex flex-col gap-4">
            <input type="hidden" name="date" value={toDateInputValue(today)} />
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="waterMl">Agua total del día (ml)</Label>
              <Input id="waterMl" name="waterMl" type="number" defaultValue={existing?.waterMl ?? ""} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="preMatchMl">Antes del fútbol (ml)</Label>
                <Input id="preMatchMl" name="preMatchMl" type="number" defaultValue={existing?.preMatchMl ?? ""} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="duringMl">Durante (ml)</Label>
                <Input id="duringMl" name="duringMl" type="number" defaultValue={existing?.duringMl ?? ""} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="postMl">Después (ml)</Label>
                <Input id="postMl" name="postMl" type="number" defaultValue={existing?.postMl ?? ""} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="electrolytes" defaultChecked={existing?.electrolytes ?? false} className="h-4 w-4 rounded border-border" />
              Tomé electrolitos/sodio
            </label>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea id="notes" name="notes" defaultValue={existing?.notes ?? ""} />
            </div>
            <Button type="submit" size="lg">
              Guardar hidratación
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
