/**
 * Semáforo de fatiga diario (sección 4 del spec).
 * Sueño + Piernas + Ganas de entrenar, cada uno 1-3 -> zona 8-9/6-7/4-5/<=3.
 */

export type CheckinZone = "GREEN" | "YELLOW" | "ORANGE" | "RED";

export interface FatigueZoneResult {
  total: number;
  zone: CheckinZone;
  label: string;
  actions: string[];
}

export function computeFatigueZone(
  sleepScore: number,
  legsScore: number,
  motivationScore: number,
): FatigueZoneResult {
  for (const [name, v] of [
    ["sueño", sleepScore],
    ["piernas", legsScore],
    ["ganas de entrenar", motivationScore],
  ] as const) {
    if (!Number.isInteger(v) || v < 1 || v > 3) {
      throw new Error(`El valor de "${name}" debe ser 1, 2 o 3`);
    }
  }

  const total = sleepScore + legsScore + motivationScore;

  if (total >= 8) {
    return { total, zone: "GREEN", label: "Verde", actions: ["Sesión completa"] };
  }
  if (total >= 6) {
    return {
      total,
      zone: "YELLOW",
      label: "Amarillo",
      actions: [
        "Reducí el volumen",
        "Quitá la última superserie",
        "Reducí una serie de los ejercicios básicos",
      ],
    };
  }
  if (total >= 4) {
    return {
      total,
      zone: "ORANGE",
      label: "Naranja",
      actions: [
        "Hacé solo los primeros ejercicios",
        "Trabajá con RIR 3-4",
        "Sin saltos",
        "Sin nórdicos",
      ],
    };
  }
  return {
    total,
    zone: "RED",
    label: "Rojo",
    actions: ["No entrenes hoy", "Caminata suave", "Priorizá la recuperación"],
  };
}

export const ZONE_COLOR: Record<CheckinZone, string> = {
  GREEN: "var(--zone-green)",
  YELLOW: "var(--zone-yellow)",
  ORANGE: "var(--zone-orange)",
  RED: "var(--zone-red)",
};

export const ZONE_EMOJI: Record<CheckinZone, string> = {
  GREEN: "🟢",
  YELLOW: "🟡",
  ORANGE: "🟠",
  RED: "🔴",
};
