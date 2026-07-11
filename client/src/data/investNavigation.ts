export interface InvestToolLink {
  key: string;
  path: string;
  title: string;
  description: string;
}

export interface InvestToolGroup {
  key: string;
  title: string;
  description: string;
  tools: readonly InvestToolLink[];
}

const tools = {
  crypto: { key: "crypto_tax", path: "/crypto-tax", title: "가상자산 세금", description: "기본공제와 예정세율을 반영해 예상 세금을 계산합니다." },
  dividend: { key: "dividend_tax", path: "/dividend-tax", title: "배당소득세", description: "배당 원천징수와 세후 수령액을 확인합니다." },
  foreign: { key: "foreign_stock_tax", path: "/foreign-stock-tax", title: "해외주식 양도세", description: "기본공제 적용 후 예상 양도소득세를 계산합니다." },
  isa: { key: "isa", path: "/isa", title: "ISA 만기 비교", description: "ISA와 일반 계좌의 세후 수령액 차이를 비교합니다." },
  savings: { key: "savings_interest", path: "/savings-interest", title: "적금 이자", description: "월 적립액 기준 만기 수령액과 세후 이자를 계산합니다." },
  deposit: { key: "deposit_interest", path: "/deposit-interest", title: "예금 이자", description: "예치 원금 기준 만기 수령액과 세후 이자를 계산합니다." },
  compound: { key: "compound_interest", path: "/compound-interest", title: "복리 성장", description: "기간별 단리·복리 차이와 자산 성장 속도를 비교합니다." },
  gift: { key: "gift_tax", path: "/gift-tax", title: "증여세", description: "관계별 공제와 누진세율을 반영해 예상 세액을 봅니다." },
  inheritance: { key: "inheritance_tax", path: "/inheritance-tax", title: "상속세", description: "공제와 누진세율을 반영해 예상 상속세를 계산합니다." },
} as const satisfies Record<string, InvestToolLink>;

export const INVEST_TOOL_GROUPS: readonly InvestToolGroup[] = [
  {
    key: "asset_growth",
    title: "저축·자산 성장",
    description: "예금·적금부터 복리와 ISA까지 세후 결과를 비교하세요.",
    tools: [tools.savings, tools.deposit, tools.compound, tools.isa],
  },
  {
    key: "investment_tax",
    title: "투자 세금",
    description: "가상자산·배당·해외주식의 과세 결과를 점검하세요.",
    tools: [tools.crypto, tools.dividend, tools.foreign],
  },
  {
    key: "asset_transfer",
    title: "자산 이전",
    description: "증여와 상속 시 적용되는 공제와 누진세율을 확인하세요.",
    tools: [tools.gift, tools.inheritance],
  },
] as const;

const relatedPaths: Record<string, readonly string[]> = {
  "/savings-interest": ["/deposit-interest", "/compound-interest", "/isa"],
  "/deposit-interest": ["/savings-interest", "/compound-interest", "/isa"],
  "/compound-interest": ["/isa", "/deposit-interest", "/savings-interest"],
  "/isa": ["/compound-interest", "/dividend-tax", "/foreign-stock-tax"],
  "/crypto-tax": ["/foreign-stock-tax", "/dividend-tax", "/isa"],
  "/dividend-tax": ["/foreign-stock-tax", "/isa", "/crypto-tax"],
  "/foreign-stock-tax": ["/crypto-tax", "/dividend-tax", "/isa"],
  "/gift-tax": ["/inheritance-tax", "/isa", "/compound-interest"],
  "/inheritance-tax": ["/gift-tax", "/isa", "/compound-interest"],
};

const allTools = INVEST_TOOL_GROUPS.flatMap((group) => group.tools);

export function getRelatedInvestTools(currentPath: string): InvestToolLink[] {
  const paths = relatedPaths[currentPath] ?? [];
  return paths.flatMap((path) => allTools.find((tool) => tool.path === path) ?? []);
}
