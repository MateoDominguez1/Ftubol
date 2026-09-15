"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function numOrNull(formData: FormData, key: string): number | null {
  const v = formData.get(key);
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function updateProfileAction(formData: FormData) {
  const id = String(formData.get("id"));

  await prisma.profile.update({
    where: { id },
    data: {
      name: String(formData.get("name") ?? "Jugador"),
      age: Number(formData.get("age")),
      heightCm: Number(formData.get("heightCm")),
      position: String(formData.get("position") ?? ""),
      footballSessionsPerWeek: Number(formData.get("footballSessionsPerWeek") ?? 3),
      gymScheduleNote: String(formData.get("gymScheduleNote") ?? "").trim() || null,
      targetWeightMinKg: numOrNull(formData, "targetWeightMinKg"),
      targetWeightMaxKg: numOrNull(formData, "targetWeightMaxKg"),
      targetWaistReductionCm: numOrNull(formData, "targetWaistReductionCm"),
      calorieTargetMin: numOrNull(formData, "calorieTargetMin"),
      calorieTargetMax: numOrNull(formData, "calorieTargetMax"),
      proteinTargetMinG: numOrNull(formData, "proteinTargetMinG"),
      proteinTargetMaxG: numOrNull(formData, "proteinTargetMaxG"),
      fatTargetPerKg: numOrNull(formData, "fatTargetPerKg"),
    },
  });

  revalidatePath("/settings");
  revalidatePath("/");
  revalidatePath("/nutrition");
}
