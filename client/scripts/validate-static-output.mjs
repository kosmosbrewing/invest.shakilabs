import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  SEO_ROUTES,
  SITEMAP_ROUTES,
  CANONICAL_OVERRIDES,
} from "./seo-routes.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const repositoryRoot = resolve(projectRoot, "..");
const distRoot = resolve(projectRoot, "dist");
const canonicalBase = "https://shakilabs.com/invest";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function routeOutputPath(route) {
  return route === "/"
    ? resolve(distRoot, "index.html")
    : resolve(distRoot, `${route.slice(1)}.html`);
}

function validateVercelConfig(configPath) {
  const config = JSON.parse(readFileSync(configPath, "utf8"));
  const indexRewrites = (config.rewrites ?? []).filter(
    (rewrite) => rewrite.destination === "/index.html"
  );

  assert(config.cleanUrls === true, `${configPath}: cleanUrls must be true`);
  assert(indexRewrites.length === 0, `${configPath}: index.html catch-all rewrite is forbidden`);
}

function validateRoute(route) {
  const outputPath = routeOutputPath(route);
  assert(existsSync(outputPath), `Missing static output for ${route}: ${outputPath}`);

  const html = readFileSync(outputPath, "utf8");
  // canonical 통합 변종(9개 패밀리의 금액 변종)은 대표 URL을 가리켜야 한다
  // (self-canonical이면 doorway로 회귀). 나머지는 self-canonical 유지.
  const canonicalRoute = CANONICAL_OVERRIDES[route] ?? route;
  // cleanUrls redirects "/invest/" to "/invest", so the home canonical carries no slash
  const expectedCanonical =
    canonicalRoute === "/" ? canonicalBase : `${canonicalBase}${canonicalRoute}`;
  const actualCanonical = html.match(/<link rel="canonical" href="([^"]+)"\s*\/?>/)?.[1];
  const h1Count = html.match(/<h1\b/gi)?.length ?? 0;

  assert(actualCanonical === expectedCanonical,
    `Invalid canonical for ${route}: expected ${expectedCanonical}`);
  assert(/<title>[^<]+<\/title>/.test(html), `Missing title for ${route}`);
  assert(h1Count === 1, `Expected one H1 for ${route}, found ${h1Count}`);
  assert(html.includes('id="app"'), `Missing app root for ${route}`);
}

// 사이트맵 = 대표 URL 전수 포함 + canonical 통합 변종 0건 (양방향 검증)
function validateSitemap() {
  const sitemapPath = resolve(distRoot, "sitemap.xml");
  assert(existsSync(sitemapPath), `Missing sitemap output: ${sitemapPath}`);

  const sitemap = readFileSync(sitemapPath, "utf8");
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const locSet = new Set(locs);

  for (const route of SITEMAP_ROUTES) {
    const loc = route === "/" ? canonicalBase : `${canonicalBase}${route}`;
    assert(locSet.has(loc), `Sitemap missing canonical route: ${loc}`);
  }
  for (const variant of Object.keys(CANONICAL_OVERRIDES)) {
    const loc = `${canonicalBase}${variant}`;
    assert(!locSet.has(loc), `Sitemap must not list canonicalized variant: ${loc}`);
  }
  assert(locs.length === SITEMAP_ROUTES.length,
    `Sitemap URL count mismatch: expected ${SITEMAP_ROUTES.length}, found ${locs.length}`);
}

validateVercelConfig(resolve(repositoryRoot, "vercel.json"));
validateVercelConfig(resolve(projectRoot, "vercel.json"));
// Consolidated variants must stay in the prerender set. Dropping one here
// would let the Vercel rewrite serve the SPA shell for that URL (soft-404),
// which is strictly worse than the duplication we are fixing.
for (const variant of Object.keys(CANONICAL_OVERRIDES)) {
  assert(SEO_ROUTES.includes(variant),
    `Canonicalized variant must stay prerendered: ${variant}`);
}
// validateRoute는 canonical 통합 변종에도 돌아간다: 정적 HTML은 계속 존재해야
// 한다 (soft-404 방지) — 사이트맵에서만 빠질 뿐이다.
SEO_ROUTES.forEach(validateRoute);
validateSitemap();

