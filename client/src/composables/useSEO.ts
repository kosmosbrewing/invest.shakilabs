import { useHead } from "@unhead/vue";
import { toValue, type MaybeRefOrGetter } from "vue";
import { useRoute } from "vue-router";
import { getSiteUrl } from "@/lib/site";

// 정본 규칙(디자인 시스템 §11.1): "{페이지} | {카테고리} | ShakiLabs".
const CATEGORY = "투자 세금 계산기";
const TITLE_SUFFIX = ` | ${CATEGORY} | ShakiLabs`;
const DEFAULT_TITLE = CATEGORY;
const LEGACY_TITLE_SUFFIXES = [
  TITLE_SUFFIX,
  " | shakilabs.com/invest",
  " | ShakiLabs",
  ` | ${CATEGORY}`,
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
};

// 뷰가 넘기는 title에 이미 "|"가 들어있어도(서브타이틀 병기) 배지를 건너뛰지
// 않는다 — 예전에는 pipe 유무로 두 레시피가 섞였다(카테고리 배지 있음/없음).
// 항상 한 레시피만 적용해 배지 유무가 페이지마다 갈리지 않게 한다.
export function normalizeTitle(rawTitle: string): string {
  const trimmed = rawTitle.trim();
  let baseTitle = trimmed || DEFAULT_TITLE;

  for (const suffix of LEGACY_TITLE_SUFFIXES) {
    if (baseTitle.endsWith(suffix)) {
      baseTitle = baseTitle.slice(0, -suffix.length).trimEnd();
      break;
    }
  }

  if (!baseTitle) {
    baseTitle = DEFAULT_TITLE;
  }

  // v3 §11.1의 레시피는 `{페이지} | {카테고리} | ShakiLabs` 3단이다.
  // 페이지 이름이 자체 부제를 pipe로 달고 있으면 4단이 되어 어디까지가 페이지명인지
  // 읽히지 않는다. 부제는 검색 키워드를 담고 있으므로 버리지 않고 구분자만 중점으로 바꾼다.
  baseTitle = baseTitle.replace(/\s*\|\s*/g, " · ");

  // 카테고리 없는 루트 예외(§11.1): 페이지 이름이 이미 카테고리로 시작하면
  // ("투자 세금 계산기 | ..." 같은 홈) 배지를 또 붙이지 않고 ShakiLabs만 추가한다.
  if (baseTitle.startsWith(CATEGORY)) {
    return `${baseTitle} | ShakiLabs`;
  }

  return `${baseTitle}${TITLE_SUFFIX}`;
}

export function useSEO({
  title,
  description,
  noindex = false,
  ogImage,
  jsonLd,
  canonicalPath,
}: SEOOptions): void {
  const route = useRoute();

  useHead(() => {
    const resolvedTitle = normalizeTitle(toValue(title));
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
