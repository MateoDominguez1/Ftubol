import { prisma } from "@/lib/prisma";
import { todayStart, toDateInputValue } from "@/lib/dates";
import { CheckinForm } from "./checkin-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function CheckinPage() {
  const today = todayStart();
  const existing = await prisma.dailyCheckin.findUnique({ where: { date: today } });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Check-in diario</h1>
        <p className="text-sm text-muted">Semáforo de fatiga — sueño, piernas y ganas de entrenar.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Hoy</CardTitle>
          <CardDescription>Cada valor va de 1 a 3. La suma decide la zona de la sesión de hoy.</CardDescription>
        </CardHeader>
        <CardContent>
          <CheckinForm
            date={toDateInputValue(today)}
            initial={
              existing
                ? {
                    sleepScore: existing.sleepScore,
                    legsScore: existing.legsScore,
                    motivationScore: existing.motivationScore,
                    notes: existing.notes,
                  }
                : undefined
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
