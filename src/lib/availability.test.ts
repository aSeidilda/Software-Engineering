import { describe, it, expect } from "vitest";
import { checkAvailability, type Room, type Booking } from "@/lib/availability";
import { ROOMS } from "@/lib/data";

// ── Fixtures ────────────────────────────────────────────────────────────

const NOW = 540; // 09:00

function makeBooking(
  start: number,
  end: number,
  overrides: Partial<Booking> = {}
): Booking {
  return {
    id: `b-${start}-${end}`,
    title: "Existing Booking",
    organizer: "Staff",
    start,
    end,
    ...overrides,
  };
}

function makeRoom(overrides: Partial<Room> = {}): Room {
  return {
    id: "room-test",
    name: "Test Room",
    building: "Test Building",
    floor: 1,
    capacity: 20,
    type: "Lab",
    blocked: false,
    image: "",
    facilities: [],
    bookings: [makeBooking(600, 660)], // 10:00–11:00
    ...overrides,
  };
}

/** Deep clone bookings so tests can detect mutation against a pristine copy. */
function snapshotBookings(room: Room): Booking[] {
  return room.bookings.map((b) => ({ ...b }));
}

/** Type-narrow helper: assert unavailable and return reasons, or fail. */
function expectUnavailable(result: ReturnType<typeof checkAvailability>): string[] {
  expect(result.status).toBe("unavailable");
  if (result.status === "unavailable") return result.reasons;
  throw new Error("unreachable");
}

// ── AC1: interval validity & start-after-now ─────────────────────────────

describe("checkAvailability — AC1 (interval validity & after-now)", () => {
  it("T02: 540–570 start == now → unavailable, reason cites after-now", () => {
    const room = makeRoom();
    const reasons = expectUnavailable(checkAvailability(room, 540, 570, NOW));
    expect(reasons.some((r) => r.includes("after the current time"))).toBe(true);
  });

  it("T03: 720–720 zero duration → unavailable, reason cites interval rule", () => {
    const room = makeRoom();
    const reasons = expectUnavailable(checkAvailability(room, 720, 720, NOW));
    expect(reasons.some((r) => r.includes("0 ≤ start < end ≤ 1440"))).toBe(true);
  });

  it("T04: 750–720 reversed → unavailable, reason cites interval rule", () => {
    const room = makeRoom();
    const reasons = expectUnavailable(checkAvailability(room, 750, 720, NOW));
    expect(reasons.some((r) => r.includes("0 ≤ start < end ≤ 1440"))).toBe(true);
  });

  it("T05: 1380–1441 end > 1440 → unavailable, reason cites interval rule", () => {
    const room = makeRoom();
    const reasons = expectUnavailable(checkAvailability(room, 1380, 1441, NOW));
    expect(reasons.some((r) => r.includes("0 ≤ start < end ≤ 1440"))).toBe(true);
  });

  // Boundary: start exactly one minute after now — the smallest valid start.
  // Uses 541–560 to stay clear of the existing 600–660 booking.
  it("AC1-B1: 541–560 start = now+1 → available (boundary of after-now rule)", () => {
    const room = makeRoom();
    const result = checkAvailability(room, 541, 560, NOW);
    expect(result.status).toBe("available");
  });

  // Boundary: end exactly 1440 — the maximum allowed end per AC1.
  it("AC1-B2: 1300–1440 end = 1440 exactly → unavailable (campus hours, but AC1 interval valid)", () => {
    const room = makeRoom();
    const reasons = expectUnavailable(checkAvailability(room, 1300, 1440, NOW));
    // AC1 interval is valid (start < end, end ≤ 1440) — should NOT cite interval rule
    expect(reasons.some((r) => r.includes("0 ≤ start < end ≤ 1440"))).toBe(false);
  });

  // Boundary: negative start — should be rejected by AC1.
  it("AC1-B3: -1–60 negative start → unavailable, reason cites interval rule", () => {
    const room = makeRoom();
    const reasons = expectUnavailable(checkAvailability(room, -1, 60, NOW));
    expect(reasons.some((r) => r.includes("0 ≤ start < end ≤ 1440"))).toBe(true);
  });
});

// ── AC2: max 120 minutes ──────────────────────────────────────────────────

