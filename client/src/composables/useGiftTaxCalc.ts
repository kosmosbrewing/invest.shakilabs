import { computed, ref, type ComputedRef, type Ref } from "vue";
import {
  DEFAULT_GIFT_TAX_INPUT,
  giftTaxClampNotices,
  type GiftTaxInput,
} from "@/lib/giftTaxValidators";
import type { ClampNotice } from "@/lib/inputRange";
import { calculateGiftTax } from "@/utils/giftTaxCalculator";

export type GiftTaxCalcResult = {
  giftAmount: Ref<number>;
  priorDeductionUsed: Ref<number>;
  relationship: Ref<GiftTaxInput["relationship"]>;
  isGenerationSkipping: Ref<boolean>;
  result: ComputedRef<ReturnType<typeof calculateGiftTax>>;
  rangeNotices: ComputedRef<ClampNotice[]>;
};

export function useGiftTaxCalc(initialGift?: number): GiftTaxCalcResult {
  const giftAmount = ref(initialGift ?? DEFAULT_GIFT_TAX_INPUT.giftAmount);
  const priorDeductionUsed = ref(DEFAULT_GIFT_TAX_INPUT.priorDeductionUsed);
  const relationship = ref<GiftTaxInput["relationship"]>(DEFAULT_GIFT_TAX_INPUT.relationship);
  const isGenerationSkipping = ref(DEFAULT_GIFT_TAX_INPUT.isGenerationSkipping);

  const result = computed(() =>
    calculateGiftTax({
      giftAmount: giftAmount.value,
      priorDeductionUsed: priorDeductionUsed.value,
      relationship: relationship.value,
      isGenerationSkipping: isGenerationSkipping.value,
    })
  );

  // 범위 밖 입력은 기본값 복귀가 아니라 경계 클램프이므로, 잘린 사실을 화면에 알린다
  const rangeNotices = computed(() =>
    giftTaxClampNotices({
      giftAmount: giftAmount.value,
      priorDeductionUsed: priorDeductionUsed.value,
    })
  );

  return {
    giftAmount,
    priorDeductionUsed,
    relationship,
    isGenerationSkipping,
    result,
    rangeNotices,
  };
}
