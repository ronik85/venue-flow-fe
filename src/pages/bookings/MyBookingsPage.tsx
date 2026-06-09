import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyBookings, confirmBooking, cancelBooking } from '../../api/bookings';
import { Ticket, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import Pagination from '../../components/ui/Pagination';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import type { Booking } from '../../types';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 10 };
      if (status) params.status = status;
      const res = await getMyBookings(params as any);
      setBookings(res.data.data || []);
      setTotalPages(res.data.meta?.totalPages || 1);
    } catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, [page, status]);

  const handleConfirm = async (id: string) => {
    try { await confirmBooking(id); toast.success('Booking confirmed!'); fetchBookings(); }
    catch (err: any) { toast.error(err.response?.data?.message || 'Confirm failed'); }
  };

  const handleCancel = async (id: string) => {
    const reason = prompt('Reason for cancellation (optional):');
    try { await cancelBooking(id, { reason: reason || undefined }); toast.success('Booking cancelled'); fetchBookings(); }
    catch (err: any) { toast.error(err.response?.data?.message || 'Cancel failed'); }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="page animate-fade-in">
      <div className="page-header"><div><h1 className="page-title">My Bookings</h1><p className="page-subtitle">View and manage your event reservations</p></div></div>
      <div className="toolbar">
        <select className="form-select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} style={{ maxWidth: 180 }}>
          <option value="">All Status</option><option value="PENDING">Pending</option><option value="CONFIRMED">Confirmed</option><option value="CANCELLED">Cancelled</option><option value="EXPIRED">Expired</option>
        </select>
      </div>
      {loading ? <LoadingSpinner /> : bookings.length === 0 ? (
        <EmptyState icon={Ticket} title="No bookings yet" text="Browse events and book your seats!" />
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {bookings.map((booking) => (
              <div key={booking.id} className="list-item" onClick={() => navigate(`/bookings/${booking.id}`)}>
                <div className="list-item-info" style={{ flex: 1 }}>
                  <div className="list-item-title">{booking.event?.title || 'Event'}</div>
                  <div className="list-item-subtitle">{booking.event?.venue?.name} • {booking.items?.length || 0} seat(s) • {formatDate(booking.createdAt)}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ textAlign: 'right' }}><div style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--accent-400)' }}>₹{parseFloat(booking.totalAmount).toLocaleString()}</div></div>
                  <StatusBadge status={booking.status} />
                  <div className="list-item-actions" onClick={(e) => e.stopPropagation()}>
                    {booking.status === 'PENDING' && (<><Button variant="primary" size="sm" onClick={() => handleConfirm(booking.id)}><CheckCircle size={14} /> Confirm</Button><Button variant="danger" size="sm" onClick={() => handleCancel(booking.id)}><XCircle size={14} /></Button></>)}
                    {booking.status === 'CONFIRMED' && (<><Button variant="secondary" size="sm" onClick={() => navigate(`/tickets/${booking.id}`)}><ExternalLink size={14} /> Ticket</Button><Button variant="danger" size="sm" onClick={() => handleCancel(booking.id)}><XCircle size={14} /> Cancel</Button></>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
