import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { SEO_ROUTES, SITEMAP_ROUTES } from "./seo-routes.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const sitemapPath = resolve(projectRoot, "public", "sitemap.xml");
const viteSsgBin = resolve(
  projectRoot,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "vite-ssg.cmd" : "vite-ssg"
);

// Every amount variant is now canonical-consolidated, so SITEMAP_ROUTES holds
// base routes only and the old per-variant priority branch is unreachable.
const basePriority = {
  "/": "1.0",
  "/all": "0.9",
  "/crypto-tax": "0.9",
  "/dividend-tax": "0.9",
  "/isa": "0.9",
  "/gift-tax": "0.9",
  "/inheritance-tax": "0.9",
  "/foreign-stock-tax": "0.9",
  "/savings-interest": "0.9",
  "/deposit-interest": "0.9",
  "/compound-interest": "0.9",
  "/about": "0.5",
  "/terms": "0.3",
  "/privacy": "0.3",
};

function getRouteConfig(path) {
  if (basePriority[path]) {
    const isInfo = ["about", "terms", "privacy"].some((s) => path.includes(s));
    return {
      changefreq: path === "/crypto-tax" ? "daily" : isInfo ? "monthly" : "weekly",
      priority: basePriority[path],
    };
  }
  return { changefreq: "monthly", priority: "0.5" };
}

function resolveBuildDate() {
  const candidate = process.env.BUILD_DATE?.trim();
  if (candidate && /^\d{4}-\d{2}-\d{2}$/.test(candidate)) {
    return candidate;
  }

  return new Date().toISOString().slice(0, 10);
}

function renderSitemap(buildDate) {
  const baseUrl = "https://shakilabs.com/invest";
  // 사이트맵은 canonical 대표 URL만 담는다 (9개 패밀리의 금액 변종 전부 제외 —
  // 프리렌더는 SEO_ROUTES 전체 유지, 변종 canonical은 대표 페이지를 가리킨다)
  const urls = SITEMAP_ROUTES.map((path) => {
    const { changefreq, priority } = getRouteConfig(path);
    // cleanUrls redirects "/invest/" to "/invest", so the home must be listed slashless
    const loc = path === "/" ? baseUrl : `${baseUrl}${path}`;
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${buildDate}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function routeOutputPath(route) {
  // vite-ssg emits the home as dist/index.html, not dist/.html
  return route === "/"
    ? resolve(projectRoot, "dist", "index.html")
    : resolve(projectRoot, "dist", `${route.slice(1)}.html`);
}

function removeRenderedNoscriptFallbacks() {
  for (const route of [...SEO_ROUTES, "/404"]) {
    const outputPath = routeOutputPath(route);
    if (!existsSync(outputPath)) continue;

    const html = readFileSync(outputPath, "utf8");
    const nextHtml = html.replace(
      /\n?\s*<noscript>[\s\S]*?<\/noscript>/i,
      "",
    );
    writeFileSync(outputPath, nextHtml, "utf8");
  }
}

// 404 셸에서만 AdSense 로더를 걷어낸다.
//
// 왜: 404 화면의 본문은 "404 / 페이지를 찾을 수 없습니다" 33자뿐인데, 셸(index.html)의
// 로더를 그대로 물려받아 auto ads가 ins.adsbygoogle 슬롯을 만든다. 게시자 콘텐츠가 없는
// 화면에 광고를 싣는 것이라 Google의 Valuable Inventory 정책에 저촉된다. noindex는 색인만
// 막을 뿐이고 정책은 색인 여부가 아니라 로더의 존재를 본다.
//
// 왜 여기서 지우는가: 로더는 index.html <head>에 정적으로 있어야 한다(승인 심사·소유 확인이
// 전 페이지 head를 본다). 404만 예외이므로 정상 라우트의 광고 배선은 건드리지 않고
// 산출물 단계에서 404.html에서만 제거한다.
function removeAdLoaderFromNotFound() {
  const notFoundPath = resolve(projectRoot, "dist", "404.html");
  if (!existsSync(notFoundPath)) return;

  const html = readFileSync(notFoundPath, "utf8");
  const nextHtml = html
    // 로더 스크립트 태그 (vite-ssg가 async -> async="" 로 다시 쓰므로 속성 순서에 기대지 않는다)
    .replace(/\n?\s*<script[^>]*googlesyndication\.com[^>]*>\s*<\/script>/gi, "")
    // 로더를 설명하던 주석도 함께 지운다 — 남으면 "광고 없음"과 모순되는 흔적이 된다
    .replace(/\n?\s*<!--\s*Google AdSense[\s\S]*?-->/i, "");

  writeFileSync(notFoundPath, nextHtml, "utf8");
}

const buildDate = resolveBuildDate();

mkdirSync(dirname(sitemapPath), { recursive: true });
writeFileSync(sitemapPath, renderSitemap(buildDate), "utf8");

const result = spawnSync(viteSsgBin, ["build"], {
  cwd: projectRoot,
  stdio: "inherit",
  env: {
    ...process.env,
    BUILD_DATE: buildDate,
  },
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

removeRenderedNoscriptFallbacks();
removeAdLoaderFromNotFound();

const validationResult = spawnSync(
  process.execPath,
  [resolve(projectRoot, "scripts", "validate-static-output.mjs")],
  {
    cwd: projectRoot,
    stdio: "inherit",
  }
);

process.exit(validationResult.status ?? 1);
