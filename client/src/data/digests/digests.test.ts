import { describe, expect, it } from "vitest";

import { GIFT_TAX_UPDATED } from "../giftTax";
import { INHERITANCE_TAX_UPDATED } from "../inheritanceTax";
import { DIVIDEND_TAX, INVEST_DATA_UPDATED, ISA_TAX } from "../investTaxRates";
import {
  COMPOUND_INTEREST_GUIDE,
  CRYPTO_TAX_GUIDE,
  DEPOSIT_INTEREST_GUIDE,
  DIVIDEND_TAX_GUIDE,
  FOREIGN_STOCK_TAX_GUIDE,
  GIFT_TAX_GUIDE,
  INHERITANCE_TAX_GUIDE,
  INVEST_HOME_GUIDE,
  INVEST_HUB_GUIDE,
  ISA_GUIDE,
  SAVINGS_INTEREST_GUIDE,
  type GuideData,
} from "../seoGuides";
import { DEFAULT_GIFT_TAX_INPUT } from "@/lib/giftTaxValidators";
import { DEFAULT_INHERITANCE_TAX_INPUT } from "@/lib/inheritanceTaxValidators";
import { calculateGiftTax } from "@/utils/giftTaxCalculator";
import { calculateInheritanceTax } from "@/utils/inheritanceTaxCalculator";
import { calculateDividendTax, calculateIsaCompare } from "@/utils/investCalculator";
import { useDividendTaxCalc } from "@/composables/useDividendTaxCalc";
import { useIsaCalc } from "@/composables/useIsaCalc";
import { type Finding, manwon, pct, won } from "./format";
import {
  DIVIDEND_BASE,
  DIVIDEND_TAX_DIGEST,
  GIFT_BASE,
  GIFT_TAX_DIGEST,
  INHERITANCE_BASE,
  INHERITANCE_TAX_DIGEST,
  ISA_BASE,
  ISA_DIGEST,
} from "./index";

// 규율: 페이지당 엔진 파생 발견 8개 이상. 세율표·공제액을 한 줄 인용한 문장은 발견이 아니므로,
// 발견마다 경계·차액·역전·상쇄 같은 파생 수치가 여럿 들어 있어야 한다(숫자 토큰 4개 이상).
const MIN_FINDINGS = 8;
const MIN_NUMBER_TOKENS = 4;
// 09-05 QA: "숫자 나열" 판정의 원인이 연결어 부족이었다. 밀도 하한을 게이트로 박는다.
const MIN_CONNECTIVE_DENSITY = 0.25;
// h3가 두 줄이 되면 스캔성이 떨어진다 — 결론 한 줄로 제한한다.
const MAX_H3_LENGTH = 45;
// scaled content abuse 방지: 새 산문 전 쌍 유사도 0.5 미만, 기존 본문과는 0.85 미만
const MAX_PAIR_SIMILARITY = 0.5;
const MAX_LEGACY_SIMILARITY = 0.85;

const DIGESTS: Record<string, Finding[]> = {
  "gift-tax": GIFT_TAX_DIGEST,
  "inheritance-tax": INHERITANCE_TAX_DIGEST,
  isa: ISA_DIGEST,
  "dividend-tax": DIVIDEND_TAX_DIGEST,
};
const ALL = Object.entries(DIGESTS).flatMap(([page, items]) => items.map((f, i) => ({ id: `${page}#${i + 1}`, ...f })));

/** 논리 연결어 — 인과·대조·환언. 숫자만 나열한 절과 분석 산문을 가르는 신호다. */
const CONNECTIVES = /때문|이유|그래서|따라서|즉 |즉,|반면|다만|하지만|그러나|대신|결국|덕분|한편|그만큼|이므로|으므로|므로|셈|반대로|반대편|게다가|오히려|그런데/g;
const density = (body: string) => ((body.match(CONNECTIVES) ?? []).length / body.length) * 100;

const compact = (text: string) => text.replace(/\s+/g, "");

function bigrams(text: string): Map<string, number> {
  const map = new Map<string, number>();
  const t = compact(text);
  for (let i = 0; i < t.length - 1; i += 1) {
    const g = t.slice(i, i + 2);
    map.set(g, (map.get(g) ?? 0) + 1);
  }
  return map;
}

/** 문자 바이그램 Dice 계수 — 0(무관)~1(동일). 순서를 무시하므로 문장 재배열 복제도 잡는다. */
function similarity(a: string, b: string): number {
  const ga = bigrams(a);
  const gb = bigrams(b);
  let shared = 0;
  for (const [g, n] of ga) shared += Math.min(n, gb.get(g) ?? 0);
  const total = [...ga.values()].reduce((s, n) => s + n, 0) + [...gb.values()].reduce((s, n) => s + n, 0);
  return total === 0 ? 0 : (2 * shared) / total;
}

