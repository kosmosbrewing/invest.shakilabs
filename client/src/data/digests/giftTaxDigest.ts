// /gift-tax 파생 다이제스트 — 증여세는 "(증여액 − 관계별 공제) × 구간세율 − 누진공제"라,
// 공제가 앞에서 한 번, 누진공제가 뒤에서 또 한 번 깎는다. 그래서 세율표만 읽어서는
// 실효세율도, 분할 증여의 이득도, 관계를 바꿨을 때의 차액도 나오지 않는다.
// 아래 수치는 전부 calculateGiftTax(및 교차 비교용 calculateInheritanceTax) 실행값이다.

import type { GiftTaxInput } from "@/lib/giftTaxValidators";
import { calculateGiftTax } from "@/utils/giftTaxCalculator";
import { calculateInheritanceTax } from "@/utils/inheritanceTaxCalculator";
import { type Finding, eul, eun, ga, imnida, manwon, pct, pp, ro, times, wa, won } from "./format";

/**
 * 화면 기본값과 같은 조건: 성년 자녀에게 3억원, 과거 10년 기공제 사용 0원, 세대생략 아님.
 *
 * 왜 DEFAULT_GIFT_TAX_INPUT을 참조하지 않고 값을 손으로 다시 적는가:
 * 같은 객체를 가리키면 드리프트 테스트의 `expect(GIFT_BASE).toEqual(DEFAULT_GIFT_TAX_INPUT)`가
 * 자기 자신과의 비교가 되어, 화면 기본값이 무엇으로 바뀌든 절대 red가 되지 않는다.
 * (실측: relationship을 parent로 바꿔도 게이트 22건이 전부 통과했다.)
 * 산문은 "성년 자녀에게"처럼 라벨을 문장에 박아 두므로, 기준값이 조용히 움직이면 문장이 거짓이 된다.
 * 독립 리터럴로 두어야 두 값이 실제로 대조되고, 어긋나는 순간 테스트가 멈춘다.
 */
export const GIFT_BASE: GiftTaxInput = {
  giftAmount: 300_000_000,
  priorDeductionUsed: 0,
  relationship: "adult-child",
  isGenerationSkipping: false,
};
const run = (patch: Partial<typeof GIFT_BASE> = {}) => calculateGiftTax({ ...GIFT_BASE, ...patch });

function effectiveVsApplied(): Finding {
  const base = run();
  const at5 = run({ giftAmount: 500_000_000 });
  return {
    h2: `증여 ${manwon(GIFT_BASE.giftAmount)}의 실효세율은 적용세율의 3분의 2다`,
    body:
      `성년 자녀에게 ${manwon(GIFT_BASE.giftAmount)}, 과거 10년 기공제 사용 0원을 가정하면 증여재산공제 ${won(base.availableDeduction)}을 뺀 과세표준이 ${won(base.taxableAmount)}, 산출세액이 ${imnida(won(base.totalTax))}. ` +
      `적용 구간은 ${pct(base.appliedRate, 0)}인데 실제로 부담하는 비율은 ${pct(base.effectiveRate)}에 그치는데, 공제가 앞에서 ${eul(won(base.availableDeduction))} 덜어 내고 누진공제가 뒤에서 ${eul(won(base.taxableAmount * base.appliedRate - base.totalTax))} 다시 빼기 때문입니다. ` +
      `그래서 같은 ${pct(base.appliedRate, 0)} 구간 안에서는 증여액을 ${manwon(500_000_000)}까지 올려도 실효세율이 ${pct(at5.effectiveRate)}에 머물러 구간세율에 닿지 못합니다. ` +
      `즉 "20% 구간이니 20%를 낸다"는 계산은 이 구간에서 언제나 ${manwon(base.taxableAmount * base.appliedRate - base.totalTax + base.availableDeduction * base.appliedRate)}만큼 과대평가입니다.`,
  };
}

