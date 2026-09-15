import { describe, it, expect } from "vitest";
import { evaluateRules, RuleContext } from "./rulesEngine";

const baseCtx: RuleContext = {
  matchesThisWeek: 1,
  daysToNextMatch: 5,
  nextMatchWeekday: 0,
  nightsUnder6hSleepStreak: 0,
  squatConsecutiveDrop: false,
  pubisPainLevel: null,
  hamstringPainLevel: null,
  painPersistentDaysAnyZone: 0,
  acuteChronicLoadRatio: 1,
  weeklyWeightLossKg: [],
  isDeloadDue: false,
  hasGymPlannedTomorrowMatch: false,
  hasGymPlannedDayBeforeSaturdayMatch: false,
};

describe("evaluateRules", () => {
  it("returns no recommendations for a clean context", () => {
    expect(evaluateRules(baseCtx)).toEqual([]);
  });

  it("flags two matches this week as critical", () => {
    const recs = evaluateRules({ ...baseCtx, matchesThisWeek: 2 });
    expect(recs.some((r) => r.id === "two-matches" && r.severity === "critical")).toBe(true);
  });

  it("flags pubis pain to reduce adductor work", () => {
    const recs = evaluateRules({ ...baseCtx, pubisPainLevel: 6 });
    expect(recs.some((r) => r.id === "pubis-pain")).toBe(true);
  });

  it("does not flag pubis pain below the threshold", () => {
    const recs = evaluateRules({ ...baseCtx, pubisPainLevel: 2 });
    expect(recs.some((r) => r.id === "pubis-pain")).toBe(false);
  });

  it("flags a match tomorrow to avoid heavy legs", () => {
    const recs = evaluateRules({ ...baseCtx, daysToNextMatch: 1 });
    expect(recs.some((r) => r.id === "match-tomorrow")).toBe(true);
  });

  it("sorts critical recommendations before warnings and info", () => {
    const recs = evaluateRules({
      ...baseCtx,
      matchesThisWeek: 2, // critical
      isDeloadDue: true, // info
      acuteChronicLoadRatio: 1.6, // warning
    });
    const severities = recs.map((r) => r.severity);
    expect(severities[0]).toBe("critical");
    expect(severities[severities.length - 1]).toBe("info");
  });

  it("flags weight loss too fast for two consecutive weeks", () => {
    const recs = evaluateRules({ ...baseCtx, weeklyWeightLossKg: [1.2, 1.4] });
    expect(recs.some((r) => r.id === "weight-loss-too-fast")).toBe(true);
  });

  it("does not flag weight loss with only one fast week", () => {
    const recs = evaluateRules({ ...baseCtx, weeklyWeightLossKg: [0.5, 1.4] });
    expect(recs.some((r) => r.id === "weight-loss-too-fast")).toBe(false);
  });
});