describe("파생 다이제스트 — 발견 밀도", () => {
  it("비선형 엔진을 가진 계산기 4페이지를 덮는다", () => {
    expect(Object.keys(DIGESTS)).toHaveLength(4);
  });

  it.each(Object.entries(DIGESTS))(`%s 페이지는 발견 ${MIN_FINDINGS}개 이상`, (_page, items) => {
    expect(items.length).toBeGreaterThanOrEqual(MIN_FINDINGS);
  });

  it("발견마다 파생 수치가 여럿 들어 있고 h3가 겹치지 않는다", () => {
    const seen = new Set<string>();
    for (const f of ALL) {
      const numbers = f.body.match(/\d[\d,.]*/g) ?? [];
      expect(numbers.length, f.id).toBeGreaterThanOrEqual(MIN_NUMBER_TOKENS);
      expect(f.body.length, f.id).toBeGreaterThan(200);
      expect(seen.has(f.h2), f.h2).toBe(false);
      seen.add(f.h2);
    }
  });

  it("h3가 결론 한 줄이고 본문 연결어 밀도가 하한을 넘는다", () => {
    for (const f of ALL) {
      expect(f.h2.length, `${f.id} h3: ${f.h2}`).toBeLessThanOrEqual(MAX_H3_LENGTH);
      expect(f.h2, f.id).toMatch(/(다|까|가)$/);
      expect(density(f.body), `${f.id} 밀도`).toBeGreaterThanOrEqual(MIN_CONNECTIVE_DENSITY);
    }
  });

  it("숫자 10개를 넘는 절은 연결어를 두 번 이상 건다", () => {
    for (const f of ALL) {
      const numbers = (f.body.match(/\d[\d,.]*/g) ?? []).length;
      if (numbers <= 10) continue;
      expect((f.body.match(CONNECTIVES) ?? []).length, `${f.id} 숫자 ${numbers}`).toBeGreaterThanOrEqual(2);
    }
  });

  // YMYL: 증여액·상속재산·수익률·다른 소득은 사실이 아니라 사용자가 고르는 파라미터다.
  it("발견마다 가정값임을 명시한다", () => {
    for (const f of ALL) expect(f.body, f.id).toContain("가정");
  });

  it("조사 오류와 계산 실패 흔적이 없다", () => {
    for (const f of ALL) {
      const text = `${f.h2} ${f.body}`;
      expect(text, f.id).not.toMatch(/원로 |원를 |원는 |원가 |원와 |원다 |만원로|억원로/);
      expect(text, f.id).not.toMatch(/%을 |%이 |%은 |%과 |%으로|배을 |배은 |배이 |배으로/);
      expect(text, f.id).not.toMatch(/명로|명를|년로|년를|%p을 |%p이 |%p은 /);
      expect(text, f.id).not.toMatch(/NaN|Infinity|undefined|null/);
    }
  });

  it("갱신 주기를 약속하는 말이 없다", () => {
    const banned = /매월\s*\S*\s*(반영|갱신|업데이트)|주\s*1회|매주|정기적으로\s*(갱신|업데이트)|실시간|즉시 반영|자동 갱신/;
    for (const f of ALL) expect(`${f.h2} ${f.body}`, f.id).not.toMatch(banned);
  });

  // 세무 대리는 우리 영역이 아니다 — 특정 금융사·상품을 지목해 유불리를 말하지 않는다.
  it("특정 금융사·상품을 지목하지 않는다", () => {
    const joined = ALL.map((f) => `${f.h2} ${f.body}`).join("\n");
    for (const brand of ["삼성", "미래에셋", "KB", "신한", "NH", "키움", "토스"]) {
      expect(joined, brand).not.toContain(brand);
    }
  });
});

