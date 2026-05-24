import clsx, { type ClassValue } from 'clsx';

/** Tiny class-name combiner. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/** Round to nearest integer, but keep sign and handle NaN gracefully. */
export function roundTemp(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.round(n);
}

/** Format a unix-seconds timestamp using the city's UTC offset (in seconds). */
export function formatLocalTime(
  unixSeconds: number,
  utcOffsetSeconds: number,
  opts: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' }
): string {
  // Compute UTC ms then add city offset, then read as UTC.
  const ms = (unixSeconds + utcOffsetSeconds) * 1000;
  const d = new Date(ms);
  return new Intl.DateTimeFormat('en-US', { ...opts, timeZone: 'UTC' }).format(d);
}

/** Returns e.g. "Fri" / "Friday" depending on opts.weekday. */
export function formatLocalDay(
  unixSeconds: number,
  utcOffsetSeconds: number,
  weekday: 'short' | 'long' = 'long'
): string {
  const ms = (unixSeconds + utcOffsetSeconds) * 1000;
  const d = new Date(ms);
  return new Intl.DateTimeFormat('en-US', { weekday, timeZone: 'UTC' }).format(d);
}

/** "Mar 02" style short date in the city's timezone. */
export function formatShortDate(
  unixSeconds: number,
  utcOffsetSeconds: number
): string {
  const ms = (unixSeconds + utcOffsetSeconds) * 1000;
  const d = new Date(ms);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    timeZone: 'UTC',
  }).format(d);
}

/** "YYYY-MM-DD" key in the city's timezone — used to group 3-hour buckets into days. */
export function localDateKey(unixSeconds: number, utcOffsetSeconds: number): string {
  const ms = (unixSeconds + utcOffsetSeconds) * 1000;
  const d = new Date(ms);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Choose a degree symbol per unit system. */
export function degSymbol(_units: 'metric' | 'imperial'): string {
  return '°';
}

/** Hard clamp. */
export function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

/** Capitalize the first letter of each word. */
export function titleCase(s: string): string {
  return s
    .toLowerCase()
    .split(' ')
    .map((w) => (w.length ? w[0]!.toUpperCase() + w.slice(1) : w))
    .join(' ');
}

/** Promise-based sleep. */
export function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}
