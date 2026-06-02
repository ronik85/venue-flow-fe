import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminListBookings } from '../../api/bookings';
import { Shield } from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge';
import Pagination from '../../components/ui/Pagination';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import type { Booking } from '../../types';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 15 };
      if (status) params.status = status;
      const res = await adminListBookings(params as any);
      setBookings(res.data.data || []);
      setTotalPages(res.data.meta?.totalPages || 1);
    } catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, [page, status]);

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="page animate-fade-in">
      <div className="page-header"><div><h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Shield size={28} /> Admin — All Bookings</h1><p className="page-subtitle">Manage all bookings across the platform</p></div></div>
      <div className="toolbar">
        <select className="form-select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} style={{ maxWidth: 180 }}>
          <option value="">All Status</option><option value="PENDING">Pending</option><option value="CONFIRMED">Confirmed</option><option value="CANCELLED">Cancelled</option><option value="EXPIRED">Expired</option>
        </select>
      </div>
      {loading ? <LoadingSpinner /> : bookings.length === 0 ? (
        <EmptyState icon={Shield} title="No bookings found" text="No bookings match your current filters." />
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px 120px 100px', gap: 16, padding: '8px 20px', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <span>User</span><span>Event</span><span>Amount</span><span>Created</span><span>Status</span>
            </div>
            {bookings.map((b) => (
              <div key={b.id} className="list-item" onClick={() => navigate(`/bookings/${b.id}`)} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px 120px 100px', gap: 16 }}>
                <span style={{ fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.user?.email || b.userId?.slice(0, 8)}</span>
                <span style={{ fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.event?.title || '—'}</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-400)' }}>₹{parseFloat(b.totalAmount).toLocaleString()}</span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{formatDate(b.createdAt)}</span>
                <StatusBadge status={b.status} />
              </div>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
