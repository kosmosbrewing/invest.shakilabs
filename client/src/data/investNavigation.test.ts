import { describe, expect, it } from "vitest";
import { INVEST_TOOL_GROUPS, getRelatedInvestTools } from "./investNavigation";

describe("invest navigation", () => {
  it("groups every calculator exactly once in the intent hub", () => {
    const paths = INVEST_TOOL_GROUPS.flatMap((group) => group.tools.map((tool) => tool.path));

    expect(paths).toHaveLength(9);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("returns three intentional next actions without the current tool", () => {
    const related = getRelatedInvestTools("/gift-tax");

    expect(related).toHaveLength(3);
    expect(related.map((tool) => tool.path)).not.toContain("/gift-tax");
    expect(related[0]?.path).toBe("/inheritance-tax");
  });
});
