"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const RoutineExerciseSchema = z.object({
  exerciseId: z.string().min(1),
  targetSets: z.number().int().nullable().optional(),
  targetReps: z.string().nullable().optional(),
  targetRIR: z.number().int().nullable().optional(),
  notes: z.string().nullable().optional(),
});

const RoutineSchema = z.object({
  name: z.string().min(1),
  notes: z.string().nullable().optional(),
  exercises: z.array(RoutineExerciseSchema).min(1, "Agregá al menos un ejercicio"),
});

export async function createRoutineAction(formData: FormData) {
  const raw = String(formData.get("payload") ?? "{}");
  const parsed = RoutineSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    throw new Error(`Datos de la rutina inválidos: ${parsed.error.message}`);
  }
  const data = parsed.data;

  const routine = await prisma.routine.create({
    data: {
      name: data.name,
      notes: data.notes || null,
      exercises: {
        create: data.exercises.map((ex, order) => ({
          exerciseId: ex.exerciseId,
          order,
          targetSets: ex.targetSets ?? null,
          targetReps: ex.targetReps || null,
          targetRIR: ex.targetRIR ?? null,
          notes: ex.notes || null,
        })),
      },
    },
  });

  revalidatePath("/gym/routines");
  redirect(`/gym/routines/${routine.id}`);
}

export async function deleteRoutineAction(formData: FormData) {
  const id = String(formData.get("id"));
  await prisma.routine.delete({ where: { id } });
  revalidatePath("/gym/routines");
  redirect("/gym/routines");
}

export async function toggleRoutineActiveAction(formData: FormData) {
  const id = String(formData.get("id"));
  const isActive = formData.get("isActive") === "true";
  await prisma.routine.update({ where: { id }, data: { isActive: !isActive } });
  revalidatePath("/gym/routines");
}
