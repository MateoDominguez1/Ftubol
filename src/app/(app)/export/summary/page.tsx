import { getDashboardData } from "@/lib/data/dashboard";
import { PHASE_INFO } from "@/lib/calculations/phase";
import { formatDateEs } from "@/lib/dates";
import { PrintButton } from "./print-button";

export default async function ExportSummaryPage() {
  const data = await getDashboardData();

  return (
    <div className="flex flex-col gap-6 text-foreground">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Resumen — {formatDateEs(data.today)}</h1>
          <p className="text-sm text-muted">{data.profile?.name}, {data.profile?.position}</p>
        </div>
        <PrintButton />
      </div>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Performance Score" value={data.performance.status === "ok" ? String(data.performance.data.score) : "Sin datos"} />
        <Stat label="Recovery Score" value={data.recovery.status === "ok" ? String(data.recovery.data.score) : "Sin datos"} />
        <Stat label="Peso" value={data.latestWeightKg != null ? `${data.latestWeightKg} kg` : "Sin datos"} />
        <Stat label="Cintura" value={data.latestWaistCm != null ? `${data.latestWaistCm} cm` : "Sin datos"} />
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-muted">Programa</h2>
        <p className="text-sm">{PHASE_INFO[data.currentPhase].label} · Semana {data.weekNumber}</p>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-muted">Esta semana</h2>
        <p className="text-sm">
          Gimnasio: {data.sessionsThisWeek.gymDone}/{Math.max(data.sessionsThisWeek.gymPlanned, data.sessionsThisWeek.gymDone)} ·
          {" "}Fútbol: {data.sessionsThisWeek.footballDone}/{Math.max(data.sessionsThisWeek.footballPlanned, data.sessionsThisWeek.footballDone)}
        </p>
      </section>

      {data.recommendations.length > 0 ? (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-muted">Recomendaciones activas</h2>
          <ul className="list-disc pl-5 text-sm">
            {data.recommendations.map((r) => (
              <li key={r.id}>{r.message}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}
