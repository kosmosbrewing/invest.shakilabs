export const DEFAULT_SITE_URL = "https://invest.shakilabs.com";

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
    return trimTrailingSlash(window.location.origin);
  }
  return getCanonicalSiteUrl();
}
