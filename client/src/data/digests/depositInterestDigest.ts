// /deposit-interest 파생 다이제스트 — 예금 엔진은 겉보기와 달리 한 갈래가 아니다.
// 만기일시는 round(원금 × 연이율 × 개월/12)을 한 번, 월이자식은 round(원금 × 연이율/12)을
// 매월 적용해 개월수만큼 곱하므로, 반올림 오차가 한쪽에서만 누적돼 두 방식의 총이자가 어긋난다.
// 아래 수치는 전부 calculateDepositInterest 실행값이다.

import {
  calculateDepositInterest,
  type DepositInterestInput,
} from "@/utils/interestCalculator";
import { type Finding, eul, eun, ga, imnida, manwon, num, pct, ro, wa, won } from "./format";

/**
 * 화면 기본값과 같은 조건: 원금 1,000만원·12개월·연 3.5%·일반과세·만기일시지급.
 *
 * useDepositInterestCalc()의 ref 초기값을 참조하지 않고 리터럴로 다시 적는다 —
 * 같은 출처를 가리키면 드리프트 테스트가 자기 자신과의 비교가 되어 red가 날 수 없다.
 * 산문이 "만기일시지급"·"일반과세"를 문장에 박아 두므로 라벨 필드까지 따로 못박아야 한다.
 */
export const DEPOSIT_BASE: DepositInterestInput = {
  principal: 10_000_000,
  months: 12,
  annualRate: 3.5,
  taxType: "normal",
  paymentType: "maturity",
};

const run = (patch: Partial<DepositInterestInput> = {}) =>
  calculateDepositInterest({ ...DEPOSIT_BASE, ...patch });
const monthly = (patch: Partial<DepositInterestInput> = {}) => run({ ...patch, paymentType: "monthly" });

/** 원금을 10만원 단위로 훑어 두 지급 방식의 세전 이자 차이를 센다. */
function paymentGapCensus(months: number) {
  let ahead = 0;
  let behind = 0;
  let level = 0;
  for (let principal = 1_000_000; principal <= 100_000_000; principal += 100_000) {
    const gap = monthly({ principal, months }).grossInterest - run({ principal, months }).grossInterest;
    if (gap > 0) ahead += 1;
    else if (gap < 0) behind += 1;
    else level += 1;
  }
  return { ahead, behind, level, total: ahead + behind + level };
}

/** 1원 단위로 훑어 두 방식의 세전 이자 차이가 벌어지는 최대 폭을 찾는다. */
function widestPaymentGap(months: number) {
  let max = 0;
  let min = 0;
  for (let principal = 10_000_000; principal <= 10_001_000; principal += 1) {
    const gap = monthly({ principal, months }).grossInterest - run({ principal, months }).grossInterest;
    if (gap > max) max = gap;
    if (gap < min) min = gap;
  }
  return { max, min, widest: Math.max(max, -min) };
}

function paymentTypeSplitsTheSameProduct(): Finding {
  const atMaturity = run();
  const perMonth = monthly();
  const gap = perMonth.grossInterest - atMaturity.grossInterest;
  const exact = (DEPOSIT_BASE.principal * (DEPOSIT_BASE.annualRate / 100)) / 12;
  return {
    h2: `같은 예금인데 지급 방식만 바꾸면 이자가 ${won(gap)} 갈린다`,
    body:
      `원금 ${won(DEPOSIT_BASE.principal)}·${DEPOSIT_BASE.months}개월·연 ${DEPOSIT_BASE.annualRate}%·일반과세를 가정하면 만기일시지급의 세전 이자는 ${ga(won(atMaturity.grossInterest))}지만, 월이자지급으로 바꾸면 ${ro(won(perMonth.grossInterest))} ${won(gap)} 많아집니다. ` +
      `만기일시는 전체 기간을 한 번에 곱해 마지막에 딱 한 번 원 단위로 맞추는 반면, 월이자식은 ${num(exact, 4)}원인 월이자를 ${ro(won(perMonth.monthlyInterestGross))} 올림한 뒤 ${DEPOSIT_BASE.months}번 곱하기 때문입니다. ` +
      `세후로도 격차가 남아 각각 ${wa(won(atMaturity.netInterest))} ${ro(won(perMonth.netInterest))} 갈리는데, 세금이 이미 어긋난 세전 이자 위에서 다시 계산되기 때문입니다. ` +
      `금액 자체는 커피 한 잔에도 못 미치지만, 같은 상품·같은 금리에서 나온 두 숫자가 다르다는 사실이 이 계산기의 구조를 드러냅니다.`,
  };
}

