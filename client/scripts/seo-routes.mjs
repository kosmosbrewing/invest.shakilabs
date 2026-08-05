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

// 복리 금액 변종: 형제 간 고유 본문이 약 9%뿐인 준-doorway라 대표 URL로 canonical을 통합한다.
// 라우트·프리렌더 산출물은 유지한다 (프리렌더에서 빼면 soft-404가 되므로 금지 · noindex도 금지).
// 변종에 고유 본문이 생기면 이 목록에서 빼고 사이트맵으로 복귀시킨다 (가역적 조치).
export const PARAM_ROUTES = COMPOUND_AMOUNTS.map((a) => `/compound-interest/${a}`);

// 변종 경로 → 대표(canonical) 경로 매핑. 빌드 검증·SSG 메타가 같은 소스를 공유한다.
export const CANONICAL_OVERRIDES = Object.fromEntries(
  PARAM_ROUTES.map((route) => [route, "/compound-interest"])
);

export const SEO_ROUTES = [
  // "/" must stay listed: without it vite-ssg skips the home and dist/index.html
  // ships as the empty shell (no content, no footer cross-app links).
  "/",
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
  ...PARAM_ROUTES,
];

// 사이트맵에는 canonical 대표 URL만 노출한다 (통합 변종은 canonical이 다른 곳을
// 가리키므로 크롤러에 광고하지 않는다). 프리렌더는 SEO_ROUTES 전체를 유지한다.
export const SITEMAP_ROUTES = SEO_ROUTES.filter(
  (route) => !(route in CANONICAL_OVERRIDES)
);
