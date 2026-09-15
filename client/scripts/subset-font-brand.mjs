// BL-020: GmarketSans "제목+숫자" 서브셋 재생성 파이프라인.
// docs/BRAND_FONT_SUBSET.md 정본의 §3(렌더 수집)~§4(서브셋 생성)를 그대로
// 자동화한다. 사전 조건: `npm run build`로 dist/가 이미 존재해야 한다
// (vite preview로 그 dist를 서빙해 실제 렌더 텍스트를 모으기 때문).
//
// 실행: npm run build && npm run fonts:subset:brand
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { preview } from "vite";
import { collectGmarketRenderedTexts } from "./collect-gmarket-text.mjs";
import { NUMERAL_CHARACTERS, clientRoot, fontJobs, manifestPath } from "./font-subset-config.mjs";
import { SEO_ROUTES } from "./seo-routes.mjs";

function hash(content) {
  return createHash("sha256").update(content).digest("hex");
}

async function main() {
  const distIndex = resolve(clientRoot, "dist", "index.html");
  if (!existsSync(distIndex)) {
    throw new Error("dist/index.html이 없다. 먼저 `npm run build`를 실행해라.");
  }

  const server = await preview({
    root: clientRoot,
    preview: { port: 4321, strictPort: true },
  });
  const baseUrl = server.resolvedUrls.local[0].replace(/\/$/, "");

  let entries, charSet;
  try {
    ({ entries, charSet } = await collectGmarketRenderedTexts({
      baseUrl,
      routes: SEO_ROUTES,
    }));
  } finally {
    await server.close();
  }

  // 404 페이지("404")는 SEO_ROUTES에 없어 위 크롤에서 빠지지만, 그 텍스트는
  // 숫자뿐이라 NUMERAL_CHARACTERS로 이미 커버된다 (docs/BRAND_FONT_SUBSET.md
  // 검증 시 별도 라우트로 재확인됨 — verify-font-brand.mjs 참고).
  const finalCharSet = new Set([...charSet, ...NUMERAL_CHARACTERS]);
  const sortedChars = [...finalCharSet].sort((a, b) => a.codePointAt(0) - b.codePointAt(0));
  const charsetString = sortedChars.join("");

  const temporaryRoot = mkdtempSync(join(tmpdir(), "invest-font-brand-"));
  const charFile = resolve(temporaryRoot, "charset.txt");
  writeFileSync(charFile, charsetString, "utf8");

  const fonts = [];
  try {
    for (const job of fontJobs) {
      const result = spawnSync(
        "python3",
        [
          "-m",
          "fontTools.subset",
          job.source,
          `--text-file=${charFile}`,
          "--flavor=woff2",
          `--output-file=${job.output}`,
          "--no-hinting",
        ],
        { encoding: "utf8" }
      );
      if (result.error || result.status !== 0) {
        const detail = result.error?.message ?? result.stderr?.trim();
        throw new Error(`${job.publicName} 서브셋 생성 실패: ${detail}`);
      }
      const content = readFileSync(job.output);
      if (content.byteLength > job.maxBytes) {
        throw new Error(
          `${job.publicName}이 예산(${job.maxBytes}B)을 초과했다: ${content.byteLength}B`
        );
      }
      fonts.push({ publicName: job.publicName, bytes: content.byteLength, sha256: hash(content) });
    }
  } finally {
    rmSync(temporaryRoot, { force: true, recursive: true });
  }

  const manifest = {
    schemaVersion: 1,
    recipe: "docs/BRAND_FONT_SUBSET.md",
    note: "제목+숫자 서브셋 — 렌더 수집(§3) ∪ NUMERAL_CHARACTERS. 소스 grep 아님.",
    routesCrawled: SEO_ROUTES.length,
    renderedEntryCount: entries.length,
    renderedTexts: entries,
    numeralCharacters: NUMERAL_CHARACTERS,
    characterSet: charsetString,
    characterCount: sortedChars.length,
    characterSha256: hash(charsetString),
    fonts,
  };
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  console.log(
    `문자셋 ${sortedChars.length}자 (렌더 ${charSet.length} ∪ 숫자셋 ${NUMERAL_CHARACTERS.length}), ` +
      `${fonts.map((f) => `${f.publicName}=${f.bytes}B`).join(", ")}`
  );
  console.log(`manifest 저장: ${manifestPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
