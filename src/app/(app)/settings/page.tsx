import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateProfileAction } from "@/lib/actions/profile-actions";
import { InsufficientData } from "@/components/dashboard/insufficient-data";

export default async function SettingsPage() {
  const profile = await prisma.profile.findFirst();

  if (!profile) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-semibold">Ajustes</h1>
        <InsufficientData reason="No hay perfil configurado. Corré el seed inicial (prisma db seed)." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Perfil y objetivos</h1>
        <p className="text-sm text-muted">Estos datos alimentan los cálculos de nutrición, composición corporal y fases.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos personales</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateProfileAction} className="flex flex-col gap-5">
            <input type="hidden" name="id" value={profile.id} />

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" name="name" defaultValue={profile.name} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="position">Posición</Label>
                <Input id="position" name="position" defaultValue={profile.position} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="age">Edad</Label>
                <Input id="age" name="age" type="number" defaultValue={profile.age} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="heightCm">Altura (cm)</Label>
                <Input id="heightCm" name="heightCm" type="number" step="0.1" defaultValue={profile.heightCm} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="footballSessionsPerWeek">Estímulos de fútbol/semana</Label>
                <Input id="footballSessionsPerWeek" name="footballSessionsPerWeek" type="number" defaultValue={profile.footballSessionsPerWeek} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="gymScheduleNote">Notas de calendario de gimnasio</Label>
              <Textarea id="gymScheduleNote" name="gymScheduleNote" defaultValue={profile.gymScheduleNote ?? ""} />
            </div>

            <CardDescription>Composición corporal</CardDescription>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="targetWeightMinKg">Peso objetivo mín. (kg)</Label>
                <Input id="targetWeightMinKg" name="targetWeightMinKg" type="number" step="0.1" defaultValue={profile.targetWeightMinKg ?? ""} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="targetWeightMaxKg">Peso objetivo máx. (kg)</Label>
                <Input id="targetWeightMaxKg" name="targetWeightMaxKg" type="number" step="0.1" defaultValue={profile.targetWeightMaxKg ?? ""} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="targetWaistReductionCm">Reducción de cintura (cm)</Label>
                <Input id="targetWaistReductionCm" name="targetWaistReductionCm" type="number" step="0.1" defaultValue={profile.targetWaistReductionCm ?? ""} />
              </div>
            </div>

            <CardDescription>Nutrición</CardDescription>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="calorieTargetMin">Calorías mín.</Label>
                <Input id="calorieTargetMin" name="calorieTargetMin" type="number" defaultValue={profile.calorieTargetMin ?? ""} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="calorieTargetMax">Calorías máx.</Label>
                <Input id="calorieTargetMax" name="calorieTargetMax" type="number" defaultValue={profile.calorieTargetMax ?? ""} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="proteinTargetMinG">Proteína mín. (g)</Label>
                <Input id="proteinTargetMinG" name="proteinTargetMinG" type="number" defaultValue={profile.proteinTargetMinG ?? ""} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="proteinTargetMaxG">Proteína máx. (g)</Label>
                <Input id="proteinTargetMaxG" name="proteinTargetMaxG" type="number" defaultValue={profile.proteinTargetMaxG ?? ""} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="fatTargetPerKg">Grasas (g/kg)</Label>
                <Input id="fatTargetPerKg" name="fatTargetPerKg" type="number" step="0.05" defaultValue={profile.fatTargetPerKg ?? ""} />
              </div>
            </div>

            <Button type="submit" size="lg">
              Guardar cambios
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
