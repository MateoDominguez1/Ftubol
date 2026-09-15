/**
 * Descarga (sección 25): sugerir cada 6-8 semanas o si se detectan las condiciones del motor de reglas.
 */

export function weeksSinceLastDeload(lastDeloadDate: Date | null, today: Date, programStartDate: Date): number {
  const from = lastDeloadDate ?? programStartDate;
  return Math.floor((today.getTime() - from.getTime()) / (7 * 86400000));
}

export function isDeloadDueBySchedule(weeksSince: number): boolean {
  return weeksSince >= 6;
}

export interface DeloadPlan {
  setsPct: number;
  rir: number;
  description: string;
}

export const DELOAD_PLAN: DeloadPlan = {
  setsPct: 50,
  rir: 4,
  description: "Mismo número de ejercicios, 50% de las series, RIR 4, menor fatiga general.",
};
