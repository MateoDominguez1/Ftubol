/**
 * Recovery Score 0-100 (sección 23). Herramienta de decisión, no un diagnóstico médico.
 * Combina: check-in de fatiga, sueño, carga reciente, proximidad del partido y molestias.
 * Si faltan demasiadas fuentes, no inventa el score: devuelve insufficient_data.
 */
import { Result, ok, insufficient } from "./result";

export interface RecoveryInputs {
  checkinTotalScore: number | null; // 3-9
  sleepHours: number | null;
  sleepQuality: number | null; // 1-5
  acuteChronicRatio: number | null; // de trainingLoad.acuteChronicRatio
  daysToNextMatch: number | null; // 0 = hoy
  maxRecentPainLevel: number | null; // 0-10, últimos 3 días
}

export interface RecoverySubscores {
  checkin: number | null;
  sleep: number | null;
  load: number | null;
  matchProximity: number | null;
}

export interface RecoveryScoreResult {
  score: number;
  band: "READY" | "MODERATE" | "CAUTION" | "REST";
  bandLabel: string;
  bandEmoji: string;
  subscores: RecoverySubscores;
  painPenaltyApplied: number;
  usedSources: string[];
}

function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, v));
}

export function computeRecoveryScore(inputs: RecoveryInputs): Result<RecoveryScoreResult> {
  const weights: { key: keyof RecoverySubscores; weight: number }[] = [
    { key: "checkin", weight: 40 },
    { key: "sleep", weight: 30 },
    { key: "load", weight: 20 },
    { key: "matchProximity", weight: 10 },
  ];

  const subscores: RecoverySubscores = { checkin: null, sleep: null, load: null, matchProximity: null };
  const usedSources: string[] = [];

  if (inputs.checkinTotalScore != null) {
    subscores.checkin = clamp(((inputs.checkinTotalScore - 3) / 6) * 100);
    usedSources.push("check-in diario");
  }

  if (inputs.sleepHours != null || inputs.sleepQuality != null) {
    const hoursPart = inputs.sleepHours != null ? clamp((inputs.sleepHours / 8) * 100) : 70;
    const qualityPart = inputs.sleepQuality != null ? clamp((inputs.sleepQuality / 5) * 100) : 70;
    subscores.sleep = clamp(hoursPart * 0.6 + qualityPart * 0.4);
    usedSources.push("sueño");
  }

  if (inputs.acuteChronicRatio != null) {
    const ratio = inputs.acuteChronicRatio;
    subscores.load = clamp(100 - Math.max(0, ratio - 1) * 80);
    usedSources.push("carga reciente");
  }

  if (inputs.daysToNextMatch != null) {
    if (inputs.daysToNextMatch <= 1) subscores.matchProximity = 40;
    else if (inputs.daysToNextMatch === 2) subscores.matchProximity = 70;
    else subscores.matchProximity = 100;
    usedSources.push("proximidad del partido");
  }

  const available = weights.filter((w) => subscores[w.key] != null);
  if (available.length === 0) {
    return insufficient("No hay check-in, sueño ni carga registrados para calcular el recovery score.");
  }
  // Requerimos al menos el check-in o el sueño para que el score tenga sentido.
  if (subscores.checkin == null && subscores.sleep == null) {
    return insufficient("Hace falta al menos el check-in diario o el registro de sueño de hoy.");
  }

  const totalWeight = available.reduce((acc, w) => acc + w.weight, 0);
  let score = available.reduce((acc, w) => acc + (subscores[w.key]! * w.weight) / totalWeight, 0);

  let painPenaltyApplied = 0;
  if (inputs.maxRecentPainLevel != null && inputs.maxRecentPainLevel >= 4) {
    painPenaltyApplied = Math.min(30, (inputs.maxRecentPainLevel - 3) * 5);
    score = clamp(score - painPenaltyApplied);
    usedSources.push("molestias/dolor");
  }

  score = Math.round(clamp(score));

  let band: RecoveryScoreResult["band"];
  let bandLabel: string;
  let bandEmoji: string;
  if (score >= 80) {
    band = "READY"; bandLabel = "Listo"; bandEmoji = "🟢";
  } else if (score >= 60) {
    band = "MODERATE"; bandLabel = "Moderado"; bandEmoji = "🟡";
  } else if (score >= 40) {
    band = "CAUTION"; bandLabel = "Cuidado"; bandEmoji = "🟠";
  } else {
    band = "REST"; bandLabel = "Descanso"; bandEmoji = "🔴";
  }

  return ok({ score, band, bandLabel, bandEmoji, subscores, painPenaltyApplied, usedSources });
}
