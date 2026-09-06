// /foreign-stock-tax 파생 다이제스트 — 이 엔진의 특징은 세율이 아니라 입력 구조에 있다.
// 다른 종목의 이익·손실을 한 해 안에서 합산(손익통산)한 뒤 기본공제를 한 번 적용하고,
// 해를 넘기는 이월은 아예 없다. 게다가 sanitize가 범위 밖 입력을 잘라 내지 않고 기본값으로 되돌린다.
// 아래 수치는 전부 calculateForeignStockTax 실행값이다.

import type { ForeignStockTaxInput } from "@/lib/foreignStockTaxValidators";
import { calculateForeignStockTax } from "@/utils/foreignStockTaxCalculator";
import { type Finding, eul, eun, ga, ida, imnida, manwon, num, pct, ro, wa, won } from "./format";

/**
 * 화면 기본값과 같은 조건: 매도 5,000만원·매수 3,000만원·필요경비 50만원·다른 종목 손익 0원.
 *
 * DEFAULT_FOREIGN_STOCK_TAX_INPUT을 참조하지 않고 리터럴로 다시 적는 이유는 gift-tax와 같다 —
 * 같은 객체를 가리키면 드리프트 테스트의 toEqual이 자기 자신과의 비교가 되어 red가 날 수 없다.
 */
export const FOREIGN_BASE: ForeignStockTaxInput = {
  sellAmount: 50_000_000,
  buyAmount: 30_000_000,
  fees: 500_000,
  otherGains: 0,
  otherLosses: 0,
};

const run = (patch: Partial<ForeignStockTaxInput> = {}) =>
  calculateForeignStockTax({ ...FOREIGN_BASE, ...patch });

function baseCaseAnatomy(): Finding {
  const b = run();
  const withoutFees = run({ fees: 0 });
  const feeWorth = withoutFees.totalTax - b.totalTax;
  const nominal = b.combinedTaxRate;
  const shieldedShare = b.basicDeduction / b.netGain;
  return {
    h2: `순차익 ${manwon(b.netGain)}에 실제로 물리는 비율은 ${ida(pct(b.effectiveRate, 2))}`,
    body:
      `화면 기본값인 매도 ${manwon(FOREIGN_BASE.sellAmount)}·매수 ${manwon(FOREIGN_BASE.buyAmount)}·필요경비 ${eul(won(FOREIGN_BASE.fees))} 가정하면 손에 남는 세후 수익이 ${won(b.netProfit)}, 내야 할 세금이 ${imnida(won(b.totalTax))}. ` +
      `명목세율표는 ${eul(pct(nominal, 0))} 가리키는데 순차익 전체로 다시 나눈 비율이 ${pct(b.effectiveRate, 2)}에 그치는 것은, 기본공제가 순차익의 ${eul(pct(shieldedShare, 2))} 세율 앞에서 미리 덜어 내 과세표준이 ${eul(won(b.taxableAmount))} 남기기 때문입니다. ` +
      `여기서 눈에 잘 띄지 않는 항목이 필요경비인데, 같은 조건에서 이 칸만 비우면 세금이 ${ro(won(withoutFees.totalTax))} 올라 한 줄의 값어치가 ${imnida(won(feeWorth))}. ` +
      `증권사 앱의 원화 환산 금액을 옮겨 적을 때 수수료를 빼먹기 쉬운데, 그 순간 결과가 실제보다 그만큼 무겁게 나옵니다.`,
  };
}

