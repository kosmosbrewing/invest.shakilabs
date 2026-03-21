import { computed, ref, type ComputedRef, type Ref } from "vue";
import { DEFAULT_INHERITANCE_TAX_INPUT } from "@/lib/inheritanceTaxValidators";
import { calculateInheritanceTax } from "@/utils/inheritanceTaxCalculator";

export type InheritanceTaxCalcResult = {
  totalEstate: Ref<number>;
  debt: Ref<number>;
  financialAssets: Ref<number>;
  hasSpouse: Ref<boolean>;
  childrenCount: Ref<number>;
  result: ComputedRef<ReturnType<typeof calculateInheritanceTax>>;
};

export function useInheritanceTaxCalc(initialEstate?: number): InheritanceTaxCalcResult {
  const totalEstate = ref(initialEstate ?? DEFAULT_INHERITANCE_TAX_INPUT.totalEstate);
  const debt = ref(DEFAULT_INHERITANCE_TAX_INPUT.debt);
  const financialAssets = ref(DEFAULT_INHERITANCE_TAX_INPUT.financialAssets);
  const hasSpouse = ref(DEFAULT_INHERITANCE_TAX_INPUT.hasSpouse);
  const childrenCount = ref(DEFAULT_INHERITANCE_TAX_INPUT.childrenCount);

  const result = computed(() =>
    calculateInheritanceTax({
      totalEstate: totalEstate.value,
      debt: debt.value,
      financialAssets: financialAssets.value,
      hasSpouse: hasSpouse.value,
      childrenCount: childrenCount.value,
    })
  );

  return {
    totalEstate,
    debt,
    financialAssets,
    hasSpouse,
    childrenCount,
    result,
  };
}
