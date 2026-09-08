import { describe, expect, it } from "vitest";
import {
  DEFAULT_FOREIGN_STOCK_TAX_INPUT,
  foreignStockTaxClampNotices,
  sanitizeForeignStockTaxInput,
} from "@/lib/foreignStockTaxValidators";
import {
  DEFAULT_GIFT_TAX_INPUT,
  giftTaxClampNotices,
  sanitizeGiftTaxInput,
} from "@/lib/giftTaxValidators";
import {
  DEFAULT_INHERITANCE_TAX_INPUT,
  inheritanceTaxClampNotices,
  sanitizeInheritanceTaxInput,
} from "@/lib/inheritanceTaxValidators";

// 범위 밖 입력을 필드 기본값으로 되돌리면 넣은 값과 결과가 어긋난 채 남는다.
// 다이제스트가 엔진을 직접 호출하므로 그 오답이 산문에까지 실렸다(foreign#7 회귀).
// loan.shakilabs의 클램프 패턴을 이식해 경계로 자르고, 자른 사실을 배너로 알린다.
describe("입력 범위 — 범위 밖은 기본값이 아니라 경계로 클램프", () => {
  it("해외주식: 소수점·상한 초과·음수가 기본값으로 되돌아가지 않는다", () => {
    // 예전 동작: 셋 다 기본값 50,000,000으로 복귀 → 화면 표시 없는 조용한 오답
    expect(sanitizeForeignStockTaxInput({ sellAmount: 70_000_000.5 }).sellAmount).toBe(70_000_001);
    expect(sanitizeForeignStockTaxInput({ sellAmount: 60_000_000_000 }).sellAmount).toBe(50_000_000_000);
    expect(sanitizeForeignStockTaxInput({ sellAmount: -1 }).sellAmount).toBe(0);
    expect(sanitizeForeignStockTaxInput({ fees: -100 }).fees).toBe(0);
    expect(sanitizeForeignStockTaxInput({ otherLosses: 99_999_999_999 }).otherLosses).toBe(50_000_000_000);
  });

  it("해외주식: 숫자로 읽을 수 없는 값만 기본값으로 간다", () => {
    for (const bad of [Number.NaN, "abc", null, undefined, ""]) {
      expect(sanitizeForeignStockTaxInput({ sellAmount: bad as unknown as number }).sellAmount, `${bad}`).toBe(
        DEFAULT_FOREIGN_STOCK_TAX_INPUT.sellAmount,
      );
    }
    expect(sanitizeForeignStockTaxInput({}).sellAmount).toBe(DEFAULT_FOREIGN_STOCK_TAX_INPUT.sellAmount);
    expect(sanitizeForeignStockTaxInput()).toEqual(DEFAULT_FOREIGN_STOCK_TAX_INPUT);
    // 문자열 숫자는 읽을 수 있으므로 그대로 계산된다
    expect(sanitizeForeignStockTaxInput({ sellAmount: "70000000" as unknown as number }).sellAmount).toBe(70_000_000);
  });

  it("상속: 자녀 수 11명은 2명이 아니라 상한 10명으로 잘린다", () => {
    // 예전 동작: childrenCount 11 → 기본값 2명. 자녀 수는 공제액을 직접 바꾸므로 오답 폭이 컸다.
    expect(sanitizeInheritanceTaxInput({ childrenCount: 11 }).childrenCount).toBe(10);
    expect(sanitizeInheritanceTaxInput({ childrenCount: -1 }).childrenCount).toBe(0);
    expect(sanitizeInheritanceTaxInput({ totalEstate: -1 }).totalEstate).toBe(0);
    expect(sanitizeInheritanceTaxInput({ totalEstate: 60_000_000_000 }).totalEstate).toBe(50_000_000_000);
    // 불리언은 클램프 개념이 없어 유효하지 않으면 기본값
    expect(sanitizeInheritanceTaxInput({ hasSpouse: "yes" as unknown as boolean }).hasSpouse).toBe(
      DEFAULT_INHERITANCE_TAX_INPUT.hasSpouse,
    );
  });

  it("증여: 금액이 경계로 잘리고 관계는 유효값만 통과한다", () => {
    expect(sanitizeGiftTaxInput({ giftAmount: 60_000_000_000 }).giftAmount).toBe(50_000_000_000);
    expect(sanitizeGiftTaxInput({ giftAmount: -1 }).giftAmount).toBe(0);
    expect(sanitizeGiftTaxInput({ priorDeductionUsed: 99_999_999_999 }).priorDeductionUsed).toBe(50_000_000_000);
    expect(sanitizeGiftTaxInput({ relationship: "cousin" as never }).relationship).toBe(
      DEFAULT_GIFT_TAX_INPUT.relationship,
    );
  });
});

describe("입력 범위 — 잘린 사실을 화면에 알린다", () => {
  it("범위 안 입력에는 알림이 없다", () => {
    expect(foreignStockTaxClampNotices(DEFAULT_FOREIGN_STOCK_TAX_INPUT)).toEqual([]);
    expect(inheritanceTaxClampNotices(DEFAULT_INHERITANCE_TAX_INPUT)).toEqual([]);
    expect(giftTaxClampNotices(DEFAULT_GIFT_TAX_INPUT)).toEqual([]);
    // 소수점은 범위 안이라 클램프가 아니다 — 반올림만 걸린다
    expect(foreignStockTaxClampNotices({ ...DEFAULT_FOREIGN_STOCK_TAX_INPUT, sellAmount: 70_000_000.5 })).toEqual([]);
  });

  it("잘린 필드만 라벨·입력값·적용값과 함께 보고한다", () => {
    const notices = foreignStockTaxClampNotices({
      ...DEFAULT_FOREIGN_STOCK_TAX_INPUT,
      sellAmount: 60_000_000_000,
      fees: -1,
    });
    expect(notices).toEqual([
      { key: "sellAmount", label: "매도금액", entered: 60_000_000_000, applied: 50_000_000_000 },
      { key: "fees", label: "필요경비", entered: -1, applied: 0 },
    ]);
    // 알림의 적용값은 sanitize 결과와 같아야 한다 — 배너와 계산이 어긋나면 또 다른 오답이다
    const sanitized = sanitizeForeignStockTaxInput({
      ...DEFAULT_FOREIGN_STOCK_TAX_INPUT,
      sellAmount: 60_000_000_000,
      fees: -1,
    });
    for (const n of notices) {
      expect(sanitized[n.key as keyof typeof sanitized]).toBe(n.applied);
    }
  });

  it("상속·증여도 같은 규약으로 알린다", () => {
    expect(inheritanceTaxClampNotices({ childrenCount: 11 })).toEqual([
      { key: "childrenCount", label: "자녀 수", entered: 11, applied: 10 },
    ]);
    expect(giftTaxClampNotices({ giftAmount: 60_000_000_000 })).toEqual([
      { key: "giftAmount", label: "증여금액", entered: 60_000_000_000, applied: 50_000_000_000 },
    ]);
  });

  it("숫자가 아닌 값은 클램프가 아니라 기본값이므로 알리지 않는다", () => {
    expect(foreignStockTaxClampNotices({ sellAmount: Number.NaN })).toEqual([]);
    expect(foreignStockTaxClampNotices({})).toEqual([]);
    expect(foreignStockTaxClampNotices()).toEqual([]);
  });
});
