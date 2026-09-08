import type { ForeignStockTaxInput } from "@/lib/foreignStockTaxValidators";
import { sanitizeForeignStockTaxInput } from "@/lib/foreignStockTaxValidators";
import {
  BASIC_DEDUCTION,
  COMBINED_TAX_RATE,
  INCOME_TAX_RATE,
  LOCAL_TAX_RATE,
} from "@/data/foreignStockTax";

/**
 * 세액의 원 미만 끝수 처리 — 반올림이 아니라 절사(내림)다.
 *
 * 「국고금 관리법」 제47조는 끝수를 언제나 버리는 방향으로만 규정한다.
 * ① 국고금의 수입·지출에서 10원 미만의 끝수는 "계산하지 아니한다"
 * ② 국세의 과세표준액을 산정할 때 1원 미만의 끝수가 있으면 "이를 계산하지 아니한다"
 * 지방소득세도 「지방세기본법」 제59조가 같은 조를 준용하므로 방향이 같다.
 * 즉 끝수를 올려 세액을 키우는 근거 조문은 어디에도 없다 — Math.round는 법령상
 * 도달할 수 없는 1원 높은 세액을 만들 수 있어, 같은 22% 구조인 가상자산 계산기
 * (calculateCryptoTax)와도 결과가 갈렸다. 두 계산기를 절사로 통일한다.
 */
function truncWon(value: number): number {
  return Math.floor(value);
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

  const incomeTax = truncWon(taxableAmount * INCOME_TAX_RATE);
  const localTax = truncWon(taxableAmount * LOCAL_TAX_RATE);
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
