import { describe, expect, it } from "vitest";

import {
  CRYPTO_TAX_DIGEST,
  DEPOSIT_INTEREST_DIGEST,
  DIVIDEND_TAX_DIGEST,
  FOREIGN_STOCK_TAX_DIGEST,
  GIFT_TAX_DIGEST,
  INHERITANCE_TAX_DIGEST,
  ISA_DIGEST,
  SAVINGS_INTEREST_DIGEST,
} from "./digests";
import { chunkParagraph, chunkSentences, splitSentences, type Finding } from "./digests/format";
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
} from "./seoGuides";

// BRIEF-V8 loan·invest — 측정 당시 /foreign-stock-tax 계산기 아래 문단이 616자였다(가독성
// 결함: 가이드라인상 문단은 250자 안쪽). 코디네이터 확인 후 범위가 넓어져 invest 11개 가이드
// 전체(허브·홈·9개 계산기 페이지)의 모든 문단·FAQ를 스캔했다. seller 패턴(GuideSection.body:
// string | string[], 문장 경계 청커)을 그대로 재사용했고 다이제스트(엔진 파생 "발견")는
// Finding.body 자체(digests.test.ts의 엔진 재계산 일치 검사 대상)는 바꾸지 않은 채, 화면에
// 실리는 seoGuides.ts의 GuideData.sections 조립 단계에서만 chunkParagraph로 감쌌다.
const MAX_PARAGRAPH_CHARS = 250;

function paragraphsOf(body: string | string[]): string[] {
  return Array.isArray(body) ? body : [body];
}

const ALL_GUIDES: [string, GuideData][] = [
  ["invest-hub", INVEST_HUB_GUIDE],
  ["invest-home", INVEST_HOME_GUIDE],
  ["compound-interest", COMPOUND_INTEREST_GUIDE],
  ["crypto-tax", CRYPTO_TAX_GUIDE],
  ["deposit-interest", DEPOSIT_INTEREST_GUIDE],
  ["dividend-tax", DIVIDEND_TAX_GUIDE],
  ["foreign-stock-tax", FOREIGN_STOCK_TAX_GUIDE],
  ["gift-tax", GIFT_TAX_GUIDE],
  ["inheritance-tax", INHERITANCE_TAX_GUIDE],
  ["isa", ISA_GUIDE],
  ["savings-interest", SAVINGS_INTEREST_GUIDE],
];

describe("invest 가이드 문단 길이 상한 (BRIEF-V8)", () => {
  it.each(ALL_GUIDES)(`%s: 모든 섹션 문단이 ${MAX_PARAGRAPH_CHARS}자를 넘지 않는다`, (page, guide) => {
    for (const section of guide.sections ?? []) {
      for (const paragraph of paragraphsOf(section.body)) {
        expect(
          paragraph.length,
          `[${page}] "${section.h2}" 문단이 ${MAX_PARAGRAPH_CHARS}자를 넘음(${paragraph.length}자): ${paragraph}`,
        ).toBeLessThanOrEqual(MAX_PARAGRAPH_CHARS);
      }
    }
  });

  it.each(ALL_GUIDES)("%s: 모든 FAQ 답변도 상한을 넘지 않는다", (page, guide) => {
    for (const faq of guide.faqs ?? []) {
      expect(faq.a.length, `[${page}] FAQ "${faq.q}"`).toBeLessThanOrEqual(MAX_PARAGRAPH_CHARS);
    }
  });

  // 역방향 확인: 이 상한이 실제로 걸리는지 — 측정 당시의 616자 원문을 그대로 재는다.
  // 이 값이 250 이하라면 위 스위트가 애초에 아무것도 걸러내지 못하는 빈 게이트였다는 뜻이다.
  it("상한이 공허하지 않다 — 쪼개기 전 원문은 실제로 250자를 넘었다", () => {
    const original = FOREIGN_STOCK_TAX_DIGEST.find(
      (f) => f.h2 === "범위를 벗어난 입력은 기본값이 아니라 경계로 잘려 계산된다",
    )!;
    expect(original.body.length).toBeGreaterThan(600);
    // 쪼개지 않았다면(= 이 테스트 파일이나 seoGuides.ts의 chunkParagraph 호출을 되돌리면)
    // 위 "모든 섹션 문단이 250자를 넘지 않는다" 테스트가 foreign-stock-tax에서 바로 red가 된다.
  });
});

