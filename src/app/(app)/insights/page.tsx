import { prisma } from "@/lib/prisma";
import { addDays, todayStart, startOfWeek, endOfWeek } from "@/lib/dates";
import { waistTrend, weekOverWeekWeightChange } from "@/lib/calculations/bodyComposition";
import { strengthTrend, type SetSample } from "@/lib/calculations/strength";
import { sessionLoad } from "@/lib/calculations/trainingLoad";
import {
  waistVsStrengthInsight, loadChangeInsight, weightRateInsight, NOT_ENOUGH_DATA_INSIGHT, type Insight,
} from "@/lib/calculations/insights";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export default async function InsightsPage() {
  const today = todayStart();
  const since8w = addDays(today, -56);

  const [measurements, allSets, gymThisWeek, gymLastWeek, footballThisWeek, footballLastWeek] = await Promise.all([
    prisma.bodyMeasurement.findMany({ where: { date: { gte: since8w } }, orderBy: { date: "asc" } }),
    prisma.workoutExercise.findMany({
      where: { workout: { date: { gte: since8w } } },
      include: { sets: true, workout: { select: { date: true } } },
    }),
    prisma.workout.findMany({ where: { date: { gte: startOfWeek(today), lte: endOfWeek(today) } }, select: { sessionRPE: true, durationMin: true } }),
    prisma.workout.findMany({ where: { date: { gte: startOfWeek(addDays(today, -7)), lte: endOfWeek(addDays(today, -7)) } }, select: { sessionRPE: true, durationMin: true } }),
    prisma.footballSession.findMany({ where: { date: { gte: startOfWeek(today), lte: endOfWeek(today) } }, select: { rpe: true, durationMin: true } }),
    prisma.footballSession.findMany({ where: { date: { gte: startOfWeek(addDays(today, -7)), lte: endOfWeek(addDays(today, -7)) } }, select: { rpe: true, durationMin: true } }),
  ]);

  const insights: Insight[] = [];

  const waistEntries = measurements.filter((m) => m.waistCm != null).map((m) => ({ date: m.date, waistCm: m.waistCm! }));
  const waist = waistTrend(waistEntries);

  const allSamples: SetSample[] = allSets.flatMap((we) => we.sets.map((s) => ({ date: we.workout.date, weightKg: s.weightKg, reps: s.reps })));
  const strength = strengthTrend(allSamples, "week");

  if (waist.status === "ok" && strength.status === "ok" && strength.data.length >= 2) {
    const strengthDelta = strength.data[strength.data.length - 1].bestEst1RM - strength.data[0].bestEst1RM;
    const weeksSpan = Math.round((waist.data.latestDate.getTime() - waist.data.startDate.getTime()) / (7 * 86400000));
    const insight = waistVsStrengthInsight(waist.data.deltaCm, strengthDelta, weeksSpan);
    if (insight) insights.push(insight);
  }

  const weightChange = weekOverWeekWeightChange(
    measurements.filter((m) => m.weightKg != null).map((m) => ({ date: m.date, weightKg: m.weightKg! })),
    today,
  );
  if (weightChange.status === "ok") {
    const insight = weightRateInsight(weightChange.data.deltaKg);
    if (insight) insights.push(insight);
  }

  const loadThisWeek = [...gymThisWeek.map((w) => sessionLoad(w.sessionRPE, w.durationMin)), ...footballThisWeek.map((f) => sessionLoad(f.rpe, f.durationMin))].reduce((a, v) => a + v, 0);
  const loadLastWeek = [...gymLastWeek.map((w) => sessionLoad(w.sessionRPE, w.durationMin)), ...footballLastWeek.map((f) => sessionLoad(f.rpe, f.durationMin))].reduce((a, v) => a + v, 0);
  const loadInsight = loadChangeInsight(loadThisWeek, loadLastWeek);
  if (loadInsight) insights.push(loadInsight);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Insights</h1>
        <p className="text-sm text-muted">Observaciones basadas solo en lo que registraste — nunca inventadas.</p>
      </div>

      {insights.length === 0 ? (
        <Card>
          <CardContent className="pt-4 text-sm text-muted">{NOT_ENOUGH_DATA_INSIGHT.text}</CardContent>
        </Card>
      ) : (
        insights.map((insight, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Sparkles className="h-4 w-4 text-brand" /> {insight.category}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-muted">{insight.text}</CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
