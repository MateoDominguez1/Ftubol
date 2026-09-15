/**
 * Smart Insights (sección 31). Solo observaciones basadas en datos realmente registrados.
 * Si no hay muestra suficiente, se dice explícitamente en vez de inventar una tendencia.
 */

export interface Insight {
  category: "BODY_COMPOSITION" | "SLEEP" | "STRENGTH" | "LOAD" | "FOOTBALL" | "NUTRITION" | "GENERAL";
  text: string;
}

const MIN_POINTS_FOR_TREND = 4;

export function waistVsStrengthInsight(
  waistDeltaCm: number | null,
  strengthDeltaKg: number | null,
  weeksSpan: number,
): Insight | null {
  if (waistDeltaCm == null || strengthDeltaKg == null || weeksSpan < 3) return null;
  if (waistDeltaCm < -0.5 && strengthDeltaKg > 0) {
    return {
      category: "BODY_COMPOSITION",
      text: `Tu cintura bajó ${Math.abs(waistDeltaCm).toFixed(1)} cm en ${weeksSpan} semanas mientras tu fuerza subió ${strengthDeltaKg.toFixed(1)} kg: excelente progreso.`,
    };
  }
  if (waistDeltaCm < -0.5 && strengthDeltaKg < 0) {
    return {
      category: "BODY_COMPOSITION",
      text: `Tu cintura bajó ${Math.abs(waistDeltaCm).toFixed(1)} cm pero tu fuerza también cayó ${Math.abs(strengthDeltaKg).toFixed(1)} kg en ${weeksSpan} semanas: el déficit podría ser demasiado agresivo.`,
    };
  }
  return null;
}

export function sleepVsPerformanceInsight(
  weeksWithGoodSleepAvgPerformance: number | null,
  weeksWithPoorSleepAvgPerformance: number | null,
  sampleWeeks: number,
): Insight | null {
  if (weeksWithGoodSleepAvgPerformance == null || weeksWithPoorSleepAvgPerformance == null) return null;
  if (sampleWeeks < MIN_POINTS_FOR_TREND) return null;
  if (weeksWithGoodSleepAvgPerformance > weeksWithPoorSleepAvgPerformance) {
    return {
      category: "SLEEP",
      text: "Las semanas donde dormiste más de 7.5h en promedio, tu rendimiento en fútbol fue mayor.",
    };
  }
  return null;
}

export function loadChangeInsight(currentWeekLoad: number, previousWeekLoad: number): Insight | null {
  if (previousWeekLoad <= 0) return null;
  const changePct = ((currentWeekLoad - previousWeekLoad) / previousWeekLoad) * 100;
  if (Math.abs(changePct) < 15) return null;
  const dir = changePct > 0 ? "aumentó" : "bajó";
  return {
    category: "LOAD",
    text: `Tu carga semanal ${dir} ${Math.abs(changePct).toFixed(0)}% respecto a la semana anterior.`,
  };
}

export function weightRateInsight(latestWeeklyDeltaKg: number | null): Insight | null {
  if (latestWeeklyDeltaKg == null) return null;
  if (-latestWeeklyDeltaKg > 1) {
    return { category: "BODY_COMPOSITION", text: "Tu peso bajó demasiado rápido esta semana." };
  }
  return null;
}

export const NOT_ENOUGH_DATA_INSIGHT: Insight = {
  category: "GENERAL",
  text: "No hay suficientes datos para determinar una tendencia todavía. Seguí registrando check-ins, peso y sesiones.",
};
