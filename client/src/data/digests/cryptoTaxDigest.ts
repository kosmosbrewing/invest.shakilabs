// /crypto-tax 파생 다이제스트 — 세율은 22% 하나뿐인데도 결과는 단일세율처럼 움직이지 않는다.
// 연 250만원 기본공제가 앞에서 한 번 깎고, 소득세·지방소득세가 각각 따로 내림 처리되기 때문이다.
// 아래 수치는 전부 calculateCryptoTax(및 대조용 calculateForeignStockTax) 실행값이며,
// 가상자산 양도소득 과세는 2027년 1월 1일 이후 양도분부터 적용될 예정이라 전부 시뮬레이션이다.

import { CRYPTO_TAX_EFFECTIVE_DATE } from "@/data/investTaxRates";
import { calculateForeignStockTax } from "@/utils/foreignStockTaxCalculator";
import { calculateCryptoTax } from "@/utils/investCalculator";
import { type Finding, eul, eun, ga, ida, imnida, manwon, num, pct, pp, ro, times, wa, won } from "./format";

/**
 * 화면 기본값과 같은 조건: 매수 1,000만원 → 매도 1,500만원, 필요경비 0원.
 *
 * useCryptoTaxCalc()의 ref 초기값을 참조하지 않고 리터럴로 다시 적는다 —
 * 같은 출처를 가리키면 드리프트 테스트가 자기 자신과의 비교가 되어 절대 red가 나지 않는다.
 */
export interface CryptoTaxBase {
  /** 매수금액 (원) */
  purchaseAmount: number;
  /** 매도금액 (원) */
  saleAmount: number;
  /** 필요경비 (원) */
  expenses: number;
}

export const CRYPTO_BASE: CryptoTaxBase = {
  purchaseAmount: 10_000_000,
  saleAmount: 15_000_000,
  expenses: 0,
};

const run = (patch: Partial<CryptoTaxBase> = {}) => {
  const input = { ...CRYPTO_BASE, ...patch };
  return calculateCryptoTax(input.purchaseAmount, input.saleAmount, input.expenses);
};
/** 양도차익만 주어졌을 때의 결과 — 매수 0원에서 그 금액을 판 것과 같다. */
const byGain = (gain: number) => calculateCryptoTax(0, gain, 0);

function nominalRateIsNotWhatYouPay(): Finding {
  const b = run();
  const nominal = b.totalTax / b.taxableAmount;
  return {
    h2: `차익 ${manwon(5_000_000)}의 실효세율은 22%가 아니라 ${ida(pct(b.effectiveRate, 0))}`,
    body:
      `화면 기본값대로 ${manwon(CRYPTO_BASE.purchaseAmount)}에 산 코인을 ${manwon(CRYPTO_BASE.saleAmount)}에 판다고 가정하면 양도차익이 ${won(b.totalGain)}, 기본공제 ${eul(won(b.deduction))} 뺀 과세표준이 ${won(b.taxableAmount)}, 소득세 ${wa(won(b.incomeTax))} 지방소득세 ${eul(won(b.localTax))} 더한 예상 세금이 ${won(b.totalTax)}, 세후 수익이 ${imnida(won(b.netProfit))}. ` +
      `과세표준에 붙는 비율은 정확히 ${pct(nominal, 0)}인데 양도차익 전체로 다시 나눈 실효세율은 ${pct(b.effectiveRate, 0)}에 그치므로, 명목세율의 절반입니다. ` +
      `공제가 세율표 앞에서 차익의 절반을 통째로 덜어 냈기 때문이며, 차익이 공제와 비슷한 규모일수록 이 격차가 커집니다. ` +
      `그래서 "22% 낸다"는 어림셈은 이 구간에서 세금을 두 배로 부풀려 잡는 계산이 됩니다.`,
  };
}

