// /isa 파생 다이제스트 — ISA의 이득은 "비과세 한도(정액) + 세율 차 5.5%p(정률)" 두 조각으로 되어 있다.
// 그래서 절세'액'과 절세'율'이 서로 반대 방향으로 움직이고, 오래·많이 넣을수록 비율은 떨어진다.
// 그 구조는 한도표를 읽어서는 보이지 않고 엔진을 축마다 돌려야 나온다. 아래 수치는 전부
// calculateIsaCompare(교차 비교분은 calculateDividendTax) 실행값이다.

import { ISA_TAX } from "@/data/investTaxRates";
import { calculateDividendTax, calculateIsaCompare } from "@/utils/investCalculator";
import { type Finding, eul, eun, ga, ida, imnida, manwon, pct, pp, ro, times, wa, won, years } from "./format";

interface IsaInput {
  annualInvestment: number;
  annualReturnRate: number;
  holdingYears: number;
  isaType: "general" | "low_income";
}

/** 화면 기본값(useIsaCalc)과 같은 조건: 연 1,200만원 납입, 연 5% 수익률, 3년 보유, 일반형 */
export const ISA_BASE: IsaInput = {
  annualInvestment: 12_000_000,
  annualReturnRate: 0.05,
  holdingYears: 3,
  isaType: "general",
};
const run = (patch: Partial<IsaInput> = {}) => {
  const i = { ...ISA_BASE, ...patch };
  return calculateIsaCompare(i.annualInvestment, i.annualReturnRate, i.holdingYears, i.isaType);
};

function savingIsLinear(): Finding {
  const base = run();
  const rateGap = ISA_TAX.NORMAL_ACCOUNT_TAX_RATE - ISA_TAX.SEPARATE_TAX_RATE;
  const fixedPart = ISA_TAX.GENERAL_TAX_FREE_LIMIT * ISA_TAX.SEPARATE_TAX_RATE;
  // 이 1차식은 수익 > 비과세 한도에서만 성립한다. 한도 안에서는 ISA 세금이 0원이라
  // 절세액 = 일반계좌 세금 전액이고, 1차식은 고정 몫만큼을 통째로 지어낸다.
  // 그래서 반증 사례를 엔진에서 직접 뽑아 같은 문단에 붙인다(무조건 단언 금지).
  const under = run({ annualInvestment: 1_000_000 });
  return {
    h2: `수익이 ${eul(manwon(ISA_TAX.GENERAL_TAX_FREE_LIMIT))} 넘어야 절세액이 1차식이 된다`,
    body:
      `연 ${manwon(ISA_BASE.annualInvestment)} 납입, 연 ${pct(ISA_BASE.annualReturnRate, 0)} 수익률, ${years(ISA_BASE.holdingYears)} 보유, 일반형을 가정하면 총수익 ${won(base.totalProfit)}에 일반계좌 세금 ${won(base.normalTax)}, ISA 세금 ${won(base.isaTax)}으로 절세액이 ${imnida(won(base.taxSaving))}. ` +
      `이 값은 우연이 아니라 세율 차 ${pct(rateGap, 1)}에 수익을 곱한 몫과 비과세 한도 ${manwon(ISA_TAX.GENERAL_TAX_FREE_LIMIT)}에 ${eul(pct(ISA_TAX.SEPARATE_TAX_RATE, 1))} 곱한 ${won(fixedPart)}을 더한 1차식이며, 실제로 두 조각을 더하면 ${won(rateGap * base.totalProfit + fixedPart)}으로 엔진 값과 일치합니다. ` +
      `다만 이 1차식은 총수익이 비과세 한도 ${manwon(ISA_TAX.GENERAL_TAX_FREE_LIMIT)}을 넘는 구간에서만 성립합니다. 한도 안에서는 ISA 세금이 0원이라 절세액이 일반계좌 세금 그대로가 되는데, 연 ${manwon(1_000_000)} 납입을 가정하면 총수익 ${won(under.totalProfit)}에 절세액이 ${won(under.taxSaving)}으로 1차식이 예측하는 ${won(rateGap * under.totalProfit + fixedPart)}에 한참 못 미칩니다. ` +
      `그러므로 비과세 한도가 만드는 고정 몫 ${won(fixedPart)}은 한도를 넘어선 뒤에야 온전히 붙고, 그 위로는 나머지를 전부 세율 차가 만듭니다. ` +
      `즉 한쪽은 수익과 무관한 정액이고 다른 한쪽은 수익에 정비례하기 때문에, 아래 항목에서 절세액과 절세율이 서로 반대 방향으로 움직이는 결과가 나옵니다.`,
  };
}

