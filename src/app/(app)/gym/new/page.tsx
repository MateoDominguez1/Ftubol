import { prisma } from "@/lib/prisma";
import { todayStart, toDateInputValue } from "@/lib/dates";
import { computeFatigueZone } from "@/lib/calculations/fatigue";
import { ZoneBadge } from "@/components/dashboard/zone-badge";
import { GymSessionBuilder } from "./gym-session-builder";

export default async function NewGymSessionPage() {
  const today = todayStart();
  const [exercises, checkin] = await Promise.all([
    prisma.exercise.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.dailyCheckin.findUnique({ where: { date: today } }),
  ]);

  const zone = checkin ? computeFatigueZone(checkin.sleepScore, checkin.legsScore, checkin.motivationScore) : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Nueva sesión de gimnasio</h1>
          <p className="text-sm text-muted">{toDateInputValue(today)}</p>
        </div>
        {zone ? <ZoneBadge zone={zone.zone} /> : null}
      </div>

      {zone && zone.zone !== "GREEN" ? (
        <div className="rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-muted">
          Zona {zone.label.toLowerCase()} de hoy: {zone.actions.join(" · ")}
        </div>
      ) : null}

      <GymSessionBuilder exercises={exercises} date={toDateInputValue(today)} />
    </div>
  );
}
