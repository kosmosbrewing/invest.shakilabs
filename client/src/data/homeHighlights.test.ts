import { describe, expect, it } from "vitest";
import { HOME_INTENTS, HOME_RATE_TABLE } from "./homeHighlights";
import { INVEST_TOOL_GROUPS } from "./investNavigation";
import { INVEST_HOME_GUIDE, INVEST_HUB_GUIDE } from "./seoGuides";

describe("home highlights", () => {
  it("links every calculator from the home exactly once", () => {
    const toolPaths = INVEST_TOOL_GROUPS.flatMap((group) => group.tools.map((tool) => tool.path));
    const intentPaths = HOME_INTENTS.map((intent) => intent.path);

    expect(new Set(intentPaths).size).toBe(intentPaths.length);
    expect(intentPaths.slice().sort()).toEqual(toolPaths.slice().sort());
  });

  it("keeps the rate table populated with distinct rows", () => {
    const items = HOME_RATE_TABLE.map((row) => row.item);

    expect(HOME_RATE_TABLE.length).toBeGreaterThanOrEqual(8);
    expect(new Set(items).size).toBe(items.length);
  });
});

// 홈과 /all 허브가 같은 문구를 쓰면 서로 순위를 갉아먹는다.
describe("home vs hub guide", () => {
  it("does not reuse the hub title or intro", () => {
    expect(INVEST_HOME_GUIDE.title).not.toBe(INVEST_HUB_GUIDE.title);
    expect(INVEST_HOME_GUIDE.intro).not.toBe(INVEST_HUB_GUIDE.intro);
  });

  it("does not repeat hub questions or section headings", () => {
    const hubQuestions = new Set((INVEST_HUB_GUIDE.faqs ?? []).map((faq) => faq.q));
    const hubHeadings = new Set((INVEST_HUB_GUIDE.sections ?? []).map((section) => section.h2));

    for (const faq of INVEST_HOME_GUIDE.faqs ?? []) {
      expect(hubQuestions.has(faq.q)).toBe(false);
    }
    for (const section of INVEST_HOME_GUIDE.sections ?? []) {
      expect(hubHeadings.has(section.h2)).toBe(false);
    }
  });
});
