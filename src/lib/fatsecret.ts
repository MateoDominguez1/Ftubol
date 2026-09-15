/**
 * Integración opcional con FatSecret Platform API para buscar alimentos que no
 * están en la biblioteca local. Si no hay credenciales configuradas, o la API
 * falla, la búsqueda simplemente no devuelve resultados externos — nunca rompe
 * el flujo de carga de alimentos, que siempre funciona con la biblioteca local.
 */

interface CachedToken {
  accessToken: string;
  expiresAt: number;
}

let cachedToken: CachedToken | null = null;

export function isFatSecretConfigured(): boolean {
  return Boolean(process.env.FATSECRET_CLIENT_ID && process.env.FATSECRET_CLIENT_SECRET);
}

async function getAccessToken(): Promise<string | null> {
  if (!isFatSecretConfigured()) return null;
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.accessToken;
  }

  const clientId = process.env.FATSECRET_CLIENT_ID!;
  const clientSecret = process.env.FATSECRET_CLIENT_SECRET!;
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  try {
    const res = await fetch("https://oauth.fatsecret.com/connect/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials&scope=basic",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { access_token: string; expires_in: number };
    cachedToken = { accessToken: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
    return cachedToken.accessToken;
  } catch {
    return null;
  }
}

export interface FatSecretFoodResult {
  externalId: string;
  name: string;
  brand: string | null;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
}

interface FatSecretServing {
  serving_description?: string;
  metric_serving_amount?: string;
  metric_serving_unit?: string;
  calories?: string;
  protein?: string;
  carbohydrate?: string;
  fat?: string;
}

/** Normaliza cualquier serving a valores por 100g, cuando el serving está expresado en gramos. */
function normalizeServingTo100g(serving: FatSecretServing): Omit<FatSecretFoodResult, "externalId" | "name" | "brand"> | null {
  const amount = Number(serving.metric_serving_amount);
  const unit = serving.metric_serving_unit;
  if (!amount || unit !== "g") return null;
  const factor = 100 / amount;
  return {
    caloriesPer100g: Math.round(Number(serving.calories ?? 0) * factor * 10) / 10,
    proteinPer100g: Math.round(Number(serving.protein ?? 0) * factor * 10) / 10,
    carbsPer100g: Math.round(Number(serving.carbohydrate ?? 0) * factor * 10) / 10,
    fatPer100g: Math.round(Number(serving.fat ?? 0) * factor * 10) / 10,
  };
}

/** Busca alimentos en FatSecret y devuelve los primeros N con sus macros por 100g ya resueltos. */
export async function searchFatSecretFoods(query: string, limit = 8): Promise<FatSecretFoodResult[]> {
  const token = await getAccessToken();
  if (!token) return [];

  try {
    const searchUrl = new URL("https://platform.fatsecret.com/rest/server.api");
    searchUrl.searchParams.set("method", "foods.search");
    searchUrl.searchParams.set("search_expression", query);
    searchUrl.searchParams.set("format", "json");
    searchUrl.searchParams.set("max_results", String(limit));

    const searchRes = await fetch(searchUrl, { headers: { Authorization: `Bearer ${token}` } });
    if (!searchRes.ok) return [];
    const searchData = await searchRes.json();
    const rawFoods = searchData?.foods?.food;
    if (!rawFoods) return [];
    const foods = Array.isArray(rawFoods) ? rawFoods : [rawFoods];

    const results: FatSecretFoodResult[] = [];
    for (const f of foods.slice(0, limit)) {
      const detail = await getFatSecretFoodDetail(f.food_id, token);
      if (detail) results.push(detail);
    }
    return results;
  } catch {
    return [];
  }
}

async function getFatSecretFoodDetail(foodId: string, token: string): Promise<FatSecretFoodResult | null> {
  try {
    const url = new URL("https://platform.fatsecret.com/rest/server.api");
    url.searchParams.set("method", "food.get.v2");
    url.searchParams.set("food_id", foodId);
    url.searchParams.set("format", "json");

    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return null;
    const data = await res.json();
    const food = data?.food;
    if (!food) return null;

    const rawServings = food.servings?.serving;
    const servings: FatSecretServing[] = Array.isArray(rawServings) ? rawServings : rawServings ? [rawServings] : [];

    for (const serving of servings) {
      const normalized = normalizeServingTo100g(serving);
      if (normalized) {
        return {
          externalId: foodId,
          name: food.food_name,
          brand: food.brand_name ?? null,
          ...normalized,
        };
      }
    }
    return null;
  } catch {
    return null;
  }
}
