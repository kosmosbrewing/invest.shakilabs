import { computed, ref, type ComputedRef, type Ref } from "vue";
import { calculateDepositInterest, type DepositInterestResult } from "@/utils/interestCalculator";
import type { TaxType, PaymentType } from "@/data/interestData";

export type DepositInterestCalcResult = {
  principal: Ref<number>;
  months: Ref<number>;
  annualRate: Ref<number>;
  taxType: Ref<TaxType>;
  paymentType: Ref<PaymentType>;
  result: ComputedRef<DepositInterestResult>;
};

export function useDepositInterestCalc(initialPrincipalMan?: number): DepositInterestCalcResult {
  const principal = ref(initialPrincipalMan ? initialPrincipalMan * 10_000 : 10_000_000);
  const months = ref(12);
  const annualRate = ref(3.5);
  const taxType = ref<TaxType>("normal");
  const paymentType = ref<PaymentType>("maturity");

  const result = computed(() =>
    calculateDepositInterest({
      principal: principal.value,
      months: months.value,
      annualRate: annualRate.value,
      taxType: taxType.value,
      paymentType: paymentType.value,
    }),
  );

  return { principal, months, annualRate, taxType, paymentType, result };
}
