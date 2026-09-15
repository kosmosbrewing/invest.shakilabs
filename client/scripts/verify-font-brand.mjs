// BL-020 서브셋 산출물 대조 검증. 브라우저를 띄우지 않는다 — manifest에
// 이미 기록된 렌더 문자셋(font-subset-manifest.json, subset-font-brand.mjs가
// 생성)을 실제로 배포되는 폰트 파일·CSS 참조와 대조만 한다.
//
// fontTools cmap 전수 대조(docs/BRAND_FONT_SUBSET.md §6)는 여기서 한다 —
// document.fonts.check()는 이 환경에서 항상 true를 반환해 쓸 수 없다.
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { clientRoot, fontJobs, manifestPath } from "./font-subset-config.mjs";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function hash(content) {
  return createHash("sha256").update(content).digest("hex");
}

function cmapCoverage(fontPath, texts) {
  const script = `
import json, sys
from fontTools.ttLib import TTFont
cm = set(TTFont(${JSON.stringify(fontPath)}).getBestCmap())
texts = json.loads(sys.argv[1])
missing = sorted({c for text in texts for c in text if ord(c) not in cm})
print(json.dumps(missing))
`;
  const out = execFileSync("python3", ["-c", script, JSON.stringify(texts)], {
    encoding: "utf8",
  });
  return JSON.parse(out.trim().split("\n").pop());
}

function main() {
  assert(existsSync(manifestPath), `manifest 없음: ${manifestPath}. npm run fonts:subset:brand 먼저 실행해라.`);
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

  assert(
    manifest.characterSha256 === hash(manifest.characterSet),
    "manifest.characterSet과 characterSha256이 불일치 — manifest가 손상됐거나 수동 편집됐다"
  );

  const manifestFonts = new Map(manifest.fonts.map((f) => [f.publicName, f]));
  const cssPath = resolve(clientRoot, "src/assets/css/main.css");
  const css = readFileSync(cssPath, "utf8");

  const renderedTexts = manifest.renderedTexts.map((e) => e.text).concat(["404"]);

  for (const job of fontJobs) {
    assert(existsSync(job.output), `산출물 없음: ${job.output}`);
    const content = readFileSync(job.output);
    assert(
      content.subarray(0, 4).toString("ascii") === "wOF2",
      `${job.publicName}은 WOFF2여야 한다`
    );
    assert(
      content.byteLength <= job.maxBytes,
      `${job.publicName}이 예산(${job.maxBytes}B)을 초과: ${content.byteLength}B`
    );
    const manifestFont = manifestFonts.get(job.publicName);
    assert(manifestFont, `manifest에 ${job.publicName} 항목이 없다`);
    assert(
      manifestFont.bytes === content.byteLength,
      `${job.publicName} manifest 크기가 낡음 (manifest=${manifestFont.bytes}B, 실제=${content.byteLength}B)`
    );
    assert(
      manifestFont.sha256 === hash(content),
      `${job.publicName} 해시 불일치 — manifest가 낡았다`
    );
    assert(
      css.includes(`/fonts/${job.publicName}`),
      `main.css가 ${job.publicName}을 참조하지 않는다`
    );

    const missing = cmapCoverage(job.output, renderedTexts);
    assert(
      missing.length === 0,
      `${job.publicName} cmap 미커버 문자 발견: ${JSON.stringify(missing)}`
    );
  }

  console.log(
    `검증 통과: 문자셋 ${manifest.characterCount}자, 렌더 텍스트 ${renderedTexts.length}건 전수 커버, ` +
      `${fontJobs.map((j) => j.publicName).join(", ")}`
  );
}

main();
