import { MapPin, Users, Tag, Lock, Check } from "lucide-react";
import type { Room } from "@/lib/availability";
import { minutesToLabel } from "@/lib/timeUtils";

interface Props {
  room: Room;
  selectedBookings: { id: string; title: string; start: number; end: number }[];
}

export default function RoomDetails({ room, selectedBookings }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="relative h-44 w-full overflow-hidden sm:h-52">
        <img
          src={room.image}
          alt={room.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h2 className="text-xl font-bold text-white sm:text-2xl">{room.name}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-200">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {room.building}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" /> {room.capacity} seats
            </span>
            <span className="flex items-center gap-1">
              <Tag className="h-4 w-4" /> {room.type}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {room.blocked && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <Lock className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>
              <strong>Room blocked:</strong> {room.blockedReason}
            </span>
          </div>
        )}

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Facilities
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {room.facilities.map((f) => (
              <span
                key={f}
                className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-sm text-slate-700"
              >
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                {f}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Existing Bookings ({room.bookings.length})
          </h3>
          {room.bookings.length === 0 ? (
            <p className="mt-1 text-sm text-slate-400">No existing bookings.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {room.bookings.map((b) => {
                return (
                  <li
                    key={b.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-700">{b.title}</p>
                      <p className="text-xs text-slate-400">by {b.organizer}</p>
                    </div>
                    <span className="font-mono text-xs text-slate-500">
                      {minutesToLabel(b.start)}–{minutesToLabel(b.end)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