function taxFreeCeilingInAnnual(): Finding {
  const free = run({ annualInvestment: 6_449_000 });
  const taxed = run({ annualInvestment: 6_450_000 });
  return {
    h2: `연 ${won(6_449_000)}까지는 ISA에 세금이 붙지 않는다`,
    body:
      `연 ${pct(ISA_BASE.annualReturnRate, 0)}·${years(ISA_BASE.holdingYears)}·일반형을 가정하고 연 납입액을 1,000원씩 올려 보면 ${won(6_449_000)}까지는 총수익이 ${won(free.totalProfit)}으로 비과세 한도 ${manwon(ISA_TAX.GENERAL_TAX_FREE_LIMIT)} 아래에 머물러 ISA 세금이 ${imnida(won(free.isaTax))}. ` +
      `${won(6_450_000)}에서 수익이 ${won(taxed.totalProfit)}이 되며 세금 ${ga(won(taxed.isaTax))} 처음 붙는데, 그 금액은 한도를 넘긴 ${won(taxed.isaTaxableProfit)}에 ${eul(pct(ISA_TAX.SEPARATE_TAX_RATE, 1))} 적용한 값이라 경계에 계단이 없습니다. ` +
      `반면 같은 조건의 일반계좌는 이미 ${won(taxed.normalTax)}을 떼이므로, 경계 바로 위에서 절세율이 ${ro(pct(taxed.savingRate))} 사실상 100%를 유지합니다. ` +
      `즉 소액 구간에서 ISA의 이득은 "세금을 줄여 준다"가 아니라 "세금이 아예 없다"에 가깝습니다.`,
  };
}

function taxFreeCeilingInRate(): Finding {
  const under = run({ annualReturnRate: 0.0272 });
  const over = run({ annualReturnRate: 0.0273 });
  const base = run();
  return {
    h2: `수익률이 ${pct(0.0273, 2)}를 넘는 순간 ISA 세금이 시작된다`,
    body:
      `연 ${manwon(ISA_BASE.annualInvestment)}·${years(ISA_BASE.holdingYears)}·일반형을 가정하고 수익률만 0.01%p씩 올려 보면 ${pct(0.0272, 2)}까지는 총수익이 ${won(under.totalProfit)}으로 한도 안이라 세금이 ${won(under.isaTax)}입니다. ` +
      `${pct(0.0273, 2)}에서 수익이 ${won(over.totalProfit)}이 되며 ${ga(won(over.isaTax))} 붙는데, 납입액과 수익률의 곱이 한도를 밀어 올리는 구조이므로 경계가 이렇게 낮은 수익률에 놓입니다. ` +
      `기본 가정인 ${pct(ISA_BASE.annualReturnRate, 0)}에서는 수익이 이미 ${won(base.totalProfit)}으로 한도를 ${pct(base.totalProfit / ISA_TAX.GENERAL_TAX_FREE_LIMIT - 1)} 넘어섭니다. ` +
      `그래서 "얼마를 넣느냐"와 "얼마를 버느냐" 중 어느 하나만 커도 비과세 한도는 금방 소진되고, 그 뒤로는 세율 차 몫만 남습니다.`,
  };
}

