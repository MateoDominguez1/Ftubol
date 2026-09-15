/**
 * Integración opcional con la Nutrition API de Tuduu (https://nutrition-api.com),
 * un catálogo de alimentos genéricos y envasados enfocado en Italia — ideal ya que
 * el usuario come en Italia. Si no está configurada o falla, la búsqueda de
 * alimentos sigue funcionando solo con la biblioteca local.
 */

const TUDUU_BASE_URL = "https://tuduu-prd-apim-we.azure-api.net";

export function isTuduuConfigured(): boolean {
  return Boolean(process.env.TUDUU_SUBSCRIPTION_KEY);
}

export interface TuduuFoodResult {
  externalId: string;
  name: string;
  brand: string | null;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
}

interface TuduuApiItem {
  id: number | string;
  name: string;
  brand: string | null;
  macronutrients?: {
    kcal?: number | null;
    protein?: number | null;
    carbohydrates?: number | null;
    fat?: number | null;
  };
}

/**
 * Busca alimentos en el catálogo de Tuduu (español/italiano, texto libre).
 * La API responde en italiano (Accept-Language: it es obligatorio) pero el buscador
 * de texto libre funciona igual con nombres en español para marcas/productos conocidos.
 */
export async function searchTuduuFoods(query: string, limit = 10): Promise<TuduuFoodResult[]> {
  if (!isTuduuConfigured()) return [];

  try {
    const res = await fetch(`${TUDUU_BASE_URL}/foods/search`, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": process.env.TUDUU_SUBSCRIPTION_KEY!,
        "Content-Type": "application/json",
        "Accept-Language": "it",
      },
      body: JSON.stringify({ searchText: query }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[tuduu] search failed: HTTP ${res.status} — ${body.slice(0, 300)}`);
      return [];
    }

    const data = (await res.json()) as { data?: TuduuApiItem[] };
    const items = data.data ?? [];

    return items
      .filter((it) => it.macronutrients?.kcal != null)
      .slice(0, limit)
      .map((it) => ({
        externalId: String(it.id),
        name: it.name,
        brand: it.brand ?? null,
        caloriesPer100g: Math.round((it.macronutrients!.kcal ?? 0) * 10) / 10,
        proteinPer100g: Math.round((it.macronutrients!.protein ?? 0) * 10) / 10,
        carbsPer100g: Math.round((it.macronutrients!.carbohydrates ?? 0) * 10) / 10,
        fatPer100g: Math.round((it.macronutrients!.fat ?? 0) * 10) / 10,
      }));
  } catch (err) {
    console.error("[tuduu] search threw:", err);
    return [];
  }
}
