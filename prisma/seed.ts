import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

type SeedExercise = {
  name: string;
  category: "STRENGTH" | "POWER" | "CORE" | "INJURY_PREVENTION" | "ACCESSORY";
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