function lossIsWorthTwentyTwoPercentUntilItIsNot(): Finding {
  const b = run();
  const perWon = b.combinedTaxRate;
  const costPerWonOfTax = 1 / perWon;
  let low = 0;
  let high = 30_000_000;
  for (let i = 0; i < 60; i += 1) {
    const mid = Math.floor((low + high) / 2);
    if (run({ otherLosses: mid }).totalTax > 0) low = mid;
    else high = mid;
  }
  const zeroPoint = high;
  const atZero = run({ otherLosses: zeroPoint });
  const beyond = run({ otherLosses: zeroPoint + 2_000_000 });
  return {
    h2: `세금 1원을 지우는 데 손실 ${num(costPerWonOfTax, 2)}원이 든다`,
    body:
      `기본값 조건을 가정하고 다른 종목의 손실만 늘리면 손실 ${won(100)}마다 세금이 ${won(perWon * 100)}씩 줄어듭니다. 뒤집어 말하면 세금 1원을 없애는 데 실제 손실 ${num(costPerWonOfTax, 2)}원이 든다는 뜻입니다. ` +
      `세금 ${eul(won(b.totalTax))} 통째로 0원으로 만들려면 손실이 ${eul(won(zeroPoint))} 채워야 하는데, 그 지점에서 세후 수익은 ${won(b.netProfit)}에서 ${ro(won(atZero.netProfit))} 내려앉습니다. ` +
      `그 위로 손실을 ${manwon(2_000_000)} 더 실현해도 세금은 ${ro(won(beyond.totalTax))} 그대로인데 세후 수익만 ${ga(won(beyond.netProfit))} 되므로, 공제선 아래로 내려간 손실은 이 계산기에서 값어치가 0원입니다. ` +
      `그래서 연말에 평가손실 종목을 정리할 때 "세금이 0원이 될 때까지"를 목표로 잡으면 손실을 필요 이상으로 확정하게 됩니다. 세금이 아니라 세후 수익을 기준으로 놓아야 이 지점을 지나치지 않습니다.`,
  };
}

function timingBeatsOrdering(): Finding {
  const win = 20_000_000;
  const lose = 10_000_000;
  const together = calculateForeignStockTax({
    sellAmount: win,
    buyAmount: 0,
    fees: 0,
    otherGains: 0,
    otherLosses: lose,
  });
  const winYear = calculateForeignStockTax({ sellAmount: win, buyAmount: 0, fees: 0, otherGains: 0, otherLosses: 0 });
  const loseYear = calculateForeignStockTax({
    sellAmount: 0,
    buyAmount: lose,
    fees: 0,
    otherGains: 0,
    otherLosses: 0,
  });
  const apart = winYear.totalTax + loseYear.totalTax;
  return {
    h2: `손실을 다른 해로 미루면 ${eul(manwon(apart - together.totalTax))} 더 낸다`,
    body:
      `이익 ${eul(manwon(win))} 낸 종목과 손실 ${eul(manwon(lose))} 낸 종목을 같은 해에 정리한다고 가정하면 순차익이 ${ga(won(together.netGain))} 되어 세금이 ${imnida(won(together.totalTax))}. ` +
      `두 거래를 다른 해로 갈라 놓으면 이익 해에 ${eul(won(winYear.totalTax))} 내고 손실 해에는 낼 세금이 ${ro(won(loseYear.totalTax))} 없어 합계가 ${ga(won(apart))} 되므로, 같은 두 거래인데 ${eul(won(apart - together.totalTax))} 더 냅니다. ` +
      `이 계산기에는 손실을 다음 해로 넘기는 이월공제가 없어 손실 해의 ${wa(won(Math.abs(loseYear.netGain)))} 그 해의 기본공제 ${ga(won(winYear.basicDeduction))} 함께 사라지기 때문입니다. ` +
      `이익을 먼저 실현하든 손실을 먼저 실현하든 결과가 같은 것도 같은 이유이며, 중요한 것은 순서가 아니라 두 거래가 같은 과세연도 안에 들어오는지입니다.`,
  };
}

