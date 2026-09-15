/**
 * Objetivos de nutrición (sección 18). Los carbohidratos dependen del tipo de día.
 */

export type DayType = "MATCH" | "FOOTBALL" | "GYM" | "REST";

export const CARB_TARGET_PER_KG: Record<DayType, [number, number]> = {
  MATCH: [5, 5.2],
  FOOTBALL: [4.5, 5],
  GYM: [3.5, 4],
  REST: [2.5, 3],
};

export const DAY_TYPE_LABEL: Record<DayType, string> = {
  MATCH: "Día de partido",
  FOOTBALL: "Día de fútbol",
  GYM: "Día de gimnasio",
  REST: "Día sin estímulo",
};

export interface NutritionTargets {
  calorieMin: number | null;
  calorieMax: number | null;
  proteinMinG: number | null;
  proteinMaxG: number | null;
  carbMinG: number;
  carbMaxG: number;
  fatG: number | null;
  dayType: DayType;
}

export function computeNutritionTargets(
  bodyWeightKg: number,
  dayType: DayType,
  profile: {
    calorieTargetMin: number | null;
    calorieTargetMax: number | null;
    proteinTargetMinG: number | null;
    proteinTargetMaxG: number | null;
    fatTargetPerKg: number | null;
  },
): NutritionTargets {
  const [carbMinPerKg, carbMaxPerKg] = CARB_TARGET_PER_KG[dayType];
  return {
    calorieMin: profile.calorieTargetMin,
    calorieMax: profile.calorieTargetMax,
    proteinMinG: profile.proteinTargetMinG,
    proteinMaxG: profile.proteinTargetMaxG,
    carbMinG: Math.round(carbMinPerKg * bodyWeightKg),
    carbMaxG: Math.round(carbMaxPerKg * bodyWeightKg),
    fatG: profile.fatTargetPerKg ? Math.round(profile.fatTargetPerKg * bodyWeightKg) : null,
    dayType,
  };
}
