import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVenue, updateVenue, deleteVenue } from '../../api/venues';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Edit3, Trash2, ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import SectionManager from '../../components/venues/SectionManager';
import toast from 'react-hot-toast';
import type { Venue } from '../../types';

export default function VenueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isPrivileged } = useAuth();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', city: '', address: '' });
  const [saving, setSaving] = useState(false);

  const fetchVenue = useCallback(async () => {
    try {
      const res = await getVenue(id!);
      const data = res.data.data || res.data;
      setVenue(data);
      setEditForm({ name: data.name, city: data.city, address: data.address });
    } catch { toast.error('Venue not found'); navigate('/venues'); }
    finally { setLoading(false); }
  }, [id, navigate]);

  useEffect(() => { fetchVenue(); }, [fetchVenue]);

  const handleUpdate = async () => {
    setSaving(true);
    try { await updateVenue(id!, editForm); toast.success('Venue updated!'); setEditModal(false); fetchVenue(); }
    catch (err: any) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this venue? This action cannot be undone.')) return;
    try { await deleteVenue(id!); toast.success('Venue deleted'); navigate('/venues'); }
    catch (err: any) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  if (loading) return <LoadingSpinner />;
  if (!venue) return null;
  const totalSeats = venue.sections?.reduce((sum, s) => sum + (s.seats?.length || 0), 0) || 0;

  return (
    <div className="page animate-fade-in">
      <Button variant="ghost" size="sm" onClick={() => navigate('/venues')} style={{ marginBottom: 16 }}><ArrowLeft size={16} /> Back to venues</Button>
      <div className="detail-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 className="detail-title">{venue.name}</h1>
            <div className="detail-meta"><span className="detail-meta-item"><MapPin size={16} /> {venue.city}</span><span className="detail-meta-item">{venue.address}</span></div>
            <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-400)' }}>{venue.sections?.length || 0}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sections</div></div>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-400)' }}>{totalSeats}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Seats</div></div>
            </div>
          </div>
          {isPrivileged && (
            <div className="detail-actions">
              <Button variant="secondary" size="sm" onClick={() => setEditModal(true)}><Edit3 size={14} /> Edit</Button>
              <Button variant="danger" size="sm" onClick={handleDelete}><Trash2 size={14} /> Delete</Button>
            </div>
          )}
        </div>
      </div>
      <SectionManager venue={venue} onRefresh={fetchVenue} />
      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="Edit Venue"
        footer={<><Button variant="secondary" onClick={() => setEditModal(false)}>Cancel</Button><Button loading={saving} onClick={handleUpdate}>Save</Button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="Name" id="edit-name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
          <Input label="City" id="edit-city" value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} />
          <Input label="Address" id="edit-address" value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
}
