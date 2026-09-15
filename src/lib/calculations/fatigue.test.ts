import { describe, it, expect } from "vitest";
import { computeFatigueZone } from "./fatigue";

describe("computeFatigueZone", () => {
  it("returns GREEN for totals 8-9", () => {
    expect(computeFatigueZone(3, 3, 3).zone).toBe("GREEN");
    expect(computeFatigueZone(3, 3, 2).zone).toBe("GREEN");
  });

  it("returns YELLOW for totals 6-7", () => {
    expect(computeFatigueZone(2, 2, 2).zone).toBe("YELLOW");
    expect(computeFatigueZone(3, 2, 2).zone).toBe("YELLOW");
  });

  it("returns ORANGE for totals 4-5", () => {
    expect(computeFatigueZone(2, 1, 1).zone).toBe("ORANGE");
    expect(computeFatigueZone(1, 2, 2).zone).toBe("ORANGE");
  });

  it("returns RED for totals <= 3", () => {
    expect(computeFatigueZone(1, 1, 1).zone).toBe("RED");
  });

  it("throws on out-of-range values", () => {
    expect(() => computeFatigueZone(0, 2, 2)).toThrow();
    expect(() => computeFatigueZone(4, 2, 2)).toThrow();
  });
});
