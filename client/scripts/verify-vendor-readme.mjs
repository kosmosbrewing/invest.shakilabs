// vendor tgz 무결성 기록 검증 — 파일명 버전 · README(버전+SHA-256) · package.json file: 참조 3자를 대조한다.
// README가 옛 버전/옛 해시를 가리키면 무결성 검증을 하려는 사람에게 오답을 주므로 CI에서 막는다.
// vendor 디렉터리나 tgz가 없으면 즉시 통과(no-op)라 12개 앱에 그대로 복사해 둘 수 있다.
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const vendorDir = resolve(projectRoot, "vendor");
const errors = [];

const archives = existsSync(vendorDir)
  ? readdirSync(vendorDir).filter((name) => name.endsWith(".tgz"))
  : [];

if (archives.length === 0) {
  console.log("[vendor] no vendored tgz present — skipped");
  process.exit(0);
}

if (archives.length > 1) {
  fail(`vendor/에 tgz가 ${archives.length}개다 — 활성 산출물 1개만 커밋한다: ${archives.join(", ")}`);
}

const [archive] = archives;
const version = archive.match(/-(\d+\.\d+\.\d+)\.tgz$/)?.[1];
const sha256 = createHash("sha256").update(readFileSync(resolve(vendorDir, archive))).digest("hex");
const readmePath = resolve(vendorDir, "README.md");
const readme = existsSync(readmePath) ? readFileSync(readmePath, "utf8") : "";
const pkg = JSON.parse(readFileSync(resolve(projectRoot, "package.json"), "utf8"));
const dependencyRange = pkg.dependencies?.["@shakilabs/ui"];

if (!version) fail(`tgz 파일명에서 버전을 못 읽었다: ${archive}`);
if (!readme) fail("vendor/README.md가 없다");
if (readme && !readme.includes(archive)) fail(`README가 실제 파일명 ${archive}을 언급하지 않는다`);
if (readme && version && !readme.includes(version)) fail(`README 버전이 ${version}과 다르다`);
if (readme && !readme.includes(sha256)) fail(`README의 SHA-256이 실제 해시와 다르다 (actual ${sha256})`);
if (dependencyRange !== `file:vendor/${archive}`) {
  fail(`package.json의 @shakilabs/ui 참조가 ${dependencyRange} — file:vendor/${archive} 여야 한다`);
}

if (errors.length > 0) {
  console.error(`[vendor] mismatch\n${errors.map((line) => `  - ${line}`).join("\n")}`);
  process.exit(1);
}

console.log(`[vendor] ok — ${archive} sha256=${sha256}`);

function fail(message) {
  errors.push(message);
}