function effectiveRateIsRateMinusFixed(): Finding {
  const anchor = byGain(1_000_000_000);
  const fixed = anchor.deduction * (anchor.totalTax / anchor.taxableAmount);
  const rows = [3_000_000, 25_000_000, 100_000_000, 1_000_000_000].map((gain) => ({ gain, r: byGain(gain) }));
  const [g3, g25, g100, g1000] = rows;
  const nominal = anchor.totalTax / anchor.taxableAmount;
  return {
    h2: `실효세율은 22%에서 ${won(fixed)}÷차익을 뺀 값으로만 움직인다`,
    body:
      `필요경비 0원을 가정하고 양도차익만 키우면 실효세율이 ${manwon(g3.gain)} ${pct(g3.r.effectiveRate, 4)}, ${manwon(g25.gain)} ${pct(g25.r.effectiveRate, 4)}, ${manwon(g100.gain)} ${pct(g100.r.effectiveRate, 4)}, ${manwon(g1000.gain)} ${ro(pct(g1000.r.effectiveRate, 4))} 올라갑니다. ` +
      `공제 ${won(anchor.deduction)}에 세율 ${eul(pct(nominal, 0))} 먹인 ${ga(won(fixed))} 차익과 무관하게 늘 빠지므로, 실효세율은 명목세율에서 이 고정 금액을 차익으로 나눈 값을 뺀 결과가 됩니다. ` +
      `분모가 커질수록 빼는 몫이 줄어드는 구조라 실효세율은 계속 오르지만 ${pct(nominal, 0)}에 닿지는 못하며, ${manwon(g1000.gain)}에서도 여전히 ${eun(pp((nominal - g1000.r.effectiveRate) * 100, 3))} 남아 있습니다. ` +
      `따라서 세 부담을 어림잡을 때 22%를 곱하고 끝내는 대신 그 고정 금액을 빼 주는 한 단계가 필요합니다.`,
  };
}

function deductionEdgeHasNoStep(): Finding {
  const deduction = byGain(3_000_000).deduction;
  const at = byGain(deduction);
  let firstTaxable = 1;
  while (byGain(deduction + firstTaxable).totalTax === 0) firstTaxable += 1;
  let firstLocal = firstTaxable;
  while (byGain(deduction + firstLocal).localTax === 0) firstLocal += 1;
  const atLocal = byGain(deduction + firstLocal);
  return {
    h2: `공제를 1원 넘겨도 세금은 0원이고 ${firstTaxable}원부터 붙는다`,
    body:
      `필요경비 0원을 가정하고 양도차익을 기본공제 ${won(deduction)} 언저리에서 1원씩 옮겨 보면, ${won(deduction)}에서도 ${won(deduction + 1)}에서도 예상 세금이 ${ro(won(at.totalTax))} 같습니다. 과세표준 1원에 세율을 곱한 값이 1원에 못 미쳐 내림으로 사라지기 때문입니다. ` +
      `세금 1원이 처음 등장하는 지점은 공제를 ${won(firstTaxable)} 넘긴 ${won(deduction + firstTaxable)}이고, 지방소득세는 세율이 그 10분의 1이라 한참 뒤인 ${eul(won(deduction + firstLocal))} 넘겨야 첫 1원이 붙어 그 자리에서 합계가 ${ro(won(atLocal.totalTax))} 뜁니다. ` +
      `소득세와 지방소득세를 따로 내림하는 구조라 경계 부근에서는 두 항목이 서로 다른 지점에서 켜지고, 그 사이 구간은 명목세율보다 낮게 매겨집니다. ` +
      `그러므로 공제선을 1원 차이로 넘길까 봐 매도 시점을 미루는 판단은 이 계산기에서 근거가 없습니다.`,
  };
}

function doublingGainDoesNotDoubleTax(): Finding {
  const rows = [3_000_000, 10_000_000, 50_000_000, 200_000_000].map((gain) => ({
    gain,
    ratio: byGain(gain * 2).totalTax / byGain(gain).totalTax,
  }));
  const [g3, g10, g50, g200] = rows;
  return {
    h2: `단일세율인데 수익 2배가 세금 2배가 아니다`,
    body:
      `세율이 22% 하나뿐이라 수익이 두 배면 세금도 두 배일 것 같지만, 필요경비 0원을 가정하고 실제로 돌려 보면 배수가 차익 ${manwon(g3.gain)}에서 ${num(g3.ratio, 2)}배, ${manwon(g10.gain)}에서 ${num(g10.ratio, 4)}배, ${manwon(g50.gain)}에서 ${num(g50.ratio, 4)}배, ${manwon(g200.gain)}에서 ${num(g200.ratio, 4)}배로 계속 다릅니다. ` +
      `공제 ${eun(manwon(2_500_000))} 차익이 두 배가 되어도 그대로라, 과세 대상 금액만 두 배보다 더 크게 늘어나기 때문입니다. ` +
      `배수는 차익이 커질수록 2배 쪽으로 내려오지만 아래로 뚫지는 못하는데, 공제가 사라지지 않는 한 분자 쪽이 항상 조금 더 무겁기 때문입니다. ` +
      `반대로 차익이 공제에 가까운 구간에서는 배수가 극단으로 튀므로, 소액 매도의 세금을 비율로 미루어 짐작하면 크게 빗나갑니다.`,
  };
}