function deductionWorthByBracket(): Finding {
  const small = 100_000_000;
  const big = 3_000_000_000;
  const childSmall = run({ giftAmount: small });
  const otherSmall = run({ giftAmount: small, relationship: "other" });
  const minorSmall = run({ giftAmount: small, relationship: "minor-child" });
  const childBig = run({ giftAmount: big });
  const otherBig = run({ giftAmount: big, relationship: "other" });
  return {
    h2: `같은 공제 차이가 ${manwon(otherSmall.totalTax - childSmall.totalTax)}에서 ${ro(manwon(otherBig.totalTax - childBig.totalTax))} 벌어진다`,
    body:
      `성년 자녀 공제 ${won(childSmall.deductionLimit)}과 기타 친족 공제 ${won(otherSmall.deductionLimit)}의 차이는 언제나 ${ro(won(childSmall.deductionLimit - otherSmall.deductionLimit))} 고정입니다. ` +
      `그런데 ${manwon(small)} 증여를 가정하면 세액이 ${wa(won(childSmall.totalTax))} ${ro(won(otherSmall.totalTax))} ${won(otherSmall.totalTax - childSmall.totalTax)} 차이인 반면, ${manwon(big)}에서는 ${wa(manwon(childBig.totalTax))} ${ro(manwon(otherBig.totalTax))} 차이가 ${ro(manwon(otherBig.totalTax - childBig.totalTax))} 커집니다. ` +
      `공제는 과세표준의 맨 윗칸을 잘라 내므로 그 칸에 걸린 한계세율(${pct(childSmall.appliedRate, 0)} 대 ${pct(childBig.appliedRate, 0)})이 값어치를 정하기 때문입니다. ` +
      `미성년 자녀(${won(minorSmall.deductionLimit)})가 같은 ${manwon(small)}에서 ${eul(won(minorSmall.totalTax))} 내는 것도 같은 이유이며, 결국 공제 한도를 비교할 때는 금액이 아니라 "그 금액이 어느 구간에서 잘리는가"를 봐야 합니다.`,
  };
}

function bracketEdgeIsFlat(): Finding {
  const edges = [100_000_000, 500_000_000, 1_000_000_000].map((taxBase) => {
    const amount = taxBase + run().availableDeduction;
    return { taxBase, at: run({ giftAmount: amount }), over: run({ giftAmount: amount + 1 }) };
  });
  const [e1, e2, e3] = edges;
  return {
    h2: `누진 구간 경계에는 계단이 없고 한계세율만 한 칸 오른다`,
    body:
      `성년 자녀·기공제 0원 가정으로 과세표준을 구간 경계에 정확히 맞춰 보면 ${manwon(e1.taxBase)} 경계에서 ${won(e1.at.totalTax)}, ${manwon(e2.taxBase)} 경계에서 ${won(e2.at.totalTax)}, ${manwon(e3.taxBase)} 경계에서 ${eul(won(e3.at.totalTax))} 냅니다. ` +
      `여기서 1원을 더 받아도 세액은 각각 ${won(e1.over.totalTax)}·${won(e2.over.totalTax)}·${ro(won(e3.over.totalTax))} 그대로인데, 누진공제 ${won(e1.taxBase * e2.at.appliedRate - e1.at.totalTax)}·${won(e2.taxBase * e3.at.appliedRate - e2.at.totalTax)}·${ga(won(e3.taxBase * e3.over.appliedRate - e3.at.totalTax))} 딱 그 계단만큼을 상쇄하도록 정해진 값이기 때문입니다. ` +
      `대신 경계를 넘은 다음 1원부터의 한계세율은 ${pct(e1.over.appliedRate, 0)}에서 ${pct(e2.over.appliedRate, 0)}, ${ro(pct(e3.over.appliedRate, 0))} 한 칸씩 올라가는데, 바로 앞에서 인용한 누진공제 세 값이 각각 그 구간에 붙어 있는 값이기 때문입니다. ` +
      `따라서 "경계를 1원 넘기면 세금이 왈칵 뛴다"는 걱정은 근거가 없고, 실제로 주의할 것은 그 위로 얹는 금액의 단가가 달라진다는 점입니다.`,
  };
}

