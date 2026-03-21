import { describe, expect, it } from "vitest";
import {
  calculateCryptoTax,
  calculateDividendTax,
  calculateIsaCompare,
} from "@/utils/investCalculator";
import { calculateGiftTax } from "@/utils/giftTaxCalculator";
import { calculateForeignStockTax } from "@/utils/foreignStockTaxCalculator";
import { calculateInheritanceTax } from "@/utils/inheritanceTaxCalculator";

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

  describe("calculateForeignStockTax", () => {
    it("기본공제 이하 수익은 비과세", () => {
      const result = calculateForeignStockTax({
        sellAmount: 12_000_000,
        buyAmount: 10_000_000,
        fees: 100_000,
        otherGains: 0,
        otherLosses: 0,
      });
      // 차익 1,900,000 < 2,500,000 → 비과세
      expect(result.totalTax).toBe(0);
      expect(result.netProfit).toBe(1_900_000);
    });

    it("기본공제 초과분에 22% 적용", () => {
      const result = calculateForeignStockTax({
        sellAmount: 50_000_000,
        buyAmount: 30_000_000,
        fees: 500_000,
        otherGains: 0,
        otherLosses: 0,
      });
      // 차익 19,500,000 - 공제 2,500,000 = 과세 17,000,000
      expect(result.taxableAmount).toBe(17_000_000);
      expect(result.incomeTax).toBe(3_400_000);
      expect(result.localTax).toBe(340_000);
      expect(result.totalTax).toBe(3_740_000);
    });

    it("손실 종목과 합산할 수 있다", () => {
      const result = calculateForeignStockTax({
        sellAmount: 50_000_000,
        buyAmount: 30_000_000,
        fees: 0,
        otherGains: 0,
        otherLosses: 15_000_000,
      });
      // 차익 20,000,000 - 손실 15,000,000 = 순차익 5,000,000
      expect(result.netGain).toBe(5_000_000);
      expect(result.taxableAmount).toBe(2_500_000);
    });

    it("손실이 이익보다 크면 세금 없음", () => {
      const result = calculateForeignStockTax({
        sellAmount: 30_000_000,
        buyAmount: 35_000_000,
        fees: 0,
        otherGains: 0,
        otherLosses: 0,
      });
      expect(result.totalTax).toBe(0);
      expect(result.netProfit).toBe(-5_000_000);
    });
  });

  describe("calculateInheritanceTax", () => {
    it("배우자 있는 경우 배우자 공제를 반영한다", () => {
      const result = calculateInheritanceTax({
        totalEstate: 2_000_000_000,
        debt: 0,
        financialAssets: 500_000_000,
        hasSpouse: true,
        childrenCount: 2,
      });
      expect(result.spouseDeduction).toBeGreaterThan(0);
      expect(result.spouseDeduction).toBeLessThanOrEqual(3_000_000_000);
      expect(result.totalTax).toBeGreaterThan(0);
    });

    it("배우자 없으면 배우자 공제가 0이다", () => {
      const result = calculateInheritanceTax({
        totalEstate: 2_000_000_000,
        debt: 0,
        financialAssets: 500_000_000,
        hasSpouse: false,
        childrenCount: 2,
      });
      expect(result.spouseDeduction).toBe(0);
    });

    it("5억 이하 상속재산은 일괄공제로 세금이 0이 될 수 있다", () => {
      const result = calculateInheritanceTax({
        totalEstate: 500_000_000,
        debt: 0,
        financialAssets: 200_000_000,
        hasSpouse: false,
        childrenCount: 1,
      });
      // 과세가액 ≈ 5억-1500만 = 4.85억, 일괄공제 5억 → 과세표준 0
      expect(result.taxBase).toBe(0);
      expect(result.totalTax).toBe(0);
    });

    it("신고세액공제 3%를 반영한다", () => {
      const result = calculateInheritanceTax({
        totalEstate: 5_000_000_000,
        debt: 0,
        financialAssets: 1_000_000_000,
        hasSpouse: false,
        childrenCount: 0,
      });
      expect(result.filingDeduction).toBe(Math.round(result.calculatedTax * 0.03));
      expect(result.totalTax).toBe(result.calculatedTax - result.filingDeduction);
    });

    it("금융재산 공제는 최대 2억까지 적용한다", () => {
      const result = calculateInheritanceTax({
        totalEstate: 10_000_000_000,
        debt: 0,
        financialAssets: 5_000_000_000,
        hasSpouse: true,
        childrenCount: 2,
      });
      expect(result.financialDeduction).toBe(200_000_000);
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
