import type { GiftTaxInput } from "@/lib/giftTaxValidators";
import { sanitizeGiftTaxInput } from "@/lib/giftTaxValidators";

const RELATIONSHIP_DEDUCTIONS = {
  spouse: 600_000_000,
  "adult-child": 50_000_000,
  "minor-child": 20_000_000,
  parent: 50_000_000,
  other: 10_000_000,
} as const;

const TAX_BRACKETS = [
  { max: 100_000_000, rate: 0.1, deduction: 0 },
  { max: 500_000_000, rate: 0.2, deduction: 10_000_000 },
  { max: 1_000_000_000, rate: 0.3, deduction: 60_000_000 },
  { max: 3_000_000_000, rate: 0.4, deduction: 160_000_000 },
  { max: Number.POSITIVE_INFINITY, rate: 0.5, deduction: 460_000_000 },
] as const;

function roundWon(value: number): number {
  return Math.round(value);
}

function findBracket(amount: number) {
  return TAX_BRACKETS.find((bracket) => amount <= bracket.max) ?? TAX_BRACKETS[TAX_BRACKETS.length - 1]!;
}

export function calculateGiftTax(input: GiftTaxInput) {
  const normalized = sanitizeGiftTaxInput(input);
  const deductionLimit = RELATIONSHIP_DEDUCTIONS[normalized.relationship];
  const availableDeduction = Math.max(0, deductionLimit - normalized.priorDeductionUsed);
  const taxableAmount = Math.max(0, normalized.giftAmount - availableDeduction);
  const bracket = findBracket(taxableAmount);
  const basicTax = Math.max(0, roundWon(taxableAmount * bracket.rate - bracket.deduction));
  const surcharge = normalized.isGenerationSkipping ? roundWon(basicTax * 0.3) : 0;

  // 신고세액공제 (기한 내 신고 시 3%)
  // 왜 가산액까지 포함해 3%를 먹이는가: 상증세법 제69조②는 "증여세산출세액
  // (제57조에 따라 산출세액에 가산하는 금액을 포함한다)에서 … 100분의 3에 상당하는 금액을 공제한다"고
  // 명시한다. 즉 세대생략 가산액도 공제 대상이므로 basicTax + surcharge 전체에 적용한다.
  // 상속세(제69조①)와 세율·구조가 같으므로 inheritanceTaxCalculator와 같은 형태·같은 반올림을 쓴다
  // — 한쪽에만 적용해 두면 증여세만 3% 과다 계산되어 사용자에게 불리한 방향으로 어긋난다.
  const calculatedTax = basicTax + surcharge;
  const filingDeduction = roundWon(calculatedTax * 0.03);
  const totalTax = Math.max(0, calculatedTax - filingDeduction);

  return {
    deductionLimit,
    availableDeduction,
    taxableAmount,
    basicTax,
    surcharge,
    calculatedTax,
    filingDeduction,
    totalTax,
    afterTaxGift: Math.max(0, normalized.giftAmount - totalTax),
    effectiveRate: normalized.giftAmount > 0 ? totalTax / normalized.giftAmount : 0,
    appliedRate: bracket.rate,
  };
}
