"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { searchFatSecretFoods } from "@/lib/fatsecret";
import { parseDateInput, todayStart } from "@/lib/dates";

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

/**
 * Busca en la biblioteca local primero; si hay pocos resultados, complementa con
 * FatSecret (si está configurado) e importa esos alimentos a la biblioteca local
 * para no tener que volver a pedirlos la próxima vez.
 */
export async function searchFoodsAction(query: string): Promise<FoodOption[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const local = await prisma.food.findMany({
    where: { name: { contains: trimmed, mode: "insensitive" } },
    take: 15,
    orderBy: { name: "asc" },
  });

  if (local.length >= 8) return local;

  const externalResults = await searchFatSecretFoods(trimmed, 8);
  const newOnes = externalResults.filter(
    (ext) => !local.some((l) => l.source === "fatsecret" && l.externalId === ext.externalId),
  );

  for (const ext of newOnes) {
    await prisma.food.upsert({
      where: { source_externalId: { source: "fatsecret", externalId: ext.externalId } },
      create: {
        name: ext.name,
        brand: ext.brand,
        caloriesPer100g: ext.caloriesPer100g,
        proteinPer100g: ext.proteinPer100g,
        carbsPer100g: ext.carbsPer100g,
        fatPer100g: ext.fatPer100g,
        source: "fatsecret",
        externalId: ext.externalId,
      },
      update: {},
    });
  }

  return prisma.food.findMany({
    where: { name: { contains: trimmed, mode: "insensitive" } },
    take: 15,
    orderBy: { name: "asc" },
  });
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