function whoWinsDependsOnPrincipal(): Finding {
  const census = paymentGapCensus(DEPOSIT_BASE.months);
  const short = widestPaymentGap(6);
  const long = widestPaymentGap(36);
  const wide = widestPaymentGap(DEPOSIT_BASE.months);
  return {
    h2: `월이자 방식이 유리한 원금은 셋 중 하나뿐이다`,
    body:
      `연 ${DEPOSIT_BASE.annualRate}%·${DEPOSIT_BASE.months}개월 가정으로 원금을 ${won(1_000_000)}부터 ${won(100_000_000)}까지 10만원 단위로 ${num(census.total)}개 훑으면, 월이자식이 앞서는 원금이 ${num(census.ahead)}개, 뒤지는 원금이 ${num(census.behind)}개, 완전히 같은 원금이 ${num(census.level)}개로 거의 정확히 삼등분됩니다. ` +
      `한쪽이 늘 유리한 것이 아니라 월이자 한 번의 반올림이 올림이냐 내림이냐에 따라 부호가 뒤집히기 때문이며, 그 오차가 개월수만큼 곱해지므로 격차의 한계도 기간에 비례합니다. ` +
      `1원 단위로 다시 재면 벌어질 수 있는 최대 폭이 6개월 ${won(short.widest)}, ${DEPOSIT_BASE.months}개월 ${won(wide.widest)}, 36개월 ${ro(won(long.widest))} 기간에 정비례해 커집니다. ` +
      `그러므로 "월이자로 받으면 조금 더 받는다"는 말은 특정 원금에서만 맞는 이야기이고, 지급 방식은 이자 크기가 아니라 현금 흐름이 필요한지로 골라야 합니다.`,
  };
}

function displayedMonthlyDoesNotAddUp(): Finding {
  const perMonth = monthly();
  const sumOfMonths = perMonth.monthlyInterestNet * DEPOSIT_BASE.months;
  const drift = sumOfMonths - perMonth.netInterest;
  let mismatched = 0;
  let total = 0;
  let widest = 0;
  for (let principal = 1_000_000; principal <= 100_000_000; principal += 100_000) {
    const r = monthly({ principal });
    const d = r.monthlyInterestNet * DEPOSIT_BASE.months - r.netInterest;
    total += 1;
    if (d !== 0) mismatched += 1;
    if (Math.abs(d) > Math.abs(widest)) widest = d;
  }
  return {
    h2: `세후 월이자에 ${DEPOSIT_BASE.months}를 곱하면 총 이자와 어긋난다`,
    body:
      `원금 ${won(DEPOSIT_BASE.principal)}·연 ${DEPOSIT_BASE.annualRate}%·월이자지급을 가정하면 화면의 세후 월 수령액은 ${ga(won(perMonth.monthlyInterestNet))}지만, 여기에 ${DEPOSIT_BASE.months}를 곱한 ${eun(won(sumOfMonths))} 같은 화면의 세후 총이자 ${wa(won(perMonth.netInterest))} ${won(Math.abs(drift))} 어긋납니다. ` +
      `세금을 월 수령액에서 한 번, 총액에서 다시 한 번 각각 원 단위로 반올림하는데 두 반올림이 서로 다른 값에 걸리기 때문이며, 어느 쪽도 틀린 계산은 아니지만 두 숫자를 곱셈으로 이으면 맞아떨어지지 않습니다. ` +
      `같은 조건에서 원금을 10만원 단위로 ${num(total)}개 훑으면 ${num(mismatched)}개가 어긋나 ${pct(mismatched / total, 1)}에 이르고, 벌어지는 폭은 최대 ${imnida(won(Math.abs(widest)))}. ` +
      `그러므로 월 수령액을 개월수만큼 곱해 총액을 가늠하는 대신 총이자 항목을 그대로 읽는 편이 정확합니다.`,
  };
}

