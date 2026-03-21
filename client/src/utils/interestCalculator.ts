import { INTEREST_TAX, type TaxType, type PaymentType } from "@/data/interestData";

// ── 세율 헬퍼 ──────────────────────────────────────────
function getTaxRate(taxType: TaxType): number {
  switch (taxType) {
    case "normal":
      return INTEREST_TAX.NORMAL_RATE;
    case "preferential":
      return INTEREST_TAX.PREFERENTIAL_RATE;
    case "tax_free":
      return INTEREST_TAX.TAX_FREE_RATE;
  }
}

// ── 적금 이자 계산기 ─────────────────────────────────────
export interface SavingsInterestInput {
  /** 월 적립액 (원) */
  monthlyDeposit: number;
  /** 적금 기간 (개월) */
  months: number;
  /** 연이율 (%, 예: 3.5) */
  annualRate: number;
  /** 이자과세 유형 */
  taxType: TaxType;
}

export interface SavingsInterestResult {
  /** 원금 합계 */
  totalPrincipal: number;
  /** 세전 이자 (단리) */
  grossInterest: number;
  /** 세금 */
  tax: number;
  /** 세후 이자 */
  netInterest: number;
  /** 만기 수령액 */
  maturityAmount: number;
  /** 실효 수익률 (세후이자 / 원금) */
  effectiveRate: number;
  /** 월별 누적 데이터 */
  monthlyData: { month: number; principal: number; interest: number }[];
}

export function calculateSavingsInterest(input: SavingsInterestInput): SavingsInterestResult {
  const { monthlyDeposit, months, annualRate, taxType } = input;
  const monthlyRate = annualRate / 100 / 12;
  const totalPrincipal = monthlyDeposit * months;

  // 단리: 이자 = 월적립 × 이율/12 × n(n+1)/2
  const grossInterest = Math.round(monthlyDeposit * monthlyRate * (months * (months + 1)) / 2);

  const taxRate = getTaxRate(taxType);
  const tax = Math.round(grossInterest * taxRate);
  const netInterest = grossInterest - tax;
  const maturityAmount = totalPrincipal + netInterest;
  const effectiveRate = totalPrincipal > 0 ? netInterest / totalPrincipal : 0;

  // 월별 누적 데이터
  const monthlyData: SavingsInterestResult["monthlyData"] = [];
  for (let m = 1; m <= months; m++) {
    const principal = monthlyDeposit * m;
    // m번째 달까지의 누적 이자 (단리)
    const interest = Math.round(monthlyDeposit * monthlyRate * (m * (m + 1)) / 2);
    monthlyData.push({ month: m, principal, interest });
  }

  return {
    totalPrincipal,
    grossInterest,
    tax,
    netInterest,
    maturityAmount,
    effectiveRate,
    monthlyData,
  };
}

// ── 예금 이자 계산기 ─────────────────────────────────────
export interface DepositInterestInput {
  /** 예금 원금 (원) */
  principal: number;
  /** 예금 기간 (개월) */
  months: number;
  /** 연이율 (%, 예: 3.5) */
  annualRate: number;
  /** 이자과세 유형 */
  taxType: TaxType;
  /** 이자지급방식 */
  paymentType: PaymentType;
}

export interface DepositInterestResult {
  /** 예금 원금 */
  principal: number;
  /** 세전 총이자 */
  grossInterest: number;
  /** 세금 */
  tax: number;
  /** 세후 총이자 */
  netInterest: number;
  /** 만기 수령액 (만기일시) 또는 원금+누적월이자(월이자) */
  maturityAmount: number;
  /** 실효 수익률 */
  effectiveRate: number;
  /** 월이자 방식 시 세전 월수령액 */
  monthlyInterestGross: number;
  /** 월이자 방식 시 세후 월수령액 */
  monthlyInterestNet: number;
}

export function calculateDepositInterest(input: DepositInterestInput): DepositInterestResult {
  const { principal, months, annualRate, taxType, paymentType } = input;
  const taxRate = getTaxRate(taxType);

  // 만기일시: 이자 = 원금 × 이율 × (기간/12)
  const grossInterest = Math.round(principal * (annualRate / 100) * (months / 12));
  const tax = Math.round(grossInterest * taxRate);
  const netInterest = grossInterest - tax;
  const maturityAmount = principal + netInterest;
  const effectiveRate = principal > 0 ? netInterest / principal : 0;

  // 월이자 방식
  const monthlyInterestGross = Math.round(principal * (annualRate / 100) / 12);
  const monthlyTax = Math.round(monthlyInterestGross * taxRate);
  const monthlyInterestNet = monthlyInterestGross - monthlyTax;

  if (paymentType === "monthly") {
    // 월이자 방식: 매월 이자를 받으므로 만기에는 원금만 돌려받음
    const totalGrossInterest = monthlyInterestGross * months;
    const totalTax = Math.round(totalGrossInterest * taxRate);
    // grossInterest - tax === netInterest 정합성을 보장하기 위해 차감으로 산출
    const totalNetInterest = totalGrossInterest - totalTax;

    return {
      principal,
      grossInterest: totalGrossInterest,
      tax: totalTax,
      netInterest: totalNetInterest,
      maturityAmount: principal + totalNetInterest,
      effectiveRate: principal > 0 ? totalNetInterest / principal : 0,
      monthlyInterestGross,
      monthlyInterestNet,
    };
  }

  return {
    principal,
    grossInterest,
    tax,
    netInterest,
    maturityAmount,
    effectiveRate,
    monthlyInterestGross,
    monthlyInterestNet,
  };
}

