import { Lock, ChevronRight } from "lucide-react";
import type { Room } from "@/lib/availability";

interface Props {
  rooms: Room[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function RoomSelector({ rooms, selectedId, onSelect }: Props) {
  return (
    <div className="space-y-2">
      {rooms.map((room) => {
        const active = room.id === selectedId;
        return (
          <button
            key={room.id}
            onClick={() => onSelect(room.id)}
            className={`w-full flex items-center justify-between gap-3 rounded-xl border p-4 text-left transition-all duration-200 ${
              active
                ? "border-blue-500 bg-blue-50 ring-1 ring-blue-200"
                : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
            }`}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${active ? "text-blue-700" : "text-slate-800"}`}>
                  {room.name}
                </span>
                {room.blocked && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                    <Lock className="h-3 w-3" />
                    Blocked
                  </span>
                )}
              </div>
              <p className="mt-0.5 truncate text-sm text-slate-500">
                {room.building} · Floor {room.floor} · {room.capacity} seats · {room.type}
              </p>
            </div>
            <ChevronRight
              className={`h-5 w-5 flex-shrink-0 transition-transform ${active ? "text-blue-500" : "text-slate-400"}`}
            />
          </button>
        );
      })}
    </div>
  );
}