function monthlyPayoutIsAStaircase(): Finding {
  const from = 10_008_000;
  let best = { start: from, end: from, value: monthly({ principal: from }).monthlyInterestNet };
  let start = from;
  let previous = best.value;
  for (let principal = from + 1; principal <= from + 1_000; principal += 1) {
    const value = monthly({ principal }).monthlyInterestNet;
    if (value !== previous) {
      if (principal - start > best.end - best.start + 1) best = { start, end: principal - 1, value: previous };
      start = principal;
      previous = value;
    }
  }
  const width = best.end - best.start + 1;
  const step = 1 / ((DEPOSIT_BASE.annualRate / 100) / 12);
  return {
    h2: `원금 ${won(width)} 차이가 세후 월이자에서 통째로 사라진다`,
    body:
      `연 ${DEPOSIT_BASE.annualRate}%·월이자지급 가정에서 원금을 ${wa(won(best.start))} ${ro(won(best.end))} 1원씩 올려 보면, 그 사이 ${won(width)}을 어떻게 넣든 세후 월 수령액이 ${ro(won(best.value))} 완전히 같습니다. ` +
      `세전 월이자가 원금 ${num(step, 2)}원마다 1원씩 오르는 계단인 데다, 그 위에서 세금이 다시 반올림되어 계단 두 개가 겹치는 자리마다 폭이 두 배로 넓어지기 때문입니다. ` +
      `보통 구간의 계단 폭이 ${ga(won(Math.round(step)))} 되므로, 예금 원금을 만원 단위로 맞추려는 조정은 대부분 월 수령액을 1원도 바꾸지 못합니다. ` +
      `월이자 금액을 특정 숫자에 맞추고 싶다면 원금을 조금씩 더하는 대신 계단이 바뀌는 지점을 찾아 한 번에 넘겨야 합니다.`,
  };
}

function rateAndTermStopBeingInterchangeable(): Finding {
  const doubleRate = run({ annualRate: DEPOSIT_BASE.annualRate * 2 });
  const doubleMonths = run({ months: DEPOSIT_BASE.months * 2 });
  const doubleRateMonthly = monthly({ annualRate: DEPOSIT_BASE.annualRate * 2 });
  const doubleMonthsMonthly = monthly({ months: DEPOSIT_BASE.months * 2 });
  const split = doubleRateMonthly.grossInterest - doubleMonthsMonthly.grossInterest;
  const exactAtDoubleRate = (DEPOSIT_BASE.principal * ((DEPOSIT_BASE.annualRate * 2) / 100)) / 12;
  const exactAtBaseRate = (DEPOSIT_BASE.principal * (DEPOSIT_BASE.annualRate / 100)) / 12;
  return {
    h2: `금리 2배와 기간 2배는 월이자 방식에서만 갈라진다`,
    body:
      `원금 ${eul(won(DEPOSIT_BASE.principal))} 두고 연 ${DEPOSIT_BASE.annualRate}%를 ${DEPOSIT_BASE.annualRate * 2}%로 올린 경우와 ${DEPOSIT_BASE.months}개월을 ${DEPOSIT_BASE.months * 2}개월로 늘린 경우를 가정하면, 만기일시지급에서는 세전 이자가 ${wa(won(doubleRate.grossInterest))} ${ro(won(doubleMonths.grossInterest))} 1원도 다르지 않습니다. ` +
      `산식이 원금 × 이율 × 기간이라 두 손잡이가 곱셈 안에서 대칭이고, 반올림도 마지막에 한 번만 걸리기 때문입니다. ` +
      `그런데 같은 두 조건을 월이자지급으로 옮기면 ${wa(won(doubleRateMonthly.grossInterest))} ${ro(won(doubleMonthsMonthly.grossInterest))} ${won(Math.abs(split))} 갈라집니다. 금리를 두 배로 올리면 월이자가 ${num(exactAtDoubleRate, 4)}원이 되어 반올림이 내림 쪽으로 걸리고 그 오차가 ${DEPOSIT_BASE.months}번, 기간을 두 배로 늘리면 ${num(exactAtBaseRate, 4)}원짜리 월이자의 올림 오차가 ${DEPOSIT_BASE.months * 2}번 곱해지기 때문입니다. ` +
      `즉 대칭을 깨뜨리는 것은 세율도 금액도 아니고 반올림이 걸리는 횟수이며, 이 차이는 만기일시지급을 고르는 순간 사라집니다.`,
  };
}

