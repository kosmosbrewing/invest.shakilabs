import { useHead } from "@unhead/vue";
import { toValue, type MaybeRefOrGetter } from "vue";
import { useRoute } from "vue-router";
import { getSiteUrl } from "@/lib/site";

const TITLE_SUFFIX = " | 투자 세금 계산기";
const DEFAULT_TITLE = "투자 세금 계산기";
const LEGACY_TITLE_SUFFIXES = [
  " | shakilabs.com/invest",
  " | ShakiLabs",
  TITLE_SUFFIX,
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

function normalizeTitle(rawTitle: string): string {
  const trimmed = rawTitle.trim();
  let baseTitle = trimmed;

  for (const suffix of LEGACY_TITLE_SUFFIXES) {
    if (baseTitle.endsWith(suffix)) {
      baseTitle = baseTitle.slice(0, -suffix.length).trimEnd();
      break;
    }
  }

  if (!baseTitle) {
    return DEFAULT_TITLE;
  }

  return baseTitle.includes(" | ") ? baseTitle : `${baseTitle}${TITLE_SUFFIX}`;
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
