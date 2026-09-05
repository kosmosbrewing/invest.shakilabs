import {
  CRYPTO_TAX,
  DIVIDEND_TAX,
  ISA_TAX,
  INCOME_TAX_BRACKETS,
  DIVIDEND_GROSS_UP_RATE,
} from "@/data/investTaxRates";

// --- 가상자산 양도세 ---

export type CryptoTaxResult = {
  purchaseAmount: number;
  saleAmount: number;
  totalGain: number;
  deduction: number;
  taxableAmount: number;
  incomeTax: number;
  localTax: number;
  totalTax: number;
  netProfit: number;
  effectiveRate: number;
};

export function calculateCryptoTax(
  purchaseAmount: number,
  saleAmount: number,
  expenses: number = 0
): CryptoTaxResult {
  const totalGain = saleAmount - purchaseAmount - expenses;
  const deduction = CRYPTO_TAX.BASIC_DEDUCTION;
  const taxableAmount = Math.max(0, totalGain - deduction);
  const incomeTax = Math.floor(taxableAmount * CRYPTO_TAX.INCOME_TAX_RATE);
  const localTax = Math.floor(taxableAmount * CRYPTO_TAX.LOCAL_TAX_RATE);
  const totalTax = incomeTax + localTax;
  const netProfit = totalGain - totalTax;
  const effectiveRate = totalGain > 0 ? totalTax / totalGain : 0;

  return {
    purchaseAmount,
    saleAmount,
    totalGain,
    deduction,
    taxableAmount,
    incomeTax,
    localTax,
    totalTax,
    netProfit,
    effectiveRate,
  };
}

// --- 배당소득세 ---

export type DividendTaxResult = {
  dividendAmount: number;
  country: string;
  foreignTaxRate: number;
  foreignTaxAmount: number;
  domesticIncomeTax: number;
  domesticLocalTax: number;
  /** 입력 배당금만의 분리과세(원천징수) 세부담 — 해외 원천징수 포함 */
  totalTax: number;
  netDividend: number;
  effectiveRate: number;
  isComprehensive: boolean;
  /** 계산에 사용한 다른 종합소득 과세표준(근로·사업 등). 0이면 "타 소득 없음" 가정 */
  otherComprehensiveIncome: number;
  /** 배당가산(gross-up) 금액 — 기준금액 초과분 중 국내 배당에만 적용 */
  grossUpAmount: number | null;
  /** 종합소득 과세표준(다른 종합소득 + 금융소득 + 배당가산) */
  comprehensiveTaxBase: number | null;
  /** 금융소득(배당 + 기타 금융소득) 전체를 분리과세로 끝냈을 때의 세부담 */
  separateTaxTotal: number | null;
  /** 금융소득 전체를 종합과세했을 때의 세부담(해외 원천징수 포함, 지방소득세 포함) */
  comprehensiveTax: number | null;
  /** 종합과세 − 분리과세 추가 세부담. 비교과세 하한 때문에 음수가 될 수 없다 */
  comprehensiveExtraTax: number | null;
  /** 종합과세 시 배당 실수령액 = 배당금 − 분리과세 세금 − 추가 세부담 */
  comprehensiveNetDividend: number | null;
  /** 비교과세 하한(제62조 제2호)이 적용되어 추가 세부담이 없는 경우 true */
  isComparisonFloorApplied: boolean;
};

/** 종합소득세 기본세율(6~45%) 산출세액 — 소득공제는 반영하지 않는 과세표준 기준 */
function calculateProgressiveTax(taxBase: number): number {
  let tax = 0;
  for (const bracket of INCOME_TAX_BRACKETS) {
    if (taxBase <= bracket.min) break;
    const taxable = Math.min(taxBase, bracket.max) - bracket.min;
    tax += taxable * bracket.rate;
  }
  return tax;
}

