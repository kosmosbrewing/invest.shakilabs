// /dividend-tax 파생 다이제스트 — 배당은 원천징수(분리과세)와 종합과세 두 갈래가 겹쳐 있고,
// 소득세법 제62조 비교과세가 그 사이에 하한을 깔아 둔다. 그래서 "2,000만원을 넘으면 세금이 뛴다"는
// 통념이 실제로는 성립하지 않고, 국가·구성·다른 소득에 따라 순위가 뒤집히는 지점이 생긴다.
// 아래 수치는 전부 calculateDividendTax 실행값이다.

import { DIVIDEND_GROSS_UP_RATE, DIVIDEND_TAX } from "@/data/investTaxRates";
import { calculateDividendTax } from "@/utils/investCalculator";
import { type Finding, eul, ga, imnida, manwon, pct, ro, wa, won } from "./format";

type CountryKey = "KR" | keyof typeof DIVIDEND_TAX.FOREIGN_RATES;
interface DividendInput {
  dividendAmount: number;
  country: CountryKey;
  otherFinancialIncome: number;
  otherComprehensiveIncome: number;
}

/** 화면 기본값(useDividendTaxCalc)과 같은 조건: 국내 배당 500만원, 다른 금융소득 0원, 다른 종합소득 0원 */
export const DIVIDEND_BASE: DividendInput = {
  dividendAmount: 5_000_000,
  country: "KR",
  otherFinancialIncome: 0,
  otherComprehensiveIncome: 0,
};
const run = (patch: Partial<DividendInput> = {}) => {
  const i = { ...DIVIDEND_BASE, ...patch };
  return calculateDividendTax(i.dividendAmount, i.country, i.otherFinancialIncome, i.otherComprehensiveIncome);
};
const withExtra = (r: ReturnType<typeof run>) => r.totalTax + (r.comprehensiveExtraTax ?? 0);

function baseShape(): Finding {
  const kr = run();
  const cn = run({ country: "CN" });
  const us = run({ country: "US" });
  const jp = run({ country: "JP" });
  return {
    h2: `기본 가정의 배당 ${manwon(DIVIDEND_BASE.dividendAmount)}은 국가를 바꾸면 ${ga(won(kr.totalTax - cn.totalTax))} 빠진다`,
    body:
      `국내 배당 ${manwon(DIVIDEND_BASE.dividendAmount)}, 다른 금융소득 0원, 다른 종합소득 0원을 가정하면 소득세 ${won(kr.domesticIncomeTax)}과 지방소득세 ${won(kr.domesticLocalTax)}을 합쳐 ${won(kr.totalTax)}, 실수령 ${won(kr.netDividend)}, 실효세율 ${imnida(pct(kr.effectiveRate, 3))}. ` +
      `같은 금액을 중국 주식에서 받으면 총 ${won(cn.totalTax)}으로 ${ga(won(kr.totalTax - cn.totalTax))} 가벼워지고, 미국은 ${won(us.totalTax)}, 일본은 ${imnida(won(jp.totalTax))}. ` +
      `금융소득이 종합과세 기준금액 ${manwon(DIVIDEND_TAX.FINANCIAL_INCOME_THRESHOLD)} 아래이므로 어느 쪽이든 원천징수로 납세가 종결되고, 그래서 이 구간에서 세금을 바꾸는 유일한 축은 어느 나라 주식이냐입니다. ` +
      `그런데 그 격차가 현지 세율의 크기순과 어긋나는 이유는 다음 항목에서 이어집니다.`,
  };
}