describe("파생 다이제스트 — 복제 방지", () => {
  it(`새 산문 전 쌍 유사도 ${MAX_PAIR_SIMILARITY} 미만`, () => {
    let max = 0;
    for (let i = 0; i < ALL.length; i += 1) {
      for (let j = i + 1; j < ALL.length; j += 1) {
        const s = similarity(ALL[i].body, ALL[j].body);
        max = Math.max(max, s);
        expect(s, `${ALL[i].id} vs ${ALL[j].id}`).toBeLessThan(MAX_PAIR_SIMILARITY);
      }
    }
    expect(max).toBeGreaterThan(0);
  });

  it(`기존 가이드 본문·FAQ와 유사도 ${MAX_LEGACY_SIMILARITY} 미만`, () => {
    const digestBodies = new Set(ALL.map((f) => f.body));
    const legacy = [
      INVEST_HUB_GUIDE,
      INVEST_HOME_GUIDE,
      COMPOUND_INTEREST_GUIDE,
      CRYPTO_TAX_GUIDE,
      DEPOSIT_INTEREST_GUIDE,
      DIVIDEND_TAX_GUIDE,
      FOREIGN_STOCK_TAX_GUIDE,
      GIFT_TAX_GUIDE,
      INHERITANCE_TAX_GUIDE,
      ISA_GUIDE,
      SAVINGS_INTEREST_GUIDE,
    ]
      .flatMap((g) => [g.intro, ...(g.sections ?? []).map((s) => s.body), ...(g.faqs ?? []).map((q) => q.a)])
      .filter((body) => !digestBodies.has(body));
    for (const f of ALL) for (const body of legacy) expect(similarity(f.body, body), f.id).toBeLessThan(MAX_LEGACY_SIMILARITY);
  });
});

describe("파생 다이제스트 — 가이드 배선", () => {
  const pairs: [string, GuideData, Finding[], string[]][] = [
    ["gift-tax", GIFT_TAX_GUIDE, GIFT_TAX_DIGEST, [GIFT_TAX_UPDATED]],
    ["inheritance-tax", INHERITANCE_TAX_GUIDE, INHERITANCE_TAX_DIGEST, [INHERITANCE_TAX_UPDATED]],
    ["isa", ISA_GUIDE, ISA_DIGEST, [INVEST_DATA_UPDATED]],
    ["dividend-tax", DIVIDEND_TAX_GUIDE, DIVIDEND_TAX_DIGEST, [INVEST_DATA_UPDATED]],
  ];

  it("4페이지 가이드가 각자의 다이제스트를 일반 절보다 앞에 싣는다", () => {
    for (const [page, guide, digest] of pairs) {
      expect(guide.sections!.slice(0, digest.length), page).toEqual(digest);
      expect(guide.sections![digest.length].h2, page).toBe("위 발견의 계산 기준");
      expect(guide.sections!.length, page).toBeGreaterThan(digest.length + 1);
    }
  });

  it("나머지 가이드에는 다이제스트가 섞이지 않는다", () => {
    const untouched = [
      INVEST_HUB_GUIDE,
      INVEST_HOME_GUIDE,
      COMPOUND_INTEREST_GUIDE,
      CRYPTO_TAX_GUIDE,
      DEPOSIT_INTEREST_GUIDE,
      FOREIGN_STOCK_TAX_GUIDE,
      SAVINGS_INTEREST_GUIDE,
    ];
    for (const g of untouched) {
      expect(g.sections!.some((s) => s.h2 === "위 발견의 계산 기준")).toBe(false);
    }
  });

  // 화면 FreshBadge와 같은 상수를 렌더하므로, 기준 문단도 같은 날짜를 적어야 모순이 없다.
  it("계산 기준 문단이 페이지마다 다르고 화면 기준일과 같은 날짜를 적는다", () => {
    const bodies = new Set<string>();
    for (const [page, guide, digest, dates] of pairs) {
      const basis = guide.sections![digest.length];
      for (const dparam of dates) expect(basis.body, page).toContain(dparam);
      expect(basis.body, page).not.toMatch(/매월|매주|정기적으로|실시간/);
      expect(basis.body, page).toContain("가정");
      bodies.add(basis.body);
    }
    expect(bodies.size).toBe(4);
  });

  // 다이제스트 기준값이 화면 기본값에서 드리프트하면 산문과 첫 화면이 어긋난다.
  it("다이제스트 기준값이 화면 기본값과 같다", () => {
    expect(GIFT_BASE).toEqual(DEFAULT_GIFT_TAX_INPUT);
    expect(INHERITANCE_BASE).toEqual(DEFAULT_INHERITANCE_TAX_INPUT);
    const isa = useIsaCalc();
    expect(ISA_BASE.annualInvestment).toBe(isa.annualInvestment.value);
    expect(ISA_BASE.annualReturnRate).toBe(isa.annualReturnRate.value);
    expect(ISA_BASE.holdingYears).toBe(isa.holdingYears.value);
    expect(ISA_BASE.isaType).toBe(isa.isaType.value);
    const dv = useDividendTaxCalc();
    expect(DIVIDEND_BASE.dividendAmount).toBe(dv.dividendAmount.value);
    expect(DIVIDEND_BASE.country).toBe(dv.country.value);
    expect(DIVIDEND_BASE.otherFinancialIncome).toBe(dv.otherFinancialIncome.value);
    expect(DIVIDEND_BASE.otherComprehensiveIncome).toBe(dv.otherComprehensiveIncome.value);
  });
});