export function calculateDividendTax(
  dividendAmount: number,
  country: "KR" | keyof typeof DIVIDEND_TAX.FOREIGN_RATES = "KR",
  otherFinancialIncome: number = 0,
  otherComprehensiveIncome: number = 0
): DividendTaxResult {
  const totalFinancialIncome = dividendAmount + otherFinancialIncome;
  const isComprehensive = totalFinancialIncome > DIVIDEND_TAX.FINANCIAL_INCOME_THRESHOLD;

  let foreignTaxRate = 0;
  let foreignTaxAmount = 0;
  let domesticIncomeTax = 0;
  let domesticLocalTax = 0;

  if (country === "KR") {
    // 국내 배당: 원천징수 15.4%
    domesticIncomeTax = Math.floor(dividendAmount * DIVIDEND_TAX.DOMESTIC_INCOME_TAX_RATE);
    domesticLocalTax = Math.floor(dividendAmount * DIVIDEND_TAX.DOMESTIC_LOCAL_TAX_RATE);
  } else {
    // 해외 배당: 현지 원천징수 후, 국내 세율과 비교하여 차액 추가 과세
    const foreignRate = DIVIDEND_TAX.FOREIGN_RATES[country];
    foreignTaxRate = foreignRate.localRate;
    foreignTaxAmount = Math.floor(dividendAmount * foreignTaxRate);

    // 국내 소득세율(14%)과 외국 세율 비교
    if (foreignTaxRate < DIVIDEND_TAX.DOMESTIC_INCOME_TAX_RATE) {
      // 외국 세율이 낮으면 차액 추가 납부
      domesticIncomeTax = Math.floor(
        dividendAmount * (DIVIDEND_TAX.DOMESTIC_INCOME_TAX_RATE - foreignTaxRate)
      );
    }
    // 지방소득세는 국내 소득세분에 대해 부과
    domesticLocalTax = Math.floor(domesticIncomeTax * 0.1);
  }

  const totalTax = foreignTaxAmount + domesticIncomeTax + domesticLocalTax;
  const netDividend = dividendAmount - totalTax;
  const effectiveRate = dividendAmount > 0 ? totalTax / dividendAmount : 0;

  // 종합과세 시뮬레이션 (금융소득 2,000만원 초과 시)
  let grossUpAmount: number | null = null;
  let comprehensiveTaxBase: number | null = null;
  let separateTaxTotal: number | null = null;
  let comprehensiveTax: number | null = null;
  let comprehensiveExtraTax: number | null = null;
  let comprehensiveNetDividend: number | null = null;
  let isComparisonFloorApplied = false;

  if (isComprehensive) {
    const threshold = DIVIDEND_TAX.FINANCIAL_INCOME_THRESHOLD;
    const withholdingRate = DIVIDEND_TAX.DOMESTIC_INCOME_TAX_RATE;
    const excessFinancialIncome = totalFinancialIncome - threshold;

    // 배당가산(gross-up, 소득세법 제17조③): 기준금액 초과분 중 내국법인 배당에만 적용.
    // 시행령 제116조의2 — 기준금액은 이자(기타 금융소득)부터 채우므로 초과분에 배당이 먼저 남는다.
    // 해외 배당(제17조①6호)은 배당가산·배당세액공제 대상이 아니다.
    const grossUpBase = country === "KR" ? Math.min(dividendAmount, excessFinancialIncome) : 0;
    grossUpAmount = Math.floor(grossUpBase * DIVIDEND_GROSS_UP_RATE);
    comprehensiveTaxBase = otherComprehensiveIncome + totalFinancialIncome + grossUpAmount;

    const otherIncomeTax = calculateProgressiveTax(otherComprehensiveIncome);

    // 비교과세(소득세법 제62조): 산출세액 = MAX(①, ②)
    // ① (기준금액 초과 금융소득 + 배당가산 + 다른 종합소득)의 기본세율 산출세액 + 기준금액 × 14%
    const generalTax =
      calculateProgressiveTax(otherComprehensiveIncome + excessFinancialIncome + grossUpAmount) +
      threshold * withholdingRate;
    // ② 금융소득 전체 × 원천징수세율 14% + 다른 종합소득의 산출세액
    const comparisonTax = totalFinancialIncome * withholdingRate + otherIncomeTax;
    const calculatedTax = Math.max(generalTax, comparisonTax);
    isComparisonFloorApplied = comparisonTax >= generalTax;

    // 배당세액공제(제56조): 배당가산액을 공제하되 ②를 하한으로 둔다 —
    // 종합과세 세액이 분리과세 상당액(②) 아래로 내려가지 않는 것이 비교과세의 취지.
    const dividendCredit = Math.min(grossUpAmount, Math.max(0, calculatedTax - comparisonTax));
    if (dividendCredit >= calculatedTax - comparisonTax) isComparisonFloorApplied = true;
    let taxAfterCredits = calculatedTax - dividendCredit;

    // 외국납부세액공제: 한도 = 산출세액 × (국외원천소득 ÷ 종합소득금액)
    const foreignIncome = country === "KR" ? 0 : dividendAmount;
    const foreignCreditLimit =
      comprehensiveTaxBase > 0 ? taxAfterCredits * (foreignIncome / comprehensiveTaxBase) : 0;
    const foreignCredit = Math.min(foreignTaxAmount, Math.floor(foreignCreditLimit));
    taxAfterCredits -= foreignCredit;

    // 금융소득에 귀속되는 소득세 = 전체 세액 − 다른 종합소득만 있을 때의 세액
    const incomeTaxOnFinancial = Math.max(0, Math.floor(taxAfterCredits - otherIncomeTax));
    const localTaxOnFinancial = Math.floor(incomeTaxOnFinancial * 0.1);
    comprehensiveTax = foreignTaxAmount + incomeTaxOnFinancial + localTaxOnFinancial;

    // 같은 금융소득을 분리과세로 끝냈을 때 — 기타 금융소득은 국내 이자·배당 15.4% 가정
    separateTaxTotal =
      totalTax +
      Math.floor(otherFinancialIncome * DIVIDEND_TAX.DOMESTIC_INCOME_TAX_RATE) +
      Math.floor(otherFinancialIncome * DIVIDEND_TAX.DOMESTIC_LOCAL_TAX_RATE);

    // 비교과세 구조상 음수가 될 수 없지만 원 단위 절사 차이를 0으로 정리한다
    comprehensiveExtraTax = Math.max(0, comprehensiveTax - separateTaxTotal);
    comprehensiveNetDividend = dividendAmount - totalTax - comprehensiveExtraTax;
  }

  return {
    dividendAmount,
    country,
    foreignTaxRate,
    foreignTaxAmount,
    domesticIncomeTax,
    domesticLocalTax,
    totalTax,
    netDividend,
    effectiveRate,
    isComprehensive,
    otherComprehensiveIncome,
    grossUpAmount,
    comprehensiveTaxBase,
    separateTaxTotal,
    comprehensiveTax,
    comprehensiveExtraTax,
    comprehensiveNetDividend,
    isComparisonFloorApplied,
  };
}

