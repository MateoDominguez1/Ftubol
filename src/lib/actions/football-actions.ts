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

const FOOTBALL_FIELDS = [
  "durationMin", "rpe", "minutesPlayed", "performance", "fatigue", "legFeel",
  "duels", "duelsWon", "aerialDuels", "aerialDuelsWon", "accelerations", "directionChanges",
  "sprintRecovery", "concentration", "positioning", "buildupPlay", "longPasses", "longPassesOk", "defensiveErrors",
] as const;

export async function createFootballSessionAction(formData: FormData) {
  const date = dateFrom(formData);
  const data = Object.fromEntries(FOOTBALL_FIELDS.map((f) => [f, numOrNull(formData, f)]));

  await prisma.footballSession.create({
    data: { date, notes: strOrNull(formData, "notes"), ...data },
  });

  revalidatePath("/football");
  revalidatePath("/");
  redirect("/football?saved=1");
}

const MATCH_FIELDS = [
  "minutesPlayed", "rpe", "performance", "fatigue", "legFeel",
  "goals", "assists", "duelsWon", "duelsLost", "aerialDuelsWon", "aerialDuelsLost",
  "accelerations", "directionChanges", "sprintRecovery", "concentration", "positioning", "buildupPlay",
  "longPasses", "longPassesOk", "clearances", "interceptions", "passes", "passesCompleted",
  "defensiveErrors", "personalRating",
] as const;

export async function createMatchAction(formData: FormData) {
  const date = dateFrom(formData);
  const data = Object.fromEntries(MATCH_FIELDS.map((f) => [f, numOrNull(formData, f)]));
  const starterRaw = formData.get("starter");

  const match = await prisma.match.create({
    data: {
      date,
      opponent: strOrNull(formData, "opponent"),
      competition: strOrNull(formData, "competition"),
      isHome: formData.get("isHome") === "home" ? true : formData.get("isHome") === "away" ? false : null,
      starter: starterRaw === "yes" ? true : starterRaw === "no" ? false : null,
      notes: strOrNull(formData, "notes"),
      ...data,
    },
  });

  revalidatePath("/football/matches");
  revalidatePath("/calendar");
  revalidatePath("/");
  redirect(`/football/matches/${match.id}`);
}
