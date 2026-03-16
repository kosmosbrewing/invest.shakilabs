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
  totalTax: number;
  netDividend: number;
  effectiveRate: number;
  isComprehensive: boolean;
  comprehensiveTax: number | null;
  comprehensiveNetDividend: number | null;
};

export function calculateDividendTax(
  dividendAmount: number,
  country: "KR" | keyof typeof DIVIDEND_TAX.FOREIGN_RATES = "KR",
  otherFinancialIncome: number = 0
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

  // 종합과세 시뮬레이션 (2000만원 초과 시)
  let comprehensiveTax: number | null = null;
  let comprehensiveNetDividend: number | null = null;

  if (isComprehensive) {
    // Gross-up 배당가산
    const grossUpAmount = Math.floor(dividendAmount * DIVIDEND_GROSS_UP_RATE);
    const grossedUpDividend = dividendAmount + grossUpAmount;
    const totalTaxableIncome = grossedUpDividend + otherFinancialIncome;

    // 종합소득세 누진세율 적용
    let progressiveTax = 0;
    for (const bracket of INCOME_TAX_BRACKETS) {
      if (totalTaxableIncome <= bracket.min) break;
      const taxable = Math.min(totalTaxableIncome, bracket.max) - bracket.min;
      progressiveTax += taxable * bracket.rate;
    }

    // 배당세액공제: gross-up 금액
    progressiveTax = Math.max(0, progressiveTax - grossUpAmount);
    // 외국납부세액공제
    progressiveTax = Math.max(0, progressiveTax - foreignTaxAmount);
    const localTaxOnComprehensive = Math.floor(progressiveTax * 0.1);

    comprehensiveTax = Math.floor(progressiveTax) + localTaxOnComprehensive;
    comprehensiveNetDividend = dividendAmount - comprehensiveTax;
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
    comprehensiveTax,
    comprehensiveNetDividend,
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
  let normalTotal = 0;

  for (let y = 0; y < holdingYears; y++) {
    // 해당 연도 투자금은 남은 기간만큼 복리 적용
    const years = holdingYears - y;
    const futureValue = annualInvestment * Math.pow(1 + annualReturnRate, years);
    isaTotal += futureValue;
    normalTotal += futureValue;
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
