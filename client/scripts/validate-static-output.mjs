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
  // canonical 통합 변종(compound-interest 금액)은 대표 URL을 가리켜야 한다
  // (self-canonical이면 준-doorway로 회귀). 나머지는 self-canonical 유지.
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

console.log(
  `Validated ${SEO_ROUTES.length} SEO routes (${SITEMAP_ROUTES.length} sitemap URLs, ` +
  `${Object.keys(CANONICAL_OVERRIDES).length} canonicalized variants), prerendered home, and custom 404 output.`
);
