"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseDateInput } from "@/lib/dates";

export async function createCalendarEventAction(formData: FormData) {
  const date = parseDateInput(String(formData.get("date")));
  const time = String(formData.get("time") ?? "").trim() || null;
  const durationMinRaw = formData.get("durationMin");
  const durationMin = durationMinRaw ? Number(durationMinRaw) : null;
  const type = String(formData.get("type") ?? "OTHER");
  const intensityRaw = formData.get("intensityRPE");
  const intensityRPE = intensityRaw ? Number(intensityRaw) : null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  await prisma.calendarEvent.create({
    data: { date, time, durationMin, type: type as never, intensityRPE, notes },
  });

  revalidatePath("/calendar");
  revalidatePath("/");
  redirect("/calendar");
}

export async function deleteCalendarEventAction(formData: FormData) {
  const id = String(formData.get("id"));
  await prisma.calendarEvent.delete({ where: { id } });
  revalidatePath("/calendar");
  revalidatePath("/");
}
