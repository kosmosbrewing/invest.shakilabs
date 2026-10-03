import { useHead } from "@unhead/vue";
import { toValue, type MaybeRefOrGetter } from "vue";
import { useRoute } from "vue-router";
import { getSiteUrl } from "@/lib/site";

// 네이버 CTR 레시피(2026-10-03 수정, BRIEF-TITLE.md): 네이버가 제목을 약 35자에서
// 자르기 때문에 가운데 "{앱 이름}" 접미사가 핵심 구절·브랜드를 밀어내던 3단 레시피를
// 버렸다. 계산기 페이지는 앱 이름 없이 2단으로, 검색 유입이 목적이 아닌 홈·정책류는
// 앱 이름을 유지해 12개 앱 간 제목 중복을 막는다(예: "이용약관 | ShakiLabs"는 모든
// 앱에서 같은 문자열이 된다).
const APP_NAME = "투자 세금 계산기";
const BRAND = "ShakiLabs";

export type TitleKind = "calculator" | "home" | "policy";

// 길이가 긴 접미사를 먼저 검사해야 한다 — " | ShakiLabs"는 그 위의 모든 접미사의
// 끝부분이라 먼저 걸리면 가운데 세그먼트가 안 지워진 채로 남는다.
const LEGACY_TITLE_SUFFIXES = [
  ` · ${APP_NAME} | ${BRAND}`,
  ` | ${APP_NAME} | ${BRAND}`,
  ` | ${BRAND}`,
  " | shakilabs.com/invest",
  ` | ${APP_NAME}`,
] as const;

type SEOOptions = {
  title: MaybeRefOrGetter<string>;
  description: MaybeRefOrGetter<string>;
  noindex?: MaybeRefOrGetter<boolean | undefined>;
  ogImage?: MaybeRefOrGetter<string | undefined>;
  jsonLd?: MaybeRefOrGetter<
    Record<string, unknown> | Record<string, unknown>[] | undefined
  >;
  /**
   * 변종 URL을 대표 URL로 canonical 통합할 때 대표 경로를 지정한다
   * ("/compound-interest" 등). canonical·hreflang·og:url이 모두
   * 이 경로 기준으로 계산되어 세 메타가 항상 일치한다.
   */
  canonicalPath?: MaybeRefOrGetter<string | undefined>;
  /**
   * 페이지 타입 — 레시피가 갈라지는 기준(기본값 "calculator").
   * - calculator: 계산기·도구·가이드. 앱 이름 접미사 없이 `{페이지} | ShakiLabs`.
   * - home: 홈. 페이지 제목 없이 `{앱 이름} | ShakiLabs`.
   * - policy: 허브(/all)·소개·약관·개인정보·404. `{페이지} · {앱 이름} | ShakiLabs`.
   */
  titleKind?: MaybeRefOrGetter<TitleKind | undefined>;
};

// 뷰가 넘기는 title에 이미 "|"가 들어있어도(서브타이틀 병기) 중점 변환을 건너뛰지
// 않는다 — 최종 레시피의 pipe(브랜드 구분자)가 늘 유일해야 네이버가 35자에서 잘라도
// 어디까지가 페이지명인지 섞이지 않는다.
export function normalizeTitle(rawTitle: string, kind: TitleKind = "calculator"): string {
  const trimmed = rawTitle.trim();
  let baseTitle = trimmed || APP_NAME;

  for (const suffix of LEGACY_TITLE_SUFFIXES) {
    if (baseTitle.endsWith(suffix)) {
      baseTitle = baseTitle.slice(0, -suffix.length).trimEnd();
      break;
    }
  }

  if (!baseTitle) {
    baseTitle = APP_NAME;
  }

  baseTitle = baseTitle.replace(/\s*\|\s*/g, " · ");

  // 홈: 페이지 제목 없이 앱 이름 자체가 제목이다("<앱 이름> · <앱 이름>" 중복 방지).
  if (kind === "home") {
    return `${APP_NAME} | ${BRAND}`;
  }

  // 정책류(허브·소개·약관·개인정보·404): 앱 이름이 없으면 "이용약관 | ShakiLabs"가
  // 12개 앱에서 동일해져 도메인 안 중복 제목이 된다. 이 그룹은 검색 유입이 목적이
  // 아니라 35자 절단이 문제되지 않는다.
  if (kind === "policy") {
    return `${baseTitle} · ${APP_NAME} | ${BRAND}`;
  }

  // 계산기·도구·가이드: 네이버 35자 절단 대응으로 앱 이름 접미사를 없앤다.
  return `${baseTitle} | ${BRAND}`;
}

export function useSEO({
  title,
  description,
  noindex = false,
  ogImage,
  jsonLd,
  canonicalPath,
  titleKind,
}: SEOOptions): void {
  const route = useRoute();

  useHead(() => {
    const resolvedTitle = normalizeTitle(toValue(title), toValue(titleKind) ?? "calculator");
    const resolvedDescription = toValue(description);
    const resolvedNoindex = Boolean(toValue(noindex));
    const resolvedJsonLd = toValue(jsonLd);
    const resolvedJsonLdArray = Array.isArray(resolvedJsonLd)
      ? resolvedJsonLd.filter(
          (entry): entry is Record<string, unknown> =>
            Boolean(entry) && typeof entry === "object"
        )
      : resolvedJsonLd && typeof resolvedJsonLd === "object"
        ? [resolvedJsonLd]
        : [];
    const siteUrl = getSiteUrl().replace(/\/+$/, "");
    // canonicalPath가 지정되면 실제 경로 대신 대표 경로로 canonical류 메타를 통일한다
    const currentPath = toValue(canonicalPath) ?? (route.path || "/");
    const currentUrl = currentPath === "/" ? siteUrl : `${siteUrl}${currentPath}`;

    return {
      htmlAttrs: {
        lang: "ko",
      },
      title: resolvedTitle,
      link: currentUrl
        ? [
            { rel: "canonical", href: currentUrl },
            { rel: "alternate", hreflang: "ko", href: currentUrl },
            { rel: "alternate", hreflang: "x-default", href: currentUrl },
          ]
        : [],
      meta: [
        { name: "description", content: resolvedDescription },
        { property: "og:title", content: resolvedTitle },
        { property: "og:description", content: resolvedDescription },
        { name: "twitter:title", content: resolvedTitle },
        { name: "twitter:description", content: resolvedDescription },
        ...(currentUrl ? [{ property: "og:url", content: currentUrl }] : []),
        ...(() => {
          const img = toValue(ogImage);
          return img
            ? [
                { property: "og:image", content: img },
                { name: "twitter:image", content: img },
              ]
            : [];
        })(),
        ...(resolvedNoindex ? [{ name: "robots", content: "noindex,nofollow" }] : []),
      ],
      script: resolvedJsonLdArray.map((entry, index) => ({
        key: `json-ld-${index}`,
        type: "application/ld+json",
        textContent: JSON.stringify(entry),
      })),
    };
  });
}
