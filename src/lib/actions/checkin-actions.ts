"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { computeFatigueZone } from "@/lib/calculations/fatigue";
import { parseDateInput, todayStart } from "@/lib/dates";

export async function submitCheckinAction(formData: FormData) {
  const dateStr = String(formData.get("date") ?? "");
  const date = dateStr ? parseDateInput(dateStr) : todayStart();
  const sleepScore = Number(formData.get("sleepScore"));
  const legsScore = Number(formData.get("legsScore"));
  const motivationScore = Number(formData.get("motivationScore"));
  const notes = String(formData.get("notes") ?? "").trim() || null;

  const { total, zone } = computeFatigueZone(sleepScore, legsScore, motivationScore);

  await prisma.dailyCheckin.upsert({
    where: { date },
    create: { date, sleepScore, legsScore, motivationScore, totalScore: total, zone, notes },
    update: { sleepScore, legsScore, motivationScore, totalScore: total, zone, notes },
  });

  revalidatePath("/");
  revalidatePath("/checkin");
  redirect("/?checkin=ok");
}
