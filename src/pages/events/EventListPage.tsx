import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { listEvents } from '../../api/events';
import { useAuth } from '../../context/AuthContext';
import { Plus, Search, Calendar, MapPin, Clock } from 'lucide-react';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import Pagination from '../../components/ui/Pagination';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import type { VenueEvent } from '../../types';

export default function EventListPage() {
  const [events, setEvents] = useState<VenueEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('startTime');
  const { isPrivileged } = useAuth();
  const navigate = useNavigate();

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 9, sortBy, sortOrder: 'ASC' };
      if (search) params.search = search;
      if (status) params.status = status;
      const res = await listEvents(params as any);
      setEvents(res.data.data || []);
      setTotalPages(res.data.meta?.totalPages || 1);
    } catch { toast.error('Failed to load events'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEvents(); }, [page, sortBy, status]);

  const handleSearch = (e: FormEvent) => { e.preventDefault(); setPage(1); fetchEvents(); };
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="page animate-fade-in">
      <div className="page-header">
        <div><h1 className="page-title">Events</h1><p className="page-subtitle">Discover and book amazing events near you</p></div>
        {isPrivileged && <Button onClick={() => navigate('/events/new')}><Plus size={16} /> Create Event</Button>}
      </div>
      <div className="toolbar">
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, flex: 1 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="form-input" placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
          </div>
          <Button type="submit" variant="secondary" size="sm">Search</Button>
        </form>
        <select className="form-select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} style={{ maxWidth: 160 }}>
          <option value="">All Status</option>
          <option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option><option value="CANCELLED">Cancelled</option><option value="POSTPONED">Postponed</option><option value="COMPLETED">Completed</option>
        </select>
        <select className="form-select" value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }} style={{ maxWidth: 160 }}>
          <option value="startTime">Date</option><option value="createdAt">Newest</option>
        </select>
      </div>
      {loading ? <LoadingSpinner /> : events.length === 0 ? (
        <EmptyState icon={Calendar} title="No events found" text="Try adjusting your filters or create a new event." />
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
            {events.map((event) => (
              <div key={event.id} className="card" onClick={() => navigate(`/events/${event.id}`)} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <StatusBadge status={event.status} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}><Clock size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {formatDate(event.startTime)}</span>
                </div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 8 }}>{event.title}</h3>
                {event.description && <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 12, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{event.description}</p>}
                {event.venue && <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={14} /> {event.venue.name}, {event.venue.city}</div>}
              </div>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