function exchangeRateAloneCreatesTax(): Finding {
  const buy = FOREIGN_BASE.buyAmount;
  const fees = FOREIGN_BASE.fees;
  const sellAt = (rise: number) => Math.round(buy * (1 + rise));
  let low = 0;
  let high = 0.5;
  for (let i = 0; i < 60; i += 1) {
    const mid = (low + high) / 2;
    if (calculateForeignStockTax({ ...FOREIGN_BASE, sellAmount: sellAt(mid) }).totalTax === 0) low = mid;
    else high = mid;
  }
  const breakeven = (low + high) / 2;
  const at15 = run({ sellAmount: sellAt(0.15) });
  const at20 = run({ sellAmount: sellAt(0.2) });
  return {
    h2: `달러로 한 푼도 못 벌어도 환율 ${num(breakeven * 100, 1)}%면 세금이 붙는다`,
    body:
      `달러 기준 주가가 전혀 오르지 않았는데 환율만 올라 원화 환산 매도금액이 커지는 경우를 가정합니다. 매수 ${wa(won(buy))} 필요경비 ${eun(won(fees))} 기본값 그대로 두고 환율 상승률만 키우면, 상승률이 ${num(breakeven * 100, 1)}%에 이르는 순간 양도차익이 기본공제선에 정확히 닿아 그 위부터 세금이 붙기 시작합니다. ` +
      `15% 오르면 과세표준이 ${ga(won(at15.taxableAmount))} 되어 세금 ${won(at15.totalTax)}, 20% 오르면 ${ro(won(at20.totalTax))} 늘어나는데, 달러로 보면 원금 그대로인 계좌에서 나온 세금입니다. ` +
      `양도차익을 결제일 기준 원화로 환산해 잡는 구조라 환율이 주가와 똑같은 자격으로 차익에 들어오기 때문이며, 반대로 환율이 내리면 주가 이익이 상쇄돼 세금이 사라지기도 합니다. ` +
      `이 계산기는 환산이 끝난 원화 금액을 받으므로, 환율 시나리오를 바꿔 보려면 매도금액 칸의 숫자를 직접 바꿔 넣어야 합니다.`,
  };
}

function twoAccountsGetTwoDeductions(): Finding {
  const total = 20_000_000;
  const alone = calculateForeignStockTax({ sellAmount: total, buyAmount: 0, fees: 0, otherGains: 0, otherLosses: 0 });
  const half = calculateForeignStockTax({
    sellAmount: total / 2,
    buyAmount: 0,
    fees: 0,
    otherGains: 0,
    otherLosses: 0,
  });
  const saved = alone.totalTax - half.totalTax * 2;
  const small = 4_000_000;
  const smallAlone = calculateForeignStockTax({ sellAmount: small, buyAmount: 0, fees: 0, otherGains: 0, otherLosses: 0 });
  const smallHalf = calculateForeignStockTax({
    sellAmount: small / 2,
    buyAmount: 0,
    fees: 0,
    otherGains: 0,
    otherLosses: 0,
  });
  return {
    h2: `순차익을 둘로 나누면 공제가 두 번 붙어 ${eul(manwon(saved))} 아낀다`,
    body:
      `기본공제가 사람마다 따로 적용되므로, 순차익 ${eul(manwon(total))} 한 계좌에서 실현하는 경우와 두 계좌에서 ${manwon(total / 2)}씩 실현하는 경우를 가정해 보면 세금이 ${wa(won(alone.totalTax))} ${ro(won(half.totalTax * 2))} ${eul(won(saved))} 아낍니다. ` +
      `아끼는 금액은 공제 ${won(alone.basicDeduction)}에 세율을 곱한 값 그대로라, 순차익이 얼마든 같은 크기입니다. 다만 이는 나눈 뒤에도 양쪽 모두 공제를 다 쓸 만큼 차익이 남아 있을 때의 이야기입니다. ` +
      `순차익이 ${manwon(small)}인 경우를 가정하면 혼자 실현할 때 ${won(smallAlone.totalTax)}, 둘로 나눌 때 ${ro(won(smallHalf.totalTax * 2))} 아끼는 금액이 ${won(smallAlone.totalTax - smallHalf.totalTax * 2)}에 그쳐, 위의 값보다 작아집니다. ` +
      `한쪽 몫이 공제 아래로 내려가면 남는 공제가 버려지기 때문이며, 배우자 계좌로 주식을 옮기는 방식은 증여세 문제가 따로 걸린다는 점도 함께 봐야 합니다.`,
  };
}

