import { describe, it, expect } from "vitest";
import { computeFoodMacros, sumFoodMacros } from "./nutrition";

const chickenBreast = { caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6 };

describe("computeFoodMacros", () => {
  it("scales macros linearly with quantity", () => {
    const result = computeFoodMacros(chickenBreast, 150);
    expect(result.calories).toBe(248);
    expect(result.proteinG).toBeCloseTo(46.5, 1);
    expect(result.fatG).toBeCloseTo(5.4, 1);
  });

  it("returns zero for zero grams", () => {
    const result = computeFoodMacros(chickenBreast, 0);
    expect(result).toEqual({ calories: 0, proteinG: 0, carbsG: 0, fatG: 0 });
  });
});

describe("sumFoodMacros", () => {
  it("sums multiple entries", () => {
    const total = sumFoodMacros([
      computeFoodMacros(chickenBreast, 100),
      computeFoodMacros(chickenBreast, 100),
    ]);
    expect(total.calories).toBe(330);
    expect(total.proteinG).toBeCloseTo(62, 1);
  });

  it("returns zeros for an empty list", () => {
    expect(sumFoodMacros([])).toEqual({ calories: 0, proteinG: 0, carbsG: 0, fatG: 0 });
  });
});
