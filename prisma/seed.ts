import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

type SeedExercise = {
  name: string;
  category: "STRENGTH" | "POWER" | "CORE" | "INJURY_PREVENTION" | "ACCESSORY" | "CARDIO";
  muscleGroups: { group: string; factor: number }[];
  injuryZones?: string[];
};

const EXERCISES: SeedExercise[] = [
  // Fuerza — tren inferior
  { name: "Sentadilla", category: "STRENGTH", muscleGroups: [{ group: "QUADS", factor: 1 }, { group: "GLUTES", factor: 0.5 }] },
  { name: "Peso muerto rumano (RDL)", category: "STRENGTH", muscleGroups: [{ group: "HAMSTRINGS", factor: 1 }, { group: "GLUTES", factor: 0.5 }], injuryZones: ["HAMSTRING"] },
  { name: "Hip thrust", category: "STRENGTH", muscleGroups: [{ group: "GLUTES", factor: 1 }, { group: "HAMSTRINGS", factor: 0.3 }] },
  { name: "Bulgarian split squat", category: "STRENGTH", muscleGroups: [{ group: "QUADS", factor: 1 }, { group: "GLUTES", factor: 0.5 }], injuryZones: ["KNEE"] },
  { name: "Prensa de piernas", category: "STRENGTH", muscleGroups: [{ group: "QUADS", factor: 1 }, { group: "GLUTES", factor: 0.3 }] },
  // Fuerza — tren superior
  { name: "Press banca", category: "STRENGTH", muscleGroups: [{ group: "CHEST", factor: 1 }, { group: "TRICEPS", factor: 0.5 }, { group: "SHOULDERS", factor: 0.3 }] },
  { name: "Dominadas / jalón al pecho", category: "STRENGTH", muscleGroups: [{ group: "BACK", factor: 1 }, { group: "BICEPS", factor: 0.5 }] },
  { name: "Remo con barra", category: "STRENGTH", muscleGroups: [{ group: "BACK", factor: 1 }, { group: "BICEPS", factor: 0.3 }] },
  { name: "Elevaciones laterales", category: "ACCESSORY", muscleGroups: [{ group: "SHOULDERS", factor: 1 }] },
  { name: "Curl bíceps con barra", category: "ACCESSORY", muscleGroups: [{ group: "BICEPS", factor: 1 }] },
  { name: "Extensión de tríceps en polea", category: "ACCESSORY", muscleGroups: [{ group: "TRICEPS", factor: 1 }] },
  // Potencia / pliometría
  { name: "Salto al cajón (box jump)", category: "POWER", muscleGroups: [{ group: "POWER_PLYO", factor: 1 }] },
  { name: "Sprint corto", category: "POWER", muscleGroups: [{ group: "POWER_PLYO", factor: 1 }] },
  // Prevención de lesiones
  { name: "Nordic curl", category: "INJURY_PREVENTION", muscleGroups: [{ group: "HAMSTRINGS", factor: 1 }], injuryZones: ["HAMSTRING"] },
  { name: "Copenhagen plank", category: "INJURY_PREVENTION", muscleGroups: [{ group: "ADDUCTORS", factor: 1 }], injuryZones: ["ADDUCTOR", "PUBIS"] },
  { name: "Soleus raise", category: "INJURY_PREVENTION", muscleGroups: [{ group: "CALVES", factor: 1 }], injuryZones: ["SOLEUS", "ACHILLES"] },
  { name: "Single-leg RDL", category: "INJURY_PREVENTION", muscleGroups: [{ group: "HAMSTRINGS", factor: 1 }, { group: "GLUTES", factor: 0.3 }], injuryZones: ["HAMSTRING", "ANKLE"] },
  { name: "Tibialis raise", category: "INJURY_PREVENTION", muscleGroups: [{ group: "CALVES", factor: 0.5 }], injuryZones: ["ANKLE"] },
  { name: "Face pull", category: "INJURY_PREVENTION", muscleGroups: [{ group: "SHOULDERS", factor: 1 }, { group: "BACK", factor: 0.3 }], injuryZones: ["SHOULDER"] },
  { name: "Rotación externa de hombro", category: "INJURY_PREVENTION", muscleGroups: [{ group: "SHOULDERS", factor: 1 }], injuryZones: ["SHOULDER"] },
  // Core / abdomen
  { name: "Ab wheel", category: "CORE", muscleGroups: [{ group: "CORE", factor: 1 }] },
  { name: "Pallof press", category: "CORE", muscleGroups: [{ group: "CORE", factor: 1 }] },
  { name: "Elevación de piernas", category: "CORE", muscleGroups: [{ group: "CORE", factor: 1 }] },
  { name: "Cable crunch", category: "CORE", muscleGroups: [{ group: "CORE", factor: 1 }] },
  // Cardio
  { name: "Caminadora / cinta", category: "CARDIO", muscleGroups: [{ group: "QUADS", factor: 0.3 }, { group: "CALVES", factor: 0.3 }] },
  { name: "Bicicleta fija", category: "CARDIO", muscleGroups: [{ group: "QUADS", factor: 0.3 }] },
  { name: "Elíptica", category: "CARDIO", muscleGroups: [{ group: "QUADS", factor: 0.2 }, { group: "GLUTES", factor: 0.2 }] },
  { name: "Remo (máquina de cardio)", category: "CARDIO", muscleGroups: [{ group: "BACK", factor: 0.2 }] },
  { name: "Escalador / StairMaster", category: "CARDIO", muscleGroups: [{ group: "GLUTES", factor: 0.3 }, { group: "QUADS", factor: 0.3 }] },
];

