"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { searchFatSecretFoods, type FatSecretFoodResult } from "@/lib/fatsecret";
import { searchTuduuFoods, type TuduuFoodResult } from "@/lib/tuduu";
import { parseDateInput, todayStart } from "@/lib/dates";

type ExternalFoodResult = (FatSecretFoodResult | TuduuFoodResult) & { source: "fatsecret" | "tuduu" };

export interface FoodOption {
  id: string;
  name: string;
  brand: string | null;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  source: string;
}

/** Saca espacios, apóstrofes y acentos para que "mc donalds" encuentre "McDonald's". */
function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function filterByWords<T extends { name: string; brand: string | null }>(items: T[], words: string[]): T[] {
  return items.filter((f) => {
    const haystack = normalize(`${f.name} ${f.brand ?? ""}`);
    return words.every((w) => haystack.includes(w));
  });
}

/**
 * Busca en la biblioteca local primero (por nombre y marca, tolerante a espacios/
 * apóstrofes/acentos); si hay pocos resultados, complementa con Tuduu (catálogo
 * italiano) y FatSecret (si están configurados) e importa lo nuevo a la biblioteca
 * local para no tener que volver a pedirlo la próxima vez.
 */
export async function searchFoodsAction(query: string): Promise<FoodOption[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const words = trimmed.split(/\s+/).map(normalize).filter(Boolean);
  const allFoods = await prisma.food.findMany({ orderBy: { name: "asc" } });
  const local = filterByWords(allFoods, words).slice(0, 15);

  if (local.length >= 8) return local;

  const [tuduuResults, fatSecretResults] = await Promise.all([
    searchTuduuFoods(trimmed, 8),
    searchFatSecretFoods(trimmed, 8),
  ]);
  const externalResults: ExternalFoodResult[] = [
    ...tuduuResults.map((r) => ({ ...r, source: "tuduu" as const })),
    ...fatSecretResults.map((r) => ({ ...r, source: "fatsecret" as const })),
  ];
  const newOnes = externalResults.filter(
    (ext) => !local.some((l) => l.source === ext.source && l.externalId === ext.externalId),
  );

  for (const ext of newOnes) {
    await prisma.food.upsert({
      where: { source_externalId: { source: ext.source, externalId: ext.externalId } },
      create: {
        name: ext.name,
        brand: ext.brand,
        caloriesPer100g: ext.caloriesPer100g,
        proteinPer100g: ext.proteinPer100g,
        carbsPer100g: ext.carbsPer100g,
        fatPer100g: ext.fatPer100g,
        source: ext.source,
        externalId: ext.externalId,
      },
      update: {},
    });
  }

  if (newOnes.length === 0) return local;

  const refreshed = await prisma.food.findMany({ orderBy: { name: "asc" } });
  return filterByWords(refreshed, words).slice(0, 15);
}

export async function createCustomFoodAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("El nombre del alimento es obligatorio");

  await prisma.food.create({
    data: {
      name,
      caloriesPer100g: Number(formData.get("caloriesPer100g") ?? 0),
      proteinPer100g: Number(formData.get("proteinPer100g") ?? 0),
      carbsPer100g: Number(formData.get("carbsPer100g") ?? 0),
      fatPer100g: Number(formData.get("fatPer100g") ?? 0),
      source: "local",
      isCustom: true,
    },
  });

  revalidatePath("/nutrition/foods");
  redirect("/nutrition/foods?created=1");
}

export async function addFoodLogEntryAction(formData: FormData) {
  const dateStr = String(formData.get("date") ?? "");
  const date = dateStr ? parseDateInput(dateStr) : todayStart();
  const foodId = String(formData.get("foodId"));
  const quantityGrams = Number(formData.get("quantityGrams"));

  if (!foodId || !quantityGrams || quantityGrams <= 0) {
    throw new Error("Elegí un alimento y una cantidad válida");
  }

  await prisma.foodLogEntry.create({ data: { date, foodId, quantityGrams } });

  revalidatePath("/nutrition");
  revalidatePath("/nutrition/new");
  revalidatePath("/");
}

export async function deleteFoodLogEntryAction(formData: FormData) {
  const id = String(formData.get("id"));
  await prisma.foodLogEntry.delete({ where: { id } });

  revalidatePath("/nutrition");
  revalidatePath("/nutrition/new");
  revalidatePath("/");
}
