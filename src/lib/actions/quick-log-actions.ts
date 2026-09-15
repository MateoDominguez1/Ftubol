"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseDateInput, todayStart } from "@/lib/dates";

function numOrNull(formData: FormData, key: string): number | null {
  const v = formData.get(key);
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function strOrNull(formData: FormData, key: string): string | null {
  const v = String(formData.get(key) ?? "").trim();
  return v || null;
}

function dateFrom(formData: FormData): Date {
  const raw = String(formData.get("date") ?? "");
  return raw ? parseDateInput(raw) : todayStart();
}

export async function submitSleepAction(formData: FormData) {
  const date = dateFrom(formData);
  const data = {
    bedTime: strOrNull(formData, "bedTime"),
    wakeTime: strOrNull(formData, "wakeTime"),
    hoursSlept: numOrNull(formData, "hoursSlept"),
    quality: numOrNull(formData, "quality"),
    wakeups: numOrNull(formData, "wakeups"),
    wakeFeeling: numOrNull(formData, "wakeFeeling"),
    notes: strOrNull(formData, "notes"),
  };
  await prisma.sleepEntry.upsert({
    where: { date },
    create: { date, ...data },
    update: data,
  });
  revalidatePath("/sleep");
  revalidatePath("/");
  redirect("/sleep?saved=1");
}

export async function submitBodyMeasurementAction(formData: FormData) {
  const date = dateFrom(formData);
  const weightKg = numOrNull(formData, "weightKg");
  const waistCm = numOrNull(formData, "waistCm");
  const bodyFatPct = numOrNull(formData, "bodyFatPct");
  const conditions = strOrNull(formData, "conditions");

  await prisma.bodyMeasurement.create({
    data: { date, weightKg, waistCm, bodyFatPct, conditions },
  });
  revalidatePath("/body");
  revalidatePath("/");
  redirect("/body?saved=1");
}

export async function submitNutritionAction(formData: FormData) {
  const date = dateFrom(formData);
  const data = {
    calories: numOrNull(formData, "calories"),
    proteinG: numOrNull(formData, "proteinG"),
    carbsG: numOrNull(formData, "carbsG"),
    fatG: numOrNull(formData, "fatG"),
    notes: strOrNull(formData, "notes"),
  };
  await prisma.nutritionEntry.upsert({
    where: { date },
    create: { date, ...data },
    update: data,
  });
  revalidatePath("/nutrition");
  revalidatePath("/");
  redirect("/nutrition?saved=1");
}

export async function submitHydrationAction(formData: FormData) {
  const date = dateFrom(formData);
  const data = {
    waterMl: numOrNull(formData, "waterMl"),
    preMatchMl: numOrNull(formData, "preMatchMl"),
    duringMl: numOrNull(formData, "duringMl"),
    postMl: numOrNull(formData, "postMl"),
    electrolytes: formData.get("electrolytes") === "on",
    notes: strOrNull(formData, "notes"),
  };
  await prisma.hydrationEntry.upsert({
    where: { date },
    create: { date, ...data },
    update: data,
  });
  revalidatePath("/hydration");
  revalidatePath("/");
  redirect("/hydration?saved=1");
}

export async function submitPainEntryAction(formData: FormData) {
  const date = dateFrom(formData);
  const zone = String(formData.get("zone"));
  const painLevel = Number(formData.get("painLevel"));
  const notes = strOrNull(formData, "notes");

  const checkin = await prisma.dailyCheckin.findUnique({ where: { date } });

  await prisma.painEntry.create({
    data: {
      date,
      zone: zone as never,
      painLevel,
      notes,
      checkinId: checkin?.id,
    },
  });
  revalidatePath("/pain-check");
  revalidatePath("/injury-prevention");
  revalidatePath("/");
  redirect("/?pain=ok");
}
