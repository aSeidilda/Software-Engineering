import type { Room } from "./availability";

export const ROOMS: Room[] = [
  {
    id: "room-301",
    name: "Innovation Lab 301",
    building: "Tech Building A",
    floor: 3,
    capacity: 24,
    type: "Computer Lab",
    blocked: false,
    image:
      "https://images.pexels.com/photos/2074516/pexels-photo-2074516.jpeg?auto=compress&cs=tinysrgb&w=1200",
    facilities: ["Projector", "Whiteboard", "24 PCs", "Air Conditioning"],
    bookings: [
      { id: "b1", title: "Data Structures Workshop", organizer: "Dr. Chen", start: 9 * 60, end: 10 * 60 + 30 },
      { id: "b2", title: "AI Study Group", organizer: "M. Patel", start: 11 * 60, end: 12 * 60 },
      { id: "b3", title: "Project Sprint", organizer: "Team Alpha", start: 14 * 60, end: 15 * 60 + 30 },
      { id: "b4", title: "Open Lab Session", organizer: "Lab Staff", start: 16 * 60, end: 17 * 60 },
    ],
  },
  {
    id: "room-102",
    name: "Seminar Room 102",
    building: "Humanities Block",
    floor: 1,
    capacity: 12,
    type: "Seminar Room",
    blocked: true,
    blockedReason: "Flood damage — under repair until Oct 15",
    image:
      "https://images.pexels.com/photos/2074516/pexels-photo-2074516.jpeg?auto=compress&cs=tinysrgb&w=1200",
    facilities: ["Projector", "Round Table", "Air Conditioning"],
    bookings: [],
  },
  {
    id: "room-205",
    name: "Design Studio 205",
    building: "Arts & Design Wing",
    floor: 2,
    capacity: 18,
    type: "Studio",
    blocked: false,
    image:
      "https://images.pexels.com/photos/2074516/pexels-photo-2074516.jpeg?auto=compress&cs=tinysrgb&w=1200",
    facilities: ["Drawing Tables", "Natural Light", "Sink", "Storage"],
    bookings: [
      { id: "b5", title: "Sketching Tutorial", organizer: "Prof. Lee", start: 10 * 60, end: 11 * 60 + 30 },
      { id: "b6", title: "Portfolio Review", organizer: "S. Garcia", start: 13 * 60, end: 14 * 60 },
      { id: "b7", title: "Life Drawing", organizer: "Open Session", start: 15 * 60 + 30, end: 16 * 60 + 30 },
    ],
  },
  {
    id: "room-110",
    name: "Lecture Hall 110",
    building: "Science Block",
    floor: 1,
    capacity: 60,
    type: "Lecture Hall",
    blocked: false,
    image:
      "https://images.pexels.com/photos/2074516/pexels-photo-2074516.jpeg?auto=compress&cs=tinysrgb&w=1200",
    facilities: ["Projector", "Microphone", "Air Conditioning"],
    bookings: [
      { id: "b8", title: "Guest Lecture", organizer: "Dr. Park", start: 13 * 60, end: 14 * 60 },
    ],
  },
];