function effectiveRateRankingFlips(): Finding {
  const slow = run({ principal: 30_000_000, annualRate: 3.5, months: 36 });
  const middle = run({ principal: 30_000_000, annualRate: 5, months: 12 });
  const fast = run({ principal: 30_000_000, annualRate: 8, months: 6 });
  const annualise = (r: ReturnType<typeof run>, months: number) => (r.effectiveRate * 12) / months;
  return {
    h2: `실효 수익률로 고르면 금리 순위가 통째로 뒤집힌다`,
    body:
      `원금 ${eul(won(30_000_000))} 세 상품에 넣는다고 가정하면 화면의 실효 수익률이 연 3.5%·36개월 ${pct(slow.effectiveRate, 4)}, 연 5%·12개월 ${pct(middle.effectiveRate, 4)}, 연 8%·6개월 ${ro(pct(fast.effectiveRate, 4))} 찍혀, 금리가 가장 낮은 상품이 가장 높은 숫자를 답니다. ` +
      `이 항목이 세후 이자를 원금으로 나눈 값일 뿐 기간으로 나누지 않아, 오래 묶어 두기만 해도 숫자가 커지기 때문입니다. ` +
      `같은 세 결과를 연 단위로 환산하면 ${pct(annualise(slow, 36), 4)}·${pct(annualise(middle, 12), 4)}·${ro(pct(annualise(fast, 6), 4))} 순서가 표면금리와 다시 같아지므로, 뒤집힌 것은 상품이 아니라 지표입니다. ` +
      `그래서 만기가 서로 다른 예금을 실효 수익률로 나란히 세우는 비교는 성립하지 않고, 기간이 같을 때만 이 숫자를 그대로 써도 됩니다.`,
  };
}

function comprehensiveTaxationEdge(): Finding {
  const threshold = 20_000_000;
  const edgeFor = (annualRate: number) => {
    let low = 1;
    let high = 3_000_000_000;
    for (let i = 0; i < 80; i += 1) {
      const mid = Math.floor((low + high) / 2);
      if (run({ principal: mid, annualRate, months: 12 }).grossInterest <= threshold) low = mid;
      else high = mid;
    }
    return { last: low, first: high };
  };
  const at2 = edgeFor(2);
  const at35 = edgeFor(DEPOSIT_BASE.annualRate);
  const at5 = edgeFor(5);
  return {
    h2: `연 ${DEPOSIT_BASE.annualRate}%면 원금 ${ga(manwon(at35.first))} 종합과세 문턱이다`,
    body:
      `다른 금융소득이 전혀 없다고 가정하고 12개월 예금 하나만으로 금융소득 종합과세 기준금액인 ${eul(won(threshold))} 넘기려면, 연 ${DEPOSIT_BASE.annualRate}%에서 원금이 ${eul(won(at35.first))} 넘어야 합니다. 한 칸 아래인 ${won(at35.last)}까지는 세전 이자가 ${ro(won(threshold))} 딱 맞아 문턱을 넘지 않습니다. ` +
      `이 경계 원금은 금리에 반비례해서 연 2%에서는 ${won(at2.first)}, 연 5%에서는 ${ro(won(at5.first))} 내려오는데, 이자가 원금과 금리의 곱이라 한쪽을 올리면 다른 쪽이 그만큼 줄어도 같은 지점에 닿기 때문입니다. ` +
      `경계를 넘는다고 세금이 계단처럼 뛰지는 않지만 초과분이 다른 소득과 합산되므로, 이 원금대에 이르면 예금 하나가 아니라 소득 전체를 놓고 봐야 합니다. ` +
      `이 계산기는 이자 계산까지만 하므로 합산 이후의 세부담은 배당소득세 계산기의 종합과세 시뮬레이션에서 확인해야 합니다.`,
  };
}