function longerRaisesAmountLowersRate(): Finding {
  const rows = [3, 5, 7, 10].map((y) => ({ y, r: run({ holdingYears: y }) }));
  const [y3, y5, y7, y10] = rows;
  return {
    h2: `기간을 늘리면 절세액은 커지는데 절세율은 떨어진다`,
    body:
      `연 ${manwon(ISA_BASE.annualInvestment)}·연 ${pct(ISA_BASE.annualReturnRate, 0)}·일반형을 가정하고 보유 기간만 바꾸면 절세액이 ${years(3)} ${won(y3.r.taxSaving)}, ${years(5)} ${won(y5.r.taxSaving)}, ${years(7)} ${won(y7.r.taxSaving)}, ${years(10)} ${ro(won(y10.r.taxSaving))} 늘어납니다. ` +
      `그런데 같은 구간에서 절세율은 ${pct(y3.r.savingRate)}, ${pct(y5.r.savingRate)}, ${pct(y7.r.savingRate)}, ${ro(pct(y10.r.savingRate))} 오히려 내려갑니다. ` +
      `절세액이 ${times(y10.r.taxSaving, y3.r.taxSaving)} 되는 동안 절세율이 ${pp((y3.r.savingRate - y10.r.savingRate) * 100)} 빠지는 이유는, 고정 몫인 비과세 한도의 이득은 그대로인데 수익 비례 몫만 계속 불어나기 때문입니다. ` +
      `따라서 "오래 넣을수록 ISA가 유리하다"는 금액으로 보면 맞고 비율로 보면 틀린 문장입니다.`,
  };
}

function savingRateFloor(): Finding {
  const floor = (ISA_TAX.NORMAL_ACCOUNT_TAX_RATE - ISA_TAX.SEPARATE_TAX_RATE) / ISA_TAX.NORMAL_ACCOUNT_TAX_RATE;
  const cap = { annualInvestment: 20_000_000, holdingYears: 5 };
  const r3 = run({ ...cap, annualReturnRate: 0.03 });
  const r7 = run({ ...cap, annualReturnRate: 0.07 });
  const r10 = run({ ...cap, annualReturnRate: 0.1 });
  const r20 = run({ ...cap, annualReturnRate: 0.2 });
  return {
    h2: `ISA 절세율은 ${pct(floor)} 아래로 내려가지 않는다`,
    body:
      `절세율은 "세율 차 몫 + 고정 몫"을 일반계좌 세금으로 나눈 값이라, 수익이 무한히 커지면 고정 몫이 희석돼 ${pct(ISA_TAX.NORMAL_ACCOUNT_TAX_RATE - ISA_TAX.SEPARATE_TAX_RATE, 1)}를 ${ro(pct(ISA_TAX.NORMAL_ACCOUNT_TAX_RATE, 1))} 나눈 ${pct(floor)}에 수렴합니다. ` +
      `연 ${manwon(20_000_000)}씩 ${years(5)}(총 납입 ${manwon(100_000_000)}으로 총 한도와 같음), 일반형을 가정해 수익률만 올려 보면 ${pct(0.03, 0)}에서 ${pct(r3.savingRate)}, ${pct(0.07, 0)}에서 ${pct(r7.savingRate)}, ${pct(0.1, 0)}에서 ${pct(r10.savingRate)}, ${pct(0.2, 0)}에서 ${ro(pct(r20.savingRate))} 내려가지만 하한에 닿지는 않습니다. ` +
      `그래서 ISA가 최소한 보장하는 이득은 "과세 대상 수익의 ${pct(ISA_TAX.NORMAL_ACCOUNT_TAX_RATE - ISA_TAX.SEPARATE_TAX_RATE, 1)}"이고, 비과세 한도는 그 위에 얹히는 덤입니다. ` +
      `수익이 클수록 ISA를 포기할 이유가 줄어드는 것은 이 하한이 있기 때문입니다.`,
  };
}

