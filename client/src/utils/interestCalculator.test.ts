import { describe, expect, it } from "vitest";
import {
  calculateSavingsInterest,
  calculateDepositInterest,
  calculateCompoundInterest,
} from "@/utils/interestCalculator";

describe("calculateSavingsInterest", () => {
  it("월 10만원 12개월 연 3% 단리 일반과세", () => {
    const result = calculateSavingsInterest({
      monthlyDeposit: 100_000,
      months: 12,
      annualRate: 3.0,
      taxType: "normal",
    });
    // 원금 = 100,000 × 12 = 1,200,000
    expect(result.totalPrincipal).toBe(1_200_000);
    // 이자 = 100,000 × 0.03/12 × 12×13/2 = 100,000 × 0.0025 × 78 = 19,500
    expect(result.grossInterest).toBe(19_500);
    // 세금 = 19,500 × 0.154 = 3,003
    expect(result.tax).toBe(3_003);
    expect(result.netInterest).toBe(16_497);
    expect(result.maturityAmount).toBe(1_216_497);
  });

  it("비과세 시 세금이 0이다", () => {
    const result = calculateSavingsInterest({
      monthlyDeposit: 500_000,
      months: 24,
      annualRate: 4.0,
      taxType: "tax_free",
    });
    expect(result.tax).toBe(0);
    expect(result.netInterest).toBe(result.grossInterest);
    expect(result.maturityAmount).toBe(result.totalPrincipal + result.grossInterest);
  });

  it("2026 조합 예탁금 일반 가정 5.9% 적용", () => {
    const result = calculateSavingsInterest({
      monthlyDeposit: 300_000,
      months: 12,
      annualRate: 3.5,
      taxType: "preferential",
    });
    // 이자 = 300,000 × (0.035/12) × 78 = 300,000 × 0.002917 × 78 ≈ 68,250
    expect(result.grossInterest).toBe(68_250);
    // 세금 = 68,250 × 0.059 = 4,027 (반올림)
    expect(result.tax).toBe(4_027);
  });

  it("월별 누적 데이터의 길이가 기간과 같다", () => {
    const result = calculateSavingsInterest({
      monthlyDeposit: 100_000,
      months: 6,
      annualRate: 3.0,
      taxType: "normal",
    });
    expect(result.monthlyData).toHaveLength(6);
    expect(result.monthlyData[0].month).toBe(1);
    expect(result.monthlyData[5].month).toBe(6);
    expect(result.monthlyData[5].principal).toBe(600_000);
  });

  it("이율 0%면 이자가 0이다", () => {
    const result = calculateSavingsInterest({
      monthlyDeposit: 100_000,
      months: 12,
      annualRate: 0,
      taxType: "normal",
    });
    expect(result.grossInterest).toBe(0);
    expect(result.maturityAmount).toBe(1_200_000);
  });
});

describe("calculateDepositInterest", () => {
  it("1000만원 12개월 연 3.5% 만기일시 일반과세", () => {
    const result = calculateDepositInterest({
      principal: 10_000_000,
      months: 12,
      annualRate: 3.5,
      taxType: "normal",
      paymentType: "maturity",
    });
    // 이자 = 10,000,000 × 0.035 × 1 = 350,000
    expect(result.grossInterest).toBe(350_000);
    // 세금 = 350,000 × 0.154 = 53,900
    expect(result.tax).toBe(53_900);
    expect(result.netInterest).toBe(296_100);
    expect(result.maturityAmount).toBe(10_296_100);
  });

  it("6개월 예금은 기간 비율을 반영한다", () => {
    const result = calculateDepositInterest({
      principal: 10_000_000,
      months: 6,
      annualRate: 3.0,
      taxType: "normal",
      paymentType: "maturity",
    });
    // 이자 = 10,000,000 × 0.03 × 0.5 = 150,000
    expect(result.grossInterest).toBe(150_000);
  });

  it("월이자 방식 시 월수령액이 계산된다", () => {
    const result = calculateDepositInterest({
      principal: 10_000_000,
      months: 12,
      annualRate: 3.6,
      taxType: "normal",
      paymentType: "monthly",
    });
    // 세전 월이자 = 10,000,000 × 0.036 / 12 = 30,000
    expect(result.monthlyInterestGross).toBe(30_000);
    // 세후 월이자 = 30,000 - round(30,000 × 0.154) = 30,000 - 4,620 = 25,380
    expect(result.monthlyInterestNet).toBe(25_380);
    // 총 세후이자 = 25,380 × 12 = 304,560
    expect(result.netInterest).toBe(304_560);
  });

  it("월이자 방식 세금 정합성 (grossInterest === tax + netInterest)", () => {
    const result = calculateDepositInterest({
      principal: 10_000_000,
      months: 12,
      annualRate: 4.0,
      taxType: "normal",
      paymentType: "monthly",
    });
    expect(result.grossInterest).toBe(result.tax + result.netInterest);
  });

  it("비과세 예금은 세금 0", () => {
    const result = calculateDepositInterest({
      principal: 50_000_000,
      months: 12,
      annualRate: 4.0,
      taxType: "tax_free",
      paymentType: "maturity",
    });
    expect(result.tax).toBe(0);
    expect(result.maturityAmount).toBe(52_000_000);
  });
});

