// 홈 전용 데이터 — /all(도구 디렉터리)과 문구가 겹치지 않도록 질문형으로 따로 관리한다.
// 수치는 investTaxRates.ts / interestData.ts / giftTax.ts / inheritanceTax.ts 상수와 일치시킨다.

export interface HomeIntent {
  key: string;
  question: string;
  path: string;
  action: string;
}

/** "지금 궁금한 질문"에서 계산기로 진입시키는 목록 (9개 계산기 전부 연결) */
export const HOME_INTENTS: readonly HomeIntent[] = [
  { key: "savings", question: "이번 달부터 적금을 넣으면 만기에 얼마를 받나요?", path: "/savings-interest", action: "적금 만기 수령액 계산" },
  { key: "deposit", question: "목돈을 1년 예치하면 이자가 얼마나 붙나요?", path: "/deposit-interest", action: "예금 이자 계산" },
  { key: "compound", question: "지금 수익률이 유지되면 10년 뒤 자산은 얼마인가요?", path: "/compound-interest", action: "복리 성장 시뮬레이션" },
  { key: "dividend", question: "배당을 받으면 얼마가 세금으로 빠지나요?", path: "/dividend-tax", action: "배당소득세 계산" },
  { key: "foreign", question: "해외주식을 팔면 5월에 얼마를 내야 하나요?", path: "/foreign-stock-tax", action: "해외주식 양도세 계산" },
  { key: "isa", question: "ISA 계좌로 옮기면 실제로 얼마나 아끼나요?", path: "/isa", action: "ISA 절세액 비교" },
  { key: "crypto", question: "가상자산 과세가 시작되면 얼마를 내게 되나요?", path: "/crypto-tax", action: "가상자산 세금 시뮬레이션" },
  { key: "gift", question: "자녀에게 미리 증여하면 세금이 얼마인가요?", path: "/gift-tax", action: "증여세 계산" },
  { key: "inheritance", question: "상속으로 넘기면 공제 후 얼마가 남나요?", path: "/inheritance-tax", action: "상속세 계산" },
];

export interface HomeRateRow {
  item: string;
  value: string;
  note: string;
}

/** 홈에만 있는 2026년 기준 요약표 — 계산기별 상세 페이지로 흩어진 숫자를 한 화면에 모은다 */
export const HOME_RATE_TABLE: readonly HomeRateRow[] = [
  { item: "이자·배당 원천징수", value: "15.4%", note: "소득세 14% + 지방소득세 1.4%" },
  { item: "조합 예탁금 우대(가정)", value: "5.9%", note: "2026년 신규 가입 일반 대상 가정치" },
  { item: "금융소득 종합과세 기준", value: "연 2,000만원 초과", note: "이자와 배당을 합산해 판정" },
  { item: "해외주식 양도소득세", value: "22%", note: "연 250만원 기본공제, 이듬해 5월 확정신고" },
  { item: "가상자산 양도소득세", value: "22%", note: "연 250만원 기본공제, 2027-01-01 시행 예정" },
  { item: "ISA 비과세 한도", value: "200만원 / 400만원", note: "일반형 / 서민형, 초과분은 9.9% 분리과세" },
  { item: "ISA 납입 한도", value: "연 2,000만원", note: "총 1억원, 의무 가입 기간 3년" },
  { item: "증여재산공제(10년 합산)", value: "6억 / 5,000만 / 2,000만원", note: "배우자 / 성년 자녀 / 미성년 자녀" },
  { item: "상속 일괄공제", value: "5억원", note: "배우자 상속공제는 최소 5억원부터" },
];

export interface HomeUsageNote {
  key: string;
  title: string;
  body: string;
}

/** 홈에서만 설명하는 서비스 이용 방식 */
export const HOME_USAGE_NOTES: readonly HomeUsageNote[] = [
  {
    key: "no_signup",
    title: "입력값은 저장되지 않습니다",
    body: "모든 계산은 브라우저 안에서 끝납니다. 회원가입도, 금액을 서버로 보내는 절차도 없습니다.",
  },
  {
    key: "dated",
    title: "기준일이 표시됩니다",
    body: "계산기마다 어느 시점의 법령·고시를 반영했는지 배지로 표시해, 오래된 숫자로 계산하는 일을 줄입니다.",
  },
  {
    key: "sourced",
    title: "근거 출처를 함께 답니다",
    body: "세율과 공제 한도는 국세청·법령 링크를 함께 제공하므로 계산 결과를 직접 검증할 수 있습니다.",
  },
];
