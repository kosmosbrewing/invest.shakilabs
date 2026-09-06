// /inheritance-tax 파생 다이제스트 — 상속세는 공제가 네 겹(배우자·일괄·금융재산·장례비)으로 쌓이고,
// 그중 배우자공제만 다른 입력값에 연동돼 움직인다. 그래서 자녀를 늘리거나 채무를 넣는 조작이
// 직관과 반대 방향의 결과를 내는 구간이 생긴다. 아래 수치는 전부 calculateInheritanceTax
// (교차 비교분은 calculateGiftTax) 실행값이며, 어느 것도 공제표를 옮겨 적은 값이 아니다.

import { DEFAULT_INHERITANCE_TAX_INPUT } from "@/lib/inheritanceTaxValidators";
import { calculateGiftTax } from "@/utils/giftTaxCalculator";
import { calculateInheritanceTax } from "@/utils/inheritanceTaxCalculator";
import { type Finding, eul, eun, ga, ida, imnida, manwon, num, people, pct, ro, times, wa, won, years } from "./format";

/** 화면 기본값과 같은 조건: 상속재산 20억원, 채무 0원, 금융재산 5억원, 배우자 있음, 자녀 2명 */
export const INHERITANCE_BASE = DEFAULT_INHERITANCE_TAX_INPUT;
const run = (patch: Partial<typeof INHERITANCE_BASE> = {}) =>
  calculateInheritanceTax({ ...INHERITANCE_BASE, ...patch });

function deductionShape(): Finding {
  const r = run();
  return {
    h2: `${manwon(INHERITANCE_BASE.totalEstate)} 상속의 실효세율은 ${pct(r.effectiveRate)}까지 내려간다`,
    body:
      `상속재산 ${manwon(INHERITANCE_BASE.totalEstate)}, 채무 0원, 금융재산 ${manwon(INHERITANCE_BASE.financialAssets)}, 배우자와 자녀 ${people(INHERITANCE_BASE.childrenCount)}을 가정하면 과세가액 ${manwon(r.taxableValue)}에서 배우자공제 ${manwon(r.spouseDeduction)}, 일괄공제 ${manwon(r.generalDeduction)}, 금융재산공제 ${ga(manwon(r.financialDeduction))} 차례로 빠집니다. ` +
      `공제 합계 ${eun(manwon(r.totalDeduction))} 과세가액의 ${pct(r.totalDeduction / r.taxableValue)}나 되므로, 남는 과세표준은 ${manwon(r.taxBase)}뿐입니다. ` +
      `여기에 구간세율 ${eul(pct(r.appliedRate, 0))} 적용한 산출세액 ${manwon(r.calculatedTax)}에서 기한 내 신고 시 3%인 ${eul(won(r.filingDeduction))} 빼면 ${imnida(won(r.totalTax))}. ` +
      `그래서 재산 대비 실제 부담이 ${pct(r.effectiveRate)}에 그치는 것은 공제가 세율보다 먼저 작동하기 때문입니다. ` +
      `다만 이 비율은 배우자와 금융재산이 함께 있을 때의 값이라, 상속세를 "최고 50% 세금"으로 기억하고 있으면 실제 부담을 열 배 가까이 과대평가하게 됩니다.`,
  };
}