type SeedFood = {
  name: string;
  brand?: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
};

const FOODS: SeedFood[] = [
  { name: "Pechuga de pollo (cruda)", caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6 },
  { name: "Carne vacuna magra (cruda)", caloriesPer100g: 187, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 9 },
  { name: "Huevo entero", caloriesPer100g: 155, proteinPer100g: 13, carbsPer100g: 1.1, fatPer100g: 11 },
  { name: "Clara de huevo", caloriesPer100g: 52, proteinPer100g: 11, carbsPer100g: 0.7, fatPer100g: 0.2 },
  { name: "Atún al natural (lata)", caloriesPer100g: 116, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 1 },
  { name: "Salmón (crudo)", caloriesPer100g: 208, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 13 },
  { name: "Yogur griego natural", caloriesPer100g: 97, proteinPer100g: 9, carbsPer100g: 3.9, fatPer100g: 5 },
  { name: "Queso fresco/cottage", caloriesPer100g: 98, proteinPer100g: 11, carbsPer100g: 3.4, fatPer100g: 4.3 },
  { name: "Leche descremada", caloriesPer100g: 35, proteinPer100g: 3.4, carbsPer100g: 5, fatPer100g: 0.1 },
  { name: "Proteína en polvo (whey)", caloriesPer100g: 380, proteinPer100g: 75, carbsPer100g: 8, fatPer100g: 6 },
  { name: "Lentejas cocidas", caloriesPer100g: 116, proteinPer100g: 9, carbsPer100g: 20, fatPer100g: 0.4 },
  { name: "Garbanzos cocidos", caloriesPer100g: 164, proteinPer100g: 9, carbsPer100g: 27, fatPer100g: 2.6 },
  { name: "Arroz blanco cocido", caloriesPer100g: 130, proteinPer100g: 2.7, carbsPer100g: 28, fatPer100g: 0.3 },
  { name: "Arroz integral cocido", caloriesPer100g: 123, proteinPer100g: 2.7, carbsPer100g: 26, fatPer100g: 1 },
  { name: "Pasta cocida", caloriesPer100g: 158, proteinPer100g: 5.8, carbsPer100g: 31, fatPer100g: 0.9 },
  { name: "Papa cocida", caloriesPer100g: 87, proteinPer100g: 1.9, carbsPer100g: 20, fatPer100g: 0.1 },
  { name: "Batata/boniato cocido", caloriesPer100g: 90, proteinPer100g: 2, carbsPer100g: 21, fatPer100g: 0.1 },
  { name: "Pan integral", caloriesPer100g: 247, proteinPer100g: 13, carbsPer100g: 41, fatPer100g: 3.4 },
  { name: "Avena (seca)", caloriesPer100g: 389, proteinPer100g: 17, carbsPer100g: 66, fatPer100g: 7 },
  { name: "Banana", caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 23, fatPer100g: 0.3 },
  { name: "Manzana", caloriesPer100g: 52, proteinPer100g: 0.3, carbsPer100g: 14, fatPer100g: 0.2 },
  { name: "Naranja", caloriesPer100g: 47, proteinPer100g: 0.9, carbsPer100g: 12, fatPer100g: 0.1 },
  { name: "Palta/aguacate", caloriesPer100g: 160, proteinPer100g: 2, carbsPer100g: 9, fatPer100g: 15 },
  { name: "Almendras", caloriesPer100g: 579, proteinPer100g: 21, carbsPer100g: 22, fatPer100g: 50 },
  { name: "Maní/cacahuate", caloriesPer100g: 567, proteinPer100g: 26, carbsPer100g: 16, fatPer100g: 49 },
  { name: "Aceite de oliva", caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100 },
  { name: "Brócoli cocido", caloriesPer100g: 35, proteinPer100g: 2.4, carbsPer100g: 7, fatPer100g: 0.4 },
  { name: "Tomate", caloriesPer100g: 18, proteinPer100g: 0.9, carbsPer100g: 3.9, fatPer100g: 0.2 },
  { name: "Espinaca cruda", caloriesPer100g: 23, proteinPer100g: 2.9, carbsPer100g: 3.6, fatPer100g: 0.4 },
  { name: "Miel", caloriesPer100g: 304, proteinPer100g: 0.3, carbsPer100g: 82, fatPer100g: 0 },

  // McDonald's Italia — valores nutricionales orientativos por 100g, calculados a
  // partir de porción y macros publicados. Nombres como figuran en el menú de Italia.
  { name: "Big Mac", brand: "McDonald's", caloriesPer100g: 237, proteinPer100g: 12.1, carbsPer100g: 20, fatPer100g: 12.1 },
  { name: "Crispy McBacon", brand: "McDonald's", caloriesPer100g: 245, proteinPer100g: 12.5, carbsPer100g: 21, fatPer100g: 12 },
  { name: "Gran Crispy McBacon", brand: "McDonald's", caloriesPer100g: 245, proteinPer100g: 12.5, carbsPer100g: 21, fatPer100g: 12 },
  { name: "McChicken", brand: "McDonald's", caloriesPer100g: 237, proteinPer100g: 10.4, carbsPer100g: 24.3, fatPer100g: 11 },
  { name: "McCrunchy Chicken", brand: "McDonald's", caloriesPer100g: 269, proteinPer100g: 11.8, carbsPer100g: 27.6, fatPer100g: 12.5 },
  { name: "Double Chicken BBQ", brand: "McDonald's", caloriesPer100g: 261, proteinPer100g: 12, carbsPer100g: 26, fatPer100g: 13 },
  { name: "Filet-o-Fish", brand: "McDonald's", caloriesPer100g: 243, proteinPer100g: 10.7, carbsPer100g: 27.1, fatPer100g: 10 },
  { name: "Cheeseburger", brand: "McDonald's", caloriesPer100g: 261, proteinPer100g: 13.9, carbsPer100g: 27, fatPer100g: 10.4 },
  { name: "Double Cheeseburger", brand: "McDonald's", caloriesPer100g: 275, proteinPer100g: 15, carbsPer100g: 26, fatPer100g: 13 },
  { name: "Hamburger", brand: "McDonald's", caloriesPer100g: 258, proteinPer100g: 12, carbsPer100g: 30, fatPer100g: 9 },
  { name: "Chickenburger", brand: "McDonald's", caloriesPer100g: 231, proteinPer100g: 10, carbsPer100g: 26, fatPer100g: 10 },
  { name: "McToast", brand: "McDonald's", caloriesPer100g: 329, proteinPer100g: 15.7, carbsPer100g: 31.4, fatPer100g: 15.7 },
  { name: "Chicken McNuggets (10 pz)", brand: "McDonald's", caloriesPer100g: 259, proteinPer100g: 14.1, carbsPer100g: 15.3, fatPer100g: 15.3 },
  { name: "Insalata Grilled Chicken", brand: "McDonald's", caloriesPer100g: 92, proteinPer100g: 10.4, carbsPer100g: 4.8, fatPer100g: 3.2 },
  { name: "Patatine medie", brand: "McDonald's", caloriesPer100g: 298, proteinPer100g: 3.5, carbsPer100g: 37.7, fatPer100g: 14 },
  { name: "Patatine piccole", brand: "McDonald's", caloriesPer100g: 298, proteinPer100g: 3.5, carbsPer100g: 37.7, fatPer100g: 14 },
  { name: "Patatine grandi", brand: "McDonald's", caloriesPer100g: 285, proteinPer100g: 3.3, carbsPer100g: 36, fatPer100g: 13.5 },
  { name: "McMuffin con uovo", brand: "McDonald's", caloriesPer100g: 226, proteinPer100g: 12.4, carbsPer100g: 21.9, fatPer100g: 9.5 },
  { name: "Cornetto", brand: "McDonald's", caloriesPer100g: 387, proteinPer100g: 6.7, carbsPer100g: 45.3, fatPer100g: 20 },
  { name: "Sundae al cioccolato", brand: "McDonald's", caloriesPer100g: 193, proteinPer100g: 4, carbsPer100g: 33.3, fatPer100g: 5.3 },
  { name: "McFlurry Oreo", brand: "McDonald's", caloriesPer100g: 183, proteinPer100g: 4, carbsPer100g: 28.6, fatPer100g: 6.3 },
  { name: "Cappuccino McCafé", brand: "McDonald's", caloriesPer100g: 41, proteinPer100g: 2, carbsPer100g: 4, fatPer100g: 2 },
  { name: "Caffè Espresso", brand: "McDonald's", caloriesPer100g: 1, proteinPer100g: 0.1, carbsPer100g: 0.2, fatPer100g: 0 },
  { name: "Coca-Cola", caloriesPer100g: 42, proteinPer100g: 0, carbsPer100g: 10.6, fatPer100g: 0 },
];