function zeroRateCountryCostsMore(): Finding {
  const amount = 10_000_000;
  const rows = (["CN", "US", "JP", "HK"] as const).map((c) => ({ c, r: run({ dividendAmount: amount, country: c }) }));
  const [cn, us, jp, hk] = rows;
  const kr = run({ dividendAmount: amount });
  return {
    h2: `현지 세율 0%인 홍콩 배당이 10%인 중국보다 무겁다`,
    body:
      `배당 ${manwon(amount)}을 가정하면 세금이 중국 ${won(cn.r.totalTax)}(${pct(cn.r.effectiveRate, 3)}), 미국 ${won(us.r.totalTax)}(${pct(us.r.effectiveRate, 3)}), 일본 ${won(jp.r.totalTax)}(${pct(jp.r.effectiveRate, 3)}), 홍콩 ${won(hk.r.totalTax)}(${pct(hk.r.effectiveRate, 3)}) 순으로 늘어납니다. ` +
      `현지에서 한 푼도 떼지 않는 홍콩이 가장 무거운 이유는 지방소득세가 국내 소득세분의 10%로만 붙기 때문인데, 홍콩은 국내 소득세율 ${pct(DIVIDEND_TAX.DOMESTIC_INCOME_TAX_RATE, 0)}가 통째로 남아 지방소득세 ${won(hk.r.domesticLocalTax)}까지 따라오는 반면 중국은 국내 소득세가 ${won(cn.r.domesticIncomeTax)}뿐이라 지방소득세도 ${won(cn.r.domesticLocalTax)}에 그칩니다. ` +
      `국내 배당은 홍콩과 똑같이 ${won(kr.totalTax)}이라, 현지 원천징수는 세금을 늘리는 장치가 아니라 지방소득세의 과세 대상을 대신 갉아먹는 장치에 가깝습니다. ` +
      `그래서 현지 세율이 국내 소득세율보다 낮은 나라일수록 총부담이 오히려 가벼워집니다.`,
  };
}

function thresholdHasNoCliff(): Finding {
  const other = 100_000_000;
  const under = run({ dividendAmount: 19_999_999, otherComprehensiveIncome: other });
  const at = run({ dividendAmount: 20_000_000, otherComprehensiveIncome: other });
  const over = run({ dividendAmount: 20_000_001, otherComprehensiveIncome: other });
  const above = run({ dividendAmount: 20_100_000, otherComprehensiveIncome: other });
  return {
    h2: `금융소득 ${manwon(DIVIDEND_TAX.FINANCIAL_INCOME_THRESHOLD)} 경계에는 계단이 없다`,
    body:
      `국내 배당만 있고 다른 종합소득 과세표준이 ${manwon(other)}이라고 가정하면 배당 ${won(19_999_999)}에서 총부담 ${won(withExtra(under))}, ${won(20_000_000)}에서 ${won(withExtra(at))}, 기준금액을 1원 넘긴 ${won(20_000_001)}에서도 ${ro(won(withExtra(over)))} 사실상 그대로입니다. ` +
      `종합과세 대상이 되는 순간에도 소득세법 제62조 비교과세가 "금융소득 전체에 원천징수세율을 곱한 세액 + 다른 소득의 세액"을 하한으로 두기 때문인데, 경계 바로 위에서는 두 계산 결과가 같아집니다. ` +
      `추가 세부담은 ${won(20_100_000)}에서 ${won(above.comprehensiveExtraTax ?? 0)}으로 아주 완만하게 시작합니다. ` +
      `따라서 12월에 배당을 1원 단위로 조절해 기준금액을 피하려는 전략은 이 구조에서 실익이 없습니다.`,
  };
}

function noOtherIncomeMeansNoExtra(): Finding {
  const free = run({ dividendAmount: 126_400_000 });
  const first = run({ dividendAmount: 126_500_000 });
  const at1 = run({ dividendAmount: 100_000_000 });
  return {
    h2: `다른 소득이 없으면 배당 ${manwon(126_400_000)}까지 추가 세금이 0원이다`,
    body:
      `국내 배당만 있고 다른 금융소득과 다른 종합소득이 모두 0원이라고 가정한 뒤 배당액을 10만원씩 올려 보면, ${manwon(126_400_000)}까지는 종합과세 추가 세부담이 ${won(free.comprehensiveExtraTax ?? 0)}이고 ${manwon(126_500_000)}에서 ${ga(won(first.comprehensiveExtraTax ?? 0))} 처음 생깁니다. ` +
      `배당 ${manwon(100_000_000)}을 가정해 안을 들여다보면, 배당가산 ${eul(won(at1.grossUpAmount ?? 0))} 얹은 종합과세 산출세액에서 배당세액공제를 빼고 나면 결과가 정확히 분리과세 상당액인 ${won(at1.totalTax)}으로 되돌아옵니다. ` +
      `비교과세의 하한이 종합과세 세액을 그 아래로 내려가지 못하게 막고, 배당세액공제는 그 하한까지만 작동하도록 잘리기 때문입니다. ` +
      `그래서 근로·사업소득이 없는 은퇴자라면 배당이 억대여도 종합과세 대상이라는 사실만으로는 세금이 늘지 않습니다.`,
  };
}

