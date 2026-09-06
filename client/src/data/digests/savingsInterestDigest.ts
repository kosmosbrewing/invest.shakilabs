// /savings-interest 파생 다이제스트 — 적금 이자는 "월 적립액 × 월이율 × n(n+1)/2"라
// 회차마다 예치 기간이 달라, 표면금리와 실제로 손에 남는 비율이 구조적으로 어긋난다.
// 아래 수치는 전부 calculateSavingsInterest(및 교차 비교용 calculateDepositInterest) 실행값이다.

import type { TaxType } from "@/data/interestData";
import {
  calculateDepositInterest,
  calculateSavingsInterest,
  type SavingsInterestInput,
} from "@/utils/interestCalculator";
import { type Finding, eul, ga, ida, imnida, num, pct, pp, ro, times, wa, won } from "./format";

/**
 * 화면 기본값과 같은 조건: 월 30만원·12개월·연 3.5%·일반과세.
 *
 * useSavingsInterestCalc()의 ref 초기값을 import해 쓰지 않고 리터럴로 다시 적는 이유는
 * gift-tax에서와 같다 — 같은 출처를 참조하면 드리프트 테스트가 자기 자신과의 비교가 되어
 * 화면 기본값이 무엇으로 바뀌든 절대 red가 되지 않는다. 산문은 "월 30만원"·"일반과세"처럼
 * 라벨을 문장에 박아 두므로, 기준값이 조용히 움직이면 문장이 거짓이 된다.
 */
export const SAVINGS_BASE: SavingsInterestInput = {
  monthlyDeposit: 300_000,
  months: 12,
  annualRate: 3.5,
  taxType: "normal",
};

const run = (patch: Partial<SavingsInterestInput> = {}) =>
  calculateSavingsInterest({ ...SAVINGS_BASE, ...patch });
const asDeposit = (principal: number, months: number, annualRate: number) =>
  calculateDepositInterest({ principal, months, annualRate, taxType: "normal", paymentType: "maturity" });

