import { computed, ref, type ComputedRef, type Ref } from "vue";
import { calculateCompoundInterest, type CompoundInterestResult } from "@/utils/interestCalculator";

export type CompoundInterestCalcResult = {
  initialAmount: Ref<number>;
  monthlyContribution: Ref<number>;
  annualRate: Ref<number>;
  years: Ref<number>;
  result: ComputedRef<CompoundInterestResult>;
};

export function useCompoundInterestCalc(initialAmountMan?: number): CompoundInterestCalcResult {
  const initialAmount = ref(initialAmountMan ? initialAmountMan * 10_000 : 10_000_000);
  const monthlyContribution = ref(300_000);
  const annualRate = ref(7.0);
  const years = ref(10);

  const result = computed(() =>
    calculateCompoundInterest({
      initialAmount: initialAmount.value,
      monthlyContribution: monthlyContribution.value,
      annualRate: annualRate.value,
      years: years.value,
    }),
  );

  return { initialAmount, monthlyContribution, annualRate, years, result };
}