function otherIncomeTurnsOnTheMeter(): Finding {
  const amount = 50_000_000;
  const free = run({ dividendAmount: amount, otherComprehensiveIncome: 42_000_000 });
  const first = run({ dividendAmount: amount, otherComprehensiveIncome: 42_100_000 });
  const mid = run({ dividendAmount: amount, otherComprehensiveIncome: 50_000_000 });
  const high = run({ dividendAmount: amount, otherComprehensiveIncome: 300_000_000 });
  return {
    h2: `배당 ${manwon(amount)}은 다른 소득 ${manwon(42_100_000)}부터 세금이 늘어난다`,
    body:
      `국내 배당 ${manwon(amount)}, 다른 금융소득 0원을 가정으로 고정하고 다른 종합소득 과세표준만 10만원씩 올려 보면 ${manwon(42_000_000)}까지는 추가 세부담이 ${won(free.comprehensiveExtraTax ?? 0)}이다가 ${manwon(42_100_000)}에서 ${ga(won(first.comprehensiveExtraTax ?? 0))} 붙기 시작합니다. ` +
      `${manwon(50_000_000)}이면 ${won(mid.comprehensiveExtraTax ?? 0)}, ${manwon(300_000_000)}이면 ${ro(won(high.comprehensiveExtraTax ?? 0))} 불어납니다. ` +
      `같은 배당인데 남의 근로소득이 세금을 정하는 것처럼 보이는 이유는, 비교과세가 "다른 소득 + 기준금액 초과 금융소득 + 배당가산"에 누진세율을 매긴 값과 "금융소득 전체 원천징수 + 다른 소득 세액" 중 큰 쪽을 고르는 구조여서, 앞쪽이 뒤쪽을 언제 추월하느냐가 유일한 기준이기 때문입니다. ` +
      `따라서 배당 규모만 보고 종합과세 부담을 가늠하면 방향을 놓칩니다.`,
  };
}

function extraTaxPlateau(): Finding {
  const amount = 50_000_000;
  const before = run({ dividendAmount: amount, otherComprehensiveIncome: 87_000_000 });
  const lo = run({ dividendAmount: amount, otherComprehensiveIncome: 88_000_000 });
  const hi = run({ dividendAmount: amount, otherComprehensiveIncome: 117_000_000 });
  const after = run({ dividendAmount: amount, otherComprehensiveIncome: 118_000_000 });
  const excess = amount - DIVIDEND_TAX.FINANCIAL_INCOME_THRESHOLD;
  return {
    h2: `다른 소득 ${manwon(88_000_000)}과 ${manwon(117_000_000)}의 추가 세부담이 같다`,
    body:
      `국내 배당 ${manwon(amount)}을 가정으로 고정하고 다른 종합소득 과세표준을 100만원씩 올려 보면 ${manwon(88_000_000)}에서 ${won(lo.comprehensiveExtraTax ?? 0)}, ${manwon(117_000_000)}에서도 ${ro(won(hi.comprehensiveExtraTax ?? 0))} 그 사이가 완전히 평평합니다. ` +
      `기준금액을 넘긴 금융소득 ${manwon(excess)}과 배당가산 ${eul(won(lo.grossUpAmount ?? 0))} 합한 ${manwon(excess + (lo.grossUpAmount ?? 0))}이 통째로 같은 누진 구간 안에 들어앉아, 다른 소득이 얼마든 그 구간의 세율만 곱해지기 때문입니다. ` +
      `구간을 벗어나는 ${manwon(87_000_000)}에서는 ${won(before.comprehensiveExtraTax ?? 0)}, ${manwon(118_000_000)}에서는 ${ro(won(after.comprehensiveExtraTax ?? 0))} 다시 움직입니다. ` +
      `즉 추가 세부담을 정하는 것은 다른 소득의 크기 자체가 아니라, 다른 소득이 밟고 선 누진 구간이 어디냐입니다.`,
  };
}