function sellAmountTellsYouNothing(): Finding {
  const sell = 100_000_000;
  const at = (buyAmount: number) =>
    calculateForeignStockTax({ sellAmount: sell, buyAmount, fees: 0, otherGains: 0, otherLosses: 0 });
  const none = at(0);
  const mid = at(50_000_000);
  const thin = at(80_000_000);
  const flat = at(97_500_000);
  return {
    h2: `매도 ${manwon(sell)}의 세금은 0원일 수도 ${ida(manwon(none.totalTax))}`,
    body:
      `매도금액을 ${ro(won(sell))} 고정해 두고 취득가만 바꾼다고 가정하면, 취득가 0원에서 세금이 ${won(none.totalTax)}, ${manwon(50_000_000)}에서 ${won(mid.totalTax)}, ${manwon(80_000_000)}에서 ${won(thin.totalTax)}, ${manwon(97_500_000)}에서 ${ro(won(flat.totalTax))} 갈립니다. ` +
      `매도금액 대비로 환산하면 ${pct(none.totalTax / sell, 2)}에서 ${pct(flat.totalTax / sell, 0)}까지 벌어지므로, "얼마어치를 팔면 세금이 얼마"라는 물음에는 답이 존재하지 않습니다. ` +
      `엔진이 매도금액을 그대로 쓰지 않고 매수금액·필요경비를 뺀 차이만 남기기 때문이며, 그래서 매도 ${manwon(FOREIGN_BASE.sellAmount)}과 매도 ${manwon(500_000_000)}이 똑같이 ${eul(won(run({ sellAmount: 500_000_000, buyAmount: 480_000_000 }).totalTax))} 내는 조합도 만들어집니다. ` +
      `거래 규모가 아니라 차익만 세금을 정하므로, 매도 규모를 줄여 세금을 줄이려는 계획은 취득가를 함께 옮기지 않는 한 성립하지 않습니다.`,
  };
}

function outOfRangeInputSilentlyResets(): Finding {
  const b = run();
  const raw = (sellAmount: number) => calculateForeignStockTax({ ...FOREIGN_BASE, sellAmount });
  const fractional = raw(70_000_000.5);
  const overRange = raw(60_000_000_000);
  const negative = raw(-1);
  const valid = raw(70_000_000);
  return {
    h2: `소수점을 붙이면 입력이 통째로 기본값으로 되돌아간다`,
    body:
      `매도금액 칸에 ${eul(won(70_000_000))} 넣으면 세금이 ${ro(won(valid.totalTax))} 나오는데, 똑같은 값에 소수점 아래 5만 붙여 넣는 경우를 가정하면 결과가 ${ro(won(fractional.totalTax))} 돌아갑니다. 이는 기본값 ${manwon(FOREIGN_BASE.sellAmount)}으로 계산한 값 ${wa(won(b.totalTax))} 정확히 같습니다. ` +
      `입력 검증이 정수·0 이상·500억원 이하만 통과시키고 벗어난 값은 잘라 내는 대신 기본값으로 되돌리기 때문이며, ${eul(won(60_000_000_000))} 넣어도 ${won(overRange.totalTax)}, 음수를 넣어도 ${ro(won(negative.totalTax))} 같은 결과가 나옵니다. ` +
      `화면에는 오류 표시 없이 숫자만 바뀌므로, 값을 넣었는데 결과가 처음 화면과 똑같다면 계산이 안 된 것이 아니라 입력이 되돌려진 것일 수 있습니다. ` +
      `원 단위 정수로, 그리고 허용 범위 안에서 넣어야 넣은 값 그대로 계산됩니다.`,
  };
}