async function main() {
  console.log("Seeding Profile...");
  const existingProfile = await prisma.profile.findFirst();
  if (!existingProfile) {
    await prisma.profile.create({
      data: {
        name: "Jugador",
        age: 23,
        heightCm: 190,
        initialWeightKg: 89,
        position: "Defensa central",
        footballSessionsPerWeek: 3,
        gymScheduleNote: "Lunes y miércoles fijos, tercera sesión variable según calendario de partidos",
        targetWeightMinKg: 83,
        targetWeightMaxKg: 85,
        targetWaistReductionCm: 6,
        calorieTargetMin: 2700,
        calorieTargetMax: 2900,
        proteinTargetMinG: 180,
        proteinTargetMaxG: 195,
        fatTargetPerKg: 0.9,
      },
    });
    console.log("  -> Profile created");
  } else {
    console.log("  -> Profile already exists, skipping");
  }

  console.log("Seeding Exercise library...");
  for (const ex of EXERCISES) {
    const existing = await prisma.exercise.findUnique({ where: { name: ex.name } });
    if (existing) continue;
    await prisma.exercise.create({
      data: {
        name: ex.name,
        category: ex.category,
        isCustom: false,
        injuryZones: (ex.injuryZones ?? []) as never,
        muscleGroups: {
          create: ex.muscleGroups.map((mg) => ({
            muscleGroup: mg.group as never,
            factor: mg.factor,
          })),
        },
      },
    });
  }
  console.log(`  -> ${EXERCISES.length} exercises ensured`);

  console.log("Seeding active Phase...");
  const activePhase = await prisma.phase.findFirst({ where: { isActive: true } });
  if (!activePhase) {
    await prisma.phase.create({
      data: {
        name: "ADAPTATION",
        startDate: new Date(),
        isActive: true,
        notes: "Fase 1 — Adaptación (semanas 1-4): técnica, tolerancia, cargas moderadas.",
      },
    });
    console.log("  -> Phase 1 (Adaptación) created");
  } else {
    console.log("  -> An active phase already exists, skipping");
  }

  console.log("Seeding Food library...");
  for (const food of FOODS) {
    const existing = await prisma.food.findFirst({ where: { name: food.name, source: "local" } });
    const data = {
      name: food.name,
      brand: food.brand ?? null,
      caloriesPer100g: food.caloriesPer100g,
      proteinPer100g: food.proteinPer100g,
      carbsPer100g: food.carbsPer100g,
      fatPer100g: food.fatPer100g,
      source: "local",
      isCustom: false,
    };
    if (existing) {
      if (!existing.isCustom) await prisma.food.update({ where: { id: existing.id }, data });
    } else {
      await prisma.food.create({ data });
    }
  }
  console.log(`  -> ${FOODS.length} foods ensured (valores actualizados a la versión más reciente del seed)`);

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
