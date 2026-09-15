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

export interface FoodMacros {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

/** Macros de una cantidad de alimento, a partir de sus valores por 100g. */
export function computeFoodMacros(
  food: { caloriesPer100g: number; proteinPer100g: number; carbsPer100g: number; fatPer100g: number },
  quantityGrams: number,
): FoodMacros {
  const factor = quantityGrams / 100;
  return {
    calories: Math.round(food.caloriesPer100g * factor),
    proteinG: Math.round(food.proteinPer100g * factor * 10) / 10,
    carbsG: Math.round(food.carbsPer100g * factor * 10) / 10,
    fatG: Math.round(food.fatPer100g * factor * 10) / 10,
  };
}

/** Suma los macros de una lista de registros de alimentos ya calculados. */
export function sumFoodMacros(entries: FoodMacros[]): FoodMacros {
  return entries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      proteinG: Math.round((acc.proteinG + e.proteinG) * 10) / 10,
      carbsG: Math.round((acc.carbsG + e.carbsG) * 10) / 10,
      fatG: Math.round((acc.fatG + e.fatG) * 10) / 10,
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
  );
}
