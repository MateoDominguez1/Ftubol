import { describe, it, expect } from "vitest";
import { estimate1RM, bestSet, strengthTrend, hasConsecutiveStrengthDrop } from "./strength";

describe("estimate1RM (Epley)", () => {
  it("returns the weight itself for 1 rep", () => {
    expect(estimate1RM(100, 1)).toBe(100);
  });

  it("estimates higher 1RM for more reps at same weight", () => {
    expect(estimate1RM(100, 5)).toBeCloseTo(116.67, 1);
  });

  it("returns 0 for invalid inputs", () => {
    expect(estimate1RM(0, 5)).toBe(0);
    expect(estimate1RM(100, 0)).toBe(0);
  });
});

describe("bestSet", () => {
  it("picks the set with the highest estimated 1RM", () => {
    const result = bestSet([
      { date: new Date("2026-01-01"), weightKg: 80, reps: 5 },
      { date: new Date("2026-01-08"), weightKg: 90, reps: 3 },
      { date: new Date("2026-01-15"), weightKg: null, reps: 5 },
    ]);
    expect(result?.weightKg).toBe(90);
  });

  it("returns null when there is no valid data", () => {
    expect(bestSet([{ date: new Date(), weightKg: null, reps: null }])).toBeNull();
  });
});

describe("strengthTrend", () => {
  it("flags insufficient data with fewer than 2 valid sets", () => {
    const result = strengthTrend([{ date: new Date(), weightKg: 80, reps: 5 }], "week");
    expect(result.status).toBe("insufficient_data");
  });

  it("builds a weekly trend with enough data", () => {
    const result = strengthTrend(
      [
        { date: new Date("2026-01-05"), weightKg: 80, reps: 5 },
        { date: new Date("2026-01-12"), weightKg: 85, reps: 5 },
      ],
      "week",
    );
    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.data.length).toBe(2);
    }
  });
});

describe("hasConsecutiveStrengthDrop", () => {
  it("detects two consecutive sessions below the baseline", () => {
    expect(hasConsecutiveStrengthDrop([100, 95, 90])).toBe(true);
  });

  it("does not flag when the last session recovers", () => {
    expect(hasConsecutiveStrengthDrop([100, 90, 101])).toBe(false);
  });

  it("needs at least 3 sessions", () => {
    expect(hasConsecutiveStrengthDrop([100, 90])).toBe(false);
  });
});