describe("checkAvailability — AC2 (max 120 minutes)", () => {
  it("T06: 720–840 exactly 120 min → available", () => {
    const room = makeRoom();
    const result = checkAvailability(room, 720, 840, NOW);
    expect(result.status).toBe("available");
  });

  it("T07: 720–841 = 121 min → unavailable, reason cites 120-min limit", () => {
    const room = makeRoom();
    const reasons = expectUnavailable(checkAvailability(room, 720, 841, NOW));
    expect(reasons.some((r) => r.includes("120 minutes"))).toBe(true);
  });

  // Boundary: 119 minutes — just under the limit, should be available.
  it("AC2-B1: 720–839 = 119 min → available", () => {
    const room = makeRoom();
    const result = checkAvailability(room, 720, 839, NOW);
    expect(result.status).toBe("available");
  });
});

// ── AC3: room blocked ─────────────────────────────────────────────────────

describe("checkAvailability — AC3 (room blocked)", () => {
  it("T13: 660–720 valid slot but room blocked → unavailable, reason cites blocked", () => {
    const room = makeRoom({ blocked: true, blockedReason: "Maintenance" });
    const reasons = expectUnavailable(checkAvailability(room, 660, 720, NOW));
    expect(reasons.some((r) => r.includes("blocked"))).toBe(true);
  });

  // Boundary: blocked room with a slot that would otherwise be available — the
  // blocked flag alone must be sufficient to reject.
  it("AC3-B1: blocked room, clean slot, no bookings → unavailable", () => {
    const room = makeRoom({ blocked: true, blockedReason: "Flood", bookings: [] });
    const reasons = expectUnavailable(checkAvailability(room, 660, 720, NOW));
    expect(reasons.some((r) => r.includes("blocked"))).toBe(true);
  });
});

// ── AC4: overlap detection, touching endpoints allowed ────────────────────

describe("checkAvailability — AC4 (overlap detection, touching allowed)", () => {
  it("T01: 660–720 touching after existing → available", () => {
    const room = makeRoom();
    const result = checkAvailability(room, 660, 720, NOW);
    expect(result.status).toBe("available");
  });

  it("T08: 570–600 touching before existing → available", () => {
    const room = makeRoom();
    const result = checkAvailability(room, 570, 600, NOW);
    expect(result.status).toBe("available");
  });

  it("T09: 630–690 partial overlap → unavailable, reason cites overlap", () => {
    const room = makeRoom();
    const reasons = expectUnavailable(checkAvailability(room, 630, 690, NOW));
    expect(reasons.some((r) => r.includes("Overlaps"))).toBe(true);
  });

  it("T10: 570–690 contains existing booking → unavailable, reason cites overlap", () => {
    const room = makeRoom();
    const reasons = expectUnavailable(checkAvailability(room, 570, 690, NOW));
    expect(reasons.some((r) => r.includes("Overlaps"))).toBe(true);
  });

  it("T11: 615–645 fully inside existing → unavailable, reason cites overlap", () => {
    const room = makeRoom();
    const reasons = expectUnavailable(checkAvailability(room, 615, 645, NOW));
    expect(reasons.some((r) => r.includes("Overlaps"))).toBe(true);
  });

  it("T12: 600–660 identical interval → unavailable, reason cites overlap", () => {
    const room = makeRoom();
    const reasons = expectUnavailable(checkAvailability(room, 600, 660, NOW));
    expect(reasons.some((r) => r.includes("Overlaps"))).toBe(true);
  });

  it("T14: 630–690 with no existing bookings → available", () => {
    const room = makeRoom({ bookings: [] });
    const result = checkAvailability(room, 630, 690, NOW);
    expect(result.status).toBe("available");
  });
});

// ── AC5: booking data unchanged ───────────────────────────────────────────

describe("checkAvailability — AC5 (booking data unchanged)", () => {
  it("AC5: checking availability never mutates room.bookings across mixed decisions", () => {
    const room = makeRoom();
    const before = snapshotBookings(room);

    checkAvailability(room, 660, 720, NOW); // available
    checkAvailability(room, 630, 690, NOW); // unavailable (overlap)
    checkAvailability(room, 540, 570, NOW); // unavailable (AC1 after-now)
    checkAvailability(room, 720, 841, NOW); // unavailable (AC2 over-120)

    expect(room.bookings).toEqual(before);
    expect(room.bookings.length).toBe(1);
    expect(room.bookings[0].start).toBe(600);
    expect(room.bookings[0].end).toBe(660);
  });

  it("AC5: blocked-room check preserves bookings", () => {
    const room = makeRoom({ blocked: true });
    const before = snapshotBookings(room);
    checkAvailability(room, 660, 720, NOW);
    expect(room.bookings).toEqual(before);
  });

  // Boundary: overlap case on a blocked room — the function reads bookings to
  // detect overlap; verify it doesn't mutate them while doing so.
  it("AC5: overlap check on blocked room preserves bookings", () => {
    const room = makeRoom({ blocked: true });
    const before = snapshotBookings(room);
    checkAvailability(room, 630, 690, NOW); // overlap + blocked
    expect(room.bookings).toEqual(before);
  });
});

