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
  const totalTax = basicTax + surcharge;

  return {
    deductionLimit,
    availableDeduction,
    taxableAmount,
    basicTax,
    surcharge,
    totalTax,
    afterTaxGift: Math.max(0, normalized.giftAmount - totalTax),
    effectiveRate: normalized.giftAmount > 0 ? totalTax / normalized.giftAmount : 0,
    appliedRate: bracket.rate,
  };
}
