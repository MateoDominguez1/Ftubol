import { prisma } from "@/lib/prisma";
import { computeFoodMacros, sumFoodMacros, type FoodMacros } from "@/lib/calculations/nutrition";

export interface DailyNutritionTotal extends FoodMacros {
  date: Date;
  source: "food_log" | "manual";
}

/**
 * Total nutricional de un día: si hay alimentos registrados ese día, se calculan
 * a partir de ellos (fuente de verdad); si no, se usa el total manual si existe.
 */
export async function getDailyNutritionTotals(since: Date, until: Date): Promise<DailyNutritionTotal[]> {
  const [foodLogs, manualEntries] = await Promise.all([
    prisma.foodLogEntry.findMany({
      where: { date: { gte: since, lte: until } },
      include: { food: true },
    }),
    prisma.nutritionEntry.findMany({ where: { date: { gte: since, lte: until } } }),
  ]);

  const byDateKey = new Map<string, DailyNutritionTotal>();

  const foodByDate = new Map<string, FoodMacros[]>();
  for (const entry of foodLogs) {
    const key = entry.date.toDateString();
    const macros = computeFoodMacros(entry.food, entry.quantityGrams);
    if (!foodByDate.has(key)) foodByDate.set(key, []);
    foodByDate.get(key)!.push(macros);
  }
  for (const [key, macrosList] of foodByDate) {
    const date = new Date(key);
    byDateKey.set(key, { date, source: "food_log", ...sumFoodMacros(macrosList) });
  }

  for (const entry of manualEntries) {
    const key = entry.date.toDateString();
    if (byDateKey.has(key)) continue; // el registro por alimentos tiene prioridad
    if (entry.calories == null && entry.proteinG == null && entry.carbsG == null && entry.fatG == null) continue;
    byDateKey.set(key, {
      date: entry.date,
      source: "manual",
      calories: entry.calories ?? 0,
      proteinG: entry.proteinG ?? 0,
      carbsG: entry.carbsG ?? 0,
      fatG: entry.fatG ?? 0,
    });
  }

  return Array.from(byDateKey.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
}

export async function getDailyNutritionTotalForDate(date: Date): Promise<DailyNutritionTotal | null> {
  const results = await getDailyNutritionTotals(date, date);
  return results[0] ?? null;
}
