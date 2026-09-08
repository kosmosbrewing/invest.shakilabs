import { computed, ref, type ComputedRef, type Ref } from "vue";
import type { ClampNotice } from "@/lib/inputRange";
import {
  DEFAULT_INHERITANCE_TAX_INPUT,
  inheritanceTaxClampNotices,
} from "@/lib/inheritanceTaxValidators";
import { calculateInheritanceTax } from "@/utils/inheritanceTaxCalculator";

export type InheritanceTaxCalcResult = {
  totalEstate: Ref<number>;
  debt: Ref<number>;
  financialAssets: Ref<number>;
  hasSpouse: Ref<boolean>;
  childrenCount: Ref<number>;
  result: ComputedRef<ReturnType<typeof calculateInheritanceTax>>;
  rangeNotices: ComputedRef<ClampNotice[]>;
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

  // 범위 밖 입력은 기본값 복귀가 아니라 경계 클램프이므로, 잘린 사실을 화면에 알린다
  const rangeNotices = computed(() =>
    inheritanceTaxClampNotices({
      totalEstate: totalEstate.value,
      debt: debt.value,
      financialAssets: financialAssets.value,
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
    rangeNotices,
  };
}
