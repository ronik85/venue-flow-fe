import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBooking, confirmBooking, cancelBooking } from '../../api/bookings';
import { ArrowLeft, CheckCircle, XCircle, Clock, Calendar, Armchair } from 'lucide-react';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import type { Booking } from '../../types';

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBooking = async () => {
    try { const res = await getBooking(id!); setBooking(res.data.data || res.data); }
    catch { toast.error('Booking not found'); navigate('/bookings/me'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBooking(); }, [id]);

  const handleConfirm = async () => {
    try { await confirmBooking(id!); toast.success('Booking confirmed!'); fetchBooking(); }
    catch (err: any) { toast.error(err.response?.data?.message || 'Confirm failed'); }
  };

  const handleCancel = async () => {
    const reason = prompt('Reason for cancellation (optional):');
    try { await cancelBooking(id!, { reason: reason || undefined }); toast.success('Booking cancelled'); fetchBooking(); }
    catch (err: any) { toast.error(err.response?.data?.message || 'Cancel failed'); }
  };

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  if (loading) return <LoadingSpinner />;
  if (!booking) return null;

  return (
    <div className="page animate-fade-in">
      <Button variant="ghost" size="sm" onClick={() => navigate('/bookings/me')} style={{ marginBottom: 16 }}><ArrowLeft size={16} /> Back to bookings</Button>
      <div className="detail-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ marginBottom: 12 }}><StatusBadge status={booking.status} /></div>
            <h1 className="detail-title">Booking #{booking.id.slice(0, 8)}</h1>
            <div className="detail-meta" style={{ marginTop: 12 }}>
              <span className="detail-meta-item"><Calendar size={16} /> Created {formatDate(booking.createdAt)}</span>
              {booking.expiresAt && booking.status === 'PENDING' && <span className="detail-meta-item" style={{ color: 'var(--warning)' }}><Clock size={16} /> Expires {formatDate(booking.expiresAt)}</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {booking.status === 'PENDING' && (<><Button onClick={handleConfirm}><CheckCircle size={16} /> Confirm Booking</Button><Button variant="danger" onClick={handleCancel}><XCircle size={16} /> Cancel</Button></>)}
            {booking.status === 'CONFIRMED' && <Button variant="danger" onClick={handleCancel}><XCircle size={16} /> Cancel Booking</Button>}
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Event Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div><span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>EVENT</span><br /><strong>{booking.event?.title}</strong></div>
            <div><span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>VENUE</span><br />{booking.event?.venue?.name}, {booking.event?.venue?.city}</div>
            <div><span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>DATE</span><br />{formatDate(booking.event?.startTime)}</div>
          </div>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Seats ({booking.items?.length || 0})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {booking.items?.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Armchair size={14} color="var(--accent-400)" />
                  {item.eventSeat?.seat?.section?.name && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{item.eventSeat.seat.section.name}</span>}
                  Row {item.eventSeat?.seat?.row}, Seat {item.eventSeat?.seat?.seatNumber}
                </span>
                <span style={{ fontWeight: 700, color: 'var(--accent-400)' }}>₹{parseFloat(item.priceAtBooking).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border-primary)' }}>
            <span style={{ fontWeight: 700 }}>Total</span>
            <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--accent-400)' }}>₹{parseFloat(booking.totalAmount).toLocaleString()}</span>
          </div>
        </div>
      </div>
      {booking.cancellationReason && (
        <div className="card" style={{ marginTop: 24, borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <h4 style={{ color: 'var(--danger)', marginBottom: 8 }}>Cancellation Reason</h4>
          <p style={{ color: 'var(--text-secondary)' }}>{booking.cancellationReason}</p>
        </div>
      )}
    </div>
  );
}