function splittingAcrossYearsSaturates(): Finding {
  const total = 10_000_000;
  const rows = [1, 2, 3, 4, 5].map((rounds) => ({
    rounds,
    per: Math.floor(total / rounds),
    tax: byGain(Math.floor(total / rounds)).totalTax * rounds,
  }));
  const [r1, r2, r3, r4, r5] = rows;
  const perRound = r1.tax - r2.tax;
  const overshoot = r2.tax - r3.tax - perRound;
  return {
    h2: `분할 매도는 회당 ${eul(manwon(perRound))} 깎다가 딱 멈춘다`,
    body:
      `양도차익 ${eul(manwon(total))} 시행 이후 여러 해에 나눠 실현한다고 가정하면 예상 세금이 한 번에 팔 때 ${won(r1.tax)}, 두 해로 나누면 ${won(r2.tax)}, 세 해면 ${won(r3.tax)}, 네 해면 ${imnida(won(r4.tax))}. ` +
      `공제가 해마다 새로 붙으므로 한 번 더 쪼갤 때마다 공제 하나 값인 ${eul(won(perRound))} 덜 내는 셈인데, 세 해로 나누는 경우만 ${won(overshoot)} 더 줄어드는 것은 ${eul(won(total))} 셋으로 나눈 끝자리가 잘려 실현액 합계가 ${ga(won(r3.per * 3))} 되고 내림도 세 번 걸리기 때문입니다. ` +
      `한 해 몫이 공제 이하로 내려가는 네 번째 분할에서 세금이 ${ga(won(r4.tax))} 되고, 다섯 해로 늘려도 ${ro(won(r5.tax))} 그대로라 더 쪼개는 값이 사라집니다. ` +
      `그래서 분할의 최대 횟수는 취향이 아니라 차익을 공제로 나눈 값에서 정해지고, 그 위로는 매도 시점을 미루는 대가만 남습니다.`,
  };
}

function feeIsWorthTwoWonThenNothing(): Finding {
  const b = run();
  const one = run({ expenses: 1 });
  let deadZone = 1;
  while (run({ expenses: deadZone + 1 }).totalTax === one.totalTax) deadZone += 1;
  const flat = run({ expenses: deadZone });
  const million = run({ expenses: 1_000_000 });
  const shallow = { before: run({ saleAmount: 12_000_000 }), after: run({ saleAmount: 12_000_000, expenses: 1_000_000 }) };
  // 1원의 값어치는 차익에 따라 0·1·2원으로 갈린다 — 기본값 하나로 일반화하면 거짓이 된다.
  const worths = new Set<number>();
  for (let gain = 3_000_000; gain < 3_000_100; gain += 1) {
    worths.add(byGain(gain).totalTax - calculateCryptoTax(0, gain, 1).totalTax);
  }
  const sorted = [...worths].sort((a, c) => a - c);
  return {
    h2: `필요경비 1원의 값어치가 ${won(sorted[0])}일 때도 ${won(sorted[sorted.length - 1])}일 때도 있다`,
    body:
      `기본값인 차익 ${manwon(5_000_000)}을 가정하고 필요경비만 1원 넣으면 예상 세금이 ${won(b.totalTax)}에서 ${ro(won(one.totalTax))} ${won(b.totalTax - one.totalTax)} 줄어드는데, 소득세와 지방소득세가 각각 내림 처리되면서 두 항목이 동시에 한 칸씩 내려가기 때문입니다. ` +
      `그런데 경비를 ${ro(won(deadZone))} 올릴 때까지 세금은 ${ro(won(flat.totalTax))} 그대로라, 첫 1원 뒤에 이어지는 ${eun(won(deadZone - 1))} 아무 값도 만들지 못합니다. 차익을 ${manwon(3_000_000)} 근처에서 1원씩 옮겨 가며 재면 같은 경비 1원의 값어치가 ${sorted.map((v) => won(v)).join("·")} 사이를 오가므로, 이 계단은 기본값에서만 2원인 셈입니다. ` +
      `경비가 ${manwon(1_000_000)} 규모로 커지면 계단이 눈에 띄지 않고 세금이 ${ro(won(million.totalTax))} 내려가 경비 1원당 정확히 ${pct((b.totalTax - million.totalTax) / 1_000_000, 0)} 몫이 되지만, 이는 과세표준이 남아 있을 때에 한합니다. ` +
      `매도금액을 ${manwon(12_000_000)}으로 낮춰 차익이 공제 아래인 경우를 가정하면 같은 ${manwon(1_000_000)}짜리 경비가 세금을 ${won(shallow.before.totalTax - shallow.after.totalTax)} 줄여, 영수증을 모으는 일 자체가 값을 잃습니다.`,
  };
}

