/**
 * Performance Score 0-100 (sección 3). Compuesto por 5 sub-scores que SIEMPRE
 * se muestran también por separado — nunca ocultar el detalle detrás del número único.
 */
import { Result, ok, insufficient } from "./result";

export interface PerformanceComponents {
  recovery: number | null; // recoveryScore promedio reciente
  strength: number | null; // tendencia de fuerza normalizada 0-100
  football: number | null; // rendimiento fútbol promedio normalizado 0-100
  bodyComposition: number | null; // progreso hacia objetivo de cintura/peso, 0-100
  consistency: number | null; // % de sesiones cumplidas
}

export interface PerformanceScoreResult {
  score: number;
  components: PerformanceComponents;
  missing: (keyof PerformanceComponents)[];
}

const LABELS: Record<keyof PerformanceComponents, string> = {
  recovery: "Recuperación",
  strength: "Fuerza",
  football: "Rendimiento futbolístico",
  bodyComposition: "Composición corporal",
  consistency: "Consistencia",
};

export { LABELS as PERFORMANCE_COMPONENT_LABELS };

export function computePerformanceScore(components: PerformanceComponents): Result<PerformanceScoreResult> {
  const entries = Object.entries(components) as [keyof PerformanceComponents, number | null][];
  const available = entries.filter(([, v]) => v != null) as [keyof PerformanceComponents, number][];
  const missing = entries.filter(([, v]) => v == null).map(([k]) => k);

  if (available.length < 2) {
    return insufficient(
      "Hacen falta al menos dos componentes con datos (de recuperación, fuerza, fútbol, composición corporal o consistencia) para calcular un Performance Score.",
    );
  }

  const score = Math.round(available.reduce((acc, [, v]) => acc + v, 0) / available.length);
  return ok({ score, components, missing });
}