// Regression guard: the home used to ship as the empty shell because "/" was
// missing from SEO_ROUTES. Catch that here instead of noticing it in production.
const homeHtml = readFileSync(routeOutputPath("/"), "utf8");
assert(!/<div id="app">\s*<\/div>/.test(homeHtml),
  "Home is an empty shell - it must be prerendered");
const crossAppLinks = new Set(
  homeHtml.match(/href="\/(biz|car|card|finance|house|loan|nutri|ott|seller|travel)"/g) ?? []
);
assert(crossAppLinks.size >= 8,
  `Home is missing the shared footer cross-app links (found ${crossAppLinks.size})`);

// The home and the /all hub are both directories; keep their titles distinct so
// neither page competes with the other in search results.
const hubHtml = readFileSync(routeOutputPath("/all"), "utf8");
const titleOf = (html) => html.match(/<title>([^<]+)<\/title>/)?.[1] ?? "";
assert(titleOf(homeHtml) !== titleOf(hubHtml),
  "Home and /all must not share the same title");

const notFoundPath = resolve(distRoot, "404.html");
assert(existsSync(notFoundPath), "Missing custom 404.html output");
const notFoundHtml = readFileSync(notFoundPath, "utf8");
assert(/name="robots" content="noindex,nofollow"/.test(notFoundHtml),
  "404.html must be noindex,nofollow");
// 404 본문은 제목과 복구 링크뿐이다. 셸의 로더가 남으면 auto ads가 그 위에 슬롯을 만들고,
// 이는 게시자 콘텐츠 없는 화면에 광고를 싣는 Valuable Inventory 저촉이다. noindex는 색인만
// 막을 뿐 정책 판정은 로더의 존재를 본다. 셸이 전 라우트에 로더를 넣으므로 이 제거는
// 검사하는 코드가 있을 때만 유지된다 (build.mjs: removeAdLoaderFromNotFound).
assert(!/adsbygoogle|googlesyndication/i.test(notFoundHtml),
  "404.html must not load the AdSense script (Valuable Inventory: no ads on a contentless screen)");
// 역방향 검증: 정상 라우트의 광고 배선까지 걷어내면 안 된다 (심사·소유 확인이 head 로더를 본다)
const homeAdLoaders = homeHtml.match(/googlesyndication\.com/gi)?.length ?? 0;
assert(homeAdLoaders === 1,
  `Home must keep exactly one AdSense loader, found ${homeAdLoaders}`);

// 애드센스 심사는 방침이 제3자 광고 쿠키를 고지하고 옵트아웃 경로를 제공할 것을 요구한다.
// 두 링크 모두 필수다: Google 설정은 Google만, aboutads.info는 나머지 사업자를 덮는다.
// 운영자 표기(13자산 공통 기준)까지 함께 고정해, 방침을 다시 쓰다 실수로 떨어뜨리는 것을 막는다.
function validatePolicyDisclosures() {
  const privacyHtml = readFileSync(routeOutputPath("/privacy"), "utf8");
  const termsHtml = readFileSync(routeOutputPath("/terms"), "utf8");

  for (const link of ["https://adssettings.google.com", "https://www.aboutads.info/choices"]) {
    assert(privacyHtml.includes(link), `/privacy must keep the AdSense opt-out link ${link}`);
  }
  assert(/제3자 광고|맞춤 광고/.test(privacyHtml),
    "/privacy must disclose third-party ad cookies and personalized ads");
  for (const [route, html] of [["/privacy", privacyHtml], ["/terms", termsHtml]]) {
    assert(html.includes("운영: ShakiLabs"), `${route} must keep the operator line`);
    assert(html.includes("skdba1313@gmail.com"), `${route} must keep the contact address`);
  }
  // 이 앱 약관이 이 앱의 기능을 서술하는지 — 과거 다른 저장소에서 타 앱 설명을 복붙한 사고가 있었다
  assert(termsHtml.includes("shakilabs.com/invest"),
    "/terms must describe this app, not another one");
}

validatePolicyDisclosures();

console.log(
  `Validated ${SEO_ROUTES.length} SEO routes (${SITEMAP_ROUTES.length} sitemap URLs, ` +
  `${Object.keys(CANONICAL_OVERRIDES).length} canonicalized variants), prerendered home, and custom 404 output.`
);