describe("invest 가이드 문단 분할 — 문장·숫자 보존 (BRIEF-V8)", () => {
  // 다이제스트(엔진 파생 "발견")는 원본 Finding.body가 그대로 export되어 있으므로, 화면에 실리는
  // 쪼개진 버전을 다시 합치면 원본과 글자 하나까지 같아야 한다 — 이것이 "문장 삭제·숫자 변경 없음"의
  // 가장 강한 증거다(8페이지 × 9개 발견 = 72개 전부 실제 프로덕션 산문으로 검사).
  const DIGESTS: [string, Finding[]][] = [
    ["gift-tax", GIFT_TAX_DIGEST],
    ["inheritance-tax", INHERITANCE_TAX_DIGEST],
    ["isa", ISA_DIGEST],
    ["dividend-tax", DIVIDEND_TAX_DIGEST],
    ["savings-interest", SAVINGS_INTEREST_DIGEST],
    ["deposit-interest", DEPOSIT_INTEREST_DIGEST],
    ["crypto-tax", CRYPTO_TAX_DIGEST],
    ["foreign-stock-tax", FOREIGN_STOCK_TAX_DIGEST],
  ];

  it.each(DIGESTS)("%s: 다이제스트 발견 전체를 재합치면 원문과 정확히 같다", (page, findings) => {
    let checked = 0;
    for (const f of findings) {
      const rejoined = chunkParagraph(f.body).join(" ");
      expect(rejoined, `[${page}] "${f.h2}"`).toBe(f.body);
      checked += 1;
    }
    expect(checked).toBeGreaterThanOrEqual(9);
  });

  it("세무 사실·구체 수치가 남아 있다 — 측정 당시 616자 문단(outOfRangeInputIsClampedNotReset)", () => {
    const target = FOREIGN_STOCK_TAX_GUIDE.sections!.find(
      (s) => s.h2 === "범위를 벗어난 입력은 기본값이 아니라 경계로 잘려 계산된다",
    )!;
    expect(Array.isArray(target.body), "body가 배열(여러 문단)이 아니다").toBe(true);
    const paragraphs = paragraphsOf(target.body);
    expect(paragraphs.length).toBeGreaterThan(1);
    for (const p of paragraphs) expect(p.length).toBeLessThanOrEqual(MAX_PARAGRAPH_CHARS);

    const combined = paragraphs.join(" ");
    // 분할 전 원문에 있던 사실들 — 경계값 클램프, 배너 동작, 되돌아가는 경우의 구분.
    for (const fact of [
      "매도금액만",
      "소수점 아래 5를 붙여도",
      "허용 상한인",
      "경고 배너로 뜨므로",
      "필드 기본값으로 통째로 되돌아갔습니다",
      "숫자로 읽을 수 없는 입력뿐이고",
      "클램프가 아니라 입력이 없는 것",
    ]) {
      expect(combined, fact).toContain(fact);
    }
    // 원본 Finding.body(다이제스트, BRIEF-V8 전부터 있던 엔진 산문)와 재합친 결과가 같아야
    // "재배열만 했다"는 주장이 증명된다.
    const originalFinding = FOREIGN_STOCK_TAX_DIGEST.find((f) => f.h2 === target.h2)!;
    expect(combined).toBe(originalFinding.body);
  });
});

describe("chunkParagraph / chunkSentences (BRIEF-V8 공용 청커)", () => {
  it("250자 이하 문단은 그대로 1개짜리 배열이다", () => {
    const short = "짧은 문단입니다. 두 문장뿐입니다.";
    expect(chunkParagraph(short)).toEqual([short]);
  });

  it("문장 경계에서만 쪼개고 각 조각은 상한을 넘지 않는다", () => {
    const sentences = [
      "첫째 문장은 과세표준 1,000만원을 가정합니다.",
      "둘째 문장은 세율 22%를 적용해 220만원이 산출세액입니다.",
      "셋째 문장은 신고세액공제 3%를 빼 213만 4천원이 최종 세액입니다.",
      "넷째 문장은 이 모든 수치가 예시임을 밝힙니다.",
    ];
    const long = sentences.join(" ");
    const chunked = chunkSentences(splitSentences(long), 80);
    expect(chunked.length).toBeGreaterThan(1);
    for (const p of chunked) expect(p.length).toBeLessThanOrEqual(80);
    // 역방향 확인: 다시 합치면 원문과 같아야 한다 — 문장이 사라지거나 숫자가 바뀌지 않았다.
    expect(chunked.join(" ")).toBe(long);
  });

  it("소수점 숫자(3.5%) 중간에서는 쪼개지 않는다", () => {
    const text =
      "일반과세는 연 3.5%를 가정합니다. 조합 예탁금 우대는 5.9%이고, 비과세는 0%입니다. 세 번째 문장도 있습니다.";
    const sentences = splitSentences(text);
    for (const s of sentences) {
      expect(s).not.toMatch(/^\d+$/); // 숫자 한 조각만 떨어져 나온 문장이 없어야 한다
    }
    expect(sentences.join(" ")).toBe(text);
  });

  it("역방향 확인: 상한을 낮추면 더 잘게 쪼개지고, 상한을 원문 길이보다 크게 두면 쪼개지지 않는다", () => {
    const text = "하나. 둘. 셋. 넷. 다섯.".repeat(10);
    const loose = chunkSentences(splitSentences(text), 10_000);
    const tight = chunkSentences(splitSentences(text), 20);
    expect(loose.length).toBe(1);
    expect(tight.length).toBeGreaterThan(loose.length);
    expect(loose.join(" ")).toBe(text);
    expect(tight.join(" ")).toBe(text);
  });
});
