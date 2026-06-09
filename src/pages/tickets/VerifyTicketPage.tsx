import { useState } from 'react';
import { Shield, ScanLine, CheckCircle2, XCircle, Armchair, User, Calendar, MapPin } from 'lucide-react';
import { verifyTicket } from '../../api/tickets';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import toast from 'react-hot-toast';
import type { TicketDetails } from '../../types';

export default function VerifyTicketPage() {
  const [qrPayload, setQrPayload] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TicketDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrPayload.trim()) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await verifyTicket(qrPayload.trim());
      setResult(res.data.data);
      toast.success('Ticket verified and checked in!');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Verification failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (d?: string | null) =>
    d
      ? new Date(d).toLocaleString('en-IN', {
          weekday: 'short', day: 'numeric', month: 'short',
          year: 'numeric', hour: '2-digit', minute: '2-digit',
        })
      : '—';

  return (
    <div className="page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Shield size={28} /> Ticket Verification
          </h1>
          <p className="page-subtitle">Scan or enter QR payload to check in an attendee</p>
        </div>
      </div>

      {/* ── Input panel ──────────────────────────────────────────────────── */}
      <div className="card verify-panel">
        <div className="verify-icon">
          <ScanLine size={32} />
        </div>
        <form onSubmit={handleVerify} className="verify-form">
          <div className="form-group">
            <label className="form-label" htmlFor="qrPayload">QR Payload</label>
            <input
              id="qrPayload"
              className="form-input verify-input"
              type="text"
              placeholder="booking:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              value={qrPayload}
              onChange={(e) => setQrPayload(e.target.value)}
              autoComplete="off"
              autoFocus
            />
            <span className="form-error" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Paste the QR code payload from the attendee's ticket
            </span>
          </div>
          <Button type="submit" loading={loading} style={{ width: '100%' }}>
            <ScanLine size={16} /> Verify &amp; Check In
          </Button>
        </form>
      </div>

      {/* ── Error state ──────────────────────────────────────────────────── */}
      {error && !result && (
        <div className="verify-result verify-result-error animate-fade-in">
          <div className="verify-result-icon">
            <XCircle size={40} />
          </div>
          <div className="verify-result-title">Verification Failed</div>
          <div className="verify-result-message">{error}</div>
        </div>
      )}

      {/* ── Success result ───────────────────────────────────────────────── */}
      {result && (
        <div className="verify-result verify-result-success animate-fade-in">
          <div className="verify-result-icon" style={{ color: 'var(--success)' }}>
            <CheckCircle2 size={40} />
          </div>
          <div className="verify-result-title" style={{ color: 'var(--success)' }}>
            Checked In Successfully
          </div>

          <div className="verify-ticket-card">
            {/* Ticket header */}
            <div className="verify-ticket-header">
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>TICKET NUMBER</div>
                <div style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--accent-400)', letterSpacing: '0.05em' }}>
                  {result.ticketNumber}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {result.ticketStatus && <StatusBadge status={result.ticketStatus} />}
              </div>
            </div>

            <div className="verify-ticket-body">
              {/* Event */}
              <div className="verify-ticket-section">
                <div className="verify-ticket-section-label">
                  <Calendar size={13} /> Event
                </div>
                <div className="verify-ticket-section-value">{result.event.title}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  {fmt(result.event.startTime)}
                </div>
              </div>

              {/* Venue */}
              {result.event.venue && (
                <div className="verify-ticket-section">
                  <div className="verify-ticket-section-label">
                    <MapPin size={13} /> Venue
                  </div>
                  <div className="verify-ticket-section-value">{result.event.venue.name}</div>
                  {result.event.venue.address && (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {result.event.venue.address}
                    </div>
                  )}
                </div>
              )}

              {/* Attendee */}
              <div className="verify-ticket-section">
                <div className="verify-ticket-section-label">
                  <User size={13} /> Attendee
                </div>
                <div className="verify-ticket-section-value">
                  {result.customer.name || result.customer.email}
                </div>
                {result.customer.name && (
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {result.customer.email}
                  </div>
                )}
              </div>

              {/* Check-in time */}
              <div className="verify-ticket-section">
                <div className="verify-ticket-section-label">
                  <CheckCircle2 size={13} /> Checked In At
                </div>
                <div className="verify-ticket-section-value" style={{ color: 'var(--success)' }}>
                  {fmt(result.checkedInAt)}
                </div>
              </div>
            </div>

            {/* Seats */}
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-primary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                <Armchair size={13} /> Seats ({result.seats.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {result.seats.map((item) => (
                  <div key={item.bookingItemId} className="ticket-seat-row">
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
            </div>
          </div>

          <Button
            variant="secondary"
            onClick={() => { setResult(null); setQrPayload(''); setError(null); }}
            style={{ marginTop: 16 }}
          >
            Verify Another Ticket
          </Button>
        </div>
      )}
    </div>
  );
}
