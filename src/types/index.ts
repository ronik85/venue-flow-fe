/* ─── Auth ──────────────────────────────────────────────────────────────────── */
export type UserRole = "USER" | "ADMIN" | "ORGANIZER";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}

export interface Session {
  id: string;
  userAgent?: string;
  ipAddress?: string;
  isActive: boolean;
  createdAt: string;
  expiresAt: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

/* ─── Venue ─────────────────────────────────────────────────────────────────── */
export interface Seat {
  id: string;
  row: string;
  seatNumber: string;
  isAccessible: boolean;
  sectionId: string;
}

export interface VenueSection {
  id: string;
  name: string;
  venueId: string;
  seats?: Seat[];
}

export interface Venue {
  id: string;
  name: string;
  city: string;
  address: string;
  sections?: VenueSection[];
  createdAt: string;
}

/* ─── Events ────────────────────────────────────────────────────────────────── */
export type EventStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "CANCELLED"
  | "POSTPONED"
  | "COMPLETED";
export type EventSeatStatus = "AVAILABLE" | "LOCKED" | "BOOKED";

/** Payload emitted by the backend on the `seat:update` WebSocket event */
export interface SeatStatusChange {
  id: string;
  status: EventSeatStatus;
}

export interface SeatUpdatePayload {
  eventId: string;
  seats: SeatStatusChange[];
}

export interface EventSeat {
  id: string;
  row: string;
  seatNumber: string;
  price: string;
  status: EventSeatStatus;
  sectionName?: string;
  seat?: Seat & { section?: VenueSection };
}

export interface VenueEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  status: EventStatus;
  venueId: string;
  organizerId: string;
  venue?: Venue;
  eventSeats?: EventSeat[];
  createdAt: string;
}

/* ─── Bookings ──────────────────────────────────────────────────────────────── */
export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "EXPIRED";
export type TicketStatus = "ACTIVE" | "USED" | "CANCELLED";

export interface BookingItem {
  id: string;
  bookingId: string;
  eventSeatId: string;
  priceAtBooking: string;
  eventSeat?: EventSeat;
}

export interface Booking {
  id: string;
  userId: string;
  eventId: string;
  status: BookingStatus;
  totalAmount: string;
  cancelledAt?: string;
  expiresAt?: string;
  cancellationReason?: string;
  event?: VenueEvent;
  user?: User;
  items?: BookingItem[];
  createdAt: string;
  // Ticket fields (populated after CONFIRMED)
  ticketNumber?: string;
  qrPayload?: string;
  ticketStatus?: TicketStatus;
  issuedAt?: string;
  checkedInAt?: string;
}

/* ─── Ticket Details (GET /tickets/:bookingId response shape) ───────────────── */
export interface TicketSeat {
  bookingItemId: string;
  priceAtBooking: string;
  seat: {
    id: string;
    row: string;
    seatNumber: string;
    section: { id: string; name: string } | null;
  } | null;
}

export interface TicketDetails {
  ticketNumber: string | null;
  ticketStatus: TicketStatus | null;
  qrPayload: string | null;
  issuedAt: string | null;
  checkedInAt: string | null;
  booking: {
    id: string;
    status: BookingStatus;
    totalAmount: string;
    createdAt: string;
  };
  customer: {
    id: string;
    name?: string;
    email: string;
  };
  event: {
    id: string;
    title: string;
    startTime: string;
    venue: { id: string; name: string; address?: string } | null;
  };
  seats: TicketSeat[];
}

/* ─── API Responses ─────────────────────────────────────────────────────────── */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  message: string;
  data: T[];
  meta: PaginationMeta;
}

export interface SingleResponse<T> {
  message: string;
  data: T;
}
