// SBOM 신원 검증 — 다른 앱의 SBOM이 이 저장소에 박히는 오염(스캐폴딩 복사 사고)을 잡는다.
// 재생성 후 diff 방식은 timestamp·documentNamespace·npm 버전 때문에 상시 실패하므로 쓰지 않는다.
// 산출물이 없으면 즉시 통과(no-op)라 12개 앱에 그대로 복사해 둘 수 있다.
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const pkg = readJson(resolve(projectRoot, "package.json"));
const sbomDir = resolve(projectRoot, "artifacts", "sbom");
const cyclonedxPath = resolve(sbomDir, "production.cyclonedx.json");
const errors = [];

if (!existsSync(cyclonedxPath)) {
  console.log("[sbom] no SBOM artifact present — skipped");
  process.exit(0);
}

const component = readJson(cyclonedxPath).metadata?.component ?? {};
check("cyclonedx metadata.component.name", component.name, pkg.name);
check("cyclonedx metadata.component.version", component.version, pkg.version);

if (process.env.GITHUB_REPOSITORY) {
  const vcs = (component.externalReferences ?? []).find((ref) => ref.type === "vcs")?.url;
  check("cyclonedx vcs url", vcs, `https://github.com/${process.env.GITHUB_REPOSITORY}`);
}

const spdxPath = resolve(sbomDir, "production.spdx.json");
if (existsSync(spdxPath)) {
  const spdx = readJson(spdxPath);
  const root = spdx.packages?.find((entry) => entry.SPDXID === spdx.documentDescribes?.[0]);
  check("spdx root package name", root?.name, pkg.name);
}

if (errors.length > 0) {
  console.error(`[sbom] identity mismatch\n${errors.map((line) => `  - ${line}`).join("\n")}`);
  process.exit(1);
}

console.log(`[sbom] identity ok — ${pkg.name}@${pkg.version}`);

function check(label, actual, expected) {
  if (actual !== expected) {
    errors.push(`${label}: ${JSON.stringify(actual)} != ${JSON.stringify(expected)}`);
  }
}