function lowIncomeBonusIsCapped(): Finding {
  const gap = (ISA_TAX.LOW_INCOME_TAX_FREE_LIMIT - ISA_TAX.GENERAL_TAX_FREE_LIMIT) * ISA_TAX.SEPARATE_TAX_RATE;
  const big = { annualInvestment: 20_000_000 };
  const gen = run(big);
  const low = run({ ...big, isaType: "low_income" });
  // 서민형에서 ISA 세금이 처음 붙는 연 납입액 — 일반형 경계와 마찬가지로 1,000원 단위로 엔진을 다시 돌려 찾았다
  const lowFreeAnnual = 12_898_000;
  const lowTaxedAnnual = 12_899_000;
  const lowFree = run({ annualInvestment: lowFreeAnnual, isaType: "low_income" });
  const lowTaxed = run({ annualInvestment: lowTaxedAnnual, isaType: "low_income" });
  return {
    h2: `서민형의 추가 혜택은 ${won(gap)}에서 멈춘다`,
    body:
      `일반형 비과세 한도 ${manwon(ISA_TAX.GENERAL_TAX_FREE_LIMIT)}과 서민형 ${manwon(ISA_TAX.LOW_INCOME_TAX_FREE_LIMIT)}의 차이는 ${manwon(ISA_TAX.LOW_INCOME_TAX_FREE_LIMIT - ISA_TAX.GENERAL_TAX_FREE_LIMIT)}인데, 그 구간에 걸리는 세율이 ${pct(ISA_TAX.SEPARATE_TAX_RATE, 1)}뿐이라 세금 차이는 ${won(gap)}을 넘을 수 없습니다. ` +
      `연 ${manwon(20_000_000)}·연 ${pct(ISA_BASE.annualReturnRate, 0)}·${eul(years(ISA_BASE.holdingYears))} 가정하면 일반형 ${won(gen.isaTax)} 대 서민형 ${ro(won(low.isaTax))} 정확히 ${won(gen.isaTax - low.isaTax)} 차이입니다. ` +
      `반면 절세율에서는 ${wa(pct(gen.savingRate))} ${ro(pct(low.savingRate))} 크게 벌어지고, 세금이 아예 0원인 구간도 서민형이 연 ${won(lowFreeAnnual)}까지로 일반형의 두 배 가까이 넓습니다(그 지점의 ISA 세금은 ${won(lowFree.isaTax)}). ` +
      `즉 서민형의 값어치는 절세 금액보다 "세금이 안 붙는 구간이 넓어진다"는 쪽에 있고, 실제로 ${won(lowTaxedAnnual)}에서야 ${ga(won(lowTaxed.isaTax))} 처음 붙습니다.`,
  };
}

function taxRatioConverges(): Finding {
  const base = run();
  const heavy = run({ annualInvestment: 20_000_000, holdingYears: 5, annualReturnRate: 0.2 });
  return {
    // 진짜 수렴점은 세율 비율(15.4/9.9 = 1.5556배)이고 1.60배는 이 가정에서 나온 한 점일 뿐이라 "수렴"이라 쓰지 않는다.
    h2: `일반계좌 세금은 ISA 세금의 ${times(base.normalTax, base.isaTax)}에서 ${times(heavy.normalTax, heavy.isaTax)}까지 내려온다`,
    body:
      `기본 가정(연 ${manwon(ISA_BASE.annualInvestment)}·연 ${pct(ISA_BASE.annualReturnRate, 0)}·${years(ISA_BASE.holdingYears)}·일반형)에서 두 계좌의 세금은 ${wa(won(base.normalTax))} ${ro(won(base.isaTax))} ${imnida(times(base.normalTax, base.isaTax))}. ` +
      `세율만 놓고 보면 ${pct(ISA_TAX.NORMAL_ACCOUNT_TAX_RATE, 1)} 대 ${pct(ISA_TAX.SEPARATE_TAX_RATE, 1)}로 ${times(ISA_TAX.NORMAL_ACCOUNT_TAX_RATE, ISA_TAX.SEPARATE_TAX_RATE)} 차이일 뿐인데 실제 배수가 그보다 큰 이유는, ISA가 세율을 낮출 뿐 아니라 과세 대상 수익 자체를 비과세 한도만큼 잘라 내기 때문입니다. ` +
      `수익을 키우면 잘려 나간 몫의 비중이 줄어 배수도 내려가는데, 연 ${manwon(20_000_000)}·${years(5)}·${pct(0.2, 0)}를 가정하면 ${wa(won(heavy.normalTax))} ${ro(won(heavy.isaTax))} ${times(heavy.normalTax, heavy.isaTax)}까지 내려옵니다. ` +
      `그래서 "ISA는 세율을 9.9%로 낮추는 계좌"라는 설명은 큰 수익 구간에서만 정확하고, 작은 수익 구간에서는 이득을 크게 과소평가합니다.`,
  };
}

