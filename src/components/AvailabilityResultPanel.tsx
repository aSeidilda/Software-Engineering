import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import type { AvailabilityResult } from "@/lib/availability";
import { minutesToLabel, durationLabel } from "@/lib/timeUtils";
import type { Minute } from "@/lib/timeUtils";

interface Props {
  result: AvailabilityResult | null;
  start: Minute | null;
  end: Minute | null;
}

export default function AvailabilityResultPanel({ result, start, end }: Props) {
  if (!result || start === null || end === null) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
        <AlertTriangle className="mx-auto h-6 w-6 text-slate-300" />
        <p className="mt-2 text-sm text-slate-400">
          Enter a start and end time to check availability.
        </p>
      </div>
    );
  }

  if (result.status === "available") {
    return (
      <div className="animate-fadeIn rounded-xl border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500">
            <CheckCircle2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-lg font-bold text-emerald-800">Available</p>
            <p className="text-sm text-emerald-600">
              {minutesToLabel(start)} – {minutesToLabel(end)} ({durationLabel(start, end)}) is open.
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs text-emerald-500">
          This is a prototype — no booking is saved or confirmed.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn rounded-xl border border-red-200 bg-red-50 p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-500">
          <XCircle className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-lg font-bold text-red-800">Unavailable</p>
          <p className="text-sm text-red-600">
            This time slot can&apos;t be booked.
          </p>
        </div>
      </div>
      <ul className="mt-3 space-y-1.5">
        {result.reasons.map((r, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-red-700">
            <span className="mt-1.5 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />
            {r}
          </li>
        ))}
      </ul>
    </div>
  );
}