function roundingSplitsFromForeignStock(): Finding {
  const gain = 10_000_003;
  const here = byGain(gain);
  const there = calculateForeignStockTax({ sellAmount: gain, buyAmount: 0, fees: 0, otherGains: 0, otherLosses: 0 });
  const deduction = here.deduction;
  let mismatched = 0;
  const sampled = 1_000;
  for (let taxable = 1; taxable <= sampled; taxable += 1) {
    const a = byGain(deduction + taxable).totalTax;
    const c = calculateForeignStockTax({
      sellAmount: deduction + taxable,
      buyAmount: 0,
      fees: 0,
      otherGains: 0,
      otherLosses: 0,
    }).totalTax;
    if (a !== c) mismatched += 1;
  }
  return {
    h2: `같은 22% 구조인데 해외주식 계산기와 1원이 갈린다`,
    body:
      `기본공제 ${wa(won(deduction))} 세율 22%가 똑같으니 해외주식 양도소득세 계산기에 같은 숫자를 넣으면 같은 답이 나올 것 같지만, 양도차익 ${eul(won(gain))} 가정하면 이 계산기는 ${eul(won(here.totalTax))}, 저쪽은 ${eul(won(there.totalTax))} 냅니다. ` +
      `이 계산기가 소득세·지방소득세를 각각 내림으로 끊는 반면 해외주식 쪽은 반올림으로 맞추기 때문이며, 세법이 아니라 구현이 만든 차이입니다. ` +
      `공제 바로 위 과세표준 1원부터 ${won(sampled)}까지 ${num(sampled)}개 지점에서 두 계산기를 나란히 돌리면 ${num(mismatched)}개가 서로 다른 값을 내 ${pct(mismatched / sampled, 0)}에 이르는데, 어긋나는 폭은 언제나 1~2원에 그칩니다. ` +
      `두 자산에 모두 투자해 세금을 합산해 볼 때는 이 원 단위 차이를 감안해야 하고, 실제 신고서의 원 단위 처리는 시행 시점의 공식 안내를 따라야 합니다.`,
  };
}

function afterTaxGrowsSlowerThanTwoFold(): Finding {
  const rows = [5_000_000, 20_000_000, 100_000_000].map((gain) => ({
    gain,
    small: byGain(gain),
    big: byGain(gain * 2),
  }));
  const [a, b, c] = rows;
  const ratio = (row: (typeof rows)[number]) => row.big.netProfit / row.small.netProfit;
  return {
    h2: `세전이 2배로 뛰어도 세후 수익은 ${ida(times(a.big.netProfit, a.small.netProfit))}`,
    body:
      `필요경비 0원을 가정하고 세후 수익만 보면, 양도차익 ${manwon(a.gain)}의 ${won(a.small.netProfit)}이 차익 ${manwon(a.gain * 2)}에서 ${ro(won(a.big.netProfit))} ${times(a.big.netProfit, a.small.netProfit)} 늘어납니다. ` +
      `세전이 정확히 두 배가 됐는데 세후가 못 따라오는 것은 앞의 차익에는 공제가 통째로 얹혀 있었고 뒤의 차익에는 같은 공제가 절반 몫으로만 얹히기 때문입니다. ` +
      `이 배수는 금액이 커질수록 두 배 쪽으로 올라와서 ${manwon(b.gain)} 기준 ${num(ratio(b), 4)}배, ${manwon(c.gain)} 기준 ${num(ratio(c), 4)}배가 되지만 두 배에 닿지는 않습니다. ` +
      `세금 쪽 배수가 위에서 2배로 내려오는 것과 세후 수익 쪽 배수가 아래에서 2배로 올라가는 것은 같은 공제를 반대편에서 본 결과입니다.`,
  };
}

