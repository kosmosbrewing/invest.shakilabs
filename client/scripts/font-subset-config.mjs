// BL-020 브랜드 폰트(GmarketSans) 서브셋 파이프라인 설정.
// docs/BRAND_FONT_SUBSET.md 정본 참고. Pretendard는 건드리지 않는다 —
// GmarketSans는 h1 제목·retro-title·결과 금액에만 쓰이는 별도 폰트라
// fontJobs가 하나뿐이다.
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptRoot = dirname(fileURLToPath(import.meta.url));
export const clientRoot = resolve(scriptRoot, "..");

// 히어로 수치(카운트업 포함)가 만들어낼 수 있는 모든 문자.
// docs/BRAND_FONT_SUBSET.md §3 원문 그대로 — 수정 시 정본도 함께 갱신할 것.
export const NUMERAL_CHARACTERS =
  "0123456789,.%+-~/()· 원억만천조년월일개회건세명점배급시간분초";

export const fontJobs = [
  {
    name: "GmarketSans",
    source: resolve(clientRoot, "public/fonts/GmarketSansBold.woff"),
    output: resolve(clientRoot, "public/fonts/GmarketSansBold-brand-v1.woff2"),
    publicName: "GmarketSansBold-brand-v1.woff2",
    // 정본 실측 근거 11KB, 2배 여유
    maxBytes: 24 * 1024,
  },
];

export const manifestPath = resolve(scriptRoot, "font-subset-manifest.json");
