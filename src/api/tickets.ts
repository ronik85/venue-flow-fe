import api from './axios';
import type { AxiosResponse } from 'axios';

export const getTicketDetails = (bookingId: string): Promise<AxiosResponse> =>
  api.get(`/tickets/${bookingId}`);

export const verifyTicket = (qrPayload: string): Promise<AxiosResponse> =>
  api.post('/tickets/verify', { qrPayload });

/** Triggers a browser download of the PDF ticket */
export const downloadTicketPdf = async (bookingId: string, filename = 'ticket.pdf'): Promise<void> => {
  const res = await api.get(`/tickets/${bookingId}/download`, {
    responseType: 'blob',
  });
  const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