function moreChildrenCostMore(): Finding {
  const rows = [0, 1, 2, 3, 5, 6, 7].map((n) => ({ n, r: run({ childrenCount: n }) }));
  const at0 = rows[0].r;
  const at2 = rows[2].r;
  const at5 = rows[4].r;
  const at6 = rows[5].r;
  const at7 = rows[6].r;
  return {
    h2: `자녀가 늘수록 상속세가 오르다 ${people(7)}째에 처음 꺾인다`,
    body:
      `상속재산 ${manwon(INHERITANCE_BASE.totalEstate)}·금융재산 ${manwon(INHERITANCE_BASE.financialAssets)}·배우자 있음을 가정으로 고정한 채 자녀 수만 바꾸면 세액이 ${people(0)} ${won(at0.totalTax)}, ${people(2)} ${won(at2.totalTax)}, ${people(5)} ${ro(won(at5.totalTax))} 올라갑니다. ` +
      `인적공제가 자녀 한 사람마다 늘어나는데도 세금이 오르는 이유는, 배우자 법정상속분이 1.5/(1.5+자녀 수)로 줄어 배우자공제가 ${manwon(at0.spouseDeduction)}에서 ${manwon(at2.spouseDeduction)}, 다시 하한인 ${ro(manwon(at5.spouseDeduction))} 깎이기 때문입니다. ` +
      `${people(6)}에서는 배우자공제가 이미 하한이고 일괄공제도 그대로라 세액이 ${won(at6.totalTax)}으로 멈춰 서고, ${people(7)}에 이르러 기초공제와 인적공제의 합이 처음으로 일괄공제 ${manwon(at6.generalDeduction)}을 넘어서면서 ${ro(won(at7.totalTax))} 꺾입니다. ` +
      `즉 상속인이 많다는 사실 자체는 이 계산기에서 감세 요인이 아니고, 일괄공제를 밀어낼 만큼 많아져야 비로소 방향이 바뀝니다.`,
  };
}

function financialDeductionDeadZone(): Finding {
  const none = run({ financialAssets: 0 });
  const low = run({ financialAssets: 20_000_000 });
  const flatTop = run({ financialAssets: 100_000_000 });
  const capped = run({ financialAssets: 1_000_000_000 });
  const beyond = run({ financialAssets: 2_000_000_000 });
  return {
    h2: `금융재산 ${manwon(20_000_000)}과 ${manwon(100_000_000)}의 세금이 똑같다`,
    body:
      `상속재산 ${manwon(INHERITANCE_BASE.totalEstate)}·배우자와 자녀 ${eul(people(INHERITANCE_BASE.childrenCount))} 가정으로 고정하고 금융재산만 바꾸면 세액이 0원일 때 ${won(none.totalTax)}, ${manwon(20_000_000)}일 때 ${won(low.totalTax)}, ${manwon(100_000_000)}일 때도 ${ro(won(flatTop.totalTax))} 완전히 같습니다. ` +
      `그 사이 ${manwon(80_000_000)}이 세금에 한 푼도 반영되지 않는 이유는, 공제식이 "${manwon(20_000_000)} 이하는 전액, 넘으면 20%를 쓰되 최소 ${manwon(20_000_000)}"이라 20%가 하한을 다시 넘어서는 ${manwon(100_000_000)} 위에서만 움직이기 때문입니다. ` +
      `반대편 끝에서는 ${manwon(1_000_000_000)}에서 공제가 상한 ${manwon(capped.financialDeduction)}에 닿아 세액이 ${won(capped.totalTax)}으로 내려간 뒤, ${manwon(2_000_000_000)}으로 두 배를 넣어도 ${won(beyond.totalTax)}에서 다시 평평해집니다. ` +
      `그래서 이 공제는 금융자산 비중이 ${manwon(100_000_000)}과 ${manwon(1_000_000_000)} 사이일 때만 세액을 실제로 움직입니다.`,
  };
}

function spouseIsWorthThisMuch(): Finding {
  const withSpouse = run();
  const without = run({ hasSpouse: false });
  return {
    h2: `배우자 한 사람이 상속세 ${eul(manwon(without.totalTax - withSpouse.totalTax))} 지운다`,
    body:
      `상속재산 ${manwon(INHERITANCE_BASE.totalEstate)}·금융재산 ${manwon(INHERITANCE_BASE.financialAssets)}·자녀 ${eul(people(INHERITANCE_BASE.childrenCount))} 가정으로 고정하고 배우자 유무만 바꾸면 세액이 ${wa(won(withSpouse.totalTax))} ${ro(won(without.totalTax))} 갈립니다. ` +
      `배우자공제 ${manwon(withSpouse.spouseDeduction)}이 과세표준을 ${manwon(without.taxBase)}에서 ${ro(manwon(withSpouse.taxBase))} 끌어내리는데, 이때 적용 구간까지 ${pct(without.appliedRate, 0)}에서 ${ro(pct(withSpouse.appliedRate, 0))} 한 칸 내려앉습니다. ` +
      `그래서 절감액 ${eun(manwon(without.totalTax - withSpouse.totalTax))} 공제액에 한 가지 세율만 곱해서는 나오지 않고, 공제가 걷어 낸 금액이 두 구간에 걸쳐 있다는 사실까지 넣어야 설명됩니다. ` +
      `그만큼 배우자 유무는 이 계산기에서 단일 입력 하나가 만드는 가장 큰 폭이며, 자녀 수나 금융재산을 아무리 조절해도 이 크기에는 미치지 못합니다.`,
  };
}