// --- ISA 세후 비교 ---

export type IsaCompareResult = {
  totalInvestment: number;
  totalProfit: number;
  annualReturn: number;
  holdingYears: number;
  isaType: "general" | "low_income";
  // ISA 계좌
  isaTaxFreeLimit: number;
  isaTaxableProfit: number;
  isaTax: number;
  isaNetProfit: number;
  isaNetTotal: number;
  // 일반 계좌
  normalTax: number;
  normalNetProfit: number;
  normalNetTotal: number;
  // 비교
  taxSaving: number;
  savingRate: number;
};

export function calculateIsaCompare(
  annualInvestment: number,
  annualReturnRate: number,
  holdingYears: number,
  isaType: "general" | "low_income" = "general"
): IsaCompareResult {
  // 단리 방식 총 투자/수익 계산 (간소화)
  const totalInvestment = annualInvestment * holdingYears;

  // 복리 수익 계산
  let isaTotal = 0;

  for (let y = 0; y < holdingYears; y++) {
    // 해당 연도 투자금은 남은 기간만큼 복리 적용
    const years = holdingYears - y;
    const futureValue = annualInvestment * Math.pow(1 + annualReturnRate, years);
    isaTotal += futureValue;
  }

  const totalProfit = Math.round(isaTotal - totalInvestment);

  // ISA 세금 계산
  const taxFreeLimit =
    isaType === "general"
      ? ISA_TAX.GENERAL_TAX_FREE_LIMIT
      : ISA_TAX.LOW_INCOME_TAX_FREE_LIMIT;

  const isaTaxableProfit = Math.max(0, totalProfit - taxFreeLimit);
  const isaTax = Math.floor(isaTaxableProfit * ISA_TAX.SEPARATE_TAX_RATE);
  const isaNetProfit = totalProfit - isaTax;
  const isaNetTotal = totalInvestment + isaNetProfit;

  // 일반 계좌: 배당/이자 수익에 15.4% 과세
  const normalTax = Math.floor(totalProfit * ISA_TAX.NORMAL_ACCOUNT_TAX_RATE);
  const normalNetProfit = totalProfit - normalTax;
  const normalNetTotal = totalInvestment + normalNetProfit;

  const taxSaving = normalTax - isaTax;
  const savingRate = normalTax > 0 ? taxSaving / normalTax : 0;

  return {
    totalInvestment,
    totalProfit,
    annualReturn: annualReturnRate,
    holdingYears,
    isaType,
    isaTaxFreeLimit: taxFreeLimit,
    isaTaxableProfit,
    isaTax,
    isaNetProfit,
    isaNetTotal,
    normalTax,
    normalNetProfit,
    normalNetTotal,
    taxSaving,
    savingRate,
  };
}
