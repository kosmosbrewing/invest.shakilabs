import { computed, ref, type ComputedRef, type Ref } from "vue";
import {
  DEFAULT_GIFT_TAX_INPUT,
  type GiftTaxInput,
} from "@/lib/giftTaxValidators";
import { calculateGiftTax } from "@/utils/giftTaxCalculator";

export type GiftTaxCalcResult = {
  giftAmount: Ref<number>;
  priorDeductionUsed: Ref<number>;
  relationship: Ref<GiftTaxInput["relationship"]>;
  isGenerationSkipping: Ref<boolean>;
  result: ComputedRef<ReturnType<typeof calculateGiftTax>>;
};

export function useGiftTaxCalc(): GiftTaxCalcResult {
  const giftAmount = ref(DEFAULT_GIFT_TAX_INPUT.giftAmount);
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

  return {
    giftAmount,
    priorDeductionUsed,
    relationship,
    isGenerationSkipping,
    result,
  };
}
