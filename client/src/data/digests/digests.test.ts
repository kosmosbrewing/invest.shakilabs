import { describe, expect, it } from "vitest";

import { FOREIGN_STOCK_TAX_UPDATED } from "../foreignStockTax";
import { GIFT_TAX_UPDATED } from "../giftTax";
import { INHERITANCE_TAX_UPDATED } from "../inheritanceTax";
import { INTEREST_DATA_UPDATED, INTEREST_TAX } from "../interestData";
import { CRYPTO_TAX, DIVIDEND_TAX, INVEST_DATA_UPDATED, ISA_TAX } from "../investTaxRates";
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
import { DEFAULT_FOREIGN_STOCK_TAX_INPUT } from "@/lib/foreignStockTaxValidators";
import { DEFAULT_GIFT_TAX_INPUT } from "@/lib/giftTaxValidators";
import { DEFAULT_INHERITANCE_TAX_INPUT } from "@/lib/inheritanceTaxValidators";
import { calculateForeignStockTax } from "@/utils/foreignStockTaxCalculator";
import { calculateGiftTax } from "@/utils/giftTaxCalculator";
import { calculateInheritanceTax } from "@/utils/inheritanceTaxCalculator";
import { calculateDepositInterest, calculateSavingsInterest } from "@/utils/interestCalculator";
import { calculateCryptoTax, calculateDividendTax, calculateIsaCompare } from "@/utils/investCalculator";
import { useCryptoTaxCalc } from "@/composables/useCryptoTaxCalc";
import { useDepositInterestCalc } from "@/composables/useDepositInterestCalc";
import { useDividendTaxCalc } from "@/composables/useDividendTaxCalc";
import { useIsaCalc } from "@/composables/useIsaCalc";
import { useSavingsInterestCalc } from "@/composables/useSavingsInterestCalc";
import { type Finding, manwon, num, pct, won } from "./format";
import {
  CRYPTO_BASE,
  CRYPTO_TAX_DIGEST,
  DEPOSIT_BASE,
  DEPOSIT_INTEREST_DIGEST,
  DIVIDEND_BASE,
  DIVIDEND_TAX_DIGEST,
  FOREIGN_BASE,
  FOREIGN_STOCK_TAX_DIGEST,
  GIFT_BASE,
  GIFT_TAX_DIGEST,
  INHERITANCE_BASE,
  INHERITANCE_TAX_DIGEST,
  ISA_BASE,
  ISA_DIGEST,
  SAVINGS_BASE,
  SAVINGS_INTEREST_DIGEST,
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
  "savings-interest": SAVINGS_INTEREST_DIGEST,
  "deposit-interest": DEPOSIT_INTEREST_DIGEST,
  "crypto-tax": CRYPTO_TAX_DIGEST,
  "foreign-stock-tax": FOREIGN_STOCK_TAX_DIGEST,
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
  it("계산기 8페이지를 덮는다", () => {
    expect(Object.keys(DIGESTS)).toHaveLength(8);
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
    ["savings-interest", SAVINGS_INTEREST_GUIDE, SAVINGS_INTEREST_DIGEST, [INTEREST_DATA_UPDATED]],
    ["deposit-interest", DEPOSIT_INTEREST_GUIDE, DEPOSIT_INTEREST_DIGEST, [INTEREST_DATA_UPDATED]],
    ["crypto-tax", CRYPTO_TAX_GUIDE, CRYPTO_TAX_DIGEST, [INVEST_DATA_UPDATED]],
    ["foreign-stock-tax", FOREIGN_STOCK_TAX_GUIDE, FOREIGN_STOCK_TAX_DIGEST, [FOREIGN_STOCK_TAX_UPDATED]],
  ];

  it("8페이지 가이드가 각자의 다이제스트를 일반 절보다 앞에 싣는다", () => {
    for (const [page, guide, digest] of pairs) {
      expect(guide.sections!.slice(0, digest.length), page).toEqual(digest);
      expect(guide.sections![digest.length].h2, page).toBe("위 발견의 계산 기준");
      expect(guide.sections!.length, page).toBeGreaterThan(digest.length + 1);
    }
  });

  it("나머지 가이드에는 다이제스트가 섞이지 않는다", () => {
    const untouched = [INVEST_HUB_GUIDE, INVEST_HOME_GUIDE, COMPOUND_INTEREST_GUIDE];
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
    expect(bodies.size).toBe(8);
  });

  // 다이제스트 기준값이 화면 기본값에서 드리프트하면 산문과 첫 화면이 어긋난다.
  it("다이제스트 기준값이 화면 기본값과 같다", () => {
    // 왜 not.toBe부터 거는가: 두 상수가 같은 객체를 참조하면 아래 toEqual이 자기 자신과의 비교가 되어
    // 화면 기본값을 무엇으로 바꾸든 통과한다(실측: relationship·financialAssets 변경에도 22건 전부 green).
    // 독립 리터럴임을 먼저 못박아야 그다음 줄의 toEqual이 비로소 게이트가 된다.
    expect(GIFT_BASE).not.toBe(DEFAULT_GIFT_TAX_INPUT);
    expect(INHERITANCE_BASE).not.toBe(DEFAULT_INHERITANCE_TAX_INPUT);
    expect(GIFT_BASE).toEqual(DEFAULT_GIFT_TAX_INPUT);
    expect(INHERITANCE_BASE).toEqual(DEFAULT_INHERITANCE_TAX_INPUT);
    // 라벨 필드는 엔진 출력이 아니라 산문이 문자열로 적어 둔 조건이라, 숫자 재계산으로는 드리프트가 드러나지 않는다.
    // 화면 기본값과 함께 바뀌면 toEqual도 통과해 버리므로 여기서 리터럴로 고정한다.
    expect(GIFT_BASE.relationship).toBe("adult-child");
    expect(GIFT_BASE.isGenerationSkipping).toBe(false);
    expect(INHERITANCE_BASE.hasSpouse).toBe(true);
    expect(INHERITANCE_BASE.childrenCount).toBe(2);
    expect(ISA_BASE.isaType).toBe("general");
    expect(GIFT_TAX_DIGEST[0].body).toContain("성년 자녀에게");
    expect(INHERITANCE_TAX_DIGEST[0].body).toContain("배우자와 자녀 2명");
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
    // 해외주식만 검증기에 기본값 객체가 따로 있어 참조 공유가 가능하다 — 독립 리터럴임을 먼저 못박는다.
    expect(FOREIGN_BASE).not.toBe(DEFAULT_FOREIGN_STOCK_TAX_INPUT);
    expect(FOREIGN_BASE).toEqual(DEFAULT_FOREIGN_STOCK_TAX_INPUT);
    const sv = useSavingsInterestCalc();
    expect(SAVINGS_BASE.monthlyDeposit).toBe(sv.monthlyDeposit.value);
    expect(SAVINGS_BASE.months).toBe(sv.months.value);
    expect(SAVINGS_BASE.annualRate).toBe(sv.annualRate.value);
    expect(SAVINGS_BASE.taxType).toBe(sv.taxType.value);
    const dp = useDepositInterestCalc();
    expect(DEPOSIT_BASE.principal).toBe(dp.principal.value);
    expect(DEPOSIT_BASE.months).toBe(dp.months.value);
    expect(DEPOSIT_BASE.annualRate).toBe(dp.annualRate.value);
    expect(DEPOSIT_BASE.taxType).toBe(dp.taxType.value);
    expect(DEPOSIT_BASE.paymentType).toBe(dp.paymentType.value);
    const cr = useCryptoTaxCalc();
    expect(CRYPTO_BASE.purchaseAmount).toBe(cr.purchaseAmount.value);
    expect(CRYPTO_BASE.saleAmount).toBe(cr.saleAmount.value);
    expect(CRYPTO_BASE.expenses).toBe(cr.expenses.value);
    // 라벨 필드는 엔진 출력이 아니라 산문이 문자열로 적어 둔 조건이라 숫자 재계산으로 드러나지 않는다.
    expect(SAVINGS_BASE.taxType).toBe("normal");
    expect(DEPOSIT_BASE.taxType).toBe("normal");
    expect(DEPOSIT_BASE.paymentType).toBe("maturity");
    expect(SAVINGS_INTEREST_DIGEST[0].body).toContain("일반과세");
    expect(DEPOSIT_INTEREST_DIGEST[0].body).toContain("만기일시지급");
    expect(DEPOSIT_INTEREST_DIGEST[7].body).toContain("만기일시지급");
    expect(FOREIGN_STOCK_TAX_DIGEST[0].body).toContain("화면 기본값인 매도");
    expect(CRYPTO_TAX_DIGEST[0].body).toContain("화면 기본값대로");
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
    // 실효세율 대 적용세율 비율 — 신고세액공제 3%가 붙은 뒤의 값을 h3가 그대로 인용한다
    expect(base.effectiveRate / base.appliedRate).toBeCloseTo((2 / 3) * 0.97, 10);
    expect(GIFT_TAX_DIGEST[0].h2).toContain(pct(base.effectiveRate / base.appliedRate, 1));
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
    // 실효세율 상한: 천장은 최고세율이 아니라 최고세율 × (1 − 신고세액공제율)이고,
    // 그 천장선에서 잰 고정 감액만이 증여액과 무관하게 일정하다.
    const top = g({ giftAmount: 10_000_000_000 });
    const ceiling = top.appliedRate * (1 - top.filingDeduction / top.calculatedTax);
    expect(ceiling).toBeCloseTo(0.485, 10);
    const gapAt50 = Math.round(5_000_000_000 * ceiling - g({ giftAmount: 5_000_000_000 }).totalTax);
    const gapAt100 = Math.round(10_000_000_000 * ceiling - top.totalTax);
    expect(gapAt50).toBe(gapAt100);
    // 최고세율 기준으로 재면 더 이상 일정하지 않다 — 산문이 50%를 천장으로 쓰면 안 되는 이유다.
    expect(5_000_000_000 * top.appliedRate - g({ giftAmount: 5_000_000_000 }).totalTax).not.toBe(
      10_000_000_000 * top.appliedRate - top.totalTax,
    );
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

// 상수를 따라 산문이 다시 쓰이는 구조라, 엔진에서 값을 읽어 비교하는 테스트는 상수가 틀려도 같이 움직여 통과한다.
// (실측: SEPARATE_TAX_RATE 0.099→0.089, 상속 신고세액공제 3%→5%, 세대생략 가산 30%→40% 모두 22건 green)
// 그래서 여기 한 곳에만 하드코딩된 리터럴을 둔다. 세법이 실제로 개정되면 이 테스트가 가장 먼저 red가 되고,
// 그때 값을 고치는 행위가 곧 "개정을 확인했다"는 서명이 된다.
describe("파생 다이제스트 — 엔진 리터럴 앵커", () => {
  it("상수가 바뀌면 여기가 먼저 red가 된다", () => {
    // 증여 3억(성년 자녀) — (3억 − 5천만) × 20% − 누진공제 1천만 = 4,000만, 신고세액공제 3% 후 3,880만
    expect(calculateGiftTax(GIFT_BASE).taxableAmount).toBe(250_000_000);
    expect(calculateGiftTax(GIFT_BASE).calculatedTax).toBe(40_000_000);
    expect(calculateGiftTax(GIFT_BASE).filingDeduction).toBe(1_200_000);
    expect(calculateGiftTax(GIFT_BASE).totalTax).toBe(38_800_000);
    // 상속 20억(배우자·자녀 2명·금융 5억) — 산출세액과 신고세액공제 3%를 따로 못박는다
    const inh = calculateInheritanceTax(INHERITANCE_BASE);
    expect(inh.taxBase).toBe(540_000_000);
    expect(inh.calculatedTax).toBe(102_000_000);
    expect(inh.filingDeduction).toBe(3_060_000);
    expect(inh.totalTax).toBe(98_940_000);
    // 세대생략 가산 30% — 산문 h3가 이 비율을 문자 그대로 인용하므로 상수와 함께 움직이면 안 된다
    const skip = calculateGiftTax({ ...GIFT_BASE, giftAmount: 1_000_000_000, isGenerationSkipping: true });
    expect(skip.basicTax).toBe(225_000_000);
    expect(skip.surcharge).toBe(67_500_000);
    // 제69조② 괄호: 제57조 가산액도 신고세액공제 대상이므로 기본세액 + 가산액 전체에 3%가 붙는다
    expect(skip.calculatedTax).toBe(292_500_000);
    expect(skip.filingDeduction).toBe(8_775_000);
    expect(skip.totalTax).toBe(283_725_000);
    // ISA 분리과세 9.9% / 일반계좌 15.4%
    const isa = calculateIsaCompare(12_000_000, 0.05, 3);
    expect(isa.totalProfit).toBe(3_721_500);
    expect(isa.isaTax).toBe(170_428);
    expect(isa.normalTax).toBe(573_111);
    expect(isa.taxSaving).toBe(402_683);
    // 국내 배당 15.4% (현지 0%인 홍콩은 국내 원천징수만 남는다)
    expect(calculateDividendTax(10_000_000, "HK").totalTax).toBe(1_540_000);
  });
});

describe("파생 다이제스트 — 인용 수치 엔진 재계산 일치 (이자·양도)", () => {
  const sav = (patch: Partial<typeof SAVINGS_BASE> = {}) => calculateSavingsInterest({ ...SAVINGS_BASE, ...patch });
  const dep = (patch: Partial<typeof DEPOSIT_BASE> = {}) => calculateDepositInterest({ ...DEPOSIT_BASE, ...patch });
  const cry = (gain: number, expenses = 0) => calculateCryptoTax(0, gain, expenses);
  const fs = (patch: Partial<typeof FOREIGN_BASE> = {}) => calculateForeignStockTax({ ...FOREIGN_BASE, ...patch });

  it("/savings-interest: 실효 수익률·연환산·한계 효율·예금 교차·계단", () => {
    const base = sav();
    for (const v of [won(base.totalPrincipal), won(base.grossInterest), won(base.tax), won(base.netInterest), won(base.maturityAmount)]) {
      expect(bodyOf(SAVINGS_INTEREST_DIGEST, 0)).toContain(v);
    }
    expect(SAVINGS_INTEREST_DIGEST[0].h2).toContain(pct(base.effectiveRate, 4));
    // 실효 수익률이 월 납입액과 무관하다 — 소수점 여섯째 자리 아래에서만 갈린다
    const small = sav({ monthlyDeposit: 100_000 });
    const big = sav({ monthlyDeposit: 5_000_000 });
    expect(Math.abs(small.effectiveRate - big.effectiveRate)).toBeLessThan(1e-6);
    expect(bodyOf(SAVINGS_INTEREST_DIGEST, 2)).toContain(pct(small.effectiveRate, 6));
    expect(bodyOf(SAVINGS_INTEREST_DIGEST, 2)).toContain(pct(big.effectiveRate, 6));
    // 한계 효율 = 평균의 정확히 2배
    const next = sav({ months: SAVINGS_BASE.months + 1 });
    const marginal = (next.grossInterest - base.grossInterest) / SAVINGS_BASE.monthlyDeposit;
    const average = base.grossInterest / base.totalPrincipal;
    expect(marginal / average).toBeCloseTo(2, 12);
    expect(bodyOf(SAVINGS_INTEREST_DIGEST, 3)).toContain(won(next.grossInterest - base.grossInterest));
    expect(bodyOf(SAVINGS_INTEREST_DIGEST, 3)).toContain(pct(marginal, 4));
    // 과세 유형 세 갈래
    for (const v of [won(base.netInterest), won(sav({ taxType: "preferential" }).netInterest), won(sav({ taxType: "tax_free" }).netInterest)]) {
      expect(bodyOf(SAVINGS_INTEREST_DIGEST, 4)).toContain(v);
    }
    // 예금 교차 배수 = 2n/(n+1)
    const asDeposit = calculateDepositInterest({
      principal: base.totalPrincipal,
      months: SAVINGS_BASE.months,
      annualRate: SAVINGS_BASE.annualRate,
      taxType: "normal",
      paymentType: "maturity",
    });
    expect(asDeposit.grossInterest / base.grossInterest).toBeCloseTo(
      (2 * SAVINGS_BASE.months) / (SAVINGS_BASE.months + 1),
      12,
    );
    expect(SAVINGS_INTEREST_DIGEST[5].h2).toContain(`${(asDeposit.grossInterest / base.grossInterest).toFixed(2)}배`);
    // 절반 시점의 누적 이자
    const half = base.monthlyData[SAVINGS_BASE.months / 2 - 1].interest;
    expect(SAVINGS_INTEREST_DIGEST[7].h2).toContain(pct(half / base.grossInterest, 2));
    expect(bodyOf(SAVINGS_INTEREST_DIGEST, 7)).toContain(won(half));
    // 반올림 계단 — 산문이 적은 폭만큼은 이자가 1원도 늘지 않는다
    const step = Number(SAVINGS_INTEREST_DIGEST[8].h2.match(/월 납입액 (\d+)원/)![1]);
    expect(sav({ monthlyDeposit: SAVINGS_BASE.monthlyDeposit + step }).grossInterest).toBe(base.grossInterest);
    expect(sav({ monthlyDeposit: SAVINGS_BASE.monthlyDeposit + step + 1 }).grossInterest).toBe(base.grossInterest + 1);
  });

  it("/deposit-interest: 지급 방식 발산·표시 정합·대칭 붕괴·문턱", () => {
    const atMaturity = dep();
    const perMonth = dep({ paymentType: "monthly" });
    for (const v of [won(atMaturity.grossInterest), won(atMaturity.netInterest), won(perMonth.grossInterest), won(perMonth.netInterest)]) {
      expect(bodyOf(DEPOSIT_INTEREST_DIGEST, 0)).toContain(v);
    }
    expect(DEPOSIT_INTEREST_DIGEST[0].h2).toContain(won(perMonth.grossInterest - atMaturity.grossInterest));
    // 유불리가 원금에 따라 삼등분된다 — 산문이 적은 세 숫자를 다시 센다
    let ahead = 0;
    let behind = 0;
    let level = 0;
    for (let principal = 1_000_000; principal <= 100_000_000; principal += 100_000) {
      const gap = dep({ principal, paymentType: "monthly" }).grossInterest - dep({ principal }).grossInterest;
      if (gap > 0) ahead += 1;
      else if (gap < 0) behind += 1;
      else level += 1;
    }
    expect(ahead + behind + level).toBe(991);
    for (const v of [num(ahead), num(behind), num(level)]) expect(bodyOf(DEPOSIT_INTEREST_DIGEST, 1)).toContain(v);
    // 표시 월이자 × 개월수 ≠ 총 세후이자
    const drift = perMonth.monthlyInterestNet * DEPOSIT_BASE.months - perMonth.netInterest;
    expect(drift).not.toBe(0);
    expect(bodyOf(DEPOSIT_INTEREST_DIGEST, 2)).toContain(won(perMonth.monthlyInterestNet));
    expect(bodyOf(DEPOSIT_INTEREST_DIGEST, 2)).toContain(won(Math.abs(drift)));
    // 세후 월이자 계단 — h3가 적은 폭 전체에서 값이 같다
    const width = Number(DEPOSIT_INTEREST_DIGEST[3].h2.match(/원금 ([\d,]+)원/)![1].replace(/,/g, ""));
    const start = Number(bodyOf(DEPOSIT_INTEREST_DIGEST, 3).match(/원금을 ([\d,]+)원과/)![1].replace(/,/g, ""));
    const value = dep({ principal: start, paymentType: "monthly" }).monthlyInterestNet;
    for (const offset of [0, 1, width - 2, width - 1]) {
      expect(dep({ principal: start + offset, paymentType: "monthly" }).monthlyInterestNet, `${offset}`).toBe(value);
    }
    expect(dep({ principal: start - 1, paymentType: "monthly" }).monthlyInterestNet).not.toBe(value);
    expect(dep({ principal: start + width, paymentType: "monthly" }).monthlyInterestNet).not.toBe(value);
    // 금리 2배 ≡ 기간 2배는 만기일시에서만 성립
    expect(dep({ annualRate: DEPOSIT_BASE.annualRate * 2 }).grossInterest).toBe(dep({ months: DEPOSIT_BASE.months * 2 }).grossInterest);
    expect(dep({ annualRate: DEPOSIT_BASE.annualRate * 2, paymentType: "monthly" }).grossInterest).not.toBe(
      dep({ months: DEPOSIT_BASE.months * 2, paymentType: "monthly" }).grossInterest,
    );
    // 종합과세 문턱 원금 — 한 칸 아래는 넘지 않고 그 원금부터 넘는다
    const edge = Number(bodyOf(DEPOSIT_INTEREST_DIGEST, 6).match(/원금이 ([\d,]+)원을 넘어야/)![1].replace(/,/g, ""));
    expect(dep({ principal: edge }).grossInterest).toBeGreaterThan(DIVIDEND_TAX.FINANCIAL_INCOME_THRESHOLD);
    expect(dep({ principal: edge - 1 }).grossInterest).toBe(DIVIDEND_TAX.FINANCIAL_INCOME_THRESHOLD);
    // 기간 선형성 1:2:4:6
    const byMonth = [6, 12, 24, 36].map((months) => dep({ months }).grossInterest);
    expect(byMonth).toEqual([byMonth[0], byMonth[0] * 2, byMonth[0] * 4, byMonth[0] * 6]);
    for (const v of byMonth) expect(bodyOf(DEPOSIT_INTEREST_DIGEST, 8)).toContain(won(v));
  });

  it("/crypto-tax: 실효세율 점근·내림 경계·분할 포화·해외주식 대조", () => {
    const base = calculateCryptoTax(CRYPTO_BASE.purchaseAmount, CRYPTO_BASE.saleAmount, CRYPTO_BASE.expenses);
    for (const v of [won(base.totalGain), won(base.deduction), won(base.taxableAmount), won(base.incomeTax), won(base.localTax), won(base.totalTax), won(base.netProfit)]) {
      expect(bodyOf(CRYPTO_TAX_DIGEST, 0)).toContain(v);
    }
    expect(CRYPTO_TAX_DIGEST[0].h2).toContain(pct(base.effectiveRate, 0));
    // 실효세율 = 명목세율 − 고정 감액 ÷ 차익. 고정 감액은 차익과 무관하게 일정하다.
    const fixedAt = (gain: number) => Math.round(gain * CRYPTO_TAX.TOTAL_RATE - cry(gain).totalTax);
    expect(fixedAt(25_000_000)).toBe(fixedAt(1_000_000_000));
    expect(bodyOf(CRYPTO_TAX_DIGEST, 1)).toContain(won(fixedAt(1_000_000_000)));
    expect(CRYPTO_TAX_DIGEST[1].h2).toContain(won(fixedAt(1_000_000_000)));
    // 공제 경계: 1원 초과에서 0원, 5원 초과에서 소득세 1원, 50원 초과에서 지방소득세 1원
    const d = CRYPTO_TAX.BASIC_DEDUCTION;
    expect(cry(d + 1).totalTax).toBe(0);
    expect(cry(d + 4).totalTax).toBe(0);
    expect(cry(d + 5).totalTax).toBe(1);
    expect(cry(d + 49).localTax).toBe(0);
    expect(cry(d + 50).localTax).toBe(1);
    expect(bodyOf(CRYPTO_TAX_DIGEST, 2)).toContain(won(d + 50));
    // 수익 2배 → 세금 배수가 2를 아래로 뚫지 않는다
    for (const gain of [3_000_000, 10_000_000, 50_000_000, 200_000_000]) {
      expect(cry(gain * 2).totalTax / cry(gain).totalTax, `${gain}`).toBeGreaterThan(2);
    }
    expect(bodyOf(CRYPTO_TAX_DIGEST, 3)).toContain(num(cry(6_000_000).totalTax / cry(3_000_000).totalTax, 2));
    // 분할: 회당 절감 = 공제 × 세율, 네 번째에서 0원 도달 후 포화
    const total = 10_000_000;
    const at = (rounds: number) => cry(Math.floor(total / rounds)).totalTax * rounds;
    expect(at(1) - at(2)).toBe(Math.round(d * CRYPTO_TAX.TOTAL_RATE));
    expect(at(4)).toBe(0);
    expect(at(5)).toBe(0);
    expect(bodyOf(CRYPTO_TAX_DIGEST, 4)).toContain(won(at(3)));
    // 해외주식 계산기와의 1원 어긋남 — 산문이 적은 지점에서 실제로 갈린다
    const gain = Number(bodyOf(CRYPTO_TAX_DIGEST, 6).match(/양도차익 ([\d,]+)원을 가정/)![1].replace(/,/g, ""));
    const here = cry(gain).totalTax;
    const there = calculateForeignStockTax({ sellAmount: gain, buyAmount: 0, fees: 0, otherGains: 0, otherLosses: 0 }).totalTax;
    expect(there - here).toBe(1);
    expect(bodyOf(CRYPTO_TAX_DIGEST, 6)).toContain(won(here));
    expect(bodyOf(CRYPTO_TAX_DIGEST, 6)).toContain(won(there));
    // 세후 수익 배수는 2배 아래에서 올라온다
    for (const g of [5_000_000, 20_000_000, 100_000_000]) {
      expect(cry(g * 2).netProfit / cry(g).netProfit, `${g}`).toBeLessThan(2);
    }
    expect(CRYPTO_TAX_DIGEST[7].h2).toContain(`${(cry(10_000_000).netProfit / cry(5_000_000).netProfit).toFixed(2)}배`);
    // 공제 이하로 25년 분산하면 세금 0원
    expect(cry(d).totalTax).toBe(0);
    expect(cry(d * 25).taxableAmount).toBe(d * 24);
    expect(bodyOf(CRYPTO_TAX_DIGEST, 9)).toContain(won(cry(d * 25).totalTax));
  });

  it("/foreign-stock-tax: 손익통산 값어치·연도 경계·환율·입력 되돌림", () => {
    const base = fs();
    for (const v of [won(base.netProfit), won(base.totalTax), won(base.taxableAmount)]) {
      expect(bodyOf(FOREIGN_STOCK_TAX_DIGEST, 0)).toContain(v);
    }
    expect(FOREIGN_STOCK_TAX_DIGEST[0].h2).toContain(pct(base.effectiveRate, 2));
    // 필요경비 한 줄의 값어치
    expect(bodyOf(FOREIGN_STOCK_TAX_DIGEST, 0)).toContain(won(fs({ fees: 0 }).totalTax - base.totalTax));
    // 손실의 값어치는 22%이고 산문이 적은 지점에서 정확히 0원이 된다
    expect(base.totalTax - fs({ otherLosses: 5_000_000 }).totalTax).toBe(Math.round(5_000_000 * base.combinedTaxRate));
    const zeroPoint = Number(bodyOf(FOREIGN_STOCK_TAX_DIGEST, 1).match(/손실이 ([\d,]+)원을 채워야/)![1].replace(/,/g, ""));
    expect(fs({ otherLosses: zeroPoint }).totalTax).toBe(0);
    expect(fs({ otherLosses: zeroPoint - 1 }).totalTax).toBeGreaterThan(0);
    expect(fs({ otherLosses: zeroPoint + 2_000_000 }).totalTax).toBe(0);
    // 같은 해 통산과 해를 가른 경우의 차액
    const together = calculateForeignStockTax({ sellAmount: 20_000_000, buyAmount: 0, fees: 0, otherGains: 0, otherLosses: 10_000_000 });
    const winYear = calculateForeignStockTax({ sellAmount: 20_000_000, buyAmount: 0, fees: 0, otherGains: 0, otherLosses: 0 });
    const loseYear = calculateForeignStockTax({ sellAmount: 0, buyAmount: 10_000_000, fees: 0, otherGains: 0, otherLosses: 0 });
    expect(loseYear.totalTax).toBe(0);
    expect(FOREIGN_STOCK_TAX_DIGEST[2].h2).toContain(manwon(winYear.totalTax + loseYear.totalTax - together.totalTax));
    // 환율 경계 — 산문이 적은 상승률 바로 위에서 세금이 처음 붙는다
    const rise = Number(FOREIGN_STOCK_TAX_DIGEST[3].h2.match(/환율 ([\d.]+)%/)![1]) / 100;
    const sellAt = (r: number) => Math.round(FOREIGN_BASE.buyAmount * (1 + r));
    expect(fs({ sellAmount: sellAt(rise) }).totalTax).toBe(0);
    expect(fs({ sellAmount: sellAt(rise) + 100 }).totalTax).toBeGreaterThan(0);
    // 매도금액만으로는 세금이 정해지지 않는다
    const sameTax = fs({ sellAmount: 500_000_000, buyAmount: 480_000_000 });
    expect(sameTax.totalTax).toBe(base.totalTax);
    expect(bodyOf(FOREIGN_STOCK_TAX_DIGEST, 5)).toContain(won(sameTax.totalTax));
    // sanitize: 범위 밖·소수점·음수가 잘리지 않고 기본값으로 되돌아간다
    for (const bad of [70_000_000.5, 60_000_000_000, -1]) {
      expect(calculateForeignStockTax({ ...FOREIGN_BASE, sellAmount: bad }).totalTax, `${bad}`).toBe(base.totalTax);
    }
    expect(calculateForeignStockTax({ ...FOREIGN_BASE, sellAmount: 70_000_000 }).totalTax).not.toBe(base.totalTax);
    expect(bodyOf(FOREIGN_STOCK_TAX_DIGEST, 6)).toContain(won(calculateForeignStockTax({ ...FOREIGN_BASE, sellAmount: 70_000_000 }).totalTax));
    // 다른 종목 이익과 매도금액 인상이 완전히 같다
    expect(fs({ sellAmount: FOREIGN_BASE.sellAmount + 10_000_000 }).totalTax).toBe(fs({ otherGains: 10_000_000 }).totalTax);
    // 같은 1,000만원의 한계 세부담이 공제 소진 여부로 갈린다
    const rich = fs({ otherGains: 10_000_000 }).totalTax - base.totalTax;
    const thinBase = fs({ otherLosses: 18_500_000 });
    const thin = fs({ otherLosses: 18_500_000, otherGains: 10_000_000 }).totalTax - thinBase.totalTax;
    expect(thinBase.totalTax).toBe(0);
    expect(thin).toBeLessThan(rich);
    expect(bodyOf(FOREIGN_STOCK_TAX_DIGEST, 8)).toContain(won(rich));
    expect(bodyOf(FOREIGN_STOCK_TAX_DIGEST, 8)).toContain(won(thin));
  });
});

// 세율·공제 상수를 따라 산문이 다시 쓰이므로, 엔진에서 값을 읽어 비교하는 위 테스트는
// 상수가 틀려도 산문과 함께 움직여 통과한다. 이자·양도 네 페이지의 앵커를 여기 한 곳에 리터럴로 둔다.
describe("파생 다이제스트 — 이자·양도 엔진 리터럴 앵커", () => {
  it("이자소득세 15.4%·조합 5.9%·양도 22%·공제 250만원이 바뀌면 여기가 먼저 red가 된다", () => {
    // 적금 월 30만원·12개월·연 3.5% — 이자 = 300,000 × (0.035/12) × 78
    const sav = calculateSavingsInterest(SAVINGS_BASE);
    expect(sav.totalPrincipal).toBe(3_600_000);
    expect(sav.grossInterest).toBe(68_250);
    expect(sav.tax).toBe(10_511);
    expect(sav.netInterest).toBe(57_739);
    expect(calculateSavingsInterest({ ...SAVINGS_BASE, taxType: "preferential" }).netInterest).toBe(64_223);
    expect(calculateSavingsInterest({ ...SAVINGS_BASE, taxType: "tax_free" }).netInterest).toBe(68_250);
    expect(INTEREST_TAX.NORMAL_RATE).toBe(0.154);
    // 예금 1,000만원·12개월·연 3.5% — 만기일시와 월이자식이 4원 갈린다
    const atMaturity = calculateDepositInterest(DEPOSIT_BASE);
    expect(atMaturity.grossInterest).toBe(350_000);
    expect(atMaturity.tax).toBe(53_900);
    expect(atMaturity.netInterest).toBe(296_100);
    const perMonth = calculateDepositInterest({ ...DEPOSIT_BASE, paymentType: "monthly" });
    expect(perMonth.monthlyInterestGross).toBe(29_167);
    expect(perMonth.monthlyInterestNet).toBe(24_675);
    expect(perMonth.grossInterest).toBe(350_004);
    expect(perMonth.netInterest).toBe(296_103);
    // 가상자산 1,000만원 → 1,500만원 — (500만 − 250만) × 20% + × 2%
    const crypto = calculateCryptoTax(CRYPTO_BASE.purchaseAmount, CRYPTO_BASE.saleAmount, CRYPTO_BASE.expenses);
    expect(crypto.taxableAmount).toBe(2_500_000);
    expect(crypto.incomeTax).toBe(500_000);
    expect(crypto.localTax).toBe(50_000);
    expect(crypto.totalTax).toBe(550_000);
    expect(CRYPTO_TAX.BASIC_DEDUCTION).toBe(2_500_000);
    // 해외주식 기본값 — (1,950만 − 250만) × 22%
    const foreign = calculateForeignStockTax(FOREIGN_BASE);
    expect(foreign.gain).toBe(19_500_000);
    expect(foreign.taxableAmount).toBe(17_000_000);
    expect(foreign.incomeTax).toBe(3_400_000);
    expect(foreign.localTax).toBe(340_000);
    expect(foreign.totalTax).toBe(3_740_000);
  });
});

// 산문 서술(부등호 방향·인과·무조건 단언)은 숫자 재계산만으로는 검증되지 않는다.
// 09-06 QA가 찾은 오류 그대로를 반증 형태로 못박아, 문장이 되돌아가면 red가 나게 한다.
describe("파생 다이제스트 — 산문 서술 반증", () => {
  const g = (patch: Partial<typeof GIFT_BASE> = {}) => calculateGiftTax({ ...GIFT_BASE, ...patch });
  const h = (patch: Partial<typeof INHERITANCE_BASE> = {}) => calculateInheritanceTax({ ...INHERITANCE_BASE, ...patch });

  it("inheritance#6: 채무 절감액은 두 구간세율 사이에 놓인다", () => {
    const base = h();
    const withDebt = h({ debt: 100_000_000 });
    const drop = base.taxBase - withDebt.taxBase;
    const saving = base.totalTax - withDebt.totalTax;
    // 잘려 나간 과세표준이 5억 경계를 걸치므로 절감액은 낮은 구간세율 위, 원래 구간세율 아래다.
    expect(withDebt.appliedRate).toBeLessThan(base.appliedRate);
    expect(saving).toBeGreaterThan(drop * withDebt.appliedRate);
    expect(saving).toBeLessThan(drop * base.appliedRate);
    // 산문이 기준으로 삼는 값이 낮은 구간세율 쪽인지 확인한다(30%만 기준으로 삼으면 red).
    expect(bodyOf(INHERITANCE_TAX_DIGEST, 5)).toContain(won(drop * withDebt.appliedRate));
    expect(bodyOf(INHERITANCE_TAX_DIGEST, 5)).toContain(won(drop * base.appliedRate));
  });

  it("isa#1: 절세액 1차식은 비과세 한도 아래에서 깨진다", () => {
    const small = calculateIsaCompare(1_000_000, 0.05, 3);
    expect(small.isaTax).toBe(0);
    expect(small.taxSaving).toBe(small.normalTax);
    const rateGap = ISA_TAX.NORMAL_ACCOUNT_TAX_RATE - ISA_TAX.SEPARATE_TAX_RATE;
    const linear = rateGap * small.totalProfit + ISA_TAX.GENERAL_TAX_FREE_LIMIT * ISA_TAX.SEPARATE_TAX_RATE;
    expect(Math.abs(small.taxSaving - linear)).toBeGreaterThan(100_000);
    // 수익 0원이면 절세액도 0원 — 1차식은 여기서 고정 몫을 통째로 지어낸다.
    expect(calculateIsaCompare(0, 0.05, 3).taxSaving).toBe(0);
    // 그러므로 산문은 조건을 밝혀야 한다: h3에 한도가, 본문에 반례 수치가 있어야 한다.
    expect(ISA_DIGEST[0].h2).toContain(manwon(ISA_TAX.GENERAL_TAX_FREE_LIMIT));
    expect(ISA_DIGEST[0].body).toContain(won(small.taxSaving));
    expect(ISA_DIGEST[0].body).not.toContain("수익이 얼마든");
  });

  it("gift#3: 경계 위 한계세율은 경계 아래 세율이 아니라 다음 구간 세율이다", () => {
    const avail = g().availableDeduction;
    const overRates = [100_000_000, 500_000_000, 1_000_000_000].map(
      (taxBase) => g({ giftAmount: taxBase + avail + 1 }).appliedRate,
    );
    expect(overRates).toEqual([0.2, 0.3, 0.4]);
    for (const r of overRates) expect(bodyOf(GIFT_TAX_DIGEST, 2), pct(r, 0)).toContain(pct(r, 0));
    // 첫 경계에서만 두 배이고 나머지는 1.5배·1.33배라 "두 배"는 h3에 쓸 수 없다.
    expect(overRates[2] / overRates[1]).toBeLessThan(1.5);
    expect(GIFT_TAX_DIGEST[2].h2).not.toContain("두 배");
  });

  it("gift#5: 공제 한도 이하에서는 세대생략과 2단 증여의 우열이 없다", () => {
    const limit = g().deductionLimit;
    expect(g({ giftAmount: limit, isGenerationSkipping: true }).totalTax).toBe(0);
    expect(g({ giftAmount: limit }).totalTax).toBe(0);
    expect(bodyOf(GIFT_TAX_DIGEST, 4)).not.toContain("언제나");
    expect(bodyOf(GIFT_TAX_DIGEST, 4)).toContain(won(limit));
  });

  it("gift#9: 실효세율은 100억 위에서도 계속 오른다", () => {
    expect(g({ giftAmount: 20_000_000_000 }).effectiveRate).toBeGreaterThan(
      g({ giftAmount: 10_000_000_000 }).effectiveRate,
    );
    expect(GIFT_TAX_DIGEST[8].h2).not.toContain("멈춘");
  });

  it("isa#7: 세금 배수의 수렴점은 1.60배가 아니라 세율 비율이다", () => {
    const heavy = calculateIsaCompare(20_000_000, 0.2, 5);
    const rateRatio = ISA_TAX.NORMAL_ACCOUNT_TAX_RATE / ISA_TAX.SEPARATE_TAX_RATE;
    expect(heavy.normalTax / heavy.isaTax).toBeGreaterThan(rateRatio);
    expect(ISA_DIGEST[6].h2).not.toContain("수렴");
  });
});

// 09-06 QA가 찾은 오류 네 가지(부등호 반대·무조건 단언·한 칸 어긋난 세율·h3와 본문 모순)를
// 이자·양도 네 페이지에도 그대로 적용한다. 여기서 검사하는 것은 숫자가 아니라 문장이 주장하는 관계다.
describe("파생 다이제스트 — 산문 서술 반증 (이자·양도)", () => {
  const sav = (patch: Partial<typeof SAVINGS_BASE> = {}) => calculateSavingsInterest({ ...SAVINGS_BASE, ...patch });
  const dep = (patch: Partial<typeof DEPOSIT_BASE> = {}) => calculateDepositInterest({ ...DEPOSIT_BASE, ...patch });
  const cry = (gain: number) => calculateCryptoTax(0, gain, 0);
  const fs = (patch: Partial<typeof FOREIGN_BASE> = {}) => calculateForeignStockTax({ ...FOREIGN_BASE, ...patch });
  const annualised = (months: number) => (sav({ months }).effectiveRate * 12) / months;

  it("savings#2: 연환산 비율은 단조 감소하고 세후 배수의 절반을 뚫지 않는다", () => {
    // "기간을 늘릴수록 내려간다"는 방향 주장 — 600개월까지 한 번도 뒤집히지 않아야 성립한다.
    for (let months = 2; months <= 600; months += 1) {
      expect(annualised(months), `${months}`).toBeLessThan(annualised(months - 1));
    }
    // "그 아래로 내려가는 기간은 없다"는 하한 주장 — 하한은 명목세율의 절반이 아니라 세후 배수의 절반이다.
    const base = sav();
    const floor = (1 - base.tax / base.grossInterest) / 2;
    expect(annualised(600) / (SAVINGS_BASE.annualRate / 100)).toBeGreaterThan(floor);
    expect(floor).toBeLessThan(0.5);
    expect(SAVINGS_INTEREST_DIGEST[1].body).toContain(pct(floor, 1));
    // 실제로 접근하기만 할 뿐 도달하지 않으므로 "수렴"·"멈춘다"로 마무리하면 안 된다.
    expect(SAVINGS_INTEREST_DIGEST[1].h2).not.toContain("수렴");
    expect(SAVINGS_INTEREST_DIGEST[1].h2).not.toContain("멈춘");
  });

  it("savings#4: 한계 대 평균 2배는 기간과 무관한 항등식이다", () => {
    for (const months of [1, 2, 6, 12, 36, 120, 360]) {
      const at = sav({ months });
      const next = sav({ months: months + 1 });
      const marginal = (next.grossInterest - at.grossInterest) / SAVINGS_BASE.monthlyDeposit;
      const average = at.grossInterest / at.totalPrincipal;
      expect(marginal / average, `${months}`).toBeCloseTo(2, 9);
    }
    // "정확히"라고 쓴 이상 반올림으로 깨지는 조합이 없어야 한다.
    expect(SAVINGS_INTEREST_DIGEST[3].body).toContain("정확히");
  });

  it("savings#5: 과세 혜택의 금리 환산값은 고정이 아니라 금리에 비례한다", () => {
    const bumpAt = (rate: number) => {
      const target = sav({ annualRate: rate, taxType: "tax_free" }).netInterest;
      let low = rate;
      let high = rate * 2;
      for (let i = 0; i < 60; i += 1) {
        const mid = (low + high) / 2;
        if (sav({ annualRate: mid, taxType: "normal" }).netInterest < target) low = mid;
        else high = mid;
      }
      return (low + high) / 2 - rate;
    };
    expect(bumpAt(2)).toBeLessThan(bumpAt(SAVINGS_BASE.annualRate));
    expect(bumpAt(SAVINGS_BASE.annualRate)).toBeLessThan(bumpAt(5));
    // 그래서 "0.6371%p 올린 것과 같다"는 h3는 반드시 기준 금리와 함께 읽혀야 한다.
    expect(SAVINGS_INTEREST_DIGEST[4].body).toContain("연 2%");
    expect(SAVINGS_INTEREST_DIGEST[4].body).toContain("연 5%");
  });

  it("savings#6: 예금 대 적금 배수는 2배로 올라가되 닿지 않는다", () => {
    let previous = 0;
    for (let months = 1; months <= 600; months += 1) {
      const ratio =
        calculateDepositInterest({
          principal: SAVINGS_BASE.monthlyDeposit * months,
          months,
          annualRate: SAVINGS_BASE.annualRate,
          taxType: "normal",
          paymentType: "maturity",
        }).grossInterest / sav({ months }).grossInterest;
      expect(ratio, `${months}`).toBeLessThan(2);
      if (months > 1) expect(ratio, `${months}`).toBeGreaterThan(previous);
      previous = ratio;
    }
    expect(SAVINGS_INTEREST_DIGEST[5].h2).not.toContain("2배다");
  });

  it("deposit#2: 월이자 방식이 늘 유리하지는 않다", () => {
    let cheaper = 0;
    for (let principal = 1_000_000; principal <= 100_000_000; principal += 100_000) {
      if (dep({ principal, paymentType: "monthly" }).grossInterest < dep({ principal }).grossInterest) cheaper += 1;
    }
    expect(cheaper).toBeGreaterThan(0);
    for (const finding of [DEPOSIT_INTEREST_DIGEST[0], DEPOSIT_INTEREST_DIGEST[1]]) {
      expect(`${finding.h2} ${finding.body}`).not.toContain("언제나");
      expect(`${finding.h2} ${finding.body}`).not.toContain("항상");
    }
    // 4원 격차는 기본 원금에서만 성립하므로 h3가 아니라 본문이 조건을 밝혀야 한다.
    expect(DEPOSIT_INTEREST_DIGEST[0].body).toContain(won(DEPOSIT_BASE.principal));
  });

  it("deposit#6: 실효 수익률 역전은 지표 탓이고 연환산하면 순서가 돌아온다", () => {
    const rows = [
      { rate: 3.5, months: 36 },
      { rate: 5, months: 12 },
      { rate: 8, months: 6 },
    ].map(({ rate, months }) => {
      const r = dep({ principal: 30_000_000, annualRate: rate, months });
      return { rate, months, effective: r.effectiveRate, annual: (r.effectiveRate * 12) / months };
    });
    // 표면금리 오름차순으로 실효 수익률은 내려간다(역전).
    expect(rows[0].effective).toBeGreaterThan(rows[1].effective);
    expect(rows[1].effective).toBeGreaterThan(rows[2].effective);
    // 연환산하면 표면금리와 같은 방향으로 되돌아온다.
    expect(rows[0].annual).toBeLessThan(rows[1].annual);
    expect(rows[1].annual).toBeLessThan(rows[2].annual);
    for (const row of rows) {
      expect(DEPOSIT_INTEREST_DIGEST[5].body).toContain(pct(row.effective, 4));
      expect(DEPOSIT_INTEREST_DIGEST[5].body).toContain(pct(row.annual, 4));
    }
  });

  it("crypto#2: 실효세율은 22%에 닿지 않지만 어디서도 멈추지 않는다", () => {
    expect(cry(20_000_000_000).effectiveRate).toBeGreaterThan(cry(10_000_000_000).effectiveRate);
    expect(cry(20_000_000_000).effectiveRate).toBeLessThan(CRYPTO_TAX.TOTAL_RATE);
    expect(CRYPTO_TAX_DIGEST[1].h2).not.toContain("멈춘");
    expect(CRYPTO_TAX_DIGEST[1].body).not.toContain("수렴");
  });

  it("crypto#5: 회당 절감이 같다는 단언은 나눠떨어지지 않는 분할에서 깨진다", () => {
    const total = 10_000_000;
    const at = (rounds: number) => cry(Math.floor(total / rounds)).totalTax * rounds;
    const perRound = at(1) - at(2);
    expect(at(2) - at(3)).not.toBe(perRound);
    // 그러므로 본문은 어긋난 폭과 그 원인(잘린 끝자리)을 함께 적어야 한다.
    expect(CRYPTO_TAX_DIGEST[4].body).toContain(won(at(2) - at(3) - perRound));
    expect(CRYPTO_TAX_DIGEST[4].body).toContain(won(Math.floor(total / 3) * 3));
  });

  it("crypto#6: 필요경비 1원의 값어치는 차익에 따라 갈린다", () => {
    const worths = new Set<number>();
    for (let gain = 3_000_000; gain < 3_000_100; gain += 1) {
      worths.add(cry(gain).totalTax - calculateCryptoTax(0, gain, 1).totalTax);
    }
    expect(worths.size).toBeGreaterThan(1);
    expect(worths.has(0)).toBe(true);
    // h3가 "1원이 2원을 줄인다"로 단정하면 위 반례에서 거짓이 되므로 폭을 밝혀야 한다.
    expect(CRYPTO_TAX_DIGEST[5].h2).toContain("0원일 때도");
    for (const worth of worths) expect(CRYPTO_TAX_DIGEST[5].body).toContain(won(worth));
  });

  it("foreign#2: 손실의 22% 값어치는 공제선 아래에서 0으로 끊긴다", () => {
    const base = fs();
    const worthOf = (loss: number) => base.totalTax - fs({ otherLosses: loss }).totalTax;
    expect(worthOf(5_000_000) - worthOf(4_000_000)).toBe(Math.round(1_000_000 * base.combinedTaxRate));
    const beyond = worthOf(25_000_000) - worthOf(24_000_000);
    expect(beyond).toBe(0);
    // "손실 1원이 0.22원"이라는 단언이 어디서 끝나는지 본문이 밝혀야 한다.
    expect(FOREIGN_STOCK_TAX_DIGEST[1].body).toContain("값어치가 0원");
    expect(FOREIGN_STOCK_TAX_DIGEST[1].h2).not.toContain("언제나");
  });

  it("foreign#3: 이월공제가 없으므로 실현 순서는 결과를 바꾸지 못한다", () => {
    const win = 20_000_000;
    const lose = 10_000_000;
    const winFirst =
      calculateForeignStockTax({ sellAmount: win, buyAmount: 0, fees: 0, otherGains: 0, otherLosses: 0 }).totalTax +
      calculateForeignStockTax({ sellAmount: 0, buyAmount: lose, fees: 0, otherGains: 0, otherLosses: 0 }).totalTax;
    const loseFirst =
      calculateForeignStockTax({ sellAmount: 0, buyAmount: lose, fees: 0, otherGains: 0, otherLosses: 0 }).totalTax +
      calculateForeignStockTax({ sellAmount: win, buyAmount: 0, fees: 0, otherGains: 0, otherLosses: 0 }).totalTax;
    expect(winFirst).toBe(loseFirst);
    const together = calculateForeignStockTax({ sellAmount: win, buyAmount: 0, fees: 0, otherGains: 0, otherLosses: lose });
    expect(together.totalTax).toBeLessThan(winFirst);
    expect(FOREIGN_STOCK_TAX_DIGEST[2].body).toContain("순서");
  });

  it("foreign#5: 계좌를 나눈 절감액이 공제 하나 값인 것은 양쪽이 공제를 다 쓸 때뿐이다", () => {
    const savedAt = (netGain: number) => {
      const alone = calculateForeignStockTax({ sellAmount: netGain, buyAmount: 0, fees: 0, otherGains: 0, otherLosses: 0 });
      const half = calculateForeignStockTax({ sellAmount: netGain / 2, buyAmount: 0, fees: 0, otherGains: 0, otherLosses: 0 });
      return alone.totalTax - half.totalTax * 2;
    };
    const full = savedAt(20_000_000);
    const small = savedAt(4_000_000);
    expect(full).toBe(Math.round(fs().basicDeduction * fs().combinedTaxRate));
    expect(small).toBeLessThan(full);
    expect(FOREIGN_STOCK_TAX_DIGEST[4].body).toContain(won(small));
    expect(FOREIGN_STOCK_TAX_DIGEST[4].body).toContain("다만");
  });

  it("foreign#9: 추가 이익의 한계 세부담은 남은 공제에 따라 갈린다", () => {
    const base = fs();
    const rich = fs({ otherGains: 10_000_000 }).totalTax - base.totalTax;
    const thin = fs({ otherLosses: 18_500_000, otherGains: 10_000_000 }).totalTax - fs({ otherLosses: 18_500_000 }).totalTax;
    expect(rich).toBe(Math.round(10_000_000 * base.combinedTaxRate));
    expect(thin).toBeLessThan(rich);
    // 22%를 무조건 곱하는 어림셈이 깨지는 구간이라, 본문이 두 비율을 모두 적어야 한다.
    expect(FOREIGN_STOCK_TAX_DIGEST[8].body).toContain(pct(rich / 10_000_000, 0));
    expect(FOREIGN_STOCK_TAX_DIGEST[8].body).toContain(pct(thin / 10_000_000, 2));
  });
});

// 상증세법 제69조는 상속세(①)와 증여세(②)에 똑같이 100분의 3 신고세액공제를 준다.
// 한쪽에만 구현돼 있으면 그 세목만 3% 과다 계산된다 — 대칭을 게이트로 박는다.
describe("신고세액공제 3% — 상속·증여 대칭", () => {
  it("두 세목 모두 산출세액의 3%를 공제한다", () => {
    const gift = calculateGiftTax({ ...GIFT_BASE, giftAmount: 1_000_000_000 });
    const inh = calculateInheritanceTax(INHERITANCE_BASE);
    for (const r of [gift, inh]) {
      expect(r.filingDeduction).toBe(Math.round(r.calculatedTax * 0.03));
      expect(r.totalTax).toBe(r.calculatedTax - r.filingDeduction);
    }
    // 증여 10억(성년 자녀): 225,000,000 × 0.97
    expect(gift.calculatedTax).toBe(225_000_000);
    expect(gift.totalTax).toBe(218_250_000);
  });

  it("제57조 세대생략 가산액도 공제 대상에 포함된다", () => {
    const skip = calculateGiftTax({ ...GIFT_BASE, giftAmount: 1_000_000_000, isGenerationSkipping: true });
    expect(skip.calculatedTax).toBe(skip.basicTax + skip.surcharge);
    // 가산액을 빼고 기본세액에만 3%를 물리면 6,750,000원이 되므로 여기서 갈린다
    expect(skip.filingDeduction).toBe(8_775_000);
    expect(skip.filingDeduction).not.toBe(Math.round(skip.basicTax * 0.03));
  });
});
