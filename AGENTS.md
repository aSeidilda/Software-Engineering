# AGENTS.md

## Project
Smart Campus room availability checker. One room view, fictional bookings, fixed current time. Availability decision only.

## Key files
- Booking rules: `src/lib/availability.ts` (`checkAvailability`, `intervalsOverlap`)
- Time helpers: `src/lib/timeUtils.ts` (`minutesToLabel`, `labelToMinutesRaw`)
- Fixtures: `src/lib/data.ts` (`ROOMS`)
- UI: `src/App.tsx`, `src/components/`
- Tests: `src/lib/availability.test.ts`

## Constraints
- Preserve AC1–AC6 behavior exactly (see below).
- No backend, login, database, or saved booking creation.
- Keep the existing UI layout and visible text.

## Acceptance criteria
- AC1: reject start >= end and past start times.
- AC2: reject durations longer than 120 minutes.
- AC3: reject a blocked room.
- AC4: reject overlaps; bookings touching only at endpoints are allowed.
- AC5: do not mutate booking data or fixtures.
- AC6: keep clear desktop/mobile feedback reasons.

## Engineering rules
- Prefer pure functions and minimal changes.
- Use at most 2 justified design patterns.
- Do not mutate booking fixtures.
- Do not delete or weaken existing test assertions.

## Verification commands
- `npm test` (Vitest)
- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Reporting
Report changed files, the rationale for each change, and the test output (pass/fail counts).