/** 같은 세후 이자를 내려면 표면금리가 얼마여야 하는지 — 엔진을 이분 탐색해 찾는다. */
function rateForSameNet(targetNet: number, taxType: TaxType): number {
  let lo = 0;
  let hi = 20;
  for (let i = 0; i < 60; i += 1) {
    const mid = (lo + hi) / 2;
    if (run({ annualRate: mid, taxType }).netInterest < targetNet) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** 같은 총 납입액·같은 기간의 예금이 적금과 같은 이자를 내는 예금 금리. */
function depositRateMatchingSavings(months: number): number {
  const target = run({ months }).grossInterest;
  const principal = SAVINGS_BASE.monthlyDeposit * months;
  let lo = 0;
  let hi = SAVINGS_BASE.annualRate;
  for (let i = 0; i < 60; i += 1) {
    const mid = (lo + hi) / 2;
    if (asDeposit(principal, months, mid).grossInterest < target) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

function headlineRateIsNotTheReturn(): Finding {
  const b = run();
  const ratio = b.effectiveRate / (SAVINGS_BASE.annualRate / 100);
  const grossRate = b.grossInterest / b.totalPrincipal;
  const avgMonths = (SAVINGS_BASE.months + 1) / 2;
  return {
    h2: `연 ${SAVINGS_BASE.annualRate}% 적금의 세후 실효 수익률은 ${ida(pct(b.effectiveRate, 4))}`,
    body:
      `월 ${num(SAVINGS_BASE.monthlyDeposit / 10_000)}만원을 연 ${SAVINGS_BASE.annualRate}%로 ${SAVINGS_BASE.months}개월, 일반과세를 가정하면 원금 ${won(b.totalPrincipal)}에 세전 이자 ${won(b.grossInterest)}, 이자소득세 ${eul(won(b.tax))} 뗀 세후 이자가 ${won(b.netInterest)}, 만기 수령액이 ${imnida(won(b.maturityAmount))}. ` +
      `세후 이자를 총 원금으로 나눈 실효 수익률은 ${pct(b.effectiveRate, 4)}로 표면금리의 ${pct(ratio, 2)}에 그치는데, 첫 회차만 ${SAVINGS_BASE.months}개월치 이자를 받고 마지막 회차는 1개월치만 받아 회차별 평균 예치 기간이 ${num(avgMonths, 1)}개월이기 때문입니다. ` +
      `세금을 아예 걷어 내도 세전 기준 비율이 ${ro(pct(grossRate, 4))} 절반을 겨우 넘는 수준이라, 사라진 절반의 원인은 과세가 아니라 적립 구조 쪽입니다. ` +
      `그래서 적금과 다른 상품을 비교할 때 표면금리끼리 맞대는 것은 단위가 다른 두 숫자를 겹쳐 놓는 셈입니다.`,
  };
}

function annualisedRatioFalls(): Finding {
  const steps = [6, 12, 36, 60].map((months) => {
    const r = run({ months });
    return { months, annualised: (r.effectiveRate * 12) / months };
  });
  const [m6, m12, m36, m60] = steps;
  const nominal = SAVINGS_BASE.annualRate / 100;
  // 비율 = (n+1)/(2n) × (1 − 세율). (n+1)/(2n)이 1/2보다 항상 크므로 세후 배수의 절반이 바닥이다.
  const floor = (1 - run().tax / run().grossInterest) / 2;
  return {
    h2: `기간을 늘릴수록 연환산 실효 수익률은 오히려 내려간다`,
    body:
      `월 ${num(SAVINGS_BASE.monthlyDeposit / 10_000)}만원·연 ${SAVINGS_BASE.annualRate}%·일반과세를 가정하고 기간만 바꾸면 연환산 실효 수익률이 ${m6.months}개월 ${pct(m6.annualised, 4)}, ${m12.months}개월 ${pct(m12.annualised, 4)}, ${m36.months}개월 ${pct(m36.annualised, 4)}, ${m60.months}개월 ${ro(pct(m60.annualised, 4))} 계속 내려갑니다. ` +
      `이자 총액은 기간과 함께 커지는데 연환산 수익률만 반대로 가는 것은, 이 비율이 (개월수 + 1) ÷ (2 × 개월수)에 세후 배수를 곱한 값이라 개월수가 커질수록 절반 쪽으로 눌리기 때문입니다. ` +
      `표면금리 대비로 보면 ${m6.months}개월 ${pct(m6.annualised / nominal, 2)}에서 ${m60.months}개월 ${ro(pct(m60.annualised / nominal, 2))} 낮아지는데, 그럼에도 표면금리의 ${pct(floor, 1)} 아래로 내려가는 기간은 존재하지 않습니다. ` +
      `1개월짜리 적금만이 예금과 같은 조건이 되어 이 비율이 세후 배수 전체에 닿고, 기간이 붙는 순간부터는 예외 없이 깎입니다.`,
  };
}

function depositSizeDoesNotMatter(): Finding {
  const small = run({ monthlyDeposit: 100_000 });
  const big = run({ monthlyDeposit: 5_000_000 });
  return {
    h2: `월 납입액을 50배로 키워도 실효 수익률은 그대로다`,
    body:
      `연 ${SAVINGS_BASE.annualRate}%·${SAVINGS_BASE.months}개월·일반과세를 가정하고 월 납입액만 ${won(100_000)}에서 ${ro(won(5_000_000))} 50배 늘리면 세전 이자는 ${won(small.grossInterest)}에서 ${ro(won(big.grossInterest))} 그대로 50배가 되지만, 실효 수익률은 ${pct(small.effectiveRate, 6)}에서 ${ro(pct(big.effectiveRate, 6))} 소수점 여섯째 자리에서만 달라집니다. ` +
      `이자도 원금도 월 납입액에 정비례하므로 그 비율에서는 납입액이 통째로 약분되고, 남는 미세한 차이는 원 단위 반올림이 세금 계산에서 한 번 더 걸리기 때문입니다. ` +
      `그래서 "얼마를 넣느냐"는 이자 금액만 정하고 수익률은 건드리지 못하며, 수익률을 움직이는 손잡이는 금리·기간·과세 유형 셋뿐입니다. ` +
      `납입액을 늘려 수익률이 좋아지기를 기대했다면 이 계산기에서는 그 기대가 성립하지 않습니다.`,
  };
}

function marginalMonthIsTwiceAverage(): Finding {
  const b = run();
  const next = run({ months: SAVINGS_BASE.months + 1 });
  const delta = next.grossInterest - b.grossInterest;
  const marginal = delta / SAVINGS_BASE.monthlyDeposit;
  const average = b.grossInterest / b.totalPrincipal;
  const short = { at: run({ months: 6 }), next: run({ months: 7 }) };
  const long = { at: run({ months: 36 }), next: run({ months: 37 }) };
  const shortMarginal = (short.next.grossInterest - short.at.grossInterest) / SAVINGS_BASE.monthlyDeposit;
  const longMarginal = (long.next.grossInterest - long.at.grossInterest) / SAVINGS_BASE.monthlyDeposit;
  return {
    h2: `기간 1개월 연장의 이자 효율은 평균의 정확히 2배다`,
    body:
      `월 ${num(SAVINGS_BASE.monthlyDeposit / 10_000)}만원·연 ${SAVINGS_BASE.annualRate}% 가정에서 기간을 ${SAVINGS_BASE.months}개월에서 ${SAVINGS_BASE.months + 1}개월로 한 달 늘리면 원금은 ${won(SAVINGS_BASE.monthlyDeposit)} 늘고 세전 이자는 ${won(b.grossInterest)}에서 ${ro(won(next.grossInterest))} ${won(delta)} 늘어, 늘어난 원금 대비 ${imnida(pct(marginal, 4))}. ` +
      `같은 적금의 평균(세전 이자 ÷ 총 원금)이 ${pct(average, 4)}라 정확히 ${ga(times(marginal, average))} 되는데, 한 달을 더 붙이면 이미 넣어 둔 회차 전부가 이자를 한 달치씩 더 받기 때문입니다. ` +
      `이 2배는 우연이 아니라 기간과 무관한 항등식이라, 6개월에서 7개월로 갈 때도 ${wa(pct(shortMarginal, 4))} ${pct(short.at.grossInterest / short.at.totalPrincipal, 4)}, 36개월에서 37개월로 갈 때도 ${wa(pct(longMarginal, 4))} ${ro(pct(long.at.grossInterest / long.at.totalPrincipal, 4))} 같은 배수가 나옵니다. ` +
      `따라서 만기를 한 칸 길게 잡을지 고민할 때 비교 기준으로 삼아야 할 값은 표면금리가 아니라 이 한계 효율입니다.`,
  };
}

function taxTypeAsRateBump(): Finding {
  const normal = run();
  const pref = run({ taxType: "preferential" });
  const free = run({ taxType: "tax_free" });
  const needForFree = rateForSameNet(free.netInterest, "normal");
  const bump = needForFree - SAVINGS_BASE.annualRate;
  const low = rateForSameNet(run({ annualRate: 2, taxType: "tax_free" }).netInterest, "normal") - 2;
  const high = rateForSameNet(run({ annualRate: 5, taxType: "tax_free" }).netInterest, "normal") - 5;
  return {
    h2: `비과세 전환은 금리를 ${pp(bump, 4)} 올린 것과 같다`,
    body:
      `월 ${num(SAVINGS_BASE.monthlyDeposit / 10_000)}만원·${SAVINGS_BASE.months}개월·연 ${SAVINGS_BASE.annualRate}%를 가정하면 세후 이자가 일반과세 ${won(normal.netInterest)}, 조합 예탁금 가정 ${won(pref.netInterest)}, 비과세 ${ro(won(free.netInterest))} 갈립니다. ` +
      `일반과세를 유지한 채 비과세와 같은 세후 이자를 만들려면 표면금리가 연 ${pct(needForFree / 100, 4)}여야 하므로, 비과세라는 조건은 금리 ${eul(pp(bump, 4))} 얹은 것과 같은 값입니다. ` +
      `그런데 이 환산값은 고정이 아니라 금리에 비례해서, 연 2% 상품에서는 ${pp(low, 4)}, 연 5% 상품에서는 ${ro(pp(high, 4))} 커집니다. ` +
      `세금이 이자에 비례하는 이상 금리가 낮을수록 세제 혜택의 금리 환산값도 같이 작아지므로, 저금리 구간에서는 우대 과세를 좇는 것보다 금리 자체를 올리는 편이 유리합니다.`,
  };
}

function depositBeatsSavingsButNeverDoubles(): Finding {
  const b = run();
  const same = asDeposit(b.totalPrincipal, SAVINGS_BASE.months, SAVINGS_BASE.annualRate);
  const short = { s: run({ months: 3 }), d: asDeposit(SAVINGS_BASE.monthlyDeposit * 3, 3, SAVINGS_BASE.annualRate) };
  const long = { s: run({ months: 60 }), d: asDeposit(SAVINGS_BASE.monthlyDeposit * 60, 60, SAVINGS_BASE.annualRate) };
  const veryLong = { s: run({ months: 240 }), d: asDeposit(SAVINGS_BASE.monthlyDeposit * 240, 240, SAVINGS_BASE.annualRate) };
  return {
    h2: `목돈이 있으면 예금 이자가 적금의 ${ida(times(same.grossInterest, b.grossInterest))}`,
    body:
      `총 납입액 ${won(b.totalPrincipal)}·연 ${SAVINGS_BASE.annualRate}%·${SAVINGS_BASE.months}개월로 조건을 맞췄다고 가정하면 세전 이자가 적금 ${won(b.grossInterest)}, 예금 ${ro(won(same.grossInterest))} ${times(same.grossInterest, b.grossInterest)} 차이입니다. ` +
      `이 배수는 기간에 따라 3개월 ${times(short.d.grossInterest, short.s.grossInterest)}, 60개월 ${times(long.d.grossInterest, long.s.grossInterest)}, 240개월 ${ro(times(veryLong.d.grossInterest, veryLong.s.grossInterest))} 커지는데, 값이 (2 × 개월수) ÷ (개월수 + 1)이라 기간이 길어질수록 2배 쪽으로 밀리면서도 결코 2배에 닿지는 않습니다. ` +
      `적금 상품의 표면금리가 예금보다 높게 붙는 관행은 이 배수를 메우려는 것이므로, 같은 돈이 이미 손에 있다면 금리 차이가 이 배수를 넘는지부터 따져야 합니다. ` +
      `반대로 목돈이 없어 매달 만들어 넣는 상황이라면 애초에 예금은 선택지가 아니어서 이 비교 자체가 성립하지 않습니다.`,
  };
}

function savingsRateInDepositTerms(): Finding {
  const at12 = depositRateMatchingSavings(12);
  const at6 = depositRateMatchingSavings(6);
  const at24 = depositRateMatchingSavings(24);
  const at36 = depositRateMatchingSavings(36);
  return {
    h2: `연 ${SAVINGS_BASE.annualRate}% 적금 ${SAVINGS_BASE.months}개월은 연 ${pct(at12 / 100, 4)} 예금과 같다`,
    body:
      `총 납입액과 기간을 똑같이 맞춘 예금이 이 적금과 같은 세전 이자를 내는 금리를 엔진에서 되짚으면 ${SAVINGS_BASE.months}개월에서 연 ${ga(pct(at12 / 100, 4))} 나옵니다. 광고에 붙은 연 ${SAVINGS_BASE.annualRate}%를 예금 상품과 나란히 놓으려면 이 값으로 옮겨 적어야 한다는 뜻입니다. ` +
      `환산 금리는 기간이 길수록 더 내려가서 6개월 ${pct(at6 / 100, 4)}, 24개월 ${pct(at24 / 100, 4)}, 36개월 ${ga(pct(at36 / 100, 4))} 되므로, 만기가 긴 적금일수록 표면금리와 실제 값어치의 거리가 멀어집니다. ` +
      `가정을 바꿔 월 납입액을 얼마로 잡든 이 환산 금리는 움직이지 않는데, 적금과 예금의 이자가 둘 다 납입액에 정비례해 비교에서 약분되기 때문입니다. ` +
      `결국 두 상품을 한 줄에 세우려면 금리표가 아니라 이 환산값을 기준으로 삼아야 합니다.`,
  };
}

function halfTimeIsNotHalfInterest(): Finding {
  const b = run();
  const at = (month: number) => b.monthlyData[month - 1].interest;
  const half = SAVINGS_BASE.months / 2;
  const atHalf = at(half);
  const at8 = at(8);
  const at9 = at(9);
  return {
    h2: `기간 절반이 지나도 이자는 만기의 ${ida(pct(atHalf / b.grossInterest, 2))}`,
    body:
      `월 ${num(SAVINGS_BASE.monthlyDeposit / 10_000)}만원·연 ${SAVINGS_BASE.annualRate}%·${SAVINGS_BASE.months}개월 가정에서 ${half}개월째 누적 세전 이자는 ${ro(won(atHalf))} 만기 ${won(b.grossInterest)}의 ${imnida(pct(atHalf / b.grossInterest, 2))}. ` +
      `원금은 ${half}개월째에 정확히 절반인 ${ga(won(SAVINGS_BASE.monthlyDeposit * half))} 쌓이는데 이자만 뒤처지는 것은, 누적 이자가 개월수의 제곱에 가깝게 늘어 뒤쪽 회차에 몰리기 때문입니다. ` +
      `누적 이자가 만기의 절반을 넘는 시점은 8개월(${won(at8)}·${pct(at8 / b.grossInterest, 2)})이 아니라 9개월(${won(at9)}·${pct(at9 / b.grossInterest, 2)})이라, 기간의 4분의 3을 지나야 이자의 절반이 모입니다. ` +
      `그래서 중도해지 금리를 따지기 전에 이미 시점만으로 손해가 결정되는 구간이 있습니다. 다만 이 계산기는 만기까지 채우는 경우만 다루므로 중도해지 시 적용되는 금리는 별도로 확인해야 합니다.`,
  };
}

function roundingDeadZone(): Finding {
  const base = run();
  let width = 1;
  while (run({ monthlyDeposit: SAVINGS_BASE.monthlyDeposit + width }).grossInterest === base.grossInterest) width += 1;
  const nextStep = run({ monthlyDeposit: SAVINGS_BASE.monthlyDeposit + width });
  const wonPerDeposit = base.grossInterest / SAVINGS_BASE.monthlyDeposit;
  return {
    h2: `월 납입액 ${width - 1}원을 더 넣어도 이자는 1원도 늘지 않는다`,
    body:
      `연 ${SAVINGS_BASE.annualRate}%·${SAVINGS_BASE.months}개월·일반과세 가정에서 월 납입액을 ${won(SAVINGS_BASE.monthlyDeposit)}에서 1원씩 올려 보면 ${won(SAVINGS_BASE.monthlyDeposit + width - 1)}까지는 세전 이자가 ${ro(won(base.grossInterest))} 완전히 같고, ${won(SAVINGS_BASE.monthlyDeposit + width)}에 이르러서야 ${ro(won(nextStep.grossInterest))} 1원 오릅니다. ` +
      `이자 1원을 만들어 내는 데 필요한 월 납입액이 ${num(1 / wonPerDeposit, 2)}원이라, 그 폭 안의 증액은 반올림에 통째로 삼켜지기 때문입니다. ` +
      `그래서 자동이체 금액을 몇 원 단위로 다듬는 일은 이 계산기에서 아무 값도 만들지 못하고, 의미가 생기려면 최소한 이 계단 하나를 넘겨야 합니다. ` +
      `반대로 말하면 만기 수령액이 예상과 1~2원 어긋나는 것은 오류가 아니라 이 계단에서 생기는 정상 오차입니다.`,
  };
}

export const SAVINGS_INTEREST_DIGEST: Finding[] = [
  headlineRateIsNotTheReturn(),
  annualisedRatioFalls(),
  depositSizeDoesNotMatter(),
  marginalMonthIsTwiceAverage(),
  taxTypeAsRateBump(),
  depositBeatsSavingsButNeverDoubles(),
  savingsRateInDepositTerms(),
  halfTimeIsNotHalfInterest(),
  roundingDeadZone(),
];
