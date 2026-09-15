import { prisma } from "@/lib/prisma";
import { formatDateEs, todayStart } from "@/lib/dates";
import { PHASE_INFO, defaultPhaseForWeek, weekNumberSince, type PhaseName } from "@/lib/calculations/phase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { setActivePhaseAction } from "@/lib/actions/phase-actions";

export default async function PhasesPage() {
  const profile = await prisma.profile.findFirst();
  const today = todayStart();
  const weekNumber = weekNumberSince(profile?.programStartDate ?? today, today);
  const suggested = defaultPhaseForWeek(weekNumber);

  const activePhase = await prisma.phase.findFirst({ where: { isActive: true } });
  const history = await prisma.phase.findMany({ orderBy: { startDate: "desc" }, take: 10 });
  const currentPhase = (activePhase?.name as PhaseName) ?? suggested;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Fases del programa</h1>
        <p className="text-sm text-muted">Semana {weekNumber} desde el inicio del programa.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{PHASE_INFO[currentPhase].label}</CardTitle>
          <CardDescription>{PHASE_INFO[currentPhase].weeks}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <p className="text-sm text-muted">{PHASE_INFO[currentPhase].goal}</p>
          {!activePhase && suggested !== "ADAPTATION" ? (
            <Badge variant="outline">Sugerida automáticamente por semana — no fijada manualmente</Badge>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cambiar de fase manualmente</CardTitle>
          <CardDescription>Usalo si el calendario de partidos/exámenes te obliga a pasar a mantenimiento antes de tiempo.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={setActivePhaseAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex flex-1 flex-col gap-1.5">
              <Select name="name" defaultValue={currentPhase}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(PHASE_INFO) as PhaseName[]).map((p) => (
                    <SelectItem key={p} value={p}>
                      {PHASE_INFO[p].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit">Fijar fase</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {history.map((p) => (
            <div key={p.id} className="flex items-center justify-between border-b border-border py-2 text-sm last:border-0">
              <span>{PHASE_INFO[p.name as PhaseName].label}</span>
              <span className="text-muted-2">
                {formatDateEs(p.startDate)} {p.endDate ? `— ${formatDateEs(p.endDate)}` : "— actual"}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
