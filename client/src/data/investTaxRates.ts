// 2026년 투자 세금 관련 상수

export const INVEST_DATA_UPDATED = "2026-03-16";
export const CRYPTO_TAX_EFFECTIVE_DATE = "2027-01-01";
export const CRYPTO_TAX_STATUS_NOTE =
  "현재는 시행 전이며, 2027년 1월 1일 이후 양도분 예정 기준으로만 시뮬레이션합니다.";

// 가상자산 양도세 (2027.1.1 시행 예정 기준)
export const CRYPTO_TAX = {
  // 기본공제: 연 250만원
  BASIC_DEDUCTION: 2_500_000,
  // 소득세율: 20%
  INCOME_TAX_RATE: 0.20,
  // 지방소득세: 소득세의 10% → 실질 2%
  LOCAL_TAX_RATE: 0.02,
  // 합산 세율: 22%
  TOTAL_RATE: 0.22,
} as const;

// 배당소득세
export const DIVIDEND_TAX = {
  // 국내 배당 원천징수: 소득세 14% + 지방소득세 1.4% = 15.4%
  DOMESTIC_INCOME_TAX_RATE: 0.14,
  DOMESTIC_LOCAL_TAX_RATE: 0.014,
  DOMESTIC_TOTAL_RATE: 0.154,

  // 금융소득 종합과세 기준금액
  FINANCIAL_INCOME_THRESHOLD: 20_000_000,

  // 해외 배당 원천징수율 (주요 국가)
  FOREIGN_RATES: {
    US: { rate: 0.15, label: "미국", localRate: 0.15 },
    JP: { rate: 0.15315, label: "일본", localRate: 0.15315 },
    CN: { rate: 0.10, label: "중국", localRate: 0.10 },
    HK: { rate: 0.0, label: "홍콩", localRate: 0.0 },
    UK: { rate: 0.0, label: "영국", localRate: 0.0 },
  },
} as const;

// 종합소득세 누진세율 (배당 종합과세 시 사용)
export const INCOME_TAX_BRACKETS = [
  { min: 0, max: 14_000_000, rate: 0.06, deduction: 0 },
  { min: 14_000_000, max: 50_000_000, rate: 0.15, deduction: 1_260_000 },
  { min: 50_000_000, max: 88_000_000, rate: 0.24, deduction: 5_760_000 },
  { min: 88_000_000, max: 150_000_000, rate: 0.35, deduction: 15_440_000 },
  { min: 150_000_000, max: 300_000_000, rate: 0.38, deduction: 19_940_000 },
  { min: 300_000_000, max: 500_000_000, rate: 0.40, deduction: 25_940_000 },
  { min: 500_000_000, max: 1_000_000_000, rate: 0.42, deduction: 35_940_000 },
  { min: 1_000_000_000, max: Infinity, rate: 0.45, deduction: 65_940_000 },
] as const;

// ISA (개인종합자산관리계좌)
export const ISA_TAX = {
  // 일반형 비과세 한도
  GENERAL_TAX_FREE_LIMIT: 2_000_000,
  // 서민형/농어민형 비과세 한도
  LOW_INCOME_TAX_FREE_LIMIT: 4_000_000,
  // 초과분 분리과세율: 9.9% (소득세 9% + 지방소득세 0.9%)
  SEPARATE_TAX_RATE: 0.099,
  // 일반 계좌 배당세: 15.4%
  NORMAL_ACCOUNT_TAX_RATE: 0.154,
  // 의무 가입 기간: 3년
  MIN_HOLDING_YEARS: 3,
  // 연간 납입 한도
  ANNUAL_LIMIT: 20_000_000,
  // 총 납입 한도
  TOTAL_LIMIT: 100_000_000,
} as const;

// 배당소득 Gross-up(배당가산, 귀속법인세 상당액) — 종합과세 시 기준금액 초과 국내 배당에 적용
// 소득세법 제17조③ "배당소득의 100분의 10" (2023.12.31 개정, 2024.1.1 이후 지급분부터 11%→10%)
export const DIVIDEND_GROSS_UP_RATE = 0.10;
