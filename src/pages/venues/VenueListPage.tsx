import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { listVenues } from '../../api/venues';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Plus, Search, Building2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import type { Venue } from '../../types';

export default function VenueListPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const { isPrivileged } = useAuth();
  const navigate = useNavigate();

  const fetchVenues = async () => {
    setLoading(true);
    try {
      const res = await listVenues({ page, limit: 9, search: search || undefined, sortBy });
      setVenues(res.data.data || []);
      setTotalPages(res.data.meta?.totalPages || 1);
    } catch { toast.error('Failed to load venues'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchVenues(); }, [page, sortBy]);

  const handleSearch = (e: FormEvent) => { e.preventDefault(); setPage(1); fetchVenues(); };

  return (
    <div className="page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Venues</h1>
          <p className="page-subtitle">Discover amazing venues for unforgettable events</p>
        </div>
        {isPrivileged && <Button onClick={() => navigate('/venues/new')}><Plus size={16} /> Add Venue</Button>}
      </div>
      <div className="toolbar">
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, flex: 1 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="form-input" placeholder="Search venues..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
          </div>
          <Button type="submit" variant="secondary" size="sm">Search</Button>
        </form>
        <select className="form-select" value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }} style={{ maxWidth: 160 }}>
          <option value="createdAt">Newest</option>
          <option value="name">Name</option>
        </select>
      </div>
      {loading ? <LoadingSpinner /> : venues.length === 0 ? (
        <EmptyState icon={Building2} title="No venues found" text="Try adjusting your search or create a new venue." />
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
            {venues.map((venue) => (
              <div key={venue.id} className="card" onClick={() => navigate(`/venues/${venue.id}`)} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 4 }}>{venue.name}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={14} /> {venue.city}</p>
                  </div>
                  <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '8px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-400)' }}>{venue.sections?.length || 0}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Sections</div>
                  </div>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: 12 }}>{venue.address}</p>
              </div>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
