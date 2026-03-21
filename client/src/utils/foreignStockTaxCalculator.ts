import type { ForeignStockTaxInput } from "@/lib/foreignStockTaxValidators";
import { sanitizeForeignStockTaxInput } from "@/lib/foreignStockTaxValidators";
import {
  BASIC_DEDUCTION,
  COMBINED_TAX_RATE,
  INCOME_TAX_RATE,
  LOCAL_TAX_RATE,
} from "@/data/foreignStockTax";

function roundWon(value: number): number {
  return Math.round(value);
}

export function calculateForeignStockTax(input: ForeignStockTaxInput) {
  const normalized = sanitizeForeignStockTaxInput(input);
  const { sellAmount, buyAmount, fees, otherGains, otherLosses } = normalized;

  // 양도차익 = 매도가 - 매수가 - 필요경비
  const gain = sellAmount - buyAmount - fees;
  // 다른 종목 손익 합산
  const netGain = gain + otherGains - otherLosses;
  // 양도차익이 음수면 세금 없음
  const totalGain = Math.max(0, netGain);
  // 과세표준 = 양도차익 - 기본공제(250만원)
  const taxableAmount = Math.max(0, totalGain - BASIC_DEDUCTION);

  const incomeTax = roundWon(taxableAmount * INCOME_TAX_RATE);
  const localTax = roundWon(taxableAmount * LOCAL_TAX_RATE);
  const totalTax = incomeTax + localTax;
  const netProfit = netGain - totalTax;
  const effectiveRate = netGain > 0 ? totalTax / netGain : 0;

  return {
    sellAmount,
    buyAmount,
    fees,
    gain,
    otherGains,
    otherLosses,
    netGain,
    totalGain,
    basicDeduction: BASIC_DEDUCTION,
    taxableAmount,
    incomeTaxRate: INCOME_TAX_RATE,
    localTaxRate: LOCAL_TAX_RATE,
    combinedTaxRate: COMBINED_TAX_RATE,
    incomeTax,
    localTax,
    totalTax,
    netProfit,
    effectiveRate,
  };
}
