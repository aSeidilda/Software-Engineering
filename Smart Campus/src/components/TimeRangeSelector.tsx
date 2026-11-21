import { Clock, ArrowRight, Timer } from "lucide-react";
import {
  OPENING_MINUTES,
  CLOSING_MINUTES,
  type Minute,
  minutesToLabel,
} from "@/lib/timeUtils";

interface Props {
  startLabel: string;
  endLabel: string;
  onStartChange: (label: string) => void;
  onEndChange: (label: string) => void;
  startMinutes: Minute | null;
  endMinutes: Minute | null;
  nowLabel: string;
  onNowChange: (label: string) => void;
  nowMinutes: Minute | null;
  nowError?: string;
  startError?: string;
  endError?: string;
}

const QUICK_SLOTS = [
  { label: "09:00 – 10:00", start: "540", end: "600" },
  { label: "11:00 – 12:00", start: "660", end: "720" },
  { label: "13:00 – 14:00", start: "780", end: "840" },
  { label: "15:00 – 16:00", start: "900", end: "960" },
];

export default function TimeRangeSelector({
  startLabel,
  endLabel,
  onStartChange,
  onEndChange,
  startMinutes,
  endMinutes,
  nowLabel,
  onNowChange,
  nowMinutes,
  nowError,
  startError,
  endError,
}: Props) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
          <Clock className="h-4 w-4 text-slate-400" />
          Proposed Booking Time
        </label>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <span className="mb-1 block text-xs text-slate-400">Start (minutes)</span>
            <input
              type="number"
              min={0}
              max={1440}
              value={startLabel}
              onChange={(e) => onStartChange(e.target.value)}
              placeholder="540"
              className={`w-full rounded-lg border px-3 py-2 font-mono text-base outline-none transition-colors ${
                startError
                  ? "border-red-300 bg-red-50 focus:border-red-400"
                  : "border-slate-300 bg-white focus:border-blue-400"
              }`}
            />
            <p className="mt-1 text-xs text-slate-400">
              {startMinutes !== null ? `= ${minutesToLabel(startMinutes)}` : "e.g. 540 = 09:00"}
            </p>
            {startError && <p className="mt-0.5 text-xs text-red-600">{startError}</p>}
          </div>
          <ArrowRight className="mb-7 h-5 w-5 flex-shrink-0 text-slate-300" />
          <div className="flex-1">
            <span className="mb-1 block text-xs text-slate-400">End (minutes)</span>
            <input
              type="number"
              min={0}
              max={1440}
              value={endLabel}
              onChange={(e) => onEndChange(e.target.value)}
              placeholder="600"
              className={`w-full rounded-lg border px-3 py-2 font-mono text-base outline-none transition-colors ${
                endError
                  ? "border-red-300 bg-red-50 focus:border-red-400"
                  : "border-slate-300 bg-white focus:border-blue-400"
              }`}
            />
            <p className="mt-1 text-xs text-slate-400">
              {endMinutes !== null ? `= ${minutesToLabel(endMinutes)}` : "e.g. 600 = 10:00"}
            </p>
            {endError && <p className="mt-0.5 text-xs text-red-600">{endError}</p>}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <Timer className="h-3.5 w-3.5 text-slate-400" />
            Current time (minutes)
          </label>
          <input
            type="number"
            min={0}
            max={1440}
            value={nowLabel}
            onChange={(e) => onNowChange(e.target.value)}
            placeholder="720"
            className={`w-24 rounded-md border px-2 py-1 font-mono text-sm outline-none transition-colors ${
              nowError
                ? "border-red-300 bg-red-50 focus:border-red-400"
                : "border-slate-300 bg-white focus:border-blue-400"
            }`}
          />
          {nowMinutes !== null && (
            <span className="text-xs text-slate-400">= {minutesToLabel(nowMinutes)}</span>
          )}
          {nowError && <p className="text-xs text-red-600">{nowError}</p>}
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Campus hours: {minutesToLabel(OPENING_MINUTES)}–{minutesToLabel(CLOSING_MINUTES)}
          ({OPENING_MINUTES}–{CLOSING_MINUTES} min).
          Max booking length: 120 minutes. Start must be after the current time.
          Enter times as minutes from midnight (e.g. 540 = 09:00).
        </p>
      </div>

      <div>
        <span className="mb-2 block text-xs font-medium text-slate-400">Quick slots</span>
        <div className="flex flex-wrap gap-2">
          {QUICK_SLOTS.map((slot) => {
            const s = parseInt(slot.start, 10);
            const e = parseInt(slot.end, 10);
            const disabled = nowMinutes !== null && s <= nowMinutes;
            return (
              <button
                key={slot.label}
                disabled={disabled}
                onClick={() => {
                  onStartChange(slot.start);
                  onEndChange(slot.end);
                }}
                className={`rounded-lg border px-3 py-1.5 text-sm font-mono transition-all ${
                  disabled
                    ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                {slot.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
