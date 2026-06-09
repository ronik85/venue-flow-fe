import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Ticket, Calendar, MapPin, User, Hash,
  QrCode, Download, CheckCircle2, Clock, Armchair,
} from 'lucide-react';
import { getTicketDetails, downloadTicketPdf } from '../../api/tickets';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import type { TicketDetails } from '../../types';

export default function TicketDetailPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<TicketDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getTicketDetails(bookingId!);
        setTicket(res.data.data);
      } catch {
        toast.error('Ticket not found');
        navigate('/bookings/me');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [bookingId]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadTicketPdf(bookingId!, `ticket-${ticket?.ticketNumber ?? bookingId}.pdf`);
      toast.success('PDF downloaded!');
    } catch {
      toast.error('Failed to generate PDF');
    } finally {
      setDownloading(false);
    }
  };

  const fmt = (d?: string | null) =>
    d
      ? new Date(d).toLocaleString('en-IN', {
          weekday: 'short', day: 'numeric', month: 'short',
          year: 'numeric', hour: '2-digit', minute: '2-digit',
        })
      : '—';

  if (loading) return <LoadingSpinner />;
  if (!ticket) return null;

  const isConfirmed = ticket.booking.status === 'CONFIRMED';

  return (
    <div className="page animate-fade-in">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/bookings/me')}
        style={{ marginBottom: 20 }}
      >
        <ArrowLeft size={16} /> Back to bookings
      </Button>

      {/* ── Hero header ─────────────────────────────────────────────────── */}
      <div className="ticket-hero">
        <div className="ticket-hero-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div className="ticket-hero-icon">
              <Ticket size={22} />
            </div>
            <div>
              <div className="ticket-number-label">Ticket Number</div>
              <div className="ticket-number-value">
                {ticket.ticketNumber ?? '—'}
              </div>
            </div>
          </div>

          <h1 className="ticket-event-title">{ticket.event.title}</h1>

          <div className="ticket-meta-row">
            <span className="ticket-meta-item">
              <Calendar size={14} />
              {fmt(ticket.event.startTime)}
            </span>
            {ticket.event.venue && (
              <span className="ticket-meta-item">
                <MapPin size={14} />
                {ticket.event.venue.name}
                {ticket.event.venue.address ? `, ${ticket.event.venue.address}` : ''}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
            {ticket.ticketStatus && (
              <StatusBadge status={ticket.ticketStatus} />
            )}
            <StatusBadge status={ticket.booking.status} />
          </div>
        </div>

        {/* Download button */}
        {isConfirmed && ticket.ticketNumber && (
          <Button
            variant="secondary"
            onClick={handleDownload}
            loading={downloading}
            style={{ alignSelf: 'flex-start', flexShrink: 0 }}
          >
            <Download size={16} /> Download PDF
          </Button>
        )}
      </div>

      {/* ── Info grid ────────────────────────────────────────────────────── */}
      <div className="ticket-grid">
        {/* Attendee */}
        <div className="card">
          <div className="ticket-info-block">
            <User size={16} className="ticket-info-icon" />
            <div>
              <div className="ticket-info-label">Attendee</div>
              <div className="ticket-info-value">
                {ticket.customer.name || ticket.customer.email}
              </div>
              {ticket.customer.name && (
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  {ticket.customer.email}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* QR Payload */}
        <div className="card">
          <div className="ticket-info-block">
            <QrCode size={16} className="ticket-info-icon" />
            <div>
              <div className="ticket-info-label">QR Payload</div>
              <div className="ticket-qr-payload">
                {ticket.qrPayload ?? '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Issued At */}
        <div className="card">
          <div className="ticket-info-block">
            <Hash size={16} className="ticket-info-icon" />
            <div>
              <div className="ticket-info-label">Issued At</div>
              <div className="ticket-info-value">{fmt(ticket.issuedAt)}</div>
            </div>
          </div>
        </div>

        {/* Checked In */}
        <div className="card" style={ticket.checkedInAt ? { borderColor: 'rgba(34,197,94,0.3)' } : {}}>
          <div className="ticket-info-block">
            {ticket.checkedInAt ? (
              <CheckCircle2 size={16} style={{ color: 'var(--success)', flexShrink: 0 }} />
            ) : (
              <Clock size={16} className="ticket-info-icon" />
            )}
            <div>
              <div className="ticket-info-label">Checked In</div>
              <div
                className="ticket-info-value"
                style={ticket.checkedInAt ? { color: 'var(--success)' } : {}}
              >
                {ticket.checkedInAt ? fmt(ticket.checkedInAt) : 'Not yet'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Booked Seats ─────────────────────────────────────────────────── */}
      <div className="card" style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Armchair size={16} style={{ color: 'var(--accent-400)' }} />
          <h3 style={{ margin: 0 }}>Booked Seats ({ticket.seats.length})</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ticket.seats.map((item) => (
            <div key={item.bookingItemId} className="ticket-seat-row">
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {item.seat?.section && (
                  <span className="ticket-seat-section">{item.seat.section.name}</span>
                )}
                <span>Row {item.seat?.row ?? '?'}, Seat {item.seat?.seatNumber ?? '?'}</span>
              </span>
              <span className="ticket-seat-price">
                ₹{parseFloat(item.priceAtBooking).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>

        <div className="ticket-seat-total">
          <span>Total</span>
          <span>
            ₹{parseFloat(ticket.booking.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
}
