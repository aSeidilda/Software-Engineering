import {
  MAX_BOOKING_MINUTES,
  OPENING_MINUTES,
  CLOSING_MINUTES,
  minutesToLabel,
  isInvalidInterval,
  type Minute,
} from "./timeUtils";

export interface Booking {
  id: string;
  title: string;
  organizer: string;
  start: Minute;
  end: Minute;
}

export interface Room {
  id: string;
  name: string;
  building: string;
  floor: number;
  capacity: number;
  type: string;
  blocked: boolean;
  blockedReason?: string;
  image: string;
  facilities: string[];
  bookings: Booking[];
}

export type AvailabilityResult =
  | { status: "available" }
  | { status: "unavailable"; reasons: string[] };

export function intervalsOverlap(
  aStart: Minute,
  aEnd: Minute,
  bStart: Minute,
  bEnd: Minute
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function checkAvailability(
  room: Room,
  start: Minute,
  end: Minute,
  nowMinutes: Minute
): AvailabilityResult {
  const reasons: string[] = [];

  // AC1: interval validity
  if (isInvalidInterval(start, end)) {
    reasons.push("Enter a start and end time so that 0 ≤ start < end ≤ 1440.");
  } else if (start <= nowMinutes) {
    reasons.push(`Start time must be after the current time (${minutesToLabel(nowMinutes)}).`);
  }

  // AC2: max 120 minutes
  if (end - start > MAX_BOOKING_MINUTES) {
    reasons.push(`Bookings cannot be longer than 120 minutes (yours is ${end - start} min).`);
  }

  // AC3: room blocked
  if (room.blocked) {
    reasons.push(`Room is currently blocked: ${room.blockedReason ?? "unavailable"}.`);
  }

  // AC4: overlap with existing bookings (touching endpoints allowed)
  if (isInvalidInterval(start, end)) {
    // skip overlap check for invalid interval
  } else {
    const overlaps = room.bookings.filter((b) =>
      intervalsOverlap(start, end, b.start, b.end)
    );
    if (overlaps.length > 0) {
      const first = overlaps[0];
      reasons.push(
        `Overlaps existing booking "${first.title}" (${minutesToLabel(first.start)}–${minutesToLabel(first.end)}).`
      );
    }
  }

  // campus hours
  if (start < OPENING_MINUTES || end > CLOSING_MINUTES) {
    reasons.push(
      `Outside campus hours (07:00–22:00).`
    );
  }

  if (reasons.length > 0) {
    return { status: "unavailable", reasons };
  }
  return { status: "available" };
}
