export type Minute = number;

export const MINUTES_PER_DAY: Minute = 1440;
export const MAX_BOOKING_MINUTES: Minute = 120;
export const OPENING_MINUTES: Minute = 7 * 60;
export const CLOSING_MINUTES: Minute = 22 * 60;

export function minutesToLabel(m: Minute): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
}

export function labelToMinutes(label: string): Minute | null {
  const match = label.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const h = parseInt(match[1], 10);
  const min = parseInt(match[2], 10);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h * 60 + min;
}

export function labelToMinutesRaw(label: string): Minute | null {
  const trimmed = label.trim();
  if (trimmed === "") return null;
  if (!/^\d+$/.test(trimmed)) return null;
  const val = parseInt(trimmed, 10);
  if (val < 0 || val > 1440) return null;
  return val;
}

export function durationLabel(start: Minute, end: Minute): string {
  const total = end - start;
  const h = Math.floor(total / 60);
  const min = total % 60;
  if (h === 0) return `${min} min`;
  if (min === 0) return `${h} h`;
  return `${h} h ${min} min`;
}

export function isInvalidInterval(start: Minute, end: Minute): boolean {
  return start < 0 || end > 1440 || start >= end;
}