// ── AC6: validation feedback ──────────────────────────────────────────────
// AC6 requires the page to "give understandable validation feedback" at all
// widths. The function provides the decision + reasons that the UI surfaces.
// At the unit level we verify that every rejection includes at least one
// human-readable reason string (non-empty).

describe("checkAvailability — AC6 (understandable feedback for every rejection)", () => {
  it("AC6: every unavailable result has at least one non-empty reason", () => {
    const room = makeRoom();
    const cases: Array<[number, number]> = [
      [540, 570], // after-now
      [720, 720], // zero duration
      [750, 720], // reversed
      [1380, 1441], // end > 1440
      [720, 841], // over-120
      [630, 690], // overlap
      [600, 660], // identical
    ];
    for (const [s, e] of cases) {
      const reasons = expectUnavailable(checkAvailability(room, s, e, NOW));
      expect(reasons.length).toBeGreaterThan(0);
      expect(reasons.every((r) => r.trim().length > 0)).toBe(true);
    }
  });

  it("AC6: blocked room produces a non-empty reason", () => {
    const room = makeRoom({ blocked: true });
    const reasons = expectUnavailable(checkAvailability(room, 660, 720, NOW));
    expect(reasons.length).toBeGreaterThan(0);
    expect(reasons.every((r) => r.trim().length > 0)).toBe(true);
  });
});

// ── Extra justified cases ──────────────────────────────────────────────────

describe("checkAvailability — extra justified cases", () => {
  // C1: Multiple violations should all be reported, not just the first.
  // This matters because the UI surfaces every reason to the student.
  it("C1: overlapping + over-120 + blocked → unavailable with ≥3 reasons", () => {
    const room = makeRoom({ blocked: true });
    // 590–730 overlaps existing 600–660, is 140 min (>120), and room is blocked
    const reasons = expectUnavailable(checkAvailability(room, 590, 730, NOW));
    expect(reasons.length).toBeGreaterThanOrEqual(3);
  });

  // C2: start == 0 (midnight) with now=540 — start is before now AND before
  // campus opening. Guards the edge where start passes the numeric
  // 0 ≤ start < end check but fails both the after-now and campus-hours rules.
  it("C2: 0–60 start at midnight with now=540 → unavailable, reason cites after-now", () => {
    const room = makeRoom();
    const reasons = expectUnavailable(checkAvailability(room, 0, 60, NOW));
    expect(reasons.some((r) => r.includes("09:00"))).toBe(true);
  });
});

// ── Regression: gaps in AC1 after-now & AC5 fixture immutability ──────────

describe("checkAvailability — regression gaps", () => {
  // Gap R1: start STRICTLY BEFORE now. T02 only covers start == now (540).
  // A slot entirely in the past (start 600, end 660, now 720) must also be
  // rejected by AC1's after-now rule, and the reason must cite the current
  // time so AC6 feedback stays clear.
  it("R1: 600–660 start strictly before now=720 → unavailable, reason cites after-now", () => {
    const room = makeRoom();
    const reasons = expectUnavailable(checkAvailability(room, 600, 660, 720));
    expect(reasons.some((r) => r.includes("after the current time"))).toBe(true);
  });

  // Gap R2: existing AC5 tests use the synthetic makeRoom() helper. This guards
  // the exported ROOMS fixtures in src/lib/data.ts directly — after running
  // checkAvailability against every real room, each room's bookings array must
  // be byte-for-byte identical to a pre-call deep snapshot (AC5).
  it("R2: ROOMS fixtures unchanged after checking every room (AC5)", () => {
    const snapshots = ROOMS.map((room) => ({
      id: room.id,
      bookings: room.bookings.map((b) => ({ ...b })),
    }));

    for (const room of ROOMS) {
      checkAvailability(room, 660, 720, 540);
    }

    for (const room of ROOMS) {
      const snap = snapshots.find((s) => s.id === room.id);
      expect(snap).toBeDefined();
      expect(room.bookings).toEqual(snap!.bookings);
    }
  });
});
