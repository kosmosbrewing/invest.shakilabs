export const DEFAULT_SITE_URL = "https://shakilabs.com/invest";

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function normalizeSiteUrl(value: string | null | undefined): string | null {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (!trimmed) return null;
  try {
    return trimTrailingSlash(new URL(trimmed).toString());
  } catch {
    return null;
  }
}

export function getCanonicalSiteUrl(): string {
  const envSiteUrl = normalizeSiteUrl(import.meta.env.VITE_SITE_URL);
  return envSiteUrl ?? DEFAULT_SITE_URL;
}

export function getSiteUrl(): string {
  if (typeof window !== "undefined" && window.location.origin) {
    const basePath = new URL(getCanonicalSiteUrl()).pathname.replace(/\/+$/, "");
    return trimTrailingSlash(`${window.location.origin}${basePath}`);
  }
  return getCanonicalSiteUrl();
}

export function buildCanonicalUrl(path: string, queryString = "", hash = ""): string {
  const baseUrl = new URL(getCanonicalSiteUrl());
  const basePath = baseUrl.pathname.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  baseUrl.pathname = `${basePath}${normalizedPath}`;
  baseUrl.search = queryString ? `?${queryString.replace(/^\?/, "")}` : "";
  baseUrl.hash = hash ? `#${hash.replace(/^#/, "")}` : "";
  return baseUrl.toString();
}
