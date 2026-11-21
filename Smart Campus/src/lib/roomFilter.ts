import type { Room } from "./availability";

export interface RoomFilter {
  attendees: number;
  equipment: string[];
}

/**
 * F1: room capacity must be >= requested attendees.
 * F2: room must contain ALL selected equipment items (exact match).
 * F3 is enforced by checkAvailability, not here: blocked rooms still match a filter
 * so the user can see why they are unavailable.
 */
export function roomMatchesFilter(room: Room, filter: RoomFilter): boolean {
  if (!Number.isFinite(filter.attendees)) return false;
  const capacityOk = room.capacity >= filter.attendees;
  const equipmentOk = filter.equipment.every((item) => room.facilities.includes(item));
  return capacityOk && equipmentOk;
}

/** Returns a new array; never mutates the input rooms. */
export function filterRooms(rooms: Room[], filter: RoomFilter): Room[] {
  return rooms.filter((room) => roomMatchesFilter(room, filter));
}