// ── 복리 계산기 ──────────────────────────────────────────
export interface CompoundInterestInput {
  /** 초기 투자금 (원) */
  initialAmount: number;
  /** 월 추가 적립금 (원, 0 가능) */
  monthlyContribution: number;
  /** 연 수익률 (%, 예: 7.0) */
  annualRate: number;
  /** 투자 기간 (년) */
  years: number;
}

export interface CompoundInterestResult {
  /** 총 투자 원금 */
  totalInvested: number;
  /** 단리 최종 금액 */
  simpleTotal: number;
  /** 복리 최종 금액 */
  compoundTotal: number;
  /** 단리 이자 */
  simpleInterest: number;
  /** 복리 이자 */
  compoundInterest: number;
  /** 복리 - 단리 차이 */
  compoundAdvantage: number;
  /** 72법칙: 원금 2배 도달 예상 기간 (년) */
  rule72Years: number;
  /** 연도별 성장 데이터 */
  yearlyData: {
    year: number;
    invested: number;
    simpleTotal: number;
    compoundTotal: number;
  }[];
}

export function calculateCompoundInterest(input: CompoundInterestInput): CompoundInterestResult {
  const { initialAmount, monthlyContribution, annualRate, years } = input;
  const monthlyRate = annualRate / 100 / 12;
  const totalMonths = years * 12;
  const totalInvested = initialAmount + monthlyContribution * totalMonths;

  // 단리 계산
  // 초기금: 초기 × (1 + 연이율 × 기간)
  // 적립금: 월적립 × Σ(1 + 월이율 × (totalMonths - k)) for k=1..totalMonths
  //       = 월적립 × totalMonths + 월적립 × 월이율 × totalMonths×(totalMonths-1)/2
  const simpleInitial = Math.round(initialAmount * (1 + (annualRate / 100) * years));
  const simpleMonthly = Math.round(
    monthlyContribution * totalMonths +
    monthlyContribution * monthlyRate * (totalMonths * (totalMonths - 1)) / 2,
  );
  const simpleTotal = simpleInitial + simpleMonthly;
  const simpleInterest = simpleTotal - totalInvested;

  // 복리 계산
  // 초기금: 초기 × (1 + 월이율)^총개월
  // 적립금: 월적립 × ((1 + 월이율)^총개월 - 1) / 월이율
  let compoundTotal: number;
  if (monthlyRate === 0) {
    compoundTotal = totalInvested;
  } else {
    const compoundFactor = Math.pow(1 + monthlyRate, totalMonths);
    const compoundInitial = initialAmount * compoundFactor;
    const compoundMonthly = monthlyContribution * ((compoundFactor - 1) / monthlyRate);
    compoundTotal = Math.round(compoundInitial + compoundMonthly);
  }
  const compoundInterest = compoundTotal - totalInvested;
  const compoundAdvantage = compoundInterest - simpleInterest;

  // 72법칙
  const rule72Years = annualRate > 0 ? Math.round((72 / annualRate) * 10) / 10 : 0;

  // 연도별 성장 데이터
  const yearlyData: CompoundInterestResult["yearlyData"] = [];
  for (let y = 1; y <= years; y++) {
    const m = y * 12;
    const invested = initialAmount + monthlyContribution * m;

    // 단리
    const sInit = Math.round(initialAmount * (1 + (annualRate / 100) * y));
    const sMonth = Math.round(
      monthlyContribution * m +
      monthlyContribution * monthlyRate * (m * (m - 1)) / 2,
    );

    // 복리
    let cTotal: number;
    if (monthlyRate === 0) {
      cTotal = invested;
    } else {
      const cf = Math.pow(1 + monthlyRate, m);
      cTotal = Math.round(initialAmount * cf + monthlyContribution * ((cf - 1) / monthlyRate));
    }

    yearlyData.push({
      year: y,
      invested,
      simpleTotal: sInit + sMonth,
      compoundTotal: cTotal,
    });
  }

  return {
    totalInvested,
    simpleTotal,
    compoundTotal,
    simpleInterest,
    compoundInterest,
    compoundAdvantage,
    rule72Years,
    yearlyData,
  };
}