function fullQuotaCeiling(): Finding {
  const at10 = run({ annualInvestment: 20_000_000, holdingYears: 5, annualReturnRate: 0.1 });
  const at5 = run({ annualInvestment: 20_000_000, holdingYears: 5 });
  return {
    h2: `총 납입 한도를 다 써도 절세액은 ${ida(won(at10.taxSaving))}`,
    body:
      `연 납입 한도 ${manwon(ISA_TAX.ANNUAL_LIMIT)}을 ${years(5)} 채워 총 납입 한도 ${manwon(ISA_TAX.TOTAL_LIMIT)}을 정확히 소진한다고 가정하면, 수익률 ${pct(0.1, 0)}에서 총수익 ${won(at10.totalProfit)}, 일반계좌 세금 ${won(at10.normalTax)}, ISA 세금 ${won(at10.isaTax)}으로 절세액이 ${imnida(won(at10.taxSaving))}. ` +
      `수익률을 ${ro(pct(ISA_BASE.annualReturnRate, 0))} 낮추면 같은 납입에도 절세액이 ${ro(won(at5.taxSaving))} 줄어드는데, 절세액이 수익에 비례하는 몫을 크게 안고 있기 때문입니다. ` +
      `즉 제도가 허용하는 최대치를 끝까지 써도 절세액은 백만원 단위에 머무는데, 총수익 자체가 납입 한도에 갇혀 있기 때문입니다. ` +
      `다만 이 계산기는 연 ${manwon(ISA_TAX.ANNUAL_LIMIT)}·총 ${manwon(ISA_TAX.TOTAL_LIMIT)} 한도와 의무 가입 ${years(ISA_TAX.MIN_HOLDING_YEARS)}을 강제하지 않으므로, 그보다 큰 납입이나 짧은 기간을 넣으면 제도상 성립하지 않는 조합의 값이 나옵니다.`,
  };
}

function isaVersusDividendTax(): Finding {
  const isa = run({ annualInvestment: 20_000_000, holdingYears: 5, annualReturnRate: 0.1 });
  const otherIncome = 100_000_000;
  const asDividend = calculateDividendTax(isa.totalProfit, "KR", 0, otherIncome);
  const outside = asDividend.totalTax + (asDividend.comprehensiveExtraTax ?? 0);
  return {
    h2: `같은 수익을 배당으로 받으면 세금이 ${ida(times(outside, isa.isaTax))}`,
    body:
      `연 ${manwon(20_000_000)}씩 ${years(5)}, 수익률 ${pct(0.1, 0)}를 가정한 총수익 ${eul(won(isa.totalProfit))} ISA 안에서 실현하면 세금은 ${won(isa.isaTax)}으로 끝납니다. ` +
      `같은 금액을 ISA 밖에서 국내 배당으로 받았고 다른 종합소득 과세표준이 ${manwon(otherIncome)}이라고 가정하면, 원천징수 ${won(asDividend.totalTax)}에 종합과세 추가 세부담 ${ga(won(asDividend.comprehensiveExtraTax ?? 0))} 얹혀 ${ro(won(outside))} 불어납니다. ` +
      `ISA 수익은 ${pct(ISA_TAX.SEPARATE_TAX_RATE, 1)} 분리과세로 종결돼 금융소득 종합과세 판정에서 아예 빠지기 때문인데, 그래서 격차 ${eun(won(outside - isa.isaTax))} 세율 차만으로 설명되지 않습니다. ` +
      `다른 소득이 전혀 없다는 가정으로 바꾸면 추가 세부담이 ${won(calculateDividendTax(isa.totalProfit, "KR", 0, 0).comprehensiveExtraTax ?? 0)}이 되어 격차가 크게 줄어드는 만큼, ISA의 값어치는 본인의 다른 소득 크기에 달려 있습니다.`,
  };
}

export const ISA_DIGEST: Finding[] = [
  savingIsLinear(),
  taxFreeCeilingInAnnual(),
  taxFreeCeilingInRate(),
  longerRaisesAmountLowersRate(),
  savingRateFloor(),
  lowIncomeBonusIsCapped(),
  taxRatioConverges(),
  fullQuotaCeiling(),
  isaVersusDividendTax(),
];
