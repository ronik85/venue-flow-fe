import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/Layout/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import VenueListPage from './pages/venues/VenueListPage';
import VenueDetailPage from './pages/venues/VenueDetailPage';
import CreateVenuePage from './pages/venues/CreateVenuePage';

import EventListPage from './pages/events/EventListPage';
import EventDetailPage from './pages/events/EventDetailPage';
import CreateEventPage from './pages/events/CreateEventPage';

import MyBookingsPage from './pages/bookings/MyBookingsPage';
import BookingDetailPage from './pages/bookings/BookingDetailPage';
import AdminBookingsPage from './pages/bookings/AdminBookingsPage';

export default function App() {
  return (
    <Routes>
      {/* Auth pages — GuestRoute redirects logged-in users */}
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

      {/* App pages — with navbar */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/events" replace />} />
        <Route path="/events" element={<EventListPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route path="/venues" element={<VenueListPage />} />
        <Route path="/venues/:id" element={<VenueDetailPage />} />

        {/* Protected — any authenticated user */}
        <Route path="/bookings/me" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
        <Route path="/bookings/:id" element={<ProtectedRoute><BookingDetailPage /></ProtectedRoute>} />

        {/* Protected — Organizer/Admin only */}
        <Route path="/venues/new" element={<ProtectedRoute roles={['ORGANIZER', 'ADMIN']}><CreateVenuePage /></ProtectedRoute>} />
        <Route path="/events/new" element={<ProtectedRoute roles={['ORGANIZER', 'ADMIN']}><CreateEventPage /></ProtectedRoute>} />

        {/* Protected — Admin only */}
        <Route path="/admin/bookings" element={<ProtectedRoute roles={['ADMIN']}><AdminBookingsPage /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/events" replace />} />
    </Routes>
  );
}
