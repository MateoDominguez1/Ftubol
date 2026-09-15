"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function setActivePhaseAction(formData: FormData) {
  const name = String(formData.get("name"));
  const notes = String(formData.get("notes") ?? "").trim() || null;

  await prisma.phase.updateMany({ where: { isActive: true }, data: { isActive: false, endDate: new Date() } });
  await prisma.phase.create({ data: { name: name as never, startDate: new Date(), isActive: true, notes } });

  revalidatePath("/phases");
  revalidatePath("/");
}
