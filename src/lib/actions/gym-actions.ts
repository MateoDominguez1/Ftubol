"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseDateInput, todayStart } from "@/lib/dates";

const SetSchema = z.object({
  weightKg: z.number().nullable().optional(),
  reps: z.number().int().nullable().optional(),
  rir: z.number().int().nullable().optional(),
  difficulty: z.number().int().min(1).max(5).nullable().optional(),
  restSeconds: z.number().int().nullable().optional(),
  tempo: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  painFlag: z.boolean().optional(),
});

const WorkoutExerciseSchema = z.object({
  exerciseId: z.string().min(1),
  notes: z.string().nullable().optional(),
  painFlag: z.boolean().optional(),
  sets: z.array(SetSchema),
});

const WorkoutSchema = z.object({
  date: z.string(),
  type: z.enum(["STRENGTH", "POWER", "UPPER_BODY", "FULL_BODY", "REDUCED", "DELOAD", "OTHER"]),
  label: z.string().nullable().optional(),
  durationMin: z.number().int().nullable().optional(),
  sessionRPE: z.number().int().nullable().optional(),
  notes: z.string().nullable().optional(),
  exercises: z.array(WorkoutExerciseSchema).min(1, "Agregá al menos un ejercicio"),
});

export async function createWorkoutAction(formData: FormData) {
  const raw = String(formData.get("payload") ?? "{}");
  const parsed = WorkoutSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    throw new Error(`Datos de la sesión inválidos: ${parsed.error.message}`);
  }
  const data = parsed.data;
  const date = parseDateInput(data.date) ?? todayStart();

  const checkin = await prisma.dailyCheckin.findUnique({ where: { date } });

  const workout = await prisma.workout.create({
    data: {
      date,
      type: data.type,
      label: data.label || null,
      durationMin: data.durationMin ?? null,
      sessionRPE: data.sessionRPE ?? null,
      notes: data.notes || null,
      checkinId: checkin?.id,
      exercises: {
        create: data.exercises.map((ex, order) => ({
          exerciseId: ex.exerciseId,
          order,
          notes: ex.notes || null,
          painFlag: ex.painFlag ?? false,
          sets: {
            create: ex.sets.map((s, i) => ({
              setNumber: i + 1,
              weightKg: s.weightKg ?? null,
              reps: s.reps ?? null,
              rir: s.rir ?? null,
              difficulty: s.difficulty ?? null,
              restSeconds: s.restSeconds ?? null,
              tempo: s.tempo || null,
              notes: s.notes || null,
              painFlag: s.painFlag ?? false,
            })),
          },
        })),
      },
    },
  });

  revalidatePath("/gym");
  revalidatePath("/strength");
  revalidatePath("/volume");
  revalidatePath("/prs");
  revalidatePath("/");
  redirect(`/gym/session/${workout.id}`);
}

export async function setProgressionDecisionAction(formData: FormData) {
  const workoutExerciseId = String(formData.get("workoutExerciseId"));
  const decision = String(formData.get("decision"));
  const workoutId = String(formData.get("workoutId"));

  await prisma.workoutExercise.update({
    where: { id: workoutExerciseId },
    data: { progressionDecision: decision as never },
  });

  revalidatePath(`/gym/session/${workoutId}`);
}

export async function createExerciseAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("El nombre del ejercicio es obligatorio");
  const category = String(formData.get("category") ?? "STRENGTH");
  const groupsRaw = String(formData.get("muscleGroups") ?? "");
  const groups = groupsRaw
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean);

  await prisma.exercise.create({
    data: {
      name,
      category: category as never,
      isCustom: true,
      muscleGroups: {
        create: groups.map((g) => ({ muscleGroup: g as never, factor: 1 })),
      },
    },
  });

  revalidatePath("/gym/exercises");
  redirect("/gym/exercises?created=1");
}