function spouseShareWindow(): Finding {
  const floorEnd = run({ totalEstate: 1_171_660_000, financialAssets: 0 });
  const floorOff = run({ totalEstate: 1_171_670_000, financialAssets: 0 });
  const capOn = run({ totalEstate: 7_005_000_000, financialAssets: 0 });
  const beyond = run({ totalEstate: 10_000_000_000, financialAssets: 0 });
  const slope = 1.5 / (1.5 + INHERITANCE_BASE.childrenCount);
  return {
    h2: `배우자 법정상속분이 실제로 움직이는 구간은 두 경계 사이뿐이다`,
    body:
      `자녀 ${people(INHERITANCE_BASE.childrenCount)}·금융재산 0원·채무 0원을 가정하고 상속재산을 1만원씩 올려 보면, ${manwon(1_171_660_000)}까지는 배우자공제가 하한 ${manwon(floorEnd.spouseDeduction)}에 붙박여 있다가 ${manwon(1_171_670_000)}에서 ${ro(won(floorOff.spouseDeduction))} 처음 움직입니다. ` +
      `반대쪽 끝인 ${manwon(7_005_000_000)}에서는 계산값이 상한 ${manwon(capOn.spouseDeduction)}에 닿아 그 위로는 재산이 ${manwon(10_000_000_000)}이 되어도 공제가 ${manwon(beyond.spouseDeduction)}에서 멈춥니다. ` +
      `두 경계 사이에서만 재산 1원이 늘 때 배우자공제가 ${num(slope, 4)}원씩 따라 늘어나는데, 법정상속분 비율 1.5/(1.5+자녀 수)가 그대로 기울기가 되기 때문입니다. ` +
      `따라서 재산이 ${manwon(1_000_000_000)}이든 ${manwon(1_100_000_000)}이든 배우자공제는 똑같고, ${manwon(10_000_000_000)}이든 ${manwon(20_000_000_000)}이든 또 똑같습니다.`,
  };
}

function debtIsPartlyOffset(): Finding {
  const none = run();
  const with1 = run({ debt: 100_000_000 });
  const with5 = run({ debt: 500_000_000 });
  const shareCut = none.spouseDeduction - with1.spouseDeduction;
  return {
    h2: `채무 ${manwon(100_000_000)}을 넣어도 세금은 ${manwon(none.totalTax - with1.totalTax)}만 준다`,
    body:
      `상속재산 ${manwon(INHERITANCE_BASE.totalEstate)}·금융재산 ${manwon(INHERITANCE_BASE.financialAssets)}·배우자와 자녀 ${eul(people(INHERITANCE_BASE.childrenCount))} 가정하고 채무 금액만 넣으면 세액이 ${wa(won(none.totalTax))} ${ro(won(with1.totalTax))} 내려갑니다. ` +
      `채무 ${manwon(100_000_000)}이 과세가액을 그만큼 줄이는 것은 맞지만 배우자공제도 같은 비율로 ${manwon(shareCut)} 함께 줄어드는 상쇄가 일어나, 과세표준은 ${manwon(100_000_000)}이 아니라 ${won(none.taxBase - with1.taxBase)}만 내려가는 데 그칩니다. ` +
      `그런데도 절감액이 그 금액에 ${eul(pct(none.appliedRate, 0))} 곱한 값보다 큰 이유는, 과세표준이 ${manwon(500_000_000)} 아래로 내려가며 적용 구간이 ${pct(none.appliedRate, 0)}에서 ${ro(pct(with1.appliedRate, 0))} 바뀌었기 때문입니다. ` +
      `채무를 ${ro(manwon(500_000_000))} 늘리면 세액은 ${won(with5.totalTax)}, 절감은 ${imnida(manwon(none.totalTax - with5.totalTax))}.`,
  };
}

