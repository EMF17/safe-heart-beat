export function sweepAgeMinutes(completedAt: string | null, nowMs: number): number | null {
  if (!completedAt) return null;
  const lastMs = Date.parse(completedAt);
  if (!Number.isFinite(lastMs) || !Number.isFinite(nowMs) || lastMs > nowMs) return null;
  return Math.floor((nowMs - lastMs) / 60_000);
}