function otherGainsAreIndistinguishable(): Finding {
  const bumped = run({ sellAmount: FOREIGN_BASE.sellAmount + 10_000_000 });
  const viaOther = run({ otherGains: 10_000_000 });
  const b = run();
  return {
    h2: `다른 종목 이익과 매도금액 인상은 세금이 완전히 같다`,
    body:
      `기본값에서 매도금액만 ${manwon(10_000_000)} 올린 경우를 가정하면 세금이 ${ga(won(bumped.totalTax))} 되는데, 대신 다른 종목 이익 칸에 같은 ${eul(manwon(10_000_000))} 넣어도 ${ro(won(viaOther.totalTax))} 1원도 다르지 않습니다. ` +
      `엔진이 매도금액·매수금액·필요경비·다른 종목 이익·다른 종목 손실을 모두 한 줄의 덧셈으로 합쳐 순차익 하나만 남기기 때문이며, 어느 칸에 넣었는지는 결과에 흔적을 남기지 않습니다. ` +
      `그래서 종목이 몇 개인지, 어느 나라 주식인지, 얼마나 오래 들고 있었는지는 이 계산기에서 구분되지 않고, 세금은 ${won(b.totalTax)}에서 ${ro(won(bumped.totalTax))} 올라간 폭만 보여 줍니다. ` +
      `실제 신고에서는 종목별 취득가와 결제일 환율을 따로 적어야 하므로, 이 계산기의 결과는 합계 확인용으로만 쓰는 편이 안전합니다.`,
  };
}

function sameTenMillionCostsDifferentTax(): Finding {
  const add = 10_000_000;
  const rich = run();
  const richPlus = run({ otherGains: add });
  const thinBase = run({ otherLosses: 18_500_000 });
  const thinPlus = run({ otherLosses: 18_500_000, otherGains: add });
  const richDelta = richPlus.totalTax - rich.totalTax;
  const thinDelta = thinPlus.totalTax - thinBase.totalTax;
  return {
    h2: `같은 ${manwon(add)} 이익에 붙는 세금이 두 가지다`,
    body:
      `기본값 조건에서 다른 종목 이익 ${eul(manwon(add))} 더하면 세금이 ${won(rich.totalTax)}에서 ${ro(won(richPlus.totalTax))} ${won(richDelta)} 늘어, 더한 금액의 ${imnida(pct(richDelta / add, 0))}. ` +
      `그런데 다른 종목 손실 ${eul(manwon(18_500_000))} 먼저 반영해 순차익이 공제 아래인 경우를 가정하고 같은 ${eul(manwon(add))} 더하면, 세금이 ${won(thinBase.totalTax)}에서 ${ro(won(thinPlus.totalTax))} ${won(thinDelta)} 늘어 ${pct(thinDelta / add, 2)}에 그칩니다. ` +
      `앞의 경우는 공제를 이미 다 써 버려 더한 금액 전부가 과세 대상이 되는 반면, 뒤의 경우는 더한 금액의 일부가 남아 있던 공제를 채우는 데 먼저 쓰이기 때문입니다. ` +
      `그래서 "해외주식 이익에는 22%가 붙는다"는 말은 공제를 이미 소진한 상태에서만 맞고, 남은 공제가 얼마인지를 모르면 추가 매도의 세 부담을 가늠할 수 없습니다.`,
  };
}

export const FOREIGN_STOCK_TAX_DIGEST: Finding[] = [
  baseCaseAnatomy(),
  lossIsWorthTwentyTwoPercentUntilItIsNot(),
  timingBeatsOrdering(),
  exchangeRateAloneCreatesTax(),
  twoAccountsGetTwoDeductions(),
  sellAmountTellsYouNothing(),
  outOfRangeInputSilentlyResets(),
  otherGainsAreIndistinguishable(),
  sameTenMillionCostsDifferentTax(),
];
