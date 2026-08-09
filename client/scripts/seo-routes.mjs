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

// Amount-variant families. The URL amount only seeds post-hydration state, so
// every variant prerenders the byte-identical body of its base calculator —
// a full-scale audit measured 1.0000 similarity in all 9 families (e.g. /isa
// vs /isa/1200, /crypto-tax vs /crypto-tax/1000). That is duplication, not
// near-duplication, so the variants are consolidated rather than enriched:
// canonical/hreflang/og:url point at the base page and the variants leave the
// sitemap. Every base page is already well past the 1,500-char floor, so no
// canonical target needs padding.
//
// Routes and prerendered HTML stay (dropping them from PRERENDER/SEO_ROUTES
// would make the Vercel rewrite serve the SPA shell = soft-404). noindex is
// deliberately NOT used: it would contradict the canonical signal.
//
// Reversible: if a variant ever gains genuinely unique body content, remove it
// from this map and it returns to the sitemap as a self-canonical URL.
const VARIANT_FAMILIES = {
  "/crypto-tax": CRYPTO_AMOUNTS,
  "/dividend-tax": DIVIDEND_AMOUNTS,
  "/isa": ISA_AMOUNTS,
  "/gift-tax": GIFT_AMOUNTS,
  "/inheritance-tax": INHERITANCE_AMOUNTS,
  "/foreign-stock-tax": FOREIGN_STOCK_AMOUNTS,
  "/savings-interest": SAVINGS_AMOUNTS,
  "/deposit-interest": DEPOSIT_AMOUNTS,
  "/compound-interest": COMPOUND_AMOUNTS,
};

// 변종 경로 → 대표(canonical) 경로 매핑. 빌드 검증·SSG 메타가 같은 소스를 공유한다.
export const CANONICAL_OVERRIDES = Object.fromEntries(
  Object.entries(VARIANT_FAMILIES).flatMap(([base, amounts]) =>
    amounts.map((amount) => [`${base}/${amount}`, base])
  )
);

export const PARAM_ROUTES = Object.keys(CANONICAL_OVERRIDES);

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
  // 변종은 프리렌더 대상으로 유지한다 (사이트맵에서만 빠진다 — soft-404 방지)
  ...PARAM_ROUTES,
];

// 사이트맵에는 canonical 대표 URL만 노출한다 (통합 변종은 canonical이 다른 곳을
// 가리키므로 크롤러에 광고하지 않는다). 프리렌더는 SEO_ROUTES 전체를 유지한다.
export const SITEMAP_ROUTES = SEO_ROUTES.filter(
  (route) => !(route in CANONICAL_OVERRIDES)
);