function dividendShareDrivesGrossUp(): Finding {
  const other = 100_000_000;
  const total = 35_000_000;
  const allDividend = run({ dividendAmount: total, otherComprehensiveIncome: other });
  const mixed = run({ dividendAmount: 15_000_000, otherFinancialIncome: 20_000_000, otherComprehensiveIncome: other });
  const interestHeavy = run({ dividendAmount: 5_000_000, otherFinancialIncome: 30_000_000, otherComprehensiveIncome: other });
  const excess = total - DIVIDEND_TAX.FINANCIAL_INCOME_THRESHOLD;
  const gap = (interestHeavy.comprehensiveExtraTax ?? 0) - (allDividend.comprehensiveExtraTax ?? 0);
  return {
    h2: `배당을 이자로 바꾸면 같은 금융소득에 ${eul(won(gap))} 더 낸다`,
    body:
      `금융소득 합계 ${manwon(total)}, 다른 종합소득 과세표준 ${manwon(other)}을 가정하고 배당과 이자의 구성만 바꿔 봤습니다. 전부 배당이면 추가 세부담이 ${won(allDividend.comprehensiveExtraTax ?? 0)}, 배당 ${manwon(15_000_000)}에 이자 ${manwon(20_000_000)}인 조합도 ${ro(won(mixed.comprehensiveExtraTax ?? 0))} 같습니다. ` +
      `그런데 배당을 ${manwon(5_000_000)}까지 줄이고 이자를 ${manwon(30_000_000)}으로 늘리면 ${ro(won(interestHeavy.comprehensiveExtraTax ?? 0))} 뜁니다. ` +
      `배당가산은 기준금액을 넘긴 ${manwon(excess)} 가운데 국내 배당 몫에만 ${eul(pct(DIVIDEND_GROSS_UP_RATE, 0))} 붙이는데, 배당이 초과분 이상이면 가산이 ${won(allDividend.grossUpAmount ?? 0)}으로 꽉 차고 배당이 그보다 작으면 ${won(interestHeavy.grossUpAmount ?? 0)}에 그쳐 뒤따르는 배당세액공제도 함께 줄기 때문입니다. ` +
      `그래서 같은 금융소득이라도 "배당이 초과분을 채우고도 남는가"가 세금을 가르는 경계가 됩니다.`,
  };
}

function comprehensiveFlipsCountryOrder(): Finding {
  const amount = 100_000_000;
  const other = 100_000_000;
  const rows = (["KR", "JP", "US", "CN", "HK"] as const).map((c) => ({
    c,
    r: run({ dividendAmount: amount, country: c, otherComprehensiveIncome: other }),
  }));
  const [kr, jp, us, cn, hk] = rows;
  return {
    h2: `분리과세에서 가장 싼 중국이 종합과세에서는 네 번째가 된다`,
    body:
      `배당 ${manwon(amount)}, 다른 종합소득 과세표준 ${manwon(other)}을 가정합니다. 원천징수만 놓고 보면 중국 ${won(cn.r.totalTax)} < 미국 ${won(us.r.totalTax)} < 일본 ${won(jp.r.totalTax)} < 국내·홍콩 ${won(kr.r.totalTax)} 순으로 중국이 가장 쌉니다. ` +
      `그런데 종합과세까지 합친 총부담은 국내 ${won(withExtra(kr.r))} < 일본 ${won(withExtra(jp.r))} < 미국 ${won(withExtra(us.r))} < 중국 ${won(withExtra(cn.r))} < 홍콩 ${ro(won(withExtra(hk.r)))} 순서가 뒤집힙니다. ` +
      `국내 배당만 배당가산 ${wa(won(kr.r.grossUpAmount ?? 0))} 배당세액공제를 받고 해외 배당은 외국납부세액공제만 받기 때문인데, 그 결과 국내와 중국의 관계가 분리과세에서 ${won(kr.r.totalTax - cn.r.totalTax)} 불리하다가 종합과세에서 ${won(withExtra(cn.r) - withExtra(kr.r))} 유리한 쪽으로 완전히 돌아섭니다. ` +
      `따라서 배당 규모가 종합과세 구간에 들어갈 것 같다면 국가별 원천징수율만 비교해서는 안 됩니다.`,
  };
}

