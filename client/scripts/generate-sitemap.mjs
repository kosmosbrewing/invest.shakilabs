// sitemap.xml 생성 (수동 실행용 보조 스크립트)
// 주의: 정식 생성 지점은 build.mjs의 renderSitemap이다 (npm run build가 호출).
// 여기서도 SITEMAP_ROUTES를 써서 수동 실행이 canonical 통합 변종을 되살리지 않게 한다.
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve } from "path";
import { SITEMAP_ROUTES } from "./seo-routes.mjs";

const SITE_URL = "https://shakilabs.com/invest";
const DIST_DIR = resolve(import.meta.dirname, "../dist");
const PUBLIC_DIR = resolve(import.meta.dirname, "../public");

const today = new Date().toISOString().split("T")[0];

function resolvePriority(route) {
  if (route === "/") return "1.0";
  if (route === "/crypto-tax") return "0.9";
  if (route === "/all") return "0.9";
  if (route === "/dividend-tax") return "0.9";
  if (route === "/isa") return "0.9";
  return "0.5";
}

function resolveChangeFreq(route) {
  if (route === "/crypto-tax") return "daily";
  return "weekly";
}

// cleanUrls redirects "/invest/" to "/invest", so the home must be listed slashless
const urls = SITEMAP_ROUTES.map((route) => `  <url>
    <loc>${route === "/" ? SITE_URL : `${SITE_URL}${route}`}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${resolveChangeFreq(route)}</changefreq>
    <priority>${resolvePriority(route)}</priority>
  </url>`).join("\n");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

if (!existsSync(PUBLIC_DIR)) {
  mkdirSync(PUBLIC_DIR, { recursive: true });
}
writeFileSync(resolve(PUBLIC_DIR, "sitemap.xml"), sitemap, "utf-8");

if (existsSync(DIST_DIR)) {
  writeFileSync(resolve(DIST_DIR, "sitemap.xml"), sitemap, "utf-8");
}

console.log(`[sitemap] Generated with ${SITEMAP_ROUTES.length} URLs`);
