import { computed, ref, type ComputedRef, type Ref } from "vue";
import { calculateCryptoTax, type CryptoTaxResult } from "@/utils/investCalculator";

export type CryptoTaxCalcResult = {
  purchaseAmount: Ref<number>;
  saleAmount: Ref<number>;
  expenses: Ref<number>;
  result: ComputedRef<CryptoTaxResult>;
};

export function useCryptoTaxCalc(initialPurchase?: number): CryptoTaxCalcResult {
  const purchaseAmount = ref(initialPurchase ?? 10_000_000);
  const saleAmount = ref(initialPurchase ? Math.round(initialPurchase * 1.5) : 15_000_000);
  const expenses = ref(0);

  const result = computed(() =>
    calculateCryptoTax(purchaseAmount.value, saleAmount.value, expenses.value)
  );

  return {
    purchaseAmount,
    saleAmount,
    expenses,
    result,
  };
}
