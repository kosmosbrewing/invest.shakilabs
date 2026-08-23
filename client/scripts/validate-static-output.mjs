import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
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

// canonical 통합 변종(9개 패밀리의 금액 변종)은 대표 URL을 가리켜야 한다
// (self-canonical이면 doorway로 회귀). 나머지는 self-canonical 유지.
// cleanUrls redirects "/invest/" to "/invest", so the home canonical carries no slash.
// 검증·사이트맵·라우터 대조가 모두 이 한 함수를 쓰므로 기대값이 서로 어긋날 수 없다.
function canonicalUrlFor(route) {
  const canonicalRoute = CANONICAL_OVERRIDES[route] ?? route;
  return canonicalRoute === "/" ? canonicalBase : `${canonicalBase}${canonicalRoute}`;
}

function validateRoute(route) {
  const outputPath = routeOutputPath(route);
  assert(existsSync(outputPath), `Missing static output for ${route}: ${outputPath}`);

  const html = readFileSync(outputPath, "utf8");
  const expectedCanonical = canonicalUrlFor(route);
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
    const loc = canonicalUrlFor(route);
    assert(locSet.has(loc), `Sitemap missing canonical route: ${loc}`);
  }
  for (const variant of Object.keys(CANONICAL_OVERRIDES)) {
    const loc = `${canonicalBase}${variant}`;
    assert(!locSet.has(loc), `Sitemap must not list canonicalized variant: ${loc}`);
  }
  assert(locs.length === SITEMAP_ROUTES.length,
    `Sitemap URL count mismatch: expected ${SITEMAP_ROUTES.length}, found ${locs.length}`);
  return locSet;
}

// 라우터 소스에서 { path, redirect }를 뽑는다. 이 앱이 실제로 무엇을 서빙하는지의
// 원본은 라우터이고, seo-routes.mjs는 그걸 손으로 베낀 사본이다. 이 게이트가 막으려는
// 결함이 바로 사본이 원본에서 미끄러지는 것이다(car는 어떤 사이트맵에도 없는 홈을
// 배포하고 있었고, 빌드에서 아무도 눈치채지 못했다).
//
// 폴백을 두지 않는 것이 핵심이다: router/index.ts의 형태가 바뀌어 이 파싱이 깨지면
// 빈 집합을 조용히 통과시키며 "검증 완료"를 찍는 대신 소리 내어 실패해야 한다.
function parseRouterRoutes(source) {
  const start = source.search(/const routes\s*:/);
  assert(start !== -1,
    "router/index.ts: `const routes:` 선언을 찾지 못했다 — 라우트 표를 추출할 수 "
      + "없으면 사이트맵을 원본과 대조할 수 없다");
  // 배열 종료 지점에서 자른다: 그 뒤(가드·애널리틱스 훅)는 라우트 선언이 아니므로
  // 스캔 대상이 되면 안 된다.
  const end = source.indexOf("\n];", start);
  assert(end !== -1, "router/index.ts: 라우트 배열이 `\\n];`로 끝나지 않는다");
  const body = source.slice(start, end);

  const marks = [...body.matchAll(/path:\s*"([^"]+)"/g)].map((match) => ({
    path: match[1],
    index: match.index,
  }));
  assert(marks.length > 0, "router/index.ts: 추출된 라우트 경로가 0개다");

  return marks.map((mark, i) => ({
    path: mark.path,
    // 한 라우트의 본문은 다음 `path:` 선언 직전까지다.
    redirect: /redirect:/.test(body.slice(mark.index, marks[i + 1]?.index ?? body.length)),
  }));
}

