/**
 * Fases del programa (sección 24).
 */

export type PhaseName = "ADAPTATION" | "STRENGTH" | "STRENGTH_POWER" | "MAINTENANCE";

export const PHASE_INFO: Record<PhaseName, { label: string; weeks: string; goal: string }> = {
  ADAPTATION: { label: "Fase 1 — Adaptación", weeks: "Semanas 1-4", goal: "Técnica, tolerancia, cargas moderadas." },
  STRENGTH: { label: "Fase 2 — Fuerza", weeks: "Semanas 5-10", goal: "Aumentar la fuerza." },
  STRENGTH_POWER: { label: "Fase 3 — Fuerza + Potencia", weeks: "Semanas 11-16", goal: "Convertir fuerza en explosividad." },
  MAINTENANCE: { label: "Fase 4 — Mantenimiento", weeks: "Períodos de muchos partidos o alta fatiga", goal: "Sostener fuerza y frescura sin nuevo estímulo agresivo." },
};

/** Fase sugerida por defecto según la semana del programa, si no hay una fase activa fijada manualmente. */
export function defaultPhaseForWeek(weekNumber: number): PhaseName {
  if (weekNumber <= 4) return "ADAPTATION";
  if (weekNumber <= 10) return "STRENGTH";
  if (weekNumber <= 16) return "STRENGTH_POWER";
  return "MAINTENANCE";
}

export function weekNumberSince(startDate: Date, today: Date): number {
  const diffMs = today.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  return Math.max(1, Math.floor(diffDays / 7) + 1);
}
