import { prisma } from "@/lib/prisma";
import { isSupabaseConfigured } from "@/lib/supabase";
import { formatDateEs, toDateInputValue, todayStart } from "@/lib/dates";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InsufficientData } from "@/components/dashboard/insufficient-data";
import { uploadProgressPhotoAction } from "@/lib/actions/photo-actions";

const ANGLE_LABEL: Record<string, string> = { FRONT: "Frontal", SIDE: "Lateral", BACK: "Espalda" };

export default async function ProgressPhotosPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { error } = await searchParams;
  const configured = isSupabaseConfigured();
  const photos = await prisma.progressPhoto.findMany({ orderBy: { date: "desc" } });

  const byAngle: Record<string, typeof photos> = { FRONT: [], SIDE: [], BACK: [] };
  for (const p of photos) byAngle[p.angle]?.push(p);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Fotos de progreso</h1>
        <p className="text-sm text-muted">Comparalas solo cuando iluminación, posición, distancia y hora sean similares.</p>
      </div>

      {!configured ? (
        <Card>
          <CardContent className="pt-4">
            <InsufficientData reason="Para subir fotos hace falta configurar SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en las variables de entorno." />
          </CardContent>
        </Card>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          No se pudo subir la foto ({decodeURIComponent(error)}).
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Subir foto</CardTitle>
          <CardDescription>Frontal, lateral o espalda.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={uploadProgressPhotoAction} className="flex flex-col gap-4" encType="multipart/form-data">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="photo">Foto</Label>
              <Input id="photo" name="photo" type="file" accept="image/*" required disabled={!configured} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="date">Fecha</Label>
                <Input id="date" name="date" type="date" defaultValue={toDateInputValue(todayStart())} disabled={!configured} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Ángulo</Label>
                <Select name="angle" defaultValue="FRONT" disabled={!configured}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FRONT">Frontal</SelectItem>
                    <SelectItem value="SIDE">Lateral</SelectItem>
                    <SelectItem value="BACK">Espalda</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="lighting">Iluminación</Label>
                <Input id="lighting" name="lighting" placeholder="Natural" disabled={!configured} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="distance">Distancia</Label>
                <Input id="distance" name="distance" placeholder="2m" disabled={!configured} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="timeOfDay">Hora aprox.</Label>
                <Input id="timeOfDay" name="timeOfDay" placeholder="Mañana" disabled={!configured} />
              </div>
            </div>
            <Button type="submit" size="lg" disabled={!configured}>
              Subir foto
            </Button>
          </form>
        </CardContent>
      </Card>

      {(["FRONT", "SIDE", "BACK"] as const).map((angle) => (
        <Card key={angle}>
          <CardHeader>
            <CardTitle>{ANGLE_LABEL[angle]}</CardTitle>
          </CardHeader>
          <CardContent>
            {byAngle[angle].length === 0 ? (
              <InsufficientData reason={`Todavía no hay fotos de ángulo ${ANGLE_LABEL[angle].toLowerCase()}.`} />
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {byAngle[angle].map((p) => (
                  <div key={p.id} className="flex flex-col gap-1">
                    {/* eslint-disable-next-line @next/next/no-img-element -- URLs externas de Supabase Storage, no assets locales */}
                    <img src={p.url} alt={`${ANGLE_LABEL[angle]} ${formatDateEs(p.date)}`} className="aspect-[3/4] w-full rounded-xl object-cover" />
                    <span className="text-center text-[11px] text-muted-2">{formatDateEs(p.date)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