function splitGiftFrontLoaded(): Finding {
  const total = 1_000_000_000;
  const once = run({ giftAmount: total });
  const twice = run({ giftAmount: total / 2 });
  const fourTimes = run({ giftAmount: total / 4 });
  const firstSave = once.totalTax - twice.totalTax * 2;
  const laterSave = twice.totalTax * 2 - fourTimes.totalTax * 4;
  return {
    h2: `${manwon(total)} 증여는 첫 분할에서만 ${ga(manwon(firstSave))} 빠진다`,
    body:
      `성년 자녀에게 ${manwon(total)}, 각 회차마다 공제를 새로 쓸 수 있는 10년 간격을 가정합니다. 한 번에 주면 ${manwon(once.totalTax)}, ${manwon(total / 2)}씩 두 번이면 ${won(twice.totalTax)}이 두 번 붙어 ${manwon(twice.totalTax * 2)}, ${manwon(total / 4)}씩 네 번이면 ${imnida(manwon(fourTimes.totalTax * 4))}. ` +
      `첫 분할이 ${eul(manwon(firstSave))} 줄이는 반면 두 번 더 쪼개는 것은 ${eul(manwon(laterSave))} 추가로 줄일 뿐이라, 회당 절감이 ${ro(manwon(laterSave / 2))} 내려앉습니다. ` +
      `첫 분할만 유독 큰 이유는 과세표준이 ${pct(once.appliedRate, 0)} 구간에서 ${pct(twice.appliedRate, 0)} 구간으로 통째로 내려가기 때문이고, 그 뒤의 분할은 공제 ${wa(won(once.deductionLimit))} 누진공제를 한 벌씩 더 쓰는 효과만 남기 때문입니다. ` +
      `그래서 분할 횟수를 무한정 늘리는 설계보다, 구간이 한 칸 내려가는 첫 분할점을 정확히 잡는 편이 효율이 높습니다.`,
  };
}

function generationSkipBeatsTwoHops(): Finding {
  const amount = 1_000_000_000;
  const skip = run({ giftAmount: amount, isGenerationSkipping: true });
  const hop1 = run({ giftAmount: amount });
  const hop2 = run({ giftAmount: amount - hop1.totalTax });
  const twoHop = hop1.totalTax + hop2.totalTax;
  const small = run({ giftAmount: 100_000_000, isGenerationSkipping: true });
  const smallHop1 = run({ giftAmount: 100_000_000 });
  const smallHop2 = run({ giftAmount: 100_000_000 - smallHop1.totalTax });
  // 공제 한도 이하에서는 양쪽 다 0원이라 "가산율보다 언제나 크다"가 성립하지 않는다 — 반례를 엔진에서 뽑아 단서로 붙인다.
  const tiny = run({ giftAmount: 50_000_000, isGenerationSkipping: true });
  return {
    h2: `세대생략 ${pct(skip.surcharge / skip.basicTax, 0)} 가산을 물어도 2단 증여보다 싸다`,
    body:
      `조부모가 손자녀에게 ${manwon(amount)}을 바로 넘긴다고 가정하면 기본세액 ${manwon(skip.basicTax)}에 가산 ${ga(manwon(skip.surcharge))} 붙어 ${imnida(manwon(skip.totalTax))}. ` +
      `같은 돈을 자녀에게 한 번(${manwon(hop1.totalTax)}) 준 뒤 세후 ${eul(manwon(amount - hop1.totalTax))} 다시 손자녀에게 넘기면(${manwon(hop2.totalTax)}) 합계가 ${ro(manwon(twoHop))} 불어나, 세대생략 쪽이 ${eul(manwon(twoHop - skip.totalTax))} 아낍니다. ` +
      `${manwon(100_000_000)}처럼 작은 금액에서도 ${wa(won(small.totalTax))} ${ro(won(smallHop1.totalTax + smallHop2.totalTax))} 방향이 같은데, 가산율 ${pct(skip.surcharge / skip.basicTax, 0)}보다 두 번째 증여에서 새로 발생하는 세금의 비중이 더 크기 때문입니다. ` +
      `한편 증여액이 증여재산공제 한도 ${won(skip.deductionLimit)} 이하이면 세대생략도 2단 증여도 세액이 ${ro(won(tiny.totalTax))} 같아져 우열 자체가 사라지므로, 이 비교는 세금이 실제로 붙는 구간에서만 뜻이 있습니다. ` +
      `다만 이 비교는 두 번째 증여가 공제를 온전히 새로 받는다는 가정 위에 서 있어서, 실제로는 10년 합산과 상속재산 합산이 결과를 바꿀 수 있습니다.`,
  };
}