function firstTaxedEstate(): Finding {
  const free = run({ totalEstate: 1_005_000_000, financialAssets: 0 });
  const taxed = run({ totalEstate: 1_005_010_000, financialAssets: 0 });
  const soloFree = run({ totalEstate: 505_000_000, financialAssets: 0, hasSpouse: false });
  const soloTaxed = run({ totalEstate: 505_010_000, financialAssets: 0, hasSpouse: false });
  return {
    h2: `상속세가 처음 생기는 재산은 ${manwon(1_005_010_000)}이다`,
    body:
      `배우자와 자녀 ${people(INHERITANCE_BASE.childrenCount)}, 금융재산 0원, 채무 0원을 가정하고 재산을 1만원씩 올려 보면 ${manwon(1_005_000_000)}까지는 세액이 ${won(free.totalTax)}이고 ${manwon(1_005_010_000)}에서 ${ga(won(taxed.totalTax))} 처음 나옵니다. ` +
      `일괄공제 ${manwon(free.generalDeduction)}과 배우자공제 하한 ${manwon(free.spouseDeduction)}, 그리고 법정 장례비 ${ga(won(free.funeralExpense))} 정확히 그 지점까지 과세표준을 0으로 눌러 주기 때문입니다. ` +
      `배우자가 없으면 같은 경계가 ${ro(manwon(505_010_000))} 내려가는데, ${won(soloFree.totalTax)}에서 ${ro(won(soloTaxed.totalTax))} 바뀌는 지점이 정확히 배우자공제 하한만큼 앞당겨진 자리입니다. ` +
      `그래서 흔히 말하는 "${manwon(1_000_000_000)}까지는 상속세가 없다"는 배우자가 있을 때만 성립하는 문장입니다.`,
  };
}

function funeralDeductionIsDiluted(): Finding {
  const base = run();
  const neutral = run({ totalEstate: INHERITANCE_BASE.totalEstate + 5_000_000 });
  const worth = neutral.totalTax - base.totalTax;
  const soloBase = run({ hasSpouse: false });
  const soloNeutral = run({ hasSpouse: false, totalEstate: INHERITANCE_BASE.totalEstate + 5_000_000 });
  const soloWorth = soloNeutral.totalTax - soloBase.totalTax;
  return {
    h2: `법정 장례비 ${manwon(5_000_000)}의 실제 값어치는 ${ida(won(worth))}`,
    body:
      `기본 가정(${manwon(INHERITANCE_BASE.totalEstate)}·금융재산 ${manwon(INHERITANCE_BASE.financialAssets)}·배우자와 자녀 ${people(INHERITANCE_BASE.childrenCount)})에서 장례비가 있을 때와 없을 때를 같은 조건으로 맞춰 비교하면 세금 차이가 ${imnida(won(worth))}. ` +
      `공제액 ${manwon(5_000_000)}에 구간세율 ${eul(pct(base.appliedRate, 0))} 곱한 ${won(5_000_000 * base.appliedRate)}과 견주면 절반을 조금 넘는 값인데, 장례비가 과세가액을 줄이는 순간 배우자공제도 법정상속분 비율만큼 함께 줄어 과세표준이 ${won(neutral.taxBase - base.taxBase)}만 내려가는 데 그치기 때문입니다. ` +
      `배우자가 없으면 상쇄가 사라져 같은 ${manwon(5_000_000)}이 ${ro(won(soloWorth))} 값이 뛰어, ${eul(times(soloWorth, worth))} 넘습니다. ` +
      `즉 이 계산기에서 공제 한 항목의 값어치는 그 항목의 금액이 아니라 배우자공제와 얼마나 겹치는지가 정합니다.`,
  };
}

