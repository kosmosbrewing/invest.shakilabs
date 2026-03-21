import { computed, ref } from "vue";
import { DEFAULT_FOREIGN_STOCK_TAX_INPUT } from "@/lib/foreignStockTaxValidators";
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

  return { sellAmount, buyAmount, fees, otherGains, otherLosses, result };
}