function whatTheEngineDoesNotModel(): Finding {
  // "2027-01-01" 상수를 화면 문장에 맞춰 한글 날짜로 되읽는다 — 상수가 바뀌면 문장도 따라 바뀐다.
  const [year, month, day] = CRYPTO_TAX_EFFECTIVE_DATE.split("-").map(Number);
  const effectiveDate = `${year}년 ${month}월 ${day}일`;
  const loss = run({ saleAmount: 8_000_000 });
  const gainThenLoss = byGain(20_000_000);
  return {
    h2: `이 계산기는 종목별 통산도 손실 이월도 반영하지 않는다`,
    body:
      `입력이 매수금액·매도금액·필요경비 한 쌍뿐이라, ${manwon(CRYPTO_BASE.purchaseAmount)}에 사서 ${manwon(8_000_000)}에 판 경우를 가정하면 차익이 ${won(loss.totalGain)}, 과세표준이 ${won(loss.taxableAmount)}, 세금이 ${ro(won(loss.totalTax))} 나오고 실효세율은 아예 ${pct(loss.effectiveRate, 0)}로 표시됩니다. ` +
      `손실 자체는 그대로 남지만 다음 해로 넘겨 쓰거나 다른 코인의 이익과 상계하는 절차가 이 계산기에는 없으므로, 여러 종목을 굴렸다면 같은 해의 이익과 손실을 미리 합산한 순차익을 직접 넣어야 합니다. ` +
      `그렇게 합산한 순차익이 ${manwon(20_000_000)}이면 세금 ${won(gainThenLoss.totalTax)}처럼 한 줄로 계산되지만, 실제 손익통산 범위와 이월공제 허용 여부는 시행령에서 확정되는 항목이라 이 결과가 그대로 신고서가 되지는 않습니다. ` +
      `취득가액을 어떻게 인정할지도 아직 확정 전이므로 매수금액 칸에 무엇을 넣을지부터 ${effectiveDate} 시행 시점의 공식 안내를 확인해야 합니다.`,
  };
}

function taxIsZeroBelowTheDeductionForever(): Finding {
  const deduction = byGain(3_000_000).deduction;
  const justUnder = byGain(deduction);
  const yearly = byGain(deduction).totalTax;
  const lumped = byGain(deduction * 25);
  return {
    h2: `해마다 ${manwon(deduction)}씩 25년을 팔아도 세금은 ${ida(won(yearly))}`,
    body:
      `기본공제가 해마다 새로 붙는다는 점을 끝까지 밀어 보면, 시행 이후 매년 양도차익이 ${won(deduction)}을 넘지 않게 실현한다고 가정할 때 25년 동안 ${won(deduction * 25)}을 실현하고도 예상 세금은 매년 ${won(justUnder.totalTax)}, 합계 ${imnida(won(yearly * 25))}. ` +
      `같은 금액을 한 해에 몰아 실현하면 과세표준이 ${ga(won(lumped.taxableAmount))} 되어 세금이 ${ro(won(lumped.totalTax))} 붙으므로, 실현 시점을 나누는 것만으로 갈리는 폭이 그대로 전부입니다. ` +
      `다만 이 비교는 25년 뒤에도 공제액과 세율이 지금 예정 기준 그대로라는 가정 위에 서 있고, 가상자산의 가격 변동이 그 기간의 세금 차이보다 훨씬 크다는 점은 계산에 들어가 있지 않습니다. ` +
      `절세 폭이 확정적인 반면 가격은 확정적이지 않으므로, 이 숫자는 매도 계획의 근거가 아니라 상한선으로 읽는 편이 안전합니다.`,
  };
}

export const CRYPTO_TAX_DIGEST: Finding[] = [
  nominalRateIsNotWhatYouPay(),
  effectiveRateIsRateMinusFixed(),
  deductionEdgeHasNoStep(),
  doublingGainDoesNotDoubleTax(),
  splittingAcrossYearsSaturates(),
  feeIsWorthTwoWonThenNothing(),
  roundingSplitsFromForeignStock(),
  afterTaxGrowsSlowerThanTwoFold(),
  whatTheEngineDoesNotModel(),
  taxIsZeroBelowTheDeductionForever(),
];
