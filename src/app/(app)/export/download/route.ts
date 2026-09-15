import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toCsv } from "@/lib/csv";

const CSV_ENTITIES = {
  bodyMeasurements: () => prisma.bodyMeasurement.findMany({ orderBy: { date: "asc" } }),
  sleep: () => prisma.sleepEntry.findMany({ orderBy: { date: "asc" } }),
  nutrition: () => prisma.nutritionEntry.findMany({ orderBy: { date: "asc" } }),
  hydration: () => prisma.hydrationEntry.findMany({ orderBy: { date: "asc" } }),
  checkins: () => prisma.dailyCheckin.findMany({ orderBy: { date: "asc" } }),
  pain: () => prisma.painEntry.findMany({ orderBy: { date: "asc" } }),
  footballSessions: () => prisma.footballSession.findMany({ orderBy: { date: "asc" } }),
  matches: () => prisma.match.findMany({ orderBy: { date: "asc" } }),
} as const;

type CsvEntity = keyof typeof CSV_ENTITIES;

export async function GET(request: NextRequest) {
  const format = request.nextUrl.searchParams.get("format") ?? "json";

  if (format === "csv") {
    const entity = request.nextUrl.searchParams.get("entity") as CsvEntity | null;
    if (!entity || !(entity in CSV_ENTITIES)) {
      return NextResponse.json({ error: "Entidad inválida" }, { status: 400 });
    }
    const rows = await CSV_ENTITIES[entity]();
    const csv = toCsv(rows as unknown as Record<string, unknown>[]);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${entity}.csv"`,
      },
    });
  }

  const [
    profile, exercises, workouts, workoutExercises, sets, calendarEvents, footballSessions, matches,
    checkins, painEntries, injuries, sleep, bodyMeasurements, photos, nutrition, hydration,
    weeklyReviews, goals, phases, insights,
  ] = await Promise.all([
    prisma.profile.findMany(),
    prisma.exercise.findMany({ include: { muscleGroups: true } }),
    prisma.workout.findMany(),
    prisma.workoutExercise.findMany(),
    prisma.setEntry.findMany(),
    prisma.calendarEvent.findMany(),
    prisma.footballSession.findMany(),
    prisma.match.findMany(),
    prisma.dailyCheckin.findMany(),
    prisma.painEntry.findMany(),
    prisma.injury.findMany(),
    prisma.sleepEntry.findMany(),
    prisma.bodyMeasurement.findMany(),
    prisma.progressPhoto.findMany(),
    prisma.nutritionEntry.findMany(),
    prisma.hydrationEntry.findMany(),
    prisma.weeklyReview.findMany(),
    prisma.goal.findMany(),
    prisma.phase.findMany(),
    prisma.insight.findMany(),
  ]);

  const data = {
    exportedAt: new Date().toISOString(),
    profile, exercises, workouts, workoutExercises, sets, calendarEvents, footballSessions, matches,
    checkins, painEntries, injuries, sleep, bodyMeasurements, photos, nutrition, hydration,
    weeklyReviews, goals, phases, insights,
  };

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="football-performance-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
