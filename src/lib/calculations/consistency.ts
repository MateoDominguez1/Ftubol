/**
 * Consistencia (sección 30). El descanso programado NO cuenta como incumplimiento.
 */

export interface ConsistencyInput {
  plannedGym: number;
  completedGym: number;
  plannedFootball: number;
  completedFootball: number;
  plannedRestDays: number;
  takenRestDays: number;
}

export interface ConsistencyResult {
  gymCompliancePct: number | null;
  footballCompliancePct: number | null;
  overallCompliancePct: number | null;
}

function pct(completed: number, planned: number): number | null {
  if (planned <= 0) return null;
  return Math.round((completed / planned) * 100);
}

export function computeConsistency(input: ConsistencyInput): ConsistencyResult {
  const gymCompliancePct = pct(input.completedGym, input.plannedGym);
  const footballCompliancePct = pct(input.completedFootball, input.plannedFootball);
  const totalPlanned = input.plannedGym + input.plannedFootball;
  const totalCompleted = input.completedGym + input.completedFootball;
  const overallCompliancePct = pct(totalCompleted, totalPlanned);
  return { gymCompliancePct, footballCompliancePct, overallCompliancePct };
}