// 같은 상품(월 적립 단리)이 적금 페이지와 복리 페이지에서 다른 답을 내던 회귀를 잠근다.
// 은행 관행: 세전 이자 = 월납입액 × 연이율 × n(n+1)/2 ÷ 12 (월초 납입, k번째 납입금은 n-k+1개월)
describe("적금 ↔ 복리(단리 모드) 원 단위 일치", () => {
  const cases = [
    { monthly: 500_000, annualRate: 3.0, years: 1 },
    { monthly: 300_000, annualRate: 3.5, years: 2 },
    { monthly: 1_000_000, annualRate: 4.2, years: 5 },
  ];

  for (const { monthly, annualRate, years } of cases) {
    it(`월 ${monthly.toLocaleString("ko-KR")}원 · 연 ${annualRate}% · ${years}년`, () => {
      const savings = calculateSavingsInterest({
        monthlyDeposit: monthly,
        months: years * 12,
        annualRate,
        taxType: "tax_free",
      });
      const compound = calculateCompoundInterest({
        initialAmount: 0,
        monthlyContribution: monthly,
        annualRate,
        years,
      });

      expect(compound.simpleInterest).toBe(savings.grossInterest);
      expect(compound.simpleTotal).toBe(savings.maturityAmount);
    });
  }

  it("월 50만원 연 3% 12개월의 세전 이자는 97,500원이다", () => {
    const savings = calculateSavingsInterest({
      monthlyDeposit: 500_000,
      months: 12,
      annualRate: 3.0,
      taxType: "normal",
    });
    const compound = calculateCompoundInterest({
      initialAmount: 0,
      monthlyContribution: 500_000,
      annualRate: 3.0,
      years: 1,
    });

    // 500,000 × (0.03/12) × 78 = 97,500
    expect(savings.grossInterest).toBe(97_500);
    expect(compound.simpleInterest).toBe(97_500);
  });
});

describe("calculateCompoundInterest", () => {
  it("초기 1000만원 월 0원 연 7% 10년 복리", () => {
    const result = calculateCompoundInterest({
      initialAmount: 10_000_000,
      monthlyContribution: 0,
      annualRate: 7.0,
      years: 10,
    });
    expect(result.totalInvested).toBe(10_000_000);
    // 복리: 10,000,000 × (1 + 0.07/12)^120 ≈ 20,096,614
    expect(result.compoundTotal).toBeGreaterThan(19_000_000);
    expect(result.compoundTotal).toBeLessThan(21_000_000);
    // 단리: 10,000,000 × (1 + 0.07 × 10) = 17,000,000
    expect(result.simpleTotal).toBe(17_000_000);
    // 복리 > 단리
    expect(result.compoundAdvantage).toBeGreaterThan(0);
  });

  it("72법칙: 연 6%면 약 12년에 원금 2배", () => {
    const result = calculateCompoundInterest({
      initialAmount: 10_000_000,
      monthlyContribution: 0,
      annualRate: 6.0,
      years: 1,
    });
    expect(result.rule72Years).toBe(12);
  });

  it("72법칙: 연 8%면 약 9년에 원금 2배", () => {
    const result = calculateCompoundInterest({
      initialAmount: 10_000_000,
      monthlyContribution: 0,
      annualRate: 8.0,
      years: 1,
    });
    expect(result.rule72Years).toBe(9);
  });

  it("월 적립금이 있으면 투자원금에 포함된다", () => {
    const result = calculateCompoundInterest({
      initialAmount: 10_000_000,
      monthlyContribution: 500_000,
      annualRate: 5.0,
      years: 10,
    });
    // 총 투자 = 10,000,000 + 500,000 × 120 = 70,000,000
    expect(result.totalInvested).toBe(70_000_000);
    expect(result.compoundTotal).toBeGreaterThan(result.totalInvested);
    expect(result.compoundTotal).toBeGreaterThan(result.simpleTotal);
  });

  it("이율 0%면 단리와 복리 모두 원금과 같다", () => {
    const result = calculateCompoundInterest({
      initialAmount: 10_000_000,
      monthlyContribution: 100_000,
      annualRate: 0,
      years: 5,
    });
    expect(result.compoundTotal).toBe(result.totalInvested);
    expect(result.simpleTotal).toBe(result.totalInvested);
    expect(result.rule72Years).toBe(0);
  });

  it("연도별 데이터 길이가 투자 기간과 같다", () => {
    const result = calculateCompoundInterest({
      initialAmount: 10_000_000,
      monthlyContribution: 0,
      annualRate: 5.0,
      years: 20,
    });
    expect(result.yearlyData).toHaveLength(20);
    expect(result.yearlyData[0].year).toBe(1);
    expect(result.yearlyData[19].year).toBe(20);
    // 마지막 연도의 compoundTotal이 전체 결과와 일치
    expect(result.yearlyData[19].compoundTotal).toBe(result.compoundTotal);
  });
});
