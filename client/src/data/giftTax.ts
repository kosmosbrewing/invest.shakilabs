export const GIFT_TAX_UPDATED = "2026-07-10";

export const GIFT_TAX_RELATIONSHIP_OPTIONS = [
  { value: "spouse", label: "배우자" },
  { value: "adult-child", label: "성년 자녀" },
  { value: "minor-child", label: "미성년 자녀" },
  { value: "parent", label: "직계존속" },
  { value: "other", label: "기타 친족" },
] as const;

export const GIFT_TAX_FAQS = [
  {
    q: "증여재산공제는 얼마까지 반영하나요?",
    a: "배우자 6억원, 성년 자녀·직계존속 5천만원, 미성년 자녀 2천만원, 기타 친족 1천만원의 10년 합산 공제를 기본값으로 반영합니다.",
  },
  {
    q: "세대생략 가산세도 계산되나요?",
    a: "손자녀 등 세대생략 증여에 해당하는 경우 기본세액의 30%를 가산하는 단순 버전을 지원합니다.",
  },
  {
    q: "혼인·출산 증여재산공제도 계산되나요?",
    a: "현재 계산기는 혼인·출산 전후 2년 이내 직계존속 증여에 적용될 수 있는 추가 공제(통합 한도 1억원)를 자동 반영하지 않습니다. 해당자는 신고 전 별도로 확인해야 합니다.",
  },
] as const;

export const GIFT_TAX_SOURCES = [
  {
    name: "국세청",
    url: "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=6510&cntntsId=7862",
    basis: "증여세 개요 및 세율",
  },
  {
    name: "국세청",
    url: "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7960&mi=6533",
    basis: "증여재산공제·혼인출산 공제 안내",
  },
] as const;
