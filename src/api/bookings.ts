import api from './axios';
import type { AxiosResponse } from 'axios';

interface BookingListParams { page?: number; limit?: number; status?: string; eventId?: string; userId?: string; sortBy?: string; sortOrder?: string; }

export const createBooking = (data: { eventId: string; eventSeatIds: string[] }): Promise<AxiosResponse> => api.post('/bookings', data);
export const getMyBookings = (params?: BookingListParams): Promise<AxiosResponse> => api.get('/bookings/me', { params });
export const getBooking = (id: string): Promise<AxiosResponse> => api.get(`/bookings/${id}`);
export const confirmBooking = (id: string): Promise<AxiosResponse> => api.patch(`/bookings/${id}/confirm`);
export const cancelBooking = (id: string, data: { reason?: string } = {}): Promise<AxiosResponse> => api.delete(`/bookings/${id}`, { data });
export const adminListBookings = (params?: BookingListParams): Promise<AxiosResponse> => api.get('/bookings', { params });
