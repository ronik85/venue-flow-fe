import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createSection, updateSection, deleteSection, bulkCreateSeats, bulkUpdateSeats } from '../../api/venues';
import { Plus, Edit3, Trash2, Armchair, Accessibility } from 'lucide-react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import toast from 'react-hot-toast';
import type { Venue, VenueSection } from '../../types';

interface Props { venue: Venue; onRefresh: () => void; }

export default function SectionManager({ venue, onRefresh }: Props) {
  const { isPrivileged } = useAuth();
  const [addModal, setAddModal] = useState(false);
  const [seatModal, setSeatModal] = useState<VenueSection | null>(null);
  const [editSec, setEditSec] = useState<VenueSection | null>(null);
  const [sectionName, setSectionName] = useState('');
  const [seatForm, setSeatForm] = useState({ rows: '', seatsPerRow: '' });
  const [loading, setLoading] = useState(false);

  const handleAddSection = async () => {
    if (!sectionName.trim()) return toast.error('Section name required');
    setLoading(true);
    try { await createSection({ name: sectionName, venueId: venue.id }); toast.success('Section added!'); setSectionName(''); setAddModal(false); onRefresh(); }
    catch (err: any) { toast.error(err.response?.data?.message || 'Failed to add section'); }
    finally { setLoading(false); }
  };

  const handleEditSection = async () => {
    if (!sectionName.trim() || !editSec) return;
    setLoading(true);
    try { await updateSection(editSec.id, { name: sectionName }); toast.success('Section updated!'); setEditSec(null); setSectionName(''); onRefresh(); }
    catch (err: any) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setLoading(false); }
  };

  const handleDeleteSection = async (secId: string) => {
    if (!confirm('Delete this section and all its seats?')) return;
    try { await deleteSection(secId); toast.success('Section deleted'); onRefresh(); }
    catch (err: any) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  const handleBulkCreate = async () => {
    if (!seatModal) return;
    const rows = seatForm.rows.split(',').map(r => r.trim()).filter(Boolean);
    const seatsPerRow = parseInt(seatForm.seatsPerRow);
    if (rows.length === 0 || !seatsPerRow || seatsPerRow < 1) return toast.error('Invalid seat config');
    setLoading(true);
    try { await bulkCreateSeats({ sectionId: seatModal.id, rows, seatsPerRow }); toast.success('Seats created!'); setSeatModal(null); setSeatForm({ rows: '', seatsPerRow: '' }); onRefresh(); }
    catch (err: any) { toast.error(err.response?.data?.message || 'Failed to create seats'); }
    finally { setLoading(false); }
  };

  const handleToggleAccessibility = async (section: VenueSection) => {
    const seatIds = section.seats?.map(s => s.id) || [];
    if (seatIds.length === 0) return toast.error('No seats in section');
    const allAccessible = section.seats?.every(s => s.isAccessible);
    try { await bulkUpdateSeats({ seatIds, isAccessible: !allAccessible }); toast.success(`Seats marked as ${!allAccessible ? 'accessible' : 'standard'}`); onRefresh(); }
    catch (err: any) { toast.error(err.response?.data?.message || 'Update failed'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Sections & Seats</h2>
        {isPrivileged && <Button size="sm" onClick={() => { setSectionName(''); setAddModal(true); }}><Plus size={14} /> Add Section</Button>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {(!venue.sections || venue.sections.length === 0) ? (
          <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No sections yet. {isPrivileged && 'Add a section to get started.'}</div>
        ) : venue.sections.map((sec) => (
          <div key={sec.id} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{sec.name}</h4>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}><Armchair size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> {sec.seats?.length || 0} seats</span>
              </div>
              {isPrivileged && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <Button variant="ghost" size="sm" title="Add Seats" onClick={() => { setSeatForm({ rows: '', seatsPerRow: '' }); setSeatModal(sec); }}><Plus size={14} /> Seats</Button>
                  <Button variant="ghost" size="sm" title="Toggle Accessibility" onClick={() => handleToggleAccessibility(sec)}><Accessibility size={14} /></Button>
                  <Button variant="ghost" size="sm" onClick={() => { setSectionName(sec.name); setEditSec(sec); }}><Edit3 size={14} /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteSection(sec.id)}><Trash2 size={14} /></Button>
                </div>
              )}
            </div>
            {sec.seats && sec.seats.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {[...sec.seats].sort((a, b) => a.row === b.row ? parseInt(a.seatNumber) - parseInt(b.seatNumber) : a.row.localeCompare(b.row)).map((seat) => (
                  <div key={seat.id} title={`Row ${seat.row}, Seat ${seat.seatNumber}${seat.isAccessible ? ' (♿)' : ''}`}
                    onClick={() => {
                      if (isPrivileged) {
                        toast.promise(bulkUpdateSeats({ seatIds: [seat.id], isAccessible: !seat.isAccessible }).then(onRefresh), {
                          loading: 'Updating seat...', success: 'Seat updated', error: 'Update failed'
                        });
                      }
                    }}
                    style={{ width: 28, height: 28, borderRadius: 4, background: seat.isAccessible ? 'var(--info-bg)' : 'var(--bg-elevated)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5625rem', fontWeight: 700,
                      cursor: isPrivileged ? 'pointer' : 'default',
                      color: seat.isAccessible ? 'var(--info)' : 'var(--text-muted)', border: `1px solid ${seat.isAccessible ? 'rgba(59,130,246,0.3)' : 'var(--border-primary)'}` }}>
                    {seat.row}{seat.seatNumber}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Add Section" footer={<><Button variant="secondary" onClick={() => setAddModal(false)}>Cancel</Button><Button loading={loading} onClick={handleAddSection}>Add</Button></>}>
        <Input label="Section Name" id="sec-name" placeholder="e.g. Balcony, VIP" value={sectionName} onChange={(e) => setSectionName(e.target.value)} />
      </Modal>
      <Modal isOpen={!!editSec} onClose={() => setEditSec(null)} title="Edit Section" footer={<><Button variant="secondary" onClick={() => setEditSec(null)}>Cancel</Button><Button loading={loading} onClick={handleEditSection}>Save</Button></>}>
        <Input label="Section Name" id="sec-edit-name" value={sectionName} onChange={(e) => setSectionName(e.target.value)} />
      </Modal>
      <Modal isOpen={!!seatModal} onClose={() => setSeatModal(null)} title={`Add Seats — ${seatModal?.name || ''}`} footer={<><Button variant="secondary" onClick={() => setSeatModal(null)}>Cancel</Button><Button loading={loading} onClick={handleBulkCreate}>Create Seats</Button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="Row Labels (comma-separated)" id="seat-rows" placeholder="A, B, C, D" value={seatForm.rows} onChange={(e) => setSeatForm({ ...seatForm, rows: e.target.value })} />
          <Input label="Seats Per Row" id="seats-per-row" type="number" min="1" placeholder="20" value={seatForm.seatsPerRow} onChange={(e) => setSeatForm({ ...seatForm, seatsPerRow: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
}
