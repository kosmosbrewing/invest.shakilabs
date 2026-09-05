import { computed, ref, type ComputedRef, type Ref } from "vue";
import { calculateDividendTax, type DividendTaxResult } from "@/utils/investCalculator";
import { DIVIDEND_TAX } from "@/data/investTaxRates";

type CountryKey = "KR" | keyof typeof DIVIDEND_TAX.FOREIGN_RATES;

export type DividendTaxCalcResult = {
  dividendAmount: Ref<number>;
  country: Ref<CountryKey>;
  otherFinancialIncome: Ref<number>;
  otherComprehensiveIncome: Ref<number>;
  result: ComputedRef<DividendTaxResult>;
};

export function useDividendTaxCalc(initialDividend?: number): DividendTaxCalcResult {
  const dividendAmount = ref(initialDividend ?? 5_000_000);
  const country = ref<CountryKey>("KR");
  const otherFinancialIncome = ref(0);
  // 근로·사업 등 다른 종합소득 과세표준. 0 = "금융소득 외 소득 없음" 가정 (화면에 명시)
  const otherComprehensiveIncome = ref(0);

  const result = computed(() =>
    calculateDividendTax(
      dividendAmount.value,
      country.value,
      otherFinancialIncome.value,
      otherComprehensiveIncome.value
    )
  );

  return {
    dividendAmount,
    country,
    otherFinancialIncome,
    otherComprehensiveIncome,
    result,
  };
}