function priorDeductionSaturates(): Finding {
  const none = run();
  const half = run({ priorDeductionUsed: 30_000_000 });
  const full = run({ priorDeductionUsed: 50_000_000 });
  const over = run({ priorDeductionUsed: 100_000_000 });
  return {
    h2: `기공제는 ${won(none.deductionLimit)}에서 효과가 멈춘다`,
    body:
      `성년 자녀에게 ${manwon(GIFT_BASE.giftAmount)}을 준다고 가정하고 과거 10년 기공제 사용액만 바꾸면 세액이 0원일 때 ${won(none.totalTax)}, ${manwon(30_000_000)}일 때 ${won(half.totalTax)}, ${manwon(50_000_000)}일 때 ${ro(won(full.totalTax))} 오릅니다. ` +
      `기공제 ${manwon(30_000_000)}이 세금을 ${won(half.totalTax - none.totalTax)} 올렸으니 1원당 정확히 한계세율 ${pct(none.appliedRate, 0)}인 셈입니다. ` +
      `그런데 사용액을 한도의 두 배인 ${manwon(100_000_000)}으로 올려도 세액은 ${ro(won(over.totalTax))} 그대로인데, 남은 공제가 0에서 더 내려가지 않기 때문입니다. ` +
      `따라서 "10년 안에 이미 한도를 다 썼다"와 "한도의 두 배를 썼다"는 이 계산기에서 같은 결과이고, 구분이 필요한 것은 한도를 넘겼는지가 아니라 얼마나 남았는지입니다.`,
  };
}

function spousePathVsChildPath(): Finding {
  const amount = 1_000_000_000;
  const spouse = run({ giftAmount: amount, relationship: "spouse" });
  const child = run({ giftAmount: amount });
  const spouseSmall = run({ giftAmount: 700_000_000, relationship: "spouse" });
  const spouseBig = run({ giftAmount: 2_000_000_000, relationship: "spouse" });
  return {
    h2: `배우자 경로는 ${manwon(amount)}에서 ${eul(manwon(child.totalTax - spouse.totalTax))} 덜 낸다`,
    body:
      `${manwon(amount)}을 한 번에 넘긴다고 가정하면 배우자는 ${manwon(spouse.totalTax)}, 성년 자녀는 ${eul(manwon(child.totalTax))} 냅니다. ` +
      `공제 한도가 ${wa(won(spouse.deductionLimit))} ${ro(won(child.deductionLimit))} ${manwon(spouse.deductionLimit - child.deductionLimit)} 차이인데 세액 차이가 그보다 작은 ${manwon(child.totalTax - spouse.totalTax)}인 것은, 잘려 나간 구간이 ${pct(child.appliedRate, 0)}가 아니라 그 아래 ${pct(spouse.appliedRate, 0)} 구간을 포함하기 때문입니다. ` +
      `배우자 쪽 실효세율은 ${manwon(700_000_000)}에서 ${pct(spouseSmall.effectiveRate)}, ${manwon(amount)}에서 ${pct(spouse.effectiveRate)}, ${manwon(2_000_000_000)}에서 ${pct(spouseBig.effectiveRate)}로 올라가므로, 자녀 경로가 ${manwon(amount)}에서 이미 기록한 ${eul(pct(child.effectiveRate))} 따라잡으려면 증여액이 ${eul(manwon(2_000_000_000))} 넘어서야 합니다. ` +
      `그만큼 배우자 공제는 큰 금액을 한 번에 옮길 때 가장 크게 작동합니다.`,
  };
}

