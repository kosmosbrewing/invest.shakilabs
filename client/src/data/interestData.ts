// 이자 계산기 공통 상수 (2026-07-10 기준)

export const INTEREST_DATA_UPDATED = "2026-07-10";
export const COOPERATIVE_DEPOSIT_SOURCE_URL =
  "https://www.law.go.kr/lsLinkCommonInfo.do?lsJoLnkSeq=1018487531";
export const DEPOSIT_PROTECTION_SOURCE_URL = "https://www.fsc.go.kr/no010101/85200";

// 이자소득세율
export const INTEREST_TAX = {
  // 일반과세: 소득세 14% + 지방소득세 1.4% = 15.4%
  NORMAL_RATE: 0.154,
  NORMAL_LABEL: "일반과세 (15.4%)",
  // 2026년 신규 조합등예탁금 일반 대상: 소득세 5% + 농어촌특별세 0.9% 가정
  PREFERENTIAL_RATE: 0.059,
  PREFERENTIAL_LABEL: "2026 조합 예탁금 일반 가정 (5.9%)",
  // 비과세: 0%
  TAX_FREE_RATE: 0,
  TAX_FREE_LABEL: "비과세",
} as const;

export type TaxType = "normal" | "preferential" | "tax_free";

export const TAX_TYPE_OPTIONS: { key: TaxType; label: string; rate: number }[] = [
  { key: "normal", label: INTEREST_TAX.NORMAL_LABEL, rate: INTEREST_TAX.NORMAL_RATE },
  { key: "preferential", label: INTEREST_TAX.PREFERENTIAL_LABEL, rate: INTEREST_TAX.PREFERENTIAL_RATE },
  { key: "tax_free", label: INTEREST_TAX.TAX_FREE_LABEL, rate: INTEREST_TAX.TAX_FREE_RATE },
];

// 이자지급방식 (예금용)
export type PaymentType = "maturity" | "monthly";

export const PAYMENT_TYPE_OPTIONS: { key: PaymentType; label: string }[] = [
  { key: "maturity", label: "만기일시지급" },
  { key: "monthly", label: "월이자지급" },
];

// 적금 기간 프리셋 (개월)
export const SAVINGS_PERIOD_PRESETS = [6, 12, 24, 36] as const;

// 예금 기간 프리셋 (개월)
export const DEPOSIT_PERIOD_PRESETS = [6, 12, 24, 36] as const;

// 복리 기간 프리셋 (년)
export const COMPOUND_YEAR_PRESETS = [5, 10, 20, 30] as const;

// 연이율 프리셋
export const RATE_PRESETS = [
  { label: "2%", value: 2.0 },
  { label: "3%", value: 3.0 },
  { label: "4%", value: 4.0 },
  { label: "5%", value: 5.0 },
] as const;

// 복리 수익률 프리셋
export const COMPOUND_RATE_PRESETS = [
  { label: "3%", value: 3.0 },
  { label: "5%", value: 5.0 },
  { label: "7%", value: 7.0 },
  { label: "10%", value: 10.0 },
] as const;
