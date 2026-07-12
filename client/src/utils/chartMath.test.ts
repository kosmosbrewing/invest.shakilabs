import { describe, expect, it } from "vitest";
import { linePoint, normalizeSegments, positiveBarWidth } from "./chartMath";

describe("chartMath", () => {
  it("normalizes exact positive components", () => {
    expect(normalizeSegments([80, 20])).toEqual([0.8, 0.2]);
    expect(normalizeSegments([0, -1])).toEqual([0, 0]);
  });

  it("keeps ranked bars on a zero baseline", () => {
    expect(positiveBarWidth(0, 100)).toBe(0);
    expect(positiveBarWidth(50, 100)).toBe(50);
  });

  it("maps larger growth values higher on the chart", () => {
    expect(linePoint(100, 100)).toBe(8);
    expect(linePoint(0, 100)).toBe(52);
  });
});
