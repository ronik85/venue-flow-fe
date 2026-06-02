import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEvent, getEventSeats, updateEvent, publishEvent, deleteEvent } from '../../api/events';
import { createBooking } from '../../api/bookings';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Clock, Edit3, Trash2, ArrowLeft, Send, Ticket } from 'lucide-react';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import SeatMap from '../../components/events/SeatMap';
import toast from 'react-hot-toast';
import type { VenueEvent, EventSeat } from '../../types';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isPrivileged } = useAuth();
  const [event, setEvent] = useState<VenueEvent | null>(null);
  const [seats, setSeats] = useState<EventSeat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', startTime: '' });
  const [saving, setSaving] = useState(false);

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const fetchEvent = useCallback(async () => {
    try {
      const res = await getEvent(id!);
      const data = res.data.data || res.data;
      setEvent(data);
      setEditForm({ title: data.title, description: data.description || '', startTime: data.startTime ? new Date(data.startTime).toISOString().slice(0, 16) : '' });
    } catch { toast.error('Event not found'); navigate('/events'); }
    finally { setLoading(false); }
  }, [id, navigate]);

  const fetchSeats = useCallback(async () => {
    try { const res = await getEventSeats(id!, { sortBy: 'row', sortOrder: 'ASC' }); setSeats(res.data.data || []); } catch { /* silent */ }
  }, [id]);

  useEffect(() => { fetchEvent(); fetchSeats(); }, [fetchEvent, fetchSeats]);

  const toggleSeat = (seatId: string) => {
    setSelectedSeats(prev => prev.includes(seatId) ? prev.filter(s => s !== seatId) : prev.length >= 10 ? (toast.error('Max 10 seats'), prev) : [...prev, seatId]);
  };

  const handleBook = async () => {
    if (!user) return navigate('/login', { state: { from: { pathname: `/events/${id}` } } });
    if (selectedSeats.length === 0) return toast.error('Select at least one seat');
    setBookingLoading(true);
    try {
      const res = await createBooking({ eventId: id!, eventSeatIds: selectedSeats });
      toast.success('Booking created! Confirm within 15 minutes.');
      navigate(`/bookings/${res.data.data.id}`);
    } catch (err: any) { toast.error(err.response?.data?.message || 'Booking failed'); }
    finally { setBookingLoading(false); }
  };

  const handlePublish = async () => {
    try { await publishEvent(id!); toast.success('Event published!'); fetchEvent(); fetchSeats(); }
    catch (err: any) { toast.error(err.response?.data?.message || 'Publish failed'); }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { ...editForm };
      if (payload.startTime) payload.startTime = new Date(payload.startTime as string).toISOString();
      await updateEvent(id!, payload);
      toast.success('Event updated!'); setEditModal(false); fetchEvent();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this event? This cannot be undone.')) return;
    try { await deleteEvent(id!); toast.success('Event deleted'); navigate('/events'); }
    catch (err: any) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  if (loading) return <LoadingSpinner />;
  if (!event) return null;

  const selectedTotal = selectedSeats.reduce((sum, sId) => {
    const seat = seats.find(s => s.id === sId);
    return sum + (seat ? parseFloat(seat.price) : 0);
  }, 0);
  const availableCount = seats.filter(s => s.status === 'AVAILABLE').length;

  return (
    <div className="page animate-fade-in">
      <Button variant="ghost" size="sm" onClick={() => navigate('/events')} style={{ marginBottom: 16 }}><ArrowLeft size={16} /> Back to events</Button>

      <div className="detail-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ marginBottom: 12 }}><StatusBadge status={event.status} /></div>
            <h1 className="detail-title">{event.title}</h1>
            {event.description && <p style={{ color: 'var(--text-secondary)', marginTop: 8, maxWidth: 600 }}>{event.description}</p>}
            <div className="detail-meta" style={{ marginTop: 16 }}>
              <span className="detail-meta-item"><Clock size={16} /> {formatDate(event.startTime)}</span>
              {event.venue && <span className="detail-meta-item"><MapPin size={16} /> {event.venue.name}, {event.venue.city}</span>}
            </div>
            <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>{availableCount}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Available</div></div>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-secondary)' }}>{seats.length}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Seats</div></div>
            </div>
          </div>
          {isPrivileged && (
            <div className="detail-actions">
              {event.status === 'DRAFT' && <Button size="sm" onClick={handlePublish}><Send size={14} /> Publish</Button>}
              <Button variant="secondary" size="sm" onClick={() => setEditModal(true)}><Edit3 size={14} /> Edit</Button>
              <Button variant="danger" size="sm" onClick={handleDelete}><Trash2 size={14} /> Delete</Button>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'flex-start' }}>
        <div className="card" style={{ overflow: 'auto' }}>
          <h3 style={{ marginBottom: 16 }}>Select Your Seats</h3>
          {seats.length > 0 ? <SeatMap seats={seats} selectedSeats={selectedSeats} onToggleSeat={toggleSeat} disabled={event.status !== 'PUBLISHED'} /> : <p style={{ color: 'var(--text-muted)', padding: 32, textAlign: 'center' }}>No seats available for this event.</p>}
        </div>
        <div className="booking-summary" style={{ position: 'sticky', top: 80 }}>
          <h4 style={{ marginBottom: 16 }}>Booking Summary</h4>
          {selectedSeats.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Select seats from the map to begin</p> : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
                {selectedSeats.map(sId => { const s = seats.find(x => x.id === sId); return s && (
                  <div key={sId} className="booking-summary-row"><span>Row {s.row}, Seat {s.seatNumber}</span><span>₹{parseFloat(s.price).toLocaleString()}</span></div>
                ); })}
              </div>
              <div className="booking-summary-row" style={{ borderTop: '1px solid var(--border-secondary)', paddingTop: 12 }}>
                <span style={{ fontWeight: 700 }}>Total</span><span className="booking-summary-total">₹{selectedTotal.toLocaleString()}</span>
              </div>
            </>
          )}
          <Button className="w-full" style={{ marginTop: 20 }} size="lg" disabled={selectedSeats.length === 0 || event.status !== 'PUBLISHED'} loading={bookingLoading} onClick={handleBook}>
            <Ticket size={16} /> Book {selectedSeats.length} Seat{selectedSeats.length !== 1 ? 's' : ''}
          </Button>
          {event.status !== 'PUBLISHED' && <p style={{ color: 'var(--warning)', fontSize: '0.75rem', marginTop: 8, textAlign: 'center' }}>Booking only available for published events</p>}
        </div>
      </div>

      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="Edit Event"
        footer={<><Button variant="secondary" onClick={() => setEditModal(false)}>Cancel</Button><Button loading={saving} onClick={handleUpdate}>Save</Button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="Title" id="edit-title" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
          <Input label="Description" id="edit-desc" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
          <Input label="Start Date & Time" id="edit-time" type="datetime-local" value={editForm.startTime} onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
}
