import { describe, it, expect } from "vitest";
import { computeRecoveryScore } from "./recoveryScore";

const emptyInputs = {
  checkinTotalScore: null,
  sleepHours: null,
  sleepQuality: null,
  acuteChronicRatio: null,
  daysToNextMatch: null,
  maxRecentPainLevel: null,
};

describe("computeRecoveryScore", () => {
  it("returns insufficient_data when nothing is registered", () => {
    const result = computeRecoveryScore(emptyInputs);
    expect(result.status).toBe("insufficient_data");
  });

  it("returns insufficient_data with only load/match data and no checkin or sleep", () => {
    const result = computeRecoveryScore({ ...emptyInputs, acuteChronicRatio: 1, daysToNextMatch: 5 });
    expect(result.status).toBe("insufficient_data");
  });

  it("computes a high score for a fully green checkin and good sleep", () => {
    const result = computeRecoveryScore({
      ...emptyInputs,
      checkinTotalScore: 9,
      sleepHours: 8,
      sleepQuality: 5,
    });
    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.data.band).toBe("READY");
      expect(result.data.score).toBeGreaterThanOrEqual(80);
    }
  });

  it("applies a pain penalty that can drop the band", () => {
    const base = computeRecoveryScore({ ...emptyInputs, checkinTotalScore: 9, sleepHours: 8, sleepQuality: 5 });
    const withPain = computeRecoveryScore({
      ...emptyInputs,
      checkinTotalScore: 9,
      sleepHours: 8,
      sleepQuality: 5,
      maxRecentPainLevel: 8,
    });
    expect(base.status).toBe("ok");
    expect(withPain.status).toBe("ok");
    if (base.status === "ok" && withPain.status === "ok") {
      expect(withPain.data.score).toBeLessThan(base.data.score);
    }
  });

  it("returns a low band for a red checkin", () => {
    const result = computeRecoveryScore({ ...emptyInputs, checkinTotalScore: 3 });
    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(["REST", "CAUTION"]).toContain(result.data.band);
    }
  });
});
