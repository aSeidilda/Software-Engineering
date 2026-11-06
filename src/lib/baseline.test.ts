import { it, expect } from "vitest";
import { writeFileSync, readFileSync } from "node:fs";
import { checkAvailability } from "./availability";
import { ROOMS } from "./data";

// [label, roomIndex, start, end, now]
const cases: [string, number, number, number, number][] = [
  ["past start, no overlap (540-570, room 205, now 720)", 2, 540, 570, 720],
  ["touching before and after bookings (630-660, room 301, now 600)", 0, 630, 660, 600],
  ["touching after booking only (720-780, room 301, now 600)", 0, 720, 780, 600],
  ["partial overlap (700-750, room 301, now 600)", 0, 700, 750, 600],
  ["contains booking (650-740, room 301, now 600)", 0, 650, 740, 600],
  ["identical to booking (660-720, room 301, now 600)", 0, 660, 720, 600],
  ["exactly 120 min, touching both sides (720-840, room 301, now 600)", 0, 720, 840, 600],
  ["121 minutes (720-841, room 301, now 600)", 0, 720, 841, 600],
  ["blocked room, valid slot (800-860, room 102, now 720)", 1, 800, 860, 720],
  ["reversed interval (750-720, room 301, now 600)", 0, 750, 720, 600],
  ["zero duration (720-720, room 301, now 600)", 0, 720, 720, 600],
  ["end past 1440 (1380-1441, room 205, now 600)", 2, 1380, 1441, 600],
  ["outside campus hours (360-420, room 205, now 300)", 2, 360, 420, 300],
];

it("matches the recorded baseline", () => {
  const lines: string[] = [];
  for (const [label, idx, start, end, now] of cases) {
    const room = ROOMS[idx];
    const before = JSON.stringify(room.bookings);
    const res = checkAvailability(room, start, end, now);
    if (JSON.stringify(room.bookings) !== before) throw new Error("mutated: " + label);
    lines.push(`## ${label}`);
    lines.push(`input: room=${room.id} start=${start} end=${end} now=${now}`);
    if (res.status === "available") {
      lines.push("status: available");
    } else {
      lines.push("status: unavailable");
      res.reasons.forEach((r, i) => lines.push(`reason[${i}]: ${r}`));
    }
    lines.push("");
  }
  const output = lines.join("\n");
  writeFileSync("baseline-after.txt", output);
  const baseline = readFileSync("baseline.txt", "utf8");
  expect(output).toBe(baseline); 
});