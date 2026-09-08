import { computed, ref } from "vue";
import {
  DEFAULT_FOREIGN_STOCK_TAX_INPUT,
  foreignStockTaxClampNotices,
} from "@/lib/foreignStockTaxValidators";
import { calculateForeignStockTax } from "@/utils/foreignStockTaxCalculator";

export function useForeignStockTaxCalc(initialSellAmount?: number) {
  const sellAmount = ref(initialSellAmount ?? DEFAULT_FOREIGN_STOCK_TAX_INPUT.sellAmount);
  const buyAmount = ref(DEFAULT_FOREIGN_STOCK_TAX_INPUT.buyAmount);
  const fees = ref(DEFAULT_FOREIGN_STOCK_TAX_INPUT.fees);
  const otherGains = ref(DEFAULT_FOREIGN_STOCK_TAX_INPUT.otherGains);
  const otherLosses = ref(DEFAULT_FOREIGN_STOCK_TAX_INPUT.otherLosses);

  const result = computed(() =>
    calculateForeignStockTax({
      sellAmount: sellAmount.value,
      buyAmount: buyAmount.value,
      fees: fees.value,
      otherGains: otherGains.value,
      otherLosses: otherLosses.value,
    })
  );

  // 범위 밖 입력은 기본값 복귀가 아니라 경계 클램프이므로, 잘린 사실을 화면에 알린다
  const rangeNotices = computed(() =>
    foreignStockTaxClampNotices({
      sellAmount: sellAmount.value,
      buyAmount: buyAmount.value,
      fees: fees.value,
      otherGains: otherGains.value,
      otherLosses: otherLosses.value,
    })
  );

  return { sellAmount, buyAmount, fees, otherGains, otherLosses, result, rangeNotices };
}
