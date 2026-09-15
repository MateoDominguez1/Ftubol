import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const CSV_ENTITIES = [
  { key: "bodyMeasurements", label: "Composición corporal" },
  { key: "sleep", label: "Sueño" },
  { key: "nutrition", label: "Nutrición" },
  { key: "hydration", label: "Hidratación" },
  { key: "checkins", label: "Check-ins de fatiga" },
  { key: "pain", label: "Molestias/dolor" },
  { key: "footballSessions", label: "Entrenamientos de fútbol" },
  { key: "matches", label: "Partidos" },
];

export default function ExportPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Exportar datos</h1>
        <p className="text-sm text-muted">Tus datos son tuyos — no dependen de ningún servicio externo.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exportación completa (JSON)</CardTitle>
          <CardDescription>Incluye todas las tablas de la app.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <a href="/export/download?format=json">Descargar JSON</a>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Exportación por sección (CSV)</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          {CSV_ENTITIES.map((e) => (
            <Button key={e.key} asChild variant="outline" size="sm">
              <a href={`/export/download?format=csv&entity=${e.key}`}>{e.label}</a>
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumen en PDF</CardTitle>
          <CardDescription>Se abre en una página imprimible — usá &quot;Guardar como PDF&quot; desde el diálogo de impresión del navegador.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href="/export/summary">Ver resumen</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