function taxBreakInPrincipalTerms(): Finding {
  const normal = run();
  const pref = run({ taxType: "preferential" });
  const free = run({ taxType: "tax_free" });
  const principalForSameNet = (target: number, taxType: DepositInterestInput["taxType"]) => {
    let low = 1;
    let high = 100_000_000;
    for (let i = 0; i < 80; i += 1) {
      const mid = Math.floor((low + high) / 2);
      if (run({ principal: mid, taxType }).netInterest < target) low = mid;
      else high = mid;
    }
    return high;
  };
  const freeEquivalent = principalForSameNet(normal.netInterest, "tax_free");
  const prefEquivalent = principalForSameNet(pref.netInterest, "normal");
  return {
    h2: `비과세 ${ga(manwon(freeEquivalent))} 일반과세 ${eul(manwon(DEPOSIT_BASE.principal))} 이긴다`,
    body:
      `${DEPOSIT_BASE.months}개월·연 ${DEPOSIT_BASE.annualRate}%·만기일시지급을 가정하면 세후 이자가 일반과세 ${won(normal.netInterest)}, 조합 예탁금 가정 ${won(pref.netInterest)}, 비과세 ${ro(won(free.netInterest))} 갈립니다. ` +
      `이 격차를 금리가 아니라 원금으로 환산하면, 비과세 계좌는 원금 ${won(freeEquivalent)}만으로 일반과세 ${won(DEPOSIT_BASE.principal)}과 같은 세후 이자를 내므로 ${eul(won(DEPOSIT_BASE.principal - freeEquivalent))} 아예 넣지 않아도 되는 셈입니다. ` +
      `반대로 조합 예탁금 가정의 세후 이자를 일반과세로 따라잡으려면 원금이 ${eul(won(prefEquivalent))} 넘겨야 하므로, 우대 과세 한 칸이 ${eul(won(prefEquivalent - DEPOSIT_BASE.principal))} 더 넣은 것과 같은 값입니다. ` +
      `과세 유형은 이자 계산이 끝난 뒤에 붙는 항목이라 이렇게 원금으로 되돌려 읽을 수 있고, 가입 자격이 있는지부터 확인해야 하는 이유도 여기에 있습니다.`,
  };
}

function interestIsExactlyProportionalToTerm(): Finding {
  const rows = [6, 12, 24, 36].map((months) => ({ months, r: run({ months }) }));
  const [m6, m12, m24, m36] = rows;
  return {
    h2: `예금 이자는 기간에 정확히 비례해 계단이 없다`,
    body:
      `원금 ${won(DEPOSIT_BASE.principal)}·연 ${DEPOSIT_BASE.annualRate}%·만기일시지급 가정에서 기간만 바꾸면 세전 이자가 6개월 ${won(m6.r.grossInterest)}, 12개월 ${won(m12.r.grossInterest)}, 24개월 ${won(m24.r.grossInterest)}, 36개월 ${ro(won(m36.r.grossInterest))} 정확히 1대 2대 4대 6으로 늘어납니다. ` +
      `원금 전체가 처음부터 끝까지 같은 조건으로 묶여 있어 기간이 곱셈 항으로만 들어가기 때문이며, 매달 넣는 적금에서 기간을 두 배로 늘리면 이자가 네 배 가까이 뛰는 것과는 다른 성질입니다. ` +
      `실효 수익률도 같은 비율로 6개월 ${pct(m6.r.effectiveRate, 4)}에서 36개월 ${ro(pct(m36.r.effectiveRate, 4))} 올라가므로, 기간이 다른 예금끼리는 이자든 수익률이든 개월수로 나누기 전에는 비교가 되지 않습니다. ` +
      `다만 중도해지 금리와 만기 후 금리는 이 계산기가 반영하지 않으므로, 이 선형성은 만기를 그대로 채운다는 가정 위에서만 성립합니다.`,
  };
}

export const DEPOSIT_INTEREST_DIGEST: Finding[] = [
  paymentTypeSplitsTheSameProduct(),
  whoWinsDependsOnPrincipal(),
  displayedMonthlyDoesNotAddUp(),
  monthlyPayoutIsAStaircase(),
  rateAndTermStopBeingInterchangeable(),
  effectiveRateRankingFlips(),
  comprehensiveTaxationEdge(),
  taxBreakInPrincipalTerms(),
  interestIsExactlyProportionalToTerm(),
];
