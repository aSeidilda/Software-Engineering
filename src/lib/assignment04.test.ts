import { describe, it, expect } from "vitest";
import { ROOMS } from "./data";
import { checkAvailability } from "./availability";
import { filterRooms } from "./roomFilter";

const byId = (id: string) => {
  const room = ROOMS.find((r) => r.id === id);
  if (!room) throw new Error(`missing room ${id}`);
  return room;
};
const ids = (rooms: { id: string }[]) => rooms.map((r) => r.id);

describe("F1 capacity: exact vs insufficient", () => {
  it("F1-a: room-301 (capacity 24) passes for exactly 24 attendees", () => {
    expect(ids(filterRooms(ROOMS, { attendees: 24, equipment: [] }))).toContain("room-301");
  });
  it("F1-b: room-301 is excluded for 25 attendees", () => {
    expect(ids(filterRooms(ROOMS, { attendees: 25, equipment: [] }))).not.toContain("room-301");
  });
});

describe("F2 equipment: all selected items required", () => {
  it("F2-a: Projector + Microphone returns only room-110", () => {
    expect(ids(filterRooms(ROOMS, { attendees: 1, equipment: ["Projector", "Microphone"] }))).toEqual(["room-110"]);
  });
  it("F2-b: Sink returns only room-205", () => {
    expect(ids(filterRooms(ROOMS, { attendees: 1, equipment: ["Sink"] }))).toEqual(["room-205"]);
  });
});

describe("F3 blocked rooms", () => {
  it("F3-a: blocked room-102 stays visible in a matching filter", () => {
    expect(ids(filterRooms(ROOMS, { attendees: 1, equipment: ["Projector"] }))).toContain("room-102");
  });
  it("F3-b: blocked room-102 is never reported available", () => {
    const res = checkAvailability(byId("room-102"), 800, 860, 720);
    expect(res.status).toBe("unavailable");
    expect(res.status === "unavailable" && res.reasons.join(" ")).toMatch(/blocked/i);
  });
});

describe("F4 empty state", () => {
  it("F4: no room matches 100 attendees", () => {
    expect(filterRooms(ROOMS, { attendees: 100, equipment: [] })).toEqual([]);
  });
});

describe("F5 switching rooms uses the chosen room's bookings (integration)", () => {
  it("F5-a: the same interval gives different results for two rooms", () => {
    // 630–660 touches room-301 bookings (540–630, 660–720) → available
    expect(checkAvailability(byId("room-301"), 630, 660, 600).status).toBe("available");
    // room-205 has 600–690 → overlap
    expect(checkAvailability(byId("room-205"), 630, 660, 600).status).toBe("unavailable");
  });
  it("F5-b: a room chosen from the filtered list is checked with its own bookings", () => {
    const [first] = filterRooms(ROOMS, { attendees: 1, equipment: ["Sink"] });
    expect(first.id).toBe("room-205");
    const res = checkAvailability(first, 630, 660, 600);
    expect(res.status).toBe("unavailable");
  });
});

describe("Boundaries: 120 vs 121 minutes, touching vs overlapping", () => {
  it("BND-120: exactly 120 minutes is available (720–840, room-301)", () => {
    expect(checkAvailability(byId("room-301"), 720, 840, 600).status).toBe("available");
  });
  it("BND-121: 121 minutes is rejected with the 120-minute reason", () => {
    const res = checkAvailability(byId("room-301"), 720, 841, 600);
    expect(res.status === "unavailable" && res.reasons.join(" ")).toMatch(/120 minutes/);
  });
  it("BND-touch: booking that touches endpoints is allowed (630–660, room-301)", () => {
    expect(checkAvailability(byId("room-301"), 630, 660, 600).status).toBe("available");
  });
  it("BND-overlap: partial overlap is rejected (700–750, room-301)", () => {
    expect(checkAvailability(byId("room-301"), 700, 750, 600).status).toBe("unavailable");
  });
});