export function normalizeSegments(values: readonly number[]): number[] {
  const safe = values.map((value) => Number.isFinite(value) && value > 0 ? value : 0);
  const total = safe.reduce((sum, value) => sum + value, 0);
  return total > 0 ? safe.map((value) => value / total) : safe;
}

export function positiveBarWidth(value: number, maximum: number): number {
  if (!Number.isFinite(value) || value <= 0 || maximum <= 0) return 0;
  return Math.min(100, (value / maximum) * 100);
}

export function linePoint(value: number, maximum: number, minimumY = 8, height = 44): number {
  if (!Number.isFinite(value) || maximum <= 0) return minimumY + height;
  return minimumY + height - Math.min(1, Math.max(0, value / maximum)) * height;
}
