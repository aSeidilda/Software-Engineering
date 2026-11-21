import { describe, it, expect } from "vitest";
import type { Room } from "./availability";
import { filterRooms, roomMatchesFilter } from "./roomFilter";

function makeRoom(overrides: Partial<Room> & { id: string }): Room {
  return {
    name: overrides.id,
    building: "Test",
    floor: 1,
    capacity: 10,
    type: "Test",
    blocked: false,
    image: "",
    facilities: [],
    bookings: [],
    ...overrides,
  };
}

const rooms: Room[] = [
  makeRoom({ id: "A", capacity: 24, facilities: ["Projector", "Whiteboard"] }),
  makeRoom({ id: "B", capacity: 12, facilities: ["Projector"], blocked: true, blockedReason: "Repair" }),
  makeRoom({ id: "C", capacity: 60, facilities: ["Projector", "Microphone"] }),
  makeRoom({ id: "D", capacity: 18, facilities: ["Sink"] }),
];

describe("F1 capacity filter", () => {
  it("accepts a room whose capacity equals the attendees (boundary)", () => {
    expect(roomMatchesFilter(rooms[0], { attendees: 24, equipment: [] })).toBe(true);
  });

  it("rejects a room one seat too small", () => {
    expect(roomMatchesFilter(rooms[0], { attendees: 25, equipment: [] })).toBe(false);
  });

  it("returns only rooms with enough capacity", () => {
    const ids = filterRooms(rooms, { attendees: 20, equipment: [] }).map((r) => r.id);
    expect(ids).toEqual(["A", "C"]);
  });
});

describe("F2 equipment filter", () => {
  it("requires ALL selected items, not any of them", () => {
    const ids = filterRooms(rooms, { attendees: 1, equipment: ["Projector", "Microphone"] }).map((r) => r.id);
    expect(ids).toEqual(["C"]);
  });

  it("excludes a room missing one selected item", () => {
    expect(roomMatchesFilter(rooms[0], { attendees: 1, equipment: ["Projector", "Microphone"] })).toBe(false);
  });

  it("matches everything when no equipment is selected", () => {
    expect(filterRooms(rooms, { attendees: 1, equipment: [] })).toHaveLength(4);
  });

  it("uses exact string matching (case-sensitive)", () => {
    expect(roomMatchesFilter(rooms[0], { attendees: 1, equipment: ["projector"] })).toBe(false);
  });
});

describe("F3 blocked rooms stay visible in the filter", () => {
  it("returns a blocked room that matches the filter", () => {
    const ids = filterRooms(rooms, { attendees: 10, equipment: ["Projector"] }).map((r) => r.id);
    expect(ids).toContain("B");
  });
});

describe("F4 empty result", () => {
  it("returns an empty array when nothing matches", () => {
    expect(filterRooms(rooms, { attendees: 100, equipment: [] })).toEqual([]);
  });
});

describe("purity", () => {
  it("does not mutate the input array or rooms", () => {
    const before = JSON.stringify(rooms);
    filterRooms(rooms, { attendees: 20, equipment: ["Projector"] });
    expect(JSON.stringify(rooms)).toBe(before);
  });

  it("rejects a non-finite attendee count", () => {
    expect(roomMatchesFilter(rooms[0], { attendees: NaN, equipment: [] })).toBe(false);
  });
});