function howManySplitsToBeatInheritance(): Finding {
  const amount = 1_000_000_000;
  const inherit = run({ totalEstate: amount, financialAssets: 0, hasSpouse: false, childrenCount: 1 });
  const split = (n: number) =>
    calculateGiftTax({
      giftAmount: Math.round(amount / n),
      priorDeductionUsed: 0,
      relationship: "adult-child",
      isGenerationSkipping: false,
    }).totalTax * n;
  // 상속세를 밑도는 최소 분할 횟수를 회차를 늘려 가며 엔진에서 직접 찾는다
  let rounds = 2;
  while (rounds < 20 && split(rounds) >= inherit.totalTax) rounds += 1;
  const perRound = Math.round(amount / rounds);
  return {
    h2: `${manwon(amount)}을 ${rounds}번 쪼개야 상속 한 번을 겨우 이긴다`,
    body:
      `자녀 ${people(1)}이 ${manwon(amount)}을 물려받는다고 가정하고, 증여를 몇 번으로 나눠야 상속세 아래로 내려가는지 회차를 하나씩 늘리며 엔진을 다시 돌렸습니다. 상속(배우자 없음·금융재산 0원·채무 0원)은 ${imnida(won(inherit.totalTax))}. ` +
      `두 번 나눈 증여는 ${manwon(split(2))}, 다섯 번은 ${ro(manwon(split(5)))} 여전히 그 위에 있고, ${rounds}번(회당 ${won(perRound)})에 이르러서야 ${ro(won(split(rounds)))} 처음 내려섭니다. ` +
      `증여재산공제가 10년마다 새로 열리므로 ${rounds}번을 채우려면 ${years(rounds * 10)}이 필요하다는 뜻인데, 상속 쪽은 그 기다림 없이 일괄공제 ${manwon(inherit.generalDeduction)} 한 항목으로 같은 자리에 도달합니다. ` +
      `다만 이 비교는 재산이 늘지도 줄지도 않는다는 전제 위에 서 있으므로, 쪼개기의 값어치는 세액이 아니라 증여 이후의 가치 상승에서 찾아야 합니다.`,
  };
}

function effectiveRateClimb(): Finding {
  const rows = [1_000_000_000, 2_000_000_000, 5_000_000_000, 10_000_000_000, 30_000_000_000].map((e) => ({
    e,
    r: run({ totalEstate: e, financialAssets: Math.round(e * 0.25) }),
  }));
  const [r1, r2, r3, r4, r5] = rows;
  return {
    h2: `재산이 열 배가 되면 실효세율은 0%에서 ${ro(pct(r4.r.effectiveRate))} 뛴다`,
    body:
      `배우자와 자녀 ${people(INHERITANCE_BASE.childrenCount)}, 금융재산은 재산의 25%라고 가정하고 규모만 키우면 실효세율이 ${manwon(r1.e)} ${pct(r1.r.effectiveRate)}, ${manwon(r2.e)} ${pct(r2.r.effectiveRate)}, ${manwon(r3.e)} ${pct(r3.r.effectiveRate)}, ${manwon(r4.e)} ${pct(r4.r.effectiveRate)}, ${manwon(r5.e)} ${ro(pct(r5.r.effectiveRate))} 올라갑니다. ` +
      `공제 총액도 ${manwon(r1.r.totalDeduction)}에서 ${ro(manwon(r4.r.totalDeduction))} 함께 늘긴 하지만, 배우자공제가 상한 ${manwon(3_000_000_000)}에 걸리는 순간부터 더 자라지 못해 ${manwon(r5.e)}에서도 공제가 ${manwon(r5.r.totalDeduction)}에 머뭅니다. ` +
      `그래서 재산이 세 배가 되는 동안 세액은 ${manwon(r4.r.totalTax)}에서 ${ro(manwon(r5.r.totalTax))} ${times(r5.r.totalTax, r4.r.totalTax)} 늘어납니다. ` +
      `공제가 정액으로 굳는 구간에 들어서면 한계세율이 그대로 실효세율을 끌어올린다는 뜻입니다.`,
  };
}

export const INHERITANCE_TAX_DIGEST: Finding[] = [
  deductionShape(),
  moreChildrenCostMore(),
  financialDeductionDeadZone(),
  spouseIsWorthThisMuch(),
  spouseShareWindow(),
  debtIsPartlyOffset(),
  firstTaxedEstate(),
  funeralDeductionIsDiluted(),
  howManySplitsToBeatInheritance(),
  effectiveRateClimb(),
];
