// 파라미터 단위: 만 원 (URL 파라미터 × 10,000 = 원화)
export const CRYPTO_AMOUNTS = [1000, 3000, 5000, 10000];
export const DIVIDEND_AMOUNTS = [500, 1000, 2000, 5000];
export const ISA_AMOUNTS = [500, 1000, 1200, 2000];
export const GIFT_AMOUNTS = [5000, 10000, 30000, 50000];
export const INHERITANCE_AMOUNTS = [50000, 100000, 200000, 500000, 1000000];
export const FOREIGN_STOCK_AMOUNTS = [1000, 3000, 5000, 10000, 30000];

// 적금: 월 적립 만원 단위 (10→10만, 30→30만, 50→50만, 100→100만)
export const SAVINGS_AMOUNTS = [10, 30, 50, 100];
// 예금: 원금 만원 단위 (1000→1천만, 3000→3천만, 5000→5천만, 10000→1억)
export const DEPOSIT_AMOUNTS = [1000, 3000, 5000, 10000];
// 복리: 초기 투자 만원 단위
export const COMPOUND_AMOUNTS = [1000, 3000, 5000, 10000];

export const SEO_ROUTES = [
  "/all",
  "/crypto-tax",
  "/dividend-tax",
  "/isa",
  "/gift-tax",
  "/inheritance-tax",
  "/foreign-stock-tax",
  "/savings-interest",
  "/deposit-interest",
  "/compound-interest",
  "/about",
  "/terms",
  "/privacy",
  ...CRYPTO_AMOUNTS.map((a) => `/crypto-tax/${a}`),
  ...DIVIDEND_AMOUNTS.map((a) => `/dividend-tax/${a}`),
  ...ISA_AMOUNTS.map((a) => `/isa/${a}`),
  ...GIFT_AMOUNTS.map((a) => `/gift-tax/${a}`),
  ...INHERITANCE_AMOUNTS.map((a) => `/inheritance-tax/${a}`),
  ...FOREIGN_STOCK_AMOUNTS.map((a) => `/foreign-stock-tax/${a}`),
  ...SAVINGS_AMOUNTS.map((a) => `/savings-interest/${a}`),
  ...DEPOSIT_AMOUNTS.map((a) => `/deposit-interest/${a}`),
  ...COMPOUND_AMOUNTS.map((a) => `/compound-interest/${a}`),
];