// card #56 방식: 산문에 인용된 수치가 엔진을 독립적으로 다시 돌린 값과 일치해야 한다.
// 다이제스트는 포매터만 거치므로 여기서 어긋나면 엔진이 바뀌었는데 문장이 낡은 것이다.
const bodyOf = (items: Finding[], i: number) => items[i].body;

describe("파생 다이제스트 — 인용 수치 엔진 재계산 일치", () => {
  const g = (patch: Partial<typeof DEFAULT_GIFT_TAX_INPUT> = {}) =>
    calculateGiftTax({ ...DEFAULT_GIFT_TAX_INPUT, ...patch });
  const h = (patch: Partial<typeof DEFAULT_INHERITANCE_TAX_INPUT> = {}) =>
    calculateInheritanceTax({ ...DEFAULT_INHERITANCE_TAX_INPUT, ...patch });

  it("/gift-tax: 실효세율·공제 값어치·경계 연속성·분할·세대생략", () => {
    const base = g();
    for (const v of [won(base.availableDeduction), won(base.taxableAmount), won(base.totalTax)]) {
      expect(bodyOf(GIFT_TAX_DIGEST, 0)).toContain(v);
    }
    // 실효세율은 구간세율의 정확히 3분의 2 (기본 가정에서)
    expect(base.effectiveRate / base.appliedRate).toBeCloseTo(2 / 3, 10);
    expect(GIFT_TAX_DIGEST[0].h2).toContain("3분의 2");
    // 공제 4,000만원의 값어치가 구간에 따라 4배로 벌어진다
    const smallGap = g({ giftAmount: 100_000_000, relationship: "other" }).totalTax - g({ giftAmount: 100_000_000 }).totalTax;
    const bigGap = g({ giftAmount: 3_000_000_000, relationship: "other" }).totalTax - g({ giftAmount: 3_000_000_000 }).totalTax;
    expect(bigGap / smallGap).toBe(4);
    expect(GIFT_TAX_DIGEST[1].h2).toContain(manwon(smallGap));
    expect(GIFT_TAX_DIGEST[1].h2).toContain(manwon(bigGap));
    // 누진 경계에는 계단이 없다 — 1억·5억 경계에서 1원 차이의 세액 증가가 0원
    for (const taxBase of [100_000_000, 500_000_000]) {
      const amount = taxBase + base.availableDeduction;
      expect(g({ giftAmount: amount + 1 }).totalTax - g({ giftAmount: amount }).totalTax).toBe(0);
      expect(bodyOf(GIFT_TAX_DIGEST, 2)).toContain(won(g({ giftAmount: amount }).totalTax));
    }
    // 분할 증여: 첫 분할 절감이 이후 두 번의 절감 합보다 크다
    const once = g({ giftAmount: 1_000_000_000 }).totalTax;
    const twice = g({ giftAmount: 500_000_000 }).totalTax * 2;
    const four = g({ giftAmount: 250_000_000 }).totalTax * 4;
    expect(once - twice).toBeGreaterThan(twice - four);
    expect(GIFT_TAX_DIGEST[3].h2).toContain(manwon(once - twice));
    // 세대생략은 전 구간에서 2단 증여보다 싸다
    for (const amount of [100_000_000, 500_000_000, 1_000_000_000, 3_000_000_000]) {
      const skip = g({ giftAmount: amount, isGenerationSkipping: true }).totalTax;
      const hop1 = g({ giftAmount: amount }).totalTax;
      const hop2 = g({ giftAmount: amount - hop1 }).totalTax;
      expect(skip, `${amount}`).toBeLessThan(hop1 + hop2);
    }
    expect(bodyOf(GIFT_TAX_DIGEST, 4)).toContain(manwon(g({ giftAmount: 1_000_000_000, isGenerationSkipping: true }).surcharge));
    // 기공제는 한도에서 포화한다
    expect(g({ priorDeductionUsed: 50_000_000 }).totalTax).toBe(g({ priorDeductionUsed: 100_000_000 }).totalTax);
    expect(bodyOf(GIFT_TAX_DIGEST, 5)).toContain(won(g({ priorDeductionUsed: 50_000_000 }).totalTax));
    // 배우자 경로 격차
    const spouse = g({ giftAmount: 1_000_000_000, relationship: "spouse" });
    const child = g({ giftAmount: 1_000_000_000 });
    expect(GIFT_TAX_DIGEST[6].h2).toContain(manwon(child.totalTax - spouse.totalTax));
    // 실효세율 상한: 고정 감액이 증여액과 무관하게 일정하다
    const gapAt50 = 5_000_000_000 * 0.5 - g({ giftAmount: 5_000_000_000 }).totalTax;
    const gapAt100 = 10_000_000_000 * 0.5 - g({ giftAmount: 10_000_000_000 }).totalTax;
    expect(gapAt50).toBe(gapAt100);
    expect(bodyOf(GIFT_TAX_DIGEST, 8)).toContain(manwon(gapAt100));
  });

  it("/inheritance-tax: 공제 구성·자녀 역전·죽은 구간·상쇄·경계", () => {
    const base = h();
    for (const v of [manwon(base.spouseDeduction), manwon(base.generalDeduction), manwon(base.financialDeduction), won(base.totalTax)]) {
      expect(bodyOf(INHERITANCE_TAX_DIGEST, 0)).toContain(v);
    }
    expect(INHERITANCE_TAX_DIGEST[0].h2).toContain(pct(base.effectiveRate));
    // 자녀 수를 늘리면 세금이 오르다가 일괄공제가 뒤집히는 7명에서 처음 내려간다
    const byChildren = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => h({ childrenCount: n }));
    for (let n = 1; n <= 5; n += 1) expect(byChildren[n].totalTax, `children ${n}`).toBeGreaterThan(byChildren[n - 1].totalTax);
    expect(byChildren[6].totalTax).toBe(byChildren[5].totalTax);
    expect(byChildren[7].totalTax).toBeLessThan(byChildren[6].totalTax);
    expect(byChildren[6].usedLumpSum).toBe(true);
    expect(byChildren[7].usedLumpSum).toBe(false);
    expect(bodyOf(INHERITANCE_TAX_DIGEST, 1)).toContain(won(byChildren[7].totalTax));
    // 금융재산 공제의 죽은 구간: 2천만과 1억의 세금이 같고, 10억 위로는 다시 평평하다
    expect(h({ financialAssets: 20_000_000 }).totalTax).toBe(h({ financialAssets: 100_000_000 }).totalTax);
    expect(h({ financialAssets: 1_000_000_000 }).totalTax).toBe(h({ financialAssets: 2_000_000_000 }).totalTax);
    expect(bodyOf(INHERITANCE_TAX_DIGEST, 2)).toContain(won(h({ financialAssets: 100_000_000 }).totalTax));
    // 배우자 유무 격차 = 산문의 h3
    const without = h({ hasSpouse: false });
    expect(INHERITANCE_TAX_DIGEST[3].h2).toContain(manwon(without.totalTax - base.totalTax));
    expect(without.appliedRate).toBeGreaterThan(base.appliedRate);
    // 배우자공제 하한·상한이 실제로 걸리는 재산 경계
    expect(h({ totalEstate: 1_171_660_000, financialAssets: 0 }).spouseDeduction).toBe(500_000_000);
    expect(h({ totalEstate: 1_171_670_000, financialAssets: 0 }).spouseDeduction).toBeGreaterThan(500_000_000);
    expect(h({ totalEstate: 7_005_000_000, financialAssets: 0 }).spouseDeduction).toBe(3_000_000_000);
    expect(h({ totalEstate: 10_000_000_000, financialAssets: 0 }).spouseDeduction).toBe(3_000_000_000);
    // 채무 상쇄: 과세표준 감소분이 채무보다 작다
    const debt = 100_000_000;
    const withDebt = h({ debt });
    expect(base.taxBase - withDebt.taxBase).toBeLessThan(debt);
    expect(base.spouseDeduction - withDebt.spouseDeduction).toBeGreaterThan(0);
    expect(INHERITANCE_TAX_DIGEST[5].h2).toContain(manwon(base.totalTax - withDebt.totalTax));
    // 첫 과세 재산 경계 — 배우자 유무가 정확히 배우자공제 하한만큼 옮긴다
    expect(h({ totalEstate: 1_005_000_000, financialAssets: 0 }).totalTax).toBe(0);
    expect(h({ totalEstate: 1_005_010_000, financialAssets: 0 }).totalTax).toBeGreaterThan(0);
    expect(h({ totalEstate: 505_000_000, financialAssets: 0, hasSpouse: false }).totalTax).toBe(0);
    expect(h({ totalEstate: 505_010_000, financialAssets: 0, hasSpouse: false }).totalTax).toBeGreaterThan(0);
    expect(INHERITANCE_TAX_DIGEST[6].h2).toContain(manwon(1_005_010_000));
    // 장례비의 값어치 = 같은 조건에서 장례비만 무력화한 값과의 차이
    const funeralWorth = h({ totalEstate: DEFAULT_INHERITANCE_TAX_INPUT.totalEstate + 5_000_000 }).totalTax - base.totalTax;
    expect(funeralWorth).toBeLessThan(5_000_000 * base.appliedRate);
    expect(INHERITANCE_TAX_DIGEST[7].h2).toContain(won(funeralWorth));
    // 증여 교차: 상속세 아래로 내려가는 최소 분할 횟수를 산문이 적은 값과 대조한다
    const inherit10 = h({ totalEstate: 1_000_000_000, financialAssets: 0, hasSpouse: false, childrenCount: 1 });
    const split = (n: number) => g({ giftAmount: Math.round(1_000_000_000 / n) }).totalTax * n;
    const m = INHERITANCE_TAX_DIGEST[8].h2.match(/을 (\d+)번 쪼개야/)!;
    const rounds = Number(m[1]);
    expect(split(rounds)).toBeLessThan(inherit10.totalTax);
    expect(split(rounds - 1)).toBeGreaterThanOrEqual(inherit10.totalTax);
    expect(bodyOf(INHERITANCE_TAX_DIGEST, 8)).toContain(won(inherit10.totalTax));
    // 실효세율 곡선은 단조 증가하고 공제는 상한에서 굳는다
    const curve = [1_000_000_000, 2_000_000_000, 5_000_000_000, 10_000_000_000, 30_000_000_000].map((e) =>
      h({ totalEstate: e, financialAssets: Math.round(e * 0.25) }),
    );
    for (let i = 1; i < curve.length; i += 1) expect(curve[i].effectiveRate).toBeGreaterThan(curve[i - 1].effectiveRate);
    expect(curve[4].totalDeduction).toBe(curve[3].totalDeduction);
    expect(bodyOf(INHERITANCE_TAX_DIGEST, 9)).toContain(pct(curve[3].effectiveRate));
  });

  it("/isa: 절세액 1차식·두 경계·절세율 하한·서민형 상한", () => {
    const iso = (a: number, r: number, y: number, t: "general" | "low_income" = "general") =>
      calculateIsaCompare(a, r, y, t);
    const base = iso(ISA_BASE.annualInvestment, ISA_BASE.annualReturnRate, ISA_BASE.holdingYears);
    for (const v of [won(base.totalProfit), won(base.normalTax), won(base.isaTax), won(base.taxSaving)]) {
      expect(bodyOf(ISA_DIGEST, 0)).toContain(v);
    }
    // 절세액 = 세율차 × 수익 + 비과세한도 × 분리과세율 (원 단위 절사 오차 이내)
    const rateGap = ISA_TAX.NORMAL_ACCOUNT_TAX_RATE - ISA_TAX.SEPARATE_TAX_RATE;
    const fixed = ISA_TAX.GENERAL_TAX_FREE_LIMIT * ISA_TAX.SEPARATE_TAX_RATE;
    for (const [a, r, y] of [[12_000_000, 0.05, 3], [20_000_000, 0.05, 3], [20_000_000, 0.07, 5]] as const) {
      const x = iso(a, r, y);
      expect(Math.abs(x.taxSaving - (rateGap * x.totalProfit + fixed)), `${a}/${r}/${y}`).toBeLessThanOrEqual(2);
    }
    // 납입액 경계: 산문이 적은 금액까지는 ISA 세금 0원, 1,000원 위에서 붙는다
    expect(iso(6_449_000, 0.05, 3).isaTax).toBe(0);
    expect(iso(6_450_000, 0.05, 3).isaTax).toBeGreaterThan(0);
    expect(ISA_DIGEST[1].h2).toContain(won(6_449_000));
    // 수익률 경계
    expect(iso(12_000_000, 0.0272, 3).isaTax).toBe(0);
    expect(iso(12_000_000, 0.0273, 3).isaTax).toBeGreaterThan(0);
    expect(ISA_DIGEST[2].h2).toContain(pct(0.0273, 2));
    // 기간 축: 절세액은 오르고 절세율은 내린다
    const byYear = [3, 5, 7, 10].map((y) => iso(12_000_000, 0.05, y));
    for (let i = 1; i < byYear.length; i += 1) {
      expect(byYear[i].taxSaving).toBeGreaterThan(byYear[i - 1].taxSaving);
      expect(byYear[i].savingRate).toBeLessThan(byYear[i - 1].savingRate);
    }
    expect(bodyOf(ISA_DIGEST, 3)).toContain(won(byYear[3].taxSaving));
    // 절세율 하한: 어떤 수익률에서도 하한 아래로 내려가지 않는다
    const floor = rateGap / ISA_TAX.NORMAL_ACCOUNT_TAX_RATE;
    for (const r of [0.03, 0.07, 0.1, 0.2, 0.3]) {
      expect(iso(20_000_000, r, 5).savingRate, `rate ${r}`).toBeGreaterThan(floor);
    }
    expect(ISA_DIGEST[4].h2).toContain(pct(floor));
    // 서민형 추가 혜택 상한 = 한도 차이 × 분리과세율
    const bonusCap = (ISA_TAX.LOW_INCOME_TAX_FREE_LIMIT - ISA_TAX.GENERAL_TAX_FREE_LIMIT) * ISA_TAX.SEPARATE_TAX_RATE;
    const gen = iso(20_000_000, 0.05, 3);
    const low = iso(20_000_000, 0.05, 3, "low_income");
    expect(gen.isaTax - low.isaTax).toBe(Math.round(bonusCap));
    expect(ISA_DIGEST[5].h2).toContain(won(bonusCap));
    expect(iso(12_898_000, 0.05, 3, "low_income").isaTax).toBe(0);
    expect(iso(12_899_000, 0.05, 3, "low_income").isaTax).toBeGreaterThan(0);
    // 세금 배수는 세율 비율로 수렴한다
    const heavy = iso(20_000_000, 0.2, 5);
    expect(heavy.normalTax / heavy.isaTax).toBeLessThan(base.normalTax / base.isaTax);
    expect(heavy.normalTax / heavy.isaTax).toBeGreaterThan(ISA_TAX.NORMAL_ACCOUNT_TAX_RATE / ISA_TAX.SEPARATE_TAX_RATE);
    // 한도 소진 시나리오
    const full = iso(20_000_000, 0.1, 5);
    expect(full.totalInvestment).toBe(ISA_TAX.TOTAL_LIMIT);
    expect(ISA_DIGEST[7].h2).toContain(won(full.taxSaving));
    // 배당 교차: 같은 수익을 ISA 밖에서 받으면 총부담이 커진다
    const asDividend = calculateDividendTax(full.totalProfit, "KR", 0, 100_000_000);
    const outside = asDividend.totalTax + (asDividend.comprehensiveExtraTax ?? 0);
    expect(outside).toBeGreaterThan(full.isaTax);
    expect(asDividend.totalTax).toBe(full.normalTax);
    expect(bodyOf(ISA_DIGEST, 8)).toContain(won(outside));
  });

  it("/dividend-tax: 국가 역전·무계단 경계·하한·평지·구성 효과", () => {
    const d = (amt: number, c: "KR" | "US" | "JP" | "CN" | "HK" | "UK" = "KR", oth = 0, comp = 0) =>
      calculateDividendTax(amt, c, oth, comp);
    const base = d(DIVIDEND_BASE.dividendAmount);
    expect(base.effectiveRate).toBe(DIVIDEND_TAX.DOMESTIC_TOTAL_RATE);
    for (const v of [won(base.domesticIncomeTax), won(base.domesticLocalTax), won(base.totalTax), won(base.netDividend)]) {
      expect(bodyOf(DIVIDEND_TAX_DIGEST, 0)).toContain(v);
    }
    // 현지 0%인 홍콩이 현지 10%인 중국보다 무겁다
    const amount = 10_000_000;
    const cn = d(amount, "CN");
    const hk = d(amount, "HK");
    expect(hk.totalTax).toBeGreaterThan(cn.totalTax);
    expect(cn.totalTax).toBeLessThan(d(amount, "US").totalTax);
    expect(d(amount, "US").totalTax).toBeLessThan(d(amount, "JP").totalTax);
    expect(d(amount, "JP").totalTax).toBeLessThan(hk.totalTax);
    expect(hk.totalTax).toBe(d(amount).totalTax);
    for (const v of [won(cn.totalTax), won(hk.totalTax), won(cn.domesticLocalTax), won(hk.domesticLocalTax)]) {
      expect(bodyOf(DIVIDEND_TAX_DIGEST, 1)).toContain(v);
    }
    // 기준금액 경계에 계단이 없다
    const other = 100_000_000;
    const total = (r: ReturnType<typeof d>) => r.totalTax + (r.comprehensiveExtraTax ?? 0);
    expect(total(d(20_000_001, "KR", 0, other))).toBe(total(d(20_000_000, "KR", 0, other)));
    expect(d(20_000_001, "KR", 0, other).isComprehensive).toBe(true);
    expect(d(20_000_000, "KR", 0, other).isComprehensive).toBe(false);
    // 다른 소득이 0원이면 억대 배당에도 추가 세부담이 없다
    expect(d(126_400_000).comprehensiveExtraTax).toBe(0);
    expect(d(126_500_000).comprehensiveExtraTax!).toBeGreaterThan(0);
    expect(DIVIDEND_TAX_DIGEST[3].h2).toContain(manwon(126_400_000));
    // 다른 종합소득 경계
    expect(d(50_000_000, "KR", 0, 42_000_000).comprehensiveExtraTax).toBe(0);
    expect(d(50_000_000, "KR", 0, 42_100_000).comprehensiveExtraTax!).toBeGreaterThan(0);
    expect(DIVIDEND_TAX_DIGEST[4].h2).toContain(manwon(42_100_000));
    // 평지: 산문이 적은 두 지점 사이에서 추가 세부담이 완전히 같다
    const plateau = new Set<number>();
    for (let c = 88_000_000; c <= 117_000_000; c += 1_000_000) {
      plateau.add(d(50_000_000, "KR", 0, c).comprehensiveExtraTax ?? -1);
    }
    expect(plateau.size).toBe(1);
    expect(d(50_000_000, "KR", 0, 87_000_000).comprehensiveExtraTax).not.toBe([...plateau][0]);
    expect(d(50_000_000, "KR", 0, 118_000_000).comprehensiveExtraTax).not.toBe([...plateau][0]);
    expect(DIVIDEND_TAX_DIGEST[5].h2).toContain(manwon(88_000_000));
    // 구성 효과: 배당이 초과분 이상이면 같고, 그보다 작으면 더 낸다
    const allDiv = d(35_000_000, "KR", 0, other);
    const mixed = d(15_000_000, "KR", 20_000_000, other);
    const interestHeavy = d(5_000_000, "KR", 30_000_000, other);
    expect(mixed.comprehensiveExtraTax).toBe(allDiv.comprehensiveExtraTax);
    expect(interestHeavy.comprehensiveExtraTax!).toBeGreaterThan(allDiv.comprehensiveExtraTax!);
    expect(DIVIDEND_TAX_DIGEST[6].h2).toContain(won(interestHeavy.comprehensiveExtraTax! - allDiv.comprehensiveExtraTax!));
    // 종합과세에서 국가 순위가 뒤집힌다
    const big = 100_000_000;
    const order = (["KR", "JP", "US", "CN", "HK"] as const).map((c) => ({ c, r: d(big, c, 0, other) }));
    const sepOrder = [...order].sort((a, b) => a.r.totalTax - b.r.totalTax).map((x) => x.c);
    const compOrder = [...order].sort((a, b) => total(a.r) - total(b.r)).map((x) => x.c);
    expect(sepOrder[0]).toBe("CN");
    expect(compOrder[0]).toBe("KR");
    expect(compOrder.indexOf("CN")).toBe(3);
    // 실효세율 곡선은 단조 증가
    const curve = [20_000_000, 30_000_000, 50_000_000, 100_000_000, 200_000_000].map((a) => total(d(a, "KR", 0, other)) / a);
    for (let i = 1; i < curve.length; i += 1) expect(curve[i]).toBeGreaterThan(curve[i - 1]);
    expect(DIVIDEND_TAX_DIGEST[8].h2).toContain(pct(curve[curve.length - 1]));
    // 판정선을 넘는 것과 세금이 붙는 것은 다른 사건
    expect(d(15_000_000, "KR", 5_000_000, other).isComprehensive).toBe(false);
    expect(d(15_000_000, "KR", 5_000_001, other).isComprehensive).toBe(true);
    expect(d(15_000_000, "KR", 5_000_001, other).comprehensiveExtraTax).toBe(0);
    expect(d(15_000_000, "KR", 10_000_000, other).comprehensiveExtraTax!).toBeGreaterThan(0);
    expect(bodyOf(DIVIDEND_TAX_DIGEST, 9)).toContain(won(d(15_000_000, "KR", 10_000_000, other).comprehensiveExtraTax!));
  });
});
