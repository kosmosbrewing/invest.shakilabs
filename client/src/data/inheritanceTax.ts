export const INHERITANCE_TAX_UPDATED = "2026-03-19";

// 상속세 누진세율 (증여세와 동일)
export const INHERITANCE_TAX_BRACKETS = [
  { max: 100_000_000, rate: 0.1, deduction: 0 },
  { max: 500_000_000, rate: 0.2, deduction: 10_000_000 },
  { max: 1_000_000_000, rate: 0.3, deduction: 60_000_000 },
  { max: 3_000_000_000, rate: 0.4, deduction: 160_000_000 },
  { max: Number.POSITIVE_INFINITY, rate: 0.5, deduction: 460_000_000 },
] as const;

// 공제 상수
export const BASIC_DEDUCTION = 200_000_000;
export const LUMP_SUM_DEDUCTION = 500_000_000;
export const SPOUSE_MIN_DEDUCTION = 500_000_000;
export const SPOUSE_MAX_DEDUCTION = 3_000_000_000;
export const FUNERAL_EXPENSE = 15_000_000;
export const FINANCIAL_ASSET_RATE = 0.2;
export const FINANCIAL_ASSET_MIN = 20_000_000;
export const FINANCIAL_ASSET_MAX = 200_000_000;

export const ESTATE_PRESETS = [
  500_000_000, 1_000_000_000, 2_000_000_000, 5_000_000_000, 10_000_000_000,
] as const;

export const INHERITANCE_TAX_SOURCES = [
  { name: "국세법령정보시스템", url: "https://txsi.hometax.go.kr/", basis: "상속세 및 증여세법" },
  { name: "국세청", url: "https://www.nts.go.kr/", basis: "상속세 신고 안내" },
];

export const INHERITANCE_TAX_FAQS = [
  {
    q: "상속세 일괄공제와 기초공제의 차이는 무엇인가요?",
    a: "기초공제(2억) + 인적공제 합산액과 일괄공제(5억) 중 큰 금액을 선택할 수 있습니다. 대부분의 경우 일괄공제 5억원이 유리하지만, 인적공제 대상이 많으면 기초+인적이 클 수 있습니다.",
  },
  {
    q: "배우자 상속공제는 얼마까지 가능한가요?",
    a: "배우자가 실제 상속받은 금액 중 법정상속분 이내에서 최소 5억원, 최대 30억원까지 공제됩니다. 이 계산기에서는 법정상속분을 기준으로 자동 계산합니다.",
  },
  {
    q: "상속세 신고 기한은 언제인가요?",
    a: "피상속인(사망자)의 사망일이 속하는 달의 말일부터 6개월 이내에 신고·납부해야 합니다. 기한 내 신고 시 3%의 신고세액공제를 받을 수 있습니다.",
  },
  {
    q: "금융재산 상속공제는 어떻게 계산하나요?",
    a: "순금융재산(금융자산 - 금융부채)의 20%를 공제하며, 최소 2천만원에서 최대 2억원입니다. 순금융재산이 2천만원 미만이면 공제가 없습니다.",
  },
];
