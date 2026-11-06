import type { Minute } from "@/lib/timeUtils";
import { minutesToLabel, OPENING_MINUTES, CLOSING_MINUTES } from "@/lib/timeUtils";
import type { Booking } from "@/lib/availability";

interface Props {
  bookings: Booking[];
  candidateStart: Minute | null;
  candidateEnd: Minute | null;
  nowMinutes: Minute;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function DayTimeline({
  bookings,
  candidateStart,
  candidateEnd,
  nowMinutes,
}: Props) {
  const dayWidth = CLOSING_MINUTES - OPENING_MINUTES;

  function pct(min: Minute) {
    return ((min - OPENING_MINUTES) / dayWidth) * 100;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-700">Today&apos;s Timeline (07:00 – 22:00)</h3>
      <div className="relative h-20 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
        {/* hour grid lines */}
        {HOURS.filter((h) => h >= 7 && h <= 22).map((h) => (
          <div
            key={h}
            className="absolute top-0 bottom-0 border-l border-slate-200"
            style={{ left: `${pct(h * 60)}%` }}
          >
            <span className="absolute bottom-0.5 -translate-x-1/2 text-[9px] text-slate-400">
              {minutesToLabel(h * 60)}
            </span>
          </div>
        ))}

        {/* existing bookings */}
        {bookings.map((b) => (
          <div
            key={b.id}
            className="absolute top-2 bottom-5 rounded-md bg-slate-300/90 px-1 flex items-center overflow-hidden"
            style={{
              left: `${pct(b.start)}%`,
              width: `${pct(b.end) - pct(b.start)}%`,
            }}
            title={`${b.title}: ${minutesToLabel(b.start)}–${minutesToLabel(b.end)}`}
          >
            <span className="truncate text-[9px] font-medium text-slate-700">{b.title}</span>
          </div>
        ))}

        {/* candidate interval */}
        {candidateStart !== null && candidateEnd !== null && candidateStart < candidateEnd && (
          <div
            className="absolute top-2 bottom-5 rounded-md border-2 border-dashed border-blue-500 bg-blue-400/30 flex items-center justify-center"
            style={{
              left: `${pct(candidateStart)}%`,
              width: `${pct(candidateEnd) - pct(candidateStart)}%`,
            }}
          >
            <span className="text-[9px] font-bold text-blue-700">Your slot</span>
          </div>
        )}

        {/* current time marker */}
        {nowMinutes >= OPENING_MINUTES && nowMinutes <= CLOSING_MINUTES && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-amber-400"
            style={{ left: `${pct(nowMinutes)}%` }}
          >
            <span className="absolute top-0 -translate-x-1/2 rounded bg-amber-400 px-1 text-[8px] font-bold text-white">
              NOW
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-slate-300" /> Existing booking
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded border-2 border-dashed border-blue-500 bg-blue-200" /> Your proposed slot
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-0.5 bg-amber-400" /> Current time
        </span>
      </div>
    </div>
  );
}
