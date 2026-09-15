import { prisma } from "@/lib/prisma";
import { addDays, formatDateShortEs, todayStart } from "@/lib/dates";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { InsufficientData } from "@/components/dashboard/insufficient-data";
import { PainCheckForm } from "./pain-check-form";

const ZONE_LABEL: Record<string, string> = {
  HAMSTRING: "Isquiotibial",
  ADDUCTOR: "Aductor",
  PUBIS: "Pubis",
  ANKLE: "Tobillo",
  KNEE: "Rodilla",
  SOLEUS: "Sóleo",
  ACHILLES: "Aquiles",
  SHOULDER: "Hombro",
  BACK: "Espalda",
  OTHER: "Otra",
};

export default async function PainCheckPage() {
  const today = todayStart();
  const recent = await prisma.painEntry.findMany({
    where: { date: { gte: addDays(today, -13) } },
    orderBy: { date: "desc" },
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">¿Alguna molestia?</h1>
        <p className="text-sm text-muted">
          Esta app no diagnostica lesiones. Si el dolor persiste varios días, considerá consultar a un profesional.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registrar molestia</CardTitle>
          <CardDescription>Elegí la zona y el nivel de dolor de 0 a 10.</CardDescription>
        </CardHeader>
        <CardContent>
          <PainCheckForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Últimos 14 días</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {recent.length === 0 ? (
            <InsufficientData reason="Sin molestias registradas en los últimos 14 días." />
          ) : (
            recent.map((p) => (
              <div key={p.id} className="flex items-center justify-between border-b border-border py-2 text-sm last:border-0">
                <span className="text-muted">{formatDateShortEs(p.date)}</span>
                <span>{ZONE_LABEL[p.zone] ?? p.zone}</span>
                <span className={p.painLevel >= 4 ? "font-medium text-danger" : "text-muted-2"}>{p.painLevel}/10</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
