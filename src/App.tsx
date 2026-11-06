import { useState, useMemo } from "react";
import { Building2, Clock, Info, Users, Filter } from "lucide-react";
import RoomSelector from "@/components/RoomSelector";
import RoomDetails from "@/components/RoomDetails";
import TimeRangeSelector from "@/components/TimeRangeSelector";
import DayTimeline from "@/components/DayTimeline";
import AvailabilityResultPanel from "@/components/AvailabilityResultPanel";
import { ROOMS } from "@/lib/data";
import { checkAvailability } from "@/lib/availability";
import { filterRooms, type RoomFilter } from "@/lib/roomFilter";
import { labelToMinutesRaw, minutesToLabel } from "@/lib/timeUtils";
import type { Minute } from "@/lib/timeUtils";

const EQUIPMENT_OPTIONS = [
  "Projector",
  "Microphone",
  "Whiteboard",
  "Sink",
  "Air Conditioning",
];

function App() {
  const rooms = ROOMS;

  const [attendeesLabel, setAttendeesLabel] = useState("1");
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);

  const filter: RoomFilter = useMemo(() => {
    const parsed = parseInt(attendeesLabel, 10);
    const attendees = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
    return { attendees, equipment: selectedEquipment };
  }, [attendeesLabel, selectedEquipment]);

  const visibleRooms = useMemo(() => filterRooms(rooms, filter), [rooms, filter]);

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(rooms[0]?.id ?? null);
  const [startLabel, setStartLabel] = useState("810");
  const [endLabel, setEndLabel] = useState("870");
  const [nowLabel, setNowLabel] = useState("720");

  const attendeesError =
    attendeesLabel.trim() !== "" && (!/^\d+$/.test(attendeesLabel.trim()) || parseInt(attendeesLabel, 10) <= 0)
      ? "Enter a whole number ≥ 1."
      : undefined;

  const effectiveSelectedRoomId = useMemo(() => {
    if (visibleRooms.length === 0) return null;
    if (selectedRoomId && visibleRooms.some((r) => r.id === selectedRoomId)) {
      return selectedRoomId;
    }
    return visibleRooms[0].id;
  }, [visibleRooms, selectedRoomId]);

  const nowParsed = useMemo(() => labelToMinutesRaw(nowLabel), [nowLabel]);
  const nowMinutes: Minute = nowParsed !== null ? nowParsed : 0;
  const nowError =
    nowLabel.trim() !== "" && nowParsed === null
      ? "Enter a number 0–1440."
      : undefined;

  const selectedRoom = rooms.find((r) => r.id === effectiveSelectedRoomId) ?? null;

  const startMin = useMemo(() => labelToMinutesRaw(startLabel), [startLabel]);
  const endMin = useMemo(() => labelToMinutesRaw(endLabel), [endLabel]);

  const startError =
    startLabel.trim() !== "" && startMin === null
      ? "Enter a number 0–1440."
      : undefined;
  const endError =
    endLabel.trim() !== "" && endMin === null
      ? "Enter a number 0–1440."
      : undefined;

  const canCheck =
    selectedRoom !== null && startMin !== null && endMin !== null;

  const result = useMemo(() => {
    if (!selectedRoom || startMin === null || endMin === null) return null;
    return checkAvailability(selectedRoom, startMin, endMin, nowMinutes);
  }, [selectedRoom, startMin, endMin, nowMinutes]);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 sm:text-xl">
                Smart Campus Room Booking
              </h1>
              <p className="text-xs text-slate-500 sm:text-sm">
                Check a room&apos;s availability before requesting a booking.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Prototype notice */}
        <div className="mb-6 flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-700">
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>
            Prototype: one room at a time, fictional data, no login or backend. Availability
            is checked only — no booking is saved.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          {/* Left column: filters + room selector */}
          <section className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                <Filter className="h-4 w-4" /> Filter Rooms
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
                    <Users className="h-4 w-4 text-slate-400" />
                    Attendees
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={attendeesLabel}
                    onChange={(e) => setAttendeesLabel(e.target.value)}
                    placeholder="1"
                    className={`w-full rounded-lg border px-3 py-2 font-mono text-base outline-none transition-colors ${
                      attendeesError
                        ? "border-red-300 bg-red-50 focus:border-red-400"
                        : "border-slate-300 bg-white focus:border-blue-400"
                    }`}
                  />
                  {attendeesError && (
                    <p className="mt-0.5 text-xs text-red-600">{attendeesError}</p>
                  )}
                </div>

                <div>
                  <span className="mb-1.5 block text-xs font-medium text-slate-500">
                    Equipment
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {EQUIPMENT_OPTIONS.map((item) => {
                      const checked = selectedEquipment.includes(item);
                      return (
                        <label
                          key={item}
                          className="flex items-center gap-2 text-sm text-slate-700"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              setSelectedEquipment((prev) =>
                                prev.includes(item)
                                  ? prev.filter((i) => i !== item)
                                  : [...prev, item]
                              );
                            }}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-400"
                          />
                          {item}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Select a Room
              </h2>
              {visibleRooms.length > 0 ? (
                <RoomSelector
                  rooms={visibleRooms}
                  selectedId={effectiveSelectedRoomId}
                  onSelect={setSelectedRoomId}
                />
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                  <p className="text-sm text-slate-400">
                    No rooms match your filters.
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Try fewer attendees or less equipment.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Right column: details + checker */}
          <section className="space-y-6">
            {selectedRoom ? (
              <>
                <RoomDetails
                  room={selectedRoom}
                  selectedBookings={selectedRoom.bookings}
                />

                {/* Availability checker card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
                  <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-800">
                    <Clock className="h-5 w-5 text-blue-500" />
                    Check Availability
                  </h2>

                  <TimeRangeSelector
                    startLabel={startLabel}
                    endLabel={endLabel}
                    onStartChange={setStartLabel}
                    onEndChange={setEndLabel}
                    startMinutes={startMin}
                    endMinutes={endMin}
                    nowLabel={nowLabel}
                    onNowChange={setNowLabel}
                    nowMinutes={nowMinutes}
                    nowError={nowError}
                    startError={startError}
                    endError={endError}
                  />

                  <div className="mt-6">
                    <DayTimeline
                      bookings={selectedRoom.bookings}
                      candidateStart={startMin}
                      candidateEnd={endMin}
                      nowMinutes={nowMinutes}
                    />
                  </div>

                  <div className="mt-6">
                    {canCheck && result ? (
                      <AvailabilityResultPanel
                        result={result}
                        start={startMin}
                        end={endMin}
                      />
                    ) : (
                      <AvailabilityResultPanel
                        result={null}
                        start={startMin}
                        end={endMin}
                      />
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <p className="text-sm text-slate-400">
                  No room selected. Adjust the filters to see available rooms.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 text-center text-xs text-slate-400 sm:px-6">
          Smart Campus Room Booking · Prototype v1 · Current time:{" "}
          {minutesToLabel(nowMinutes)}
        </div>
      </footer>
    </div>
  );
}

export default App;