// 라우터 ↔ 사이트맵 양방향 대조.
//
// 전방: 라우터가 서빙하는 정적 라우트는 전부 사이트맵에 광고돼야 한다. 200을 주고
// 프리렌더도 멀쩡한데 sitemap.xml에만 없는 페이지는, 크롤러에게 이 앱의 URL 목록을
// 알려주는 유일한 파일에서 투명인간이 된다 — 그리고 빌드의 나머지는 아무도 안 본다.
//
// 역방: 사이트맵이 라우터에 없는 URL을 광고해서도 안 되고, 리다이렉트 라우트가
// 실려서도 안 된다. 리다이렉트는 자기 페이지가 없어 목적지로 canonical이 넘어가므로,
// 그 URL을 싣는 것은 크롤러를 즉시 다른 곳으로 보내는 주소를 광고하는 셈이다.
// 전방만 보면 "홈을 다시 리다이렉트로 되돌리고 URL은 사이트맵에 남기는" 상태를
// 통과시키는데, 이는 이 게이트가 애초에 잡으려던 상태보다 더 나쁘다.
function validateRouterSitemapParity(sitemapUrls) {
  const routerSource = readFileSync(
    resolve(projectRoot, "src", "router", "index.ts"),
    "utf8"
  );
  const routerRoutes = parseRouterRoutes(routerSource);
  const indexRoute = routerRoutes.find((route) => route.path === "/");

  assert(indexRoute, "router/index.ts must register an index route");
  assert(!indexRoute.redirect,
    "Index route must render its own view: 리다이렉트 홈은 목적지로 canonical이 "
      + "넘어가고, canonical이 딴 데를 가리키는 페이지는 사이트맵에 실을 수 없다");

  // 파라미터·catch-all 라우트는 정적 URL이 아니다. 그 구체 인스턴스는
  // CANONICAL_OVERRIDES(금액 변종)에 있고 아래에서 따로 대조한다.
  const staticRoutes = routerRoutes.filter(
    (route) => !route.path.includes(":") && !route.path.includes("*")
  );
  assert(staticRoutes.length > 0, "router/index.ts: 추출된 정적 라우트가 0개다");

  for (const route of staticRoutes) {
    if (route.redirect) {
      assert(!sitemapUrls.has(canonicalUrlFor(route.path)),
        `Redirect route must not be listed in the sitemap: ${route.path}`);
      continue;
    }
    assert(sitemapUrls.has(canonicalUrlFor(route.path)),
      `Router route is missing from the sitemap: ${canonicalUrlFor(route.path)}`);
  }

  // 역방향: 뒤에 서빙 라우트가 없는 사이트맵 URL은 없어야 한다.
  const servedUrls = new Set(
    staticRoutes
      .filter((route) => !route.redirect)
      .map((route) => canonicalUrlFor(route.path))
  );
  for (const url of sitemapUrls) {
    assert(servedUrls.has(url),
      `Sitemap advertises a URL the router does not serve: ${url}`);
  }

  // 변종에도 같은 역방향 규칙을 적용한다. 변종은 사이트맵에 없지만 정적 HTML로 계속
  // 나가므로, 라우터에서 `/isa/:amount` 같은 파라미터 라우트가 사라지면 그 URL은
  // 프리렌더 파일만 남고 SPA 진입 시 404가 된다.
  const paramBases = new Set(
    routerRoutes
      .filter((route) => /\/:/.test(route.path) && !route.path.startsWith("/:"))
      .map((route) => route.path.replace(/\/:.*$/, ""))
  );
  for (const [variant, base] of Object.entries(CANONICAL_OVERRIDES)) {
    assert(paramBases.has(base),
      `Prerendered variant ${variant} has no router route behind it (missing ${base}/:amount)`);
  }
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
validateRouterSitemapParity(validateSitemap());

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

// 소스에 쓰인 "색을 칠하는" 유틸리티가 산출 CSS에 실제로 규칙을 만들었는지 대조한다.
//
// 왜 필요한가: Tailwind는 해석하지 못한 클래스를 경고도 빌드 실패도 없이 통째로
// 버린다. 마크업에는 남고 CSS에만 없으므로 그 색은 그냥 안 칠해지고, 화면을 직접
// 눈으로 보기 전까지 아무도 모른다. 이 앱에서 실제로 두 종류가 살아 있었다:
//
//   1) theme.opacity 스케일 밖 단계 — /8·/12·/14·/92가 18개 파일에서 죽어 있었다.
//      앱 헤더 배경(bg-primary/8)이 페이지 배경과 같은 색으로 나갔고, 배당 계산기의
//      "종합과세 대상" 경고 콜아웃도 틴트 없이 흰 배경으로 나갔다.
//   2) 테마에 없는 색 이름 — 배지의 bg-deduction·bg-highlight와 그 짝 foreground.
//
// 색 유틸리티만 본다: 레이아웃이 틀어지면 눈에 바로 띄지만, 배경이 안 칠해진 것은
// "원래 그런 디자인"처럼 보여서 조용히 살아남는다. 임의값 대괄호 표기와 표현식은
// 정적 대조가 불가능하므로 스캔에서 제외한다.
const COLOR_UTILITY = new RegExp(
  "^(?:[a-z-]+:)*(?:bg|text|border|stroke|fill|ring|divide|outline|shadow|accent|" +
    "decoration|caret|placeholder|from|via|to)-[a-z]"
);

function validateEmittedUtilities() {
  const srcDir = resolve(projectRoot, "src");
  const assetsDir = resolve(distRoot, "assets");
  assert(existsSync(assetsDir), `Missing built assets directory: ${assetsDir}`);

  const css = readdirSync(assetsDir)
    .filter((name) => name.endsWith(".css"))
    .map((name) => readFileSync(join(assetsDir, name), "utf8"))
    .join("\n");
  assert(css.length > 0, "No built CSS found - cannot verify utility emission");

  const files = [];
  (function walk(dir) {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (/\.(vue|ts)$/.test(name)) files.push(path);
    }
  })(srcDir);

  const used = new Map();
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    // class="..." 속성, @apply, 그리고 cva 변형 문자열(작은/큰따옴표)을 함께 훑는다
    for (const match of text.matchAll(/class="([^"]*)"|@apply ([^;]*);|'([^']*)'|"([^"]*)"/g)) {
      const chunk = match[1] ?? match[2] ?? match[3] ?? match[4] ?? "";
      if (chunk.length > 600) continue;
      for (const token of chunk.split(/\s+/)) {
        if (!COLOR_UTILITY.test(token)) continue;
        if (/[[\](){}$<>=]/.test(token)) continue; // 임의값·표현식은 정적 대조 불가
        if (!/^[a-z][\w:/.-]*$/.test(token)) continue;
        if (!used.has(token)) used.set(token, new Set());
        used.get(token).add(file.slice(srcDir.length + 1));
      }
    }
  }
  assert(used.size > 20,
    `색 유틸리티 스캔이 ${used.size}종밖에 못 찾았다 — 스캐너가 깨졌다고 봐야 한다`);

  const missing = [];
  for (const [token, owners] of used) {
    // Tailwind가 셀렉터에서 이스케이프하는 문자만 골라 이스케이프한다
    const selector = "." + token.replace(/[/:.]/g, (c) => "\\" + c);
    const pattern = new RegExp(
      selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?![\\w\\\\-])"
    );
    if (!pattern.test(css)) missing.push(`${token} (${[...owners].join(", ")})`);
  }

  assert(missing.length === 0,
    "이 색 유틸리티들은 소스에 있지만 산출 CSS에 규칙이 없다 — Tailwind가 조용히 "
      + `버렸다 (theme.opacity 스케일·색 이름 확인): ${missing.join(" | ")}`);
}

validateEmittedUtilities();

console.log(
  `Validated ${SEO_ROUTES.length} SEO routes (${SITEMAP_ROUTES.length} sitemap URLs, ` +
  `${Object.keys(CANONICAL_OVERRIDES).length} canonicalized variants), router<->sitemap parity, ` +
  `emitted color utilities, prerendered home, and custom 404 output.`
);
