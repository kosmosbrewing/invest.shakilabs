import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SEO_ROUTES } from "./seo-routes.mjs";

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
  // cleanUrls redirects "/invest/" to "/invest", so the home canonical carries no slash
  const expectedCanonical = route === "/" ? canonicalBase : `${canonicalBase}${route}`;
  const actualCanonical = html.match(/<link rel="canonical" href="([^"]+)"\s*\/?>/)?.[1];
  const h1Count = html.match(/<h1\b/gi)?.length ?? 0;

  assert(actualCanonical === expectedCanonical,
    `Invalid canonical for ${route}: expected ${expectedCanonical}`);
  assert(/<title>[^<]+<\/title>/.test(html), `Missing title for ${route}`);
  assert(h1Count === 1, `Expected one H1 for ${route}, found ${h1Count}`);
  assert(html.includes('id="app"'), `Missing app root for ${route}`);
}

validateVercelConfig(resolve(repositoryRoot, "vercel.json"));
validateVercelConfig(resolve(projectRoot, "vercel.json"));
SEO_ROUTES.forEach(validateRoute);

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

console.log(`Validated ${SEO_ROUTES.length} SEO routes, prerendered home, and custom 404 output.`);
