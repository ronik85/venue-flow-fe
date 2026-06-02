/* ─── Auth ──────────────────────────────────────────────────────────────────── */
export type UserRole = 'USER' | 'ADMIN' | 'ORGANIZER';

export interface User {
  id: string;
  email: string;
  role: UserRole;
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
export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'POSTPONED' | 'COMPLETED';
export type EventSeatStatus = 'AVAILABLE' | 'LOCKED' | 'BOOKED';

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
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED';

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
