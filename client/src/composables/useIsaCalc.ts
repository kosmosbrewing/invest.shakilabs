import { computed, ref, type ComputedRef, type Ref } from "vue";
import { calculateIsaCompare, type IsaCompareResult } from "@/utils/investCalculator";

export type IsaCalcResult = {
  annualInvestment: Ref<number>;
  annualReturnRate: Ref<number>;
  holdingYears: Ref<number>;
  isaType: Ref<"general" | "low_income">;
  result: ComputedRef<IsaCompareResult>;
};

export function useIsaCalc(): IsaCalcResult {
  const annualInvestment = ref(12_000_000);
  const annualReturnRate = ref(0.05);
  const holdingYears = ref(3);
  const isaType = ref<"general" | "low_income">("general");

  const result = computed(() =>
    calculateIsaCompare(
      annualInvestment.value,
      annualReturnRate.value,
      holdingYears.value,
      isaType.value
    )
  );

  return {
    annualInvestment,
    annualReturnRate,
    holdingYears,
    isaType,
    result,
  };
}
