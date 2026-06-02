import api from './axios';
import type { AxiosResponse } from 'axios';

interface VenueListParams { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: string; }

export const listVenues = (params?: VenueListParams): Promise<AxiosResponse> => api.get('/venues', { params });
export const getVenue = (id: string): Promise<AxiosResponse> => api.get(`/venues/${id}`);
export const createVenue = (data: { name: string; city: string; address: string }): Promise<AxiosResponse> => api.post('/venues', data);
export const updateVenue = (id: string, data: Partial<{ name: string; city: string; address: string }>): Promise<AxiosResponse> => api.patch(`/venues/${id}`, data);
export const deleteVenue = (id: string): Promise<AxiosResponse> => api.delete(`/venues/${id}`);

export const createSection = (data: { name: string; venueId: string }): Promise<AxiosResponse> => api.post('/venues/sections', data);
export const updateSection = (id: string, data: { name?: string }): Promise<AxiosResponse> => api.patch(`/venues/sections/${id}`, data);
export const deleteSection = (id: string): Promise<AxiosResponse> => api.delete(`/venues/sections/${id}`);

export const bulkCreateSeats = (data: { sectionId: string; rows: string[]; seatsPerRow: number }): Promise<AxiosResponse> => api.post('/venues/seats/bulk', data);
export const bulkUpdateSeats = (data: { seatIds: string[]; isAccessible: boolean }): Promise<AxiosResponse> => api.patch('/venues/seats/bulk', data);
