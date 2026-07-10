import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import {
  SEO_ROUTES,
  CRYPTO_AMOUNTS,
  DIVIDEND_AMOUNTS,
  ISA_AMOUNTS,
  GIFT_AMOUNTS,
  INHERITANCE_AMOUNTS,
  FOREIGN_STOCK_AMOUNTS,
  SAVINGS_AMOUNTS,
  DEPOSIT_AMOUNTS,
  COMPOUND_AMOUNTS,
} from "./seo-routes.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const sitemapPath = resolve(projectRoot, "public", "sitemap.xml");
const viteSsgBin = resolve(
  projectRoot,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "vite-ssg.cmd" : "vite-ssg"
);

const paramPaths = new Set([
  ...CRYPTO_AMOUNTS.map((a) => `/crypto-tax/${a}`),
  ...DIVIDEND_AMOUNTS.map((a) => `/dividend-tax/${a}`),
  ...ISA_AMOUNTS.map((a) => `/isa/${a}`),
  ...GIFT_AMOUNTS.map((a) => `/gift-tax/${a}`),
  ...INHERITANCE_AMOUNTS.map((a) => `/inheritance-tax/${a}`),
  ...FOREIGN_STOCK_AMOUNTS.map((a) => `/foreign-stock-tax/${a}`),
  ...SAVINGS_AMOUNTS.map((a) => `/savings-interest/${a}`),
  ...DEPOSIT_AMOUNTS.map((a) => `/deposit-interest/${a}`),
  ...COMPOUND_AMOUNTS.map((a) => `/compound-interest/${a}`),
]);

const basePriority = {
  "/crypto-tax": "1.0",
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
  if (paramPaths.has(path)) {
    return { changefreq: "monthly", priority: "0.7" };
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
  const urls = SEO_ROUTES.map((path) => {
    const { changefreq, priority } = getRouteConfig(path);
    return `  <url>
    <loc>${baseUrl}${path}</loc>
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

const validationResult = spawnSync(
  process.execPath,
  [resolve(projectRoot, "scripts", "validate-static-output.mjs")],
  {
    cwd: projectRoot,
    stdio: "inherit",
  }
);

process.exit(validationResult.status ?? 1);
