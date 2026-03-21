// sitemap.xml 생성
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve } from "path";
import { SEO_ROUTES } from "./seo-routes.mjs";

const SITE_URL = "https://shakilabs.com/invest";
const DIST_DIR = resolve(import.meta.dirname, "../dist");
const PUBLIC_DIR = resolve(import.meta.dirname, "../public");

const today = new Date().toISOString().split("T")[0];

function resolvePriority(route) {
  if (route === "/crypto-tax") return "1.0";
  if (route === "/dividend-tax") return "0.9";
  if (route === "/isa") return "0.9";
  return "0.5";
}

function resolveChangeFreq(route) {
  if (route === "/crypto-tax") return "daily";
  return "weekly";
}

const urls = SEO_ROUTES.map((route) => `  <url>
    <loc>${SITE_URL}${route}</loc>
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

console.log(`[sitemap] Generated with ${SEO_ROUTES.length} URLs`);
