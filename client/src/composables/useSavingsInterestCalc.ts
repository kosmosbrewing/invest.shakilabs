import { computed, ref, type ComputedRef, type Ref } from "vue";
import { calculateSavingsInterest, type SavingsInterestResult } from "@/utils/interestCalculator";
import type { TaxType } from "@/data/interestData";

export type SavingsInterestCalcResult = {
  monthlyDeposit: Ref<number>;
  months: Ref<number>;
  annualRate: Ref<number>;
  taxType: Ref<TaxType>;
  result: ComputedRef<SavingsInterestResult>;
};

export function useSavingsInterestCalc(initialMonthlyMan?: number): SavingsInterestCalcResult {
  const monthlyDeposit = ref(initialMonthlyMan ? initialMonthlyMan * 10_000 : 300_000);
  const months = ref(12);
  const annualRate = ref(3.5);
  const taxType = ref<TaxType>("normal");

  const result = computed(() =>
    calculateSavingsInterest({
      monthlyDeposit: monthlyDeposit.value,
      months: months.value,
      annualRate: annualRate.value,
      taxType: taxType.value,
    }),
  );

  return { monthlyDeposit, months, annualRate, taxType, result };
}
