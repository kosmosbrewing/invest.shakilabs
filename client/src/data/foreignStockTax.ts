export const FOREIGN_STOCK_TAX_UPDATED = "2026-03-19";

export const BASIC_DEDUCTION = 2_500_000;
export const INCOME_TAX_RATE = 0.2;
export const LOCAL_TAX_RATE = 0.02;
export const COMBINED_TAX_RATE = INCOME_TAX_RATE + LOCAL_TAX_RATE;

export const SELL_AMOUNT_PRESETS = [
  10_000_000, 30_000_000, 50_000_000, 100_000_000, 300_000_000,
] as const;

export const FOREIGN_STOCK_TAX_SOURCES = [
  { name: "국세청", url: "https://www.nts.go.kr/", basis: "해외주식 양도소득세 신고 안내" },
  { name: "소득세법 제118조의2", url: "https://www.law.go.kr/", basis: "국외자산 양도소득" },
];

export const FOREIGN_STOCK_TAX_FAQS = [
  {
    q: "해외주식 양도소득세는 어떻게 계산하나요?",
    a: "연간 해외주식 양도차익에서 기본공제 250만원을 뺀 금액에 22%(소득세 20% + 지방소득세 2%)를 적용합니다. 양도차손이 있으면 양도차익과 상계할 수 있습니다.",
  },
  {
    q: "해외주식 양도소득세 신고 기한은 언제인가요?",
    a: "매년 5월 1일~31일까지 전년도 양도분에 대해 확정신고·납부해야 합니다. 예를 들어 2025년에 매도한 해외주식은 2026년 5월에 신고합니다.",
  },
  {
    q: "해외주식 매수·매도 시 환율은 어떻게 적용하나요?",
    a: "매수·매도 각각의 결제일 기준 매매기준율을 적용합니다. 이 계산기에서는 원화 환산 후 금액을 직접 입력하는 방식입니다.",
  },
  {
    q: "미국 주식과 다른 국가 주식의 세율이 다른가요?",
    a: "아닙니다. 국가와 관계없이 해외주식 양도소득세는 동일하게 22%입니다. 다만 해외 현지에서 원천징수된 세금이 있으면 외국납부세액공제를 받을 수 있습니다.",
  },
];
