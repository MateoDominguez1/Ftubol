/**
 * Motor de reglas (sección 26). Cada regla es una función independiente y nombrada
 * para que sea trazable qué dato disparó cada recomendación. El fútbol y la recuperación
 * tienen prioridad sobre el gimnasio: ante conflicto, las reglas recomiendan reducir/eliminar
 * el estímulo de gimnasio antes que arriesgar el entrenamiento o el partido.
 */

export type Severity = "info" | "warning" | "critical";

export interface Recommendation {
  id: string;
  severity: Severity;
  message: string;
}

export interface RuleContext {
  matchesThisWeek: number;
  daysToNextMatch: number | null; // 0 = hoy
  nextMatchWeekday: number | null; // 0 = domingo ... 6 = sábado

  nightsUnder6hSleepStreak: number;

  squatConsecutiveDrop: boolean; // ver strength.hasConsecutiveStrengthDrop para el ejercicio relevante

  pubisPainLevel: number | null; // 0-10, más reciente
  hamstringPainLevel: number | null;
  painPersistentDaysAnyZone: number; // días consecutivos con dolor relevante (>=4) en la misma zona

  acuteChronicLoadRatio: number | null;

  weeklyWeightLossKg: number[]; // últimas semanas, más reciente al final (positivo = pérdida)

  isDeloadDue: boolean;

  hasGymPlannedTomorrowMatch: boolean; // hay gimnasio programado el día antes del partido
  hasGymPlannedDayBeforeSaturdayMatch: boolean;
}

type Rule = (ctx: RuleContext) => Recommendation | null;

const twoMatchesThisWeek: Rule = (ctx) =>
  ctx.matchesThisWeek >= 2
    ? { id: "two-matches", severity: "critical", message: "Esta semana tenés dos partidos: la app pasa a modo FATIGA/REDUCIDO. Priorizá recuperación sobre gimnasio." }
    : null;

const sleepDeficitStreak: Rule = (ctx) =>
  ctx.nightsUnder6hSleepStreak >= 3
    ? { id: "sleep-deficit", severity: "critical", message: "Dormiste menos de 6 horas durante 3 noches seguidas. Semana reducida activada automáticamente: bajá volumen e intensidad de gimnasio." }
    : null;

const strengthDropSuggestDeload: Rule = (ctx) =>
  ctx.squatConsecutiveDrop
    ? { id: "strength-drop", severity: "warning", message: "Tu fuerza cayó durante dos sesiones consecutivas. Considerá una semana de descarga o revisar si las calorías están demasiado bajas." }
    : null;

const pubisPain: Rule = (ctx) =>
  ctx.pubisPainLevel != null && ctx.pubisPainLevel >= 4
    ? { id: "pubis-pain", severity: "critical", message: "Registraste molestia en el pubis. Reducí o eliminá el trabajo de aductores (Copenhagen) hasta que baje la molestia. No atravieses el dolor." }
    : null;

const hamstringPain: Rule = (ctx) =>
  ctx.hamstringPainLevel != null && ctx.hamstringPainLevel >= 4
    ? { id: "hamstring-pain", severity: "critical", message: "Registraste molestia en el isquiotibial. Eliminá el trabajo excéntrico intenso (nórdicos) hasta que baje la molestia." }
    : null;

const persistentPain: Rule = (ctx) =>
  ctx.painPersistentDaysAnyZone >= 4
    ? { id: "persistent-pain", severity: "critical", message: "La molestia persiste hace varios días. Considerá consultar a un profesional — la app no diagnostica lesiones." }
    : null;

const matchTomorrowAvoidLegs: Rule = (ctx) =>
  ctx.daysToNextMatch === 1
    ? { id: "match-tomorrow", severity: "warning", message: "Faltan 24 horas para el partido. Evitá carga pesada de piernas hoy." }
    : null;

const sundayMatchAllowFridayUpper: Rule = (ctx) =>
  ctx.nextMatchWeekday === 0 && ctx.daysToNextMatch != null && ctx.daysToNextMatch <= 2
    ? { id: "sunday-match-friday-upper", severity: "info", message: "Partido el domingo: el viernes podés hacer una sesión corta de tren superior." }
    : null;

const saturdayMatchNoFridayGym: Rule = (ctx) =>
  ctx.nextMatchWeekday === 6 && ctx.hasGymPlannedDayBeforeSaturdayMatch
    ? { id: "saturday-match-no-friday-gym", severity: "warning", message: "Partido el sábado: no agregues gimnasio el viernes, es el día previo al partido." }
    : null;

const genericDayBeforeMatchNoGym: Rule = (ctx) =>
  ctx.hasGymPlannedTomorrowMatch
    ? { id: "no-gym-day-before-match", severity: "warning", message: "Tenés gimnasio programado el día antes del partido. Movelo o convertilo en activación muy suave." }
    : null;

const noMatchAllowExtraSession: Rule = (ctx) =>
  ctx.matchesThisWeek === 0 && ctx.daysToNextMatch != null && ctx.daysToNextMatch > 6
    ? { id: "no-match-extra-session", severity: "info", message: "No tenés partido esta semana: es un buen momento para una tercera sesión de gimnasio con más trabajo de piernas." }
    : null;

const weightLossTooFast: Rule = (ctx) => {
  const last2 = ctx.weeklyWeightLossKg.slice(-2);
  if (last2.length === 2 && last2.every((v) => v > 1)) {
    return { id: "weight-loss-too-fast", severity: "critical", message: "La pérdida de peso está siendo demasiado rápida durante dos semanas seguidas. Revisá el déficit calórico." };
  }
  return null;
};

const deloadDue: Rule = (ctx) =>
  ctx.isDeloadDue
    ? { id: "deload-due", severity: "info", message: "Ya pasaron 6-8 semanas sin descarga. Se recomienda una semana de descarga: mismos ejercicios, 50% de las series, RIR 4." }
    : null;

const highAcuteLoad: Rule = (ctx) =>
  ctx.acuteChronicLoadRatio != null && ctx.acuteChronicLoadRatio >= 1.5
    ? { id: "high-acute-load", severity: "warning", message: "Tu carga de los últimos días subió fuerte respecto a tu promedio habitual. Priorizá recuperación antes de sumar más volumen de gimnasio." }
    : null;

const ALL_RULES: Rule[] = [
  twoMatchesThisWeek,
  sleepDeficitStreak,
  pubisPain,
  hamstringPain,
  persistentPain,
  matchTomorrowAvoidLegs,
  saturdayMatchNoFridayGym,
  genericDayBeforeMatchNoGym,
  sundayMatchAllowFridayUpper,
  weightLossTooFast,
  strengthDropSuggestDeload,
  highAcuteLoad,
  deloadDue,
  noMatchAllowExtraSession,
];

const SEVERITY_ORDER: Record<Severity, number> = { critical: 0, warning: 1, info: 2 };

export function evaluateRules(ctx: RuleContext): Recommendation[] {
  return ALL_RULES.map((rule) => rule(ctx))
    .filter((r): r is Recommendation => r !== null)
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
}
