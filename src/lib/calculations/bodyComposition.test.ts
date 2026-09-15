import { describe, it, expect } from "vitest";
import { rollingAverage, weekOverWeekWeightChange, evaluateWeightLossRate, waistTrend } from "./bodyComposition";

const d = (s: string) => new Date(s + "T00:00:00.000Z");

describe("rollingAverage", () => {
  it("flags insufficient data with no entries in window", () => {
    const result = rollingAverage([{ date: d("2026-01-01"), weightKg: 89 }], d("2026-02-01"), 7);
    expect(result.status).toBe("insufficient_data");
  });

  it("averages entries within the window", () => {
    const result = rollingAverage(
      [
        { date: d("2026-01-01"), weightKg: 88 },
        { date: d("2026-01-02"), weightKg: 90 },
      ],
      d("2026-01-02"),
      7,
    );
    expect(result.status).toBe("ok");
    if (result.status === "ok") expect(result.data).toBe(89);
  });
});

describe("weekOverWeekWeightChange", () => {
  it("requires two weeks of data", () => {
    const result = weekOverWeekWeightChange([{ date: d("2026-01-01"), weightKg: 89 }], d("2026-01-02"));
    expect(result.status).toBe("insufficient_data");
  });

  it("computes the delta between two rolling weekly averages", () => {
    const entries = [
      { date: d("2026-01-01"), weightKg: 90 },
      { date: d("2026-01-08"), weightKg: 89 },
    ];
    const result = weekOverWeekWeightChange(entries, d("2026-01-08"));
    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.data.deltaKg).toBeCloseTo(-1, 5);
    }
  });
});

describe("evaluateWeightLossRate", () => {
  it("flags too_fast for a single week losing more than 0.6kg", () => {
    expect(evaluateWeightLossRate([-1.2]).flag).toBe("too_fast");
  });

  it("flags on_track within the 0.4-0.6kg/week target", () => {
    expect(evaluateWeightLossRate([-0.5]).flag).toBe("on_track");
  });

  it("flags consecutiveTooFast after two weeks losing more than 1kg", () => {
    expect(evaluateWeightLossRate([-1.3, -1.1]).consecutiveTooFast).toBe(true);
  });

  it("does not flag consecutiveTooFast with only one bad week", () => {
    expect(evaluateWeightLossRate([-0.5, -1.3]).consecutiveTooFast).toBe(false);
  });
});

describe("waistTrend", () => {
  it("requires at least two measurements", () => {
    expect(waistTrend([{ date: d("2026-01-01"), waistCm: 86 }]).status).toBe("insufficient_data");
  });

  it("computes the delta between first and last measurement", () => {
    const result = waistTrend([
      { date: d("2026-01-01"), waistCm: 88 },
      { date: d("2026-01-15"), waistCm: 86 },
    ]);
    expect(result.status).toBe("ok");
    if (result.status === "ok") expect(result.data.deltaCm).toBe(-2);
  });
});
