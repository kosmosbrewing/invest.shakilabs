import { describe, expect, it } from "vitest";
import {
  calculateCryptoTax,
  calculateDividendTax,
  calculateIsaCompare,
} from "@/utils/investCalculator";
import { calculateGiftTax } from "@/utils/giftTaxCalculator";

describe("investCalculator", () => {
  describe("calculateCryptoTax", () => {
    it("기본공제 이하 수익은 과세되지 않는다", () => {
      const result = calculateCryptoTax(10_000_000, 12_000_000);

      expect(result.totalGain).toBe(2_000_000);
      expect(result.taxableAmount).toBe(0);
      expect(result.totalTax).toBe(0);
      expect(result.netProfit).toBe(2_000_000);
      expect(result.effectiveRate).toBe(0);
    });

    it("필요경비와 기본공제를 반영해 세금을 계산한다", () => {
      const result = calculateCryptoTax(10_000_000, 40_000_000, 1_000_000);

      expect(result.totalGain).toBe(29_000_000);
      expect(result.taxableAmount).toBe(26_500_000);
      expect(result.incomeTax).toBe(5_300_000);
      expect(result.localTax).toBe(530_000);
      expect(result.totalTax).toBe(5_830_000);
      expect(result.netProfit).toBe(23_170_000);
      expect(result.effectiveRate).toBeCloseTo(0.20103448, 8);
    });
  });

  describe("calculateDividendTax", () => {
    it("국내 배당은 15.4% 원천징수를 적용한다", () => {
      const result = calculateDividendTax(5_000_000, "KR");

      expect(result.foreignTaxAmount).toBe(0);
      expect(result.domesticIncomeTax).toBe(700_000);
      expect(result.domesticLocalTax).toBe(70_000);
      expect(result.totalTax).toBe(770_000);
      expect(result.netDividend).toBe(4_230_000);
      expect(result.isComprehensive).toBe(false);
      expect(result.comprehensiveTax).toBeNull();
    });

    it("미국 배당은 현지 세율이 국내 소득세보다 높아 추가 소득세가 없다", () => {
      const result = calculateDividendTax(5_000_000, "US");

      expect(result.foreignTaxRate).toBe(0.15);
      expect(result.foreignTaxAmount).toBe(750_000);
      expect(result.domesticIncomeTax).toBe(0);
      expect(result.domesticLocalTax).toBe(0);
      expect(result.totalTax).toBe(750_000);
      expect(result.effectiveRate).toBe(0.15);
    });

    it("중국 배당은 국내 세율과의 차액만큼 추가 과세한다", () => {
      const result = calculateDividendTax(5_000_000, "CN");

      expect(result.foreignTaxAmount).toBe(500_000);
      expect(result.domesticIncomeTax).toBe(200_000);
      expect(result.domesticLocalTax).toBe(20_000);
      expect(result.totalTax).toBe(720_000);
      expect(result.netDividend).toBe(4_280_000);
    });

    it("금융소득이 2천만원을 초과하면 종합과세 시뮬레이션을 제공한다", () => {
      const result = calculateDividendTax(15_000_000, "KR", 10_000_000);

      expect(result.isComprehensive).toBe(true);
      expect(result.totalTax).toBe(2_310_000);
      expect(result.comprehensiveTax).toBe(1_196_250);
      expect(result.comprehensiveNetDividend).toBe(13_803_750);
    });
  });

  describe("calculateIsaCompare", () => {
    it("일반형 ISA는 비과세 한도 초과분에만 분리과세한다", () => {
      const result = calculateIsaCompare(12_000_000, 0.05, 3, "general");

      expect(result.totalInvestment).toBe(36_000_000);
      expect(result.totalProfit).toBe(3_721_500);
      expect(result.isaTaxFreeLimit).toBe(2_000_000);
      expect(result.isaTaxableProfit).toBe(1_721_500);
      expect(result.isaTax).toBe(170_428);
      expect(result.normalTax).toBe(573_111);
      expect(result.taxSaving).toBe(402_683);
      expect(result.savingRate).toBeCloseTo(0.70262654, 8);
    });

    it("서민형 ISA는 높은 비과세 한도로 세금이 0이 될 수 있다", () => {
      const result = calculateIsaCompare(12_000_000, 0.05, 3, "low_income");

      expect(result.isaTaxFreeLimit).toBe(4_000_000);
      expect(result.isaTaxableProfit).toBe(0);
      expect(result.isaTax).toBe(0);
      expect(result.taxSaving).toBe(result.normalTax);
      expect(result.savingRate).toBe(1);
    });

    it("수익이 없으면 일반 계좌와 ISA 모두 세금이 없다", () => {
      const result = calculateIsaCompare(10_000_000, 0, 5, "general");

      expect(result.totalInvestment).toBe(50_000_000);
      expect(result.totalProfit).toBe(0);
      expect(result.isaTax).toBe(0);
      expect(result.normalTax).toBe(0);
      expect(result.isaNetTotal).toBe(50_000_000);
      expect(result.normalNetTotal).toBe(50_000_000);
      expect(result.savingRate).toBe(0);
    });
  });

  describe("calculateGiftTax", () => {
    it("성년 자녀 증여는 5천만원 공제를 반영한다", () => {
      const result = calculateGiftTax({
        giftAmount: 300_000_000,
        priorDeductionUsed: 0,
        relationship: "adult-child",
        isGenerationSkipping: false,
      });

      expect(result.availableDeduction).toBe(50_000_000);
      expect(result.taxableAmount).toBe(250_000_000);
      expect(result.totalTax).toBe(40_000_000);
    });

    it("세대생략 증여는 30% 가산세를 더한다", () => {
      const result = calculateGiftTax({
        giftAmount: 300_000_000,
        priorDeductionUsed: 0,
        relationship: "adult-child",
        isGenerationSkipping: true,
      });

      expect(result.surcharge).toBe(12_000_000);
      expect(result.totalTax).toBe(52_000_000);
    });
  });
});
