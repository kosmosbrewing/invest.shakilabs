import type { InheritanceTaxInput } from "@/lib/inheritanceTaxValidators";
import { sanitizeInheritanceTaxInput } from "@/lib/inheritanceTaxValidators";
import {
  BASIC_DEDUCTION,
  FINANCIAL_ASSET_MAX,
  FINANCIAL_ASSET_MIN,
  FINANCIAL_ASSET_RATE,
  FUNERAL_EXPENSE,
  INHERITANCE_TAX_BRACKETS,
  LUMP_SUM_DEDUCTION,
  SPOUSE_MAX_DEDUCTION,
  SPOUSE_MIN_DEDUCTION,
} from "@/data/inheritanceTax";

function roundWon(value: number): number {
  return Math.round(value);
}

function findBracket(amount: number) {
  return INHERITANCE_TAX_BRACKETS.find((b) => amount <= b.max) ?? INHERITANCE_TAX_BRACKETS[INHERITANCE_TAX_BRACKETS.length - 1]!;
}

function calcFinancialDeduction(financialAssets: number): number {
  if (financialAssets <= FINANCIAL_ASSET_MIN) return Math.max(0, financialAssets);
  const raw = financialAssets * FINANCIAL_ASSET_RATE;
  return Math.min(FINANCIAL_ASSET_MAX, Math.max(FINANCIAL_ASSET_MIN, roundWon(raw)));
}

export function calculateInheritanceTax(input: InheritanceTaxInput) {
  const normalized = sanitizeInheritanceTaxInput(input);
  const { totalEstate, debt, financialAssets, hasSpouse, childrenCount } = normalized;

  // 1. 과세가액 = 상속재산 - 채무 - 장례비용
  const taxableValue = Math.max(0, totalEstate - debt - FUNERAL_EXPENSE);

  // 2. 배우자 상속공제 (법정상속분 기준)
  // 법정상속분: 배우자 1.5 : 자녀 각 1
  let spouseDeduction = 0;
  if (hasSpouse) {
    const totalShares = 1.5 + childrenCount;
    const spouseShare = totalShares > 0 ? taxableValue * (1.5 / totalShares) : taxableValue;
    spouseDeduction = Math.min(SPOUSE_MAX_DEDUCTION, Math.max(SPOUSE_MIN_DEDUCTION, roundWon(spouseShare)));
  }

  // 3. 기초공제 + 인적공제 vs 일괄공제
  // 인적공제: 자녀 1인당 5천만원 (미성년자 추가공제는 단순화에서 제외)
  const personalDeduction = childrenCount * 50_000_000;
  const detailedDeduction = BASIC_DEDUCTION + personalDeduction;
  const generalDeduction = Math.max(LUMP_SUM_DEDUCTION, detailedDeduction);
  const usedLumpSum = LUMP_SUM_DEDUCTION >= detailedDeduction;

  // 4. 금융재산 공제
  const financialDeduction = calcFinancialDeduction(financialAssets);

  // 5. 총 공제
  const totalDeduction = spouseDeduction + generalDeduction + financialDeduction;

  // 6. 과세표준
  const taxBase = Math.max(0, taxableValue - totalDeduction);

  // 7. 세율 적용
  const bracket = findBracket(taxBase);
  const calculatedTax = Math.max(0, roundWon(taxBase * bracket.rate - bracket.deduction));

  // 8. 신고세액공제 (기한 내 신고 시 3%)
  const filingDeduction = roundWon(calculatedTax * 0.03);
  const totalTax = Math.max(0, calculatedTax - filingDeduction);
  const effectiveRate = totalEstate > 0 ? totalTax / totalEstate : 0;

  return {
    totalEstate,
    debt,
    funeralExpense: FUNERAL_EXPENSE,
    taxableValue,
    spouseDeduction,
    generalDeduction,
    usedLumpSum,
    financialDeduction,
    totalDeduction,
    taxBase,
    appliedRate: bracket.rate,
    calculatedTax,
    filingDeduction,
    totalTax,
    effectiveRate,
    afterTaxEstate: Math.max(0, totalEstate - debt - totalTax),
  };
}