function effectiveRateWalksUp(): Finding {
  const other = 100_000_000;
  const rows = [20_000_000, 30_000_000, 50_000_000, 100_000_000, 200_000_000].map((a) => ({
    a,
    r: run({ dividendAmount: a, otherComprehensiveIncome: other }),
  }));
  const [a2, a3, a5, a10, a20] = rows;
  const rate = (row: (typeof rows)[number]) => pct(withExtra(row.r) / row.a);
  return {
    h2: `배당이 커질수록 실효세율이 ${pct(DIVIDEND_TAX.DOMESTIC_TOTAL_RATE, 1)}에서 ${ro(rate(a20))} 걸어 올라간다`,
    body:
      `국내 배당만 있고 다른 종합소득 과세표준이 ${manwon(other)}이라고 가정한 뒤 원천징수와 추가 세부담을 합쳐 배당액으로 나누면, ${manwon(20_000_000)} ${rate(a2)}, ${manwon(30_000_000)} ${rate(a3)}, ${manwon(50_000_000)} ${rate(a5)}, ${manwon(100_000_000)} ${rate(a10)}, ${manwon(200_000_000)} ${ro(rate(a20))} 올라갑니다. ` +
      `종합소득세 최고세율이 45%인데도 ${manwon(200_000_000)}에서 ${rate(a20)}에 머무는 이유는, 앞쪽 ${manwon(DIVIDEND_TAX.FINANCIAL_INCOME_THRESHOLD)}이 계속 원천징수세율로만 계산되고 배당가산과 배당세액공제가 위쪽을 눌러 주기 때문입니다. ` +
      `그만큼 곡선은 계단이 아니라 완만한 오르막이라, 어느 금액에서 갑자기 불리해지는 지점은 없습니다. ` +
      `대신 ${manwon(20_000_000)}과 ${manwon(200_000_000)} 사이에서 실효세율이 두 배 넘게 벌어지므로, 배당 목표 금액을 정할 때는 세전이 아니라 이 곡선 위의 세후로 잡아야 합니다.`,
  };
}

function crossingIsNotTaxing(): Finding {
  const other = 100_000_000;
  const amount = 15_000_000;
  const at = run({ dividendAmount: amount, otherFinancialIncome: 5_000_000, otherComprehensiveIncome: other });
  const over = run({ dividendAmount: amount, otherFinancialIncome: 5_000_001, otherComprehensiveIncome: other });
  const more = run({ dividendAmount: amount, otherFinancialIncome: 10_000_000, otherComprehensiveIncome: other });
  const lots = run({ dividendAmount: amount, otherFinancialIncome: 30_000_000, otherComprehensiveIncome: other });
  return {
    h2: `이자 ${manwon(5_000_000)}을 1원 넘겨도 세금은 그대로다`,
    body:
      `국내 배당 ${manwon(amount)}, 다른 종합소득 과세표준 ${manwon(other)}을 가정하고 이자만 늘려 보면 ${won(5_000_000)}까지는 금융소득 합계가 정확히 기준금액 ${manwon(DIVIDEND_TAX.FINANCIAL_INCOME_THRESHOLD)}이라 분리과세로 끝납니다(종합과세 판정 ${at.isComprehensive ? "대상" : "비대상"}). ` +
      `1원만 더 받으면 판정이 뒤집혀 종합과세 대상이 되지만 추가 세부담은 ${imnida(won(over.comprehensiveExtraTax ?? 0))}. 비교과세 하한이 그대로 버티고 있기 때문입니다. ` +
      `실제로 세금이 붙기 시작하려면 이자를 ${manwon(10_000_000)}까지 올려야 하고 그때 ${ga(won(more.comprehensiveExtraTax ?? 0))} 나오며, ${manwon(30_000_000)}이면 ${ro(won(lots.comprehensiveExtraTax ?? 0))} 커집니다. ` +
      `즉 "종합과세 대상이 되는 것"과 "세금이 늘어나는 것"은 서로 다른 사건이고, 둘 사이의 거리는 다른 종합소득 크기에 따라 달라집니다.`,
  };
}

export const DIVIDEND_TAX_DIGEST: Finding[] = [
  baseShape(),
  zeroRateCountryCostsMore(),
  thresholdHasNoCliff(),
  noOtherIncomeMeansNoExtra(),
  otherIncomeTurnsOnTheMeter(),
  extraTaxPlateau(),
  dividendShareDrivesGrossUp(),
  comprehensiveFlipsCountryOrder(),
  effectiveRateWalksUp(),
  crossingIsNotTaxing(),
];