function giftVersusInheritance(): Finding {
  const amount = 1_000_000_000;
  const gift = run({ giftAmount: amount });
  const inherit = calculateInheritanceTax({
    totalEstate: amount,
    debt: 0,
    financialAssets: 0,
    hasSpouse: false,
    childrenCount: 1,
  });
  const half = 500_000_000;
  const giftHalf = run({ giftAmount: half });
  const inheritHalf = calculateInheritanceTax({
    totalEstate: half,
    debt: 0,
    financialAssets: 0,
    hasSpouse: false,
    childrenCount: 1,
  });
  return {
    h2: `같은 ${manwon(amount)}을 상속으로 넘기면 증여의 ${pct(inherit.totalTax / gift.totalTax, 1)}만 낸다`,
    body:
      `자녀 한 사람이 ${manwon(amount)}을 받는 상황을 가정하고 두 계산기를 같은 금액으로 돌리면, 증여세는 ${manwon(gift.totalTax)}인데 상속세(배우자 없음·금융재산 0원·채무 0원 가정)는 ${ro(manwon(inherit.totalTax))} ${times(gift.totalTax, inherit.totalTax)} 차이가 납니다. ` +
      `상속 쪽 공제가 일괄공제 ${manwon(inherit.generalDeduction)} 한 항목만으로도 증여재산공제 ${manwon(gift.deductionLimit)}의 열 배이고, 여기에 기한 내 신고 시 산출세액의 3%인 ${won(inherit.filingDeduction)}까지 더 빠지기 때문입니다. ` +
      `${manwon(half)}에서는 격차가 더 극단적이어서 상속은 ${won(inheritHalf.totalTax)}, 증여는 ${eul(manwon(giftHalf.totalTax))} 냅니다. ` +
      `그럼에도 생전 증여가 선택지로 남는 것은 세액 비교 때문이 아니라, 상속개시 10년 전에 끝낸 증여가 상속재산에 합산되지 않고 증여 시점의 평가액으로 과세가 마감된다는 점 때문입니다.`,
  };
}

function effectiveRateCeiling(): Finding {
  const steps = [100_000_000, 1_000_000_000, 5_000_000_000, 10_000_000_000].map((amount) => ({
    amount,
    r: run({ giftAmount: amount }),
  }));
  const [s1, s2, s3, s4] = steps;
  const top = s4.r.appliedRate;
  // 실효세율이 최고세율에 닿지 못하게 만드는 고정 감액 = 최고세율 × 증여액 − 실제 세액 (증여액과 무관하게 일정)
  const gap = s4.amount * top - s4.r.totalTax;
  return {
    h2: `증여액을 ${manwon(10_000_000_000)}으로 키워도 실효세율은 ${pct(s4.r.effectiveRate)}에 그친다`,
    body:
      `성년 자녀·기공제 0원 가정에서 증여액만 키우면 실효세율이 ${manwon(s1.amount)} ${pct(s1.r.effectiveRate)}, ${manwon(s2.amount)} ${pct(s2.r.effectiveRate)}, ${manwon(s3.amount)} ${pct(s3.r.effectiveRate)}, ${manwon(s4.amount)} ${ro(pct(s4.r.effectiveRate))} 오릅니다. ` +
      `최고세율이 ${pct(top, 0)}인데도 끝내 닿지 못하는 이유는, 증여재산공제 ${wa(won(s4.r.deductionLimit))} 최고구간 누진공제가 만들어 내는 고정 감액 ${ga(manwon(gap))} 분모가 커져도 사라지지 않기 때문입니다. ` +
      `즉 실효세율은 ${pct(top, 0)}에서 "${manwon(gap)} ÷ 증여액"을 뺀 값으로만 움직입니다. ` +
      `그래서 큰 금액일수록 세율표의 최고 구간을 그대로 부담률로 읽는 오차가 줄기는 하지만, ${manwon(s4.amount)}에서도 여전히 ${eun(pp((top - s4.r.effectiveRate) * 100))} 남습니다.`,
  };
}

export const GIFT_TAX_DIGEST: Finding[] = [
  effectiveVsApplied(),
  deductionWorthByBracket(),
  bracketEdgeIsFlat(),
  splitGiftFrontLoaded(),
  generationSkipBeatsTwoHops(),
  priorDeductionSaturates(),
  spousePathVsChildPath(),
  giftVersusInheritance(),
  effectiveRateCeiling(),
];
