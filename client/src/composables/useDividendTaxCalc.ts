import { computed, ref, type ComputedRef, type Ref } from "vue";
import { calculateDividendTax, type DividendTaxResult } from "@/utils/investCalculator";
import { DIVIDEND_TAX } from "@/data/investTaxRates";

type CountryKey = "KR" | keyof typeof DIVIDEND_TAX.FOREIGN_RATES;

export type DividendTaxCalcResult = {
  dividendAmount: Ref<number>;
  country: Ref<CountryKey>;
  otherFinancialIncome: Ref<number>;
  result: ComputedRef<DividendTaxResult>;
};

export function useDividendTaxCalc(initialDividend?: number): DividendTaxCalcResult {
  const dividendAmount = ref(initialDividend ?? 5_000_000);
  const country = ref<CountryKey>("KR");
  const otherFinancialIncome = ref(0);

  const result = computed(() =>
    calculateDividendTax(
      dividendAmount.value,
      country.value,
      otherFinancialIncome.value
    )
  );

  return {
    dividendAmount,
    country,
    otherFinancialIncome,
    result,
  };
}
