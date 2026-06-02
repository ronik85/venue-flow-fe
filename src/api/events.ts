import api from './axios';
import type { AxiosResponse } from 'axios';

interface EventListParams { page?: number; limit?: number; search?: string; status?: string; venueId?: string; sortBy?: string; sortOrder?: string; }
interface EventSeatParams { status?: string; row?: string; sortBy?: string; sortOrder?: string; }

export const listEvents = (params?: EventListParams): Promise<AxiosResponse> => api.get('/events', { params });
export const getEvent = (id: string): Promise<AxiosResponse> => api.get(`/events/${id}`);
export const getEventSeats = (id: string, params?: EventSeatParams): Promise<AxiosResponse> => api.get(`/events/${id}/seats`, { params });
export const createEvent = (data: { title: string; description?: string; startTime: string; venueId: string; defaultPrice: number }): Promise<AxiosResponse> => api.post('/events', data);
export const updateEvent = (id: string, data: Record<string, unknown>): Promise<AxiosResponse> => api.patch(`/events/${id}`, data);
export const publishEvent = (id: string): Promise<AxiosResponse> => api.patch(`/events/${id}/publish`);
export const deleteEvent = (id: string): Promise<AxiosResponse> => api.delete(`/events/${id}`);
