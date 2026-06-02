import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { listVenues } from '../../api/venues';
import { createEvent } from '../../api/events';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Select } from '../../components/ui/Input';
import toast from 'react-hot-toast';
import type { Venue } from '../../types';

export default function CreateEventPage() {
  const [form, setForm] = useState({ title: '', description: '', startTime: '', venueId: '', defaultPrice: '' });
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { listVenues({ limit: 100 }).then(res => setVenues(res.data.data || [])).catch(() => {}); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.startTime || !form.venueId || !form.defaultPrice) return toast.error('Please fill all required fields');
    setLoading(true);
    try {
      const payload = { title: form.title, description: form.description || undefined, startTime: new Date(form.startTime).toISOString(), venueId: form.venueId, defaultPrice: parseFloat(form.defaultPrice) };
      const res = await createEvent(payload);
      toast.success(`Event created! ${res.data.generatedSeatsCount ?? ''} seats generated.`);
      navigate(`/events/${res.data.data.id}`);
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to create event'); }
    finally { setLoading(false); }
  };

  return (
    <div className="page animate-fade-in">
      <div className="page-header"><div><h1 className="page-title">Create Event</h1><p className="page-subtitle">Set up a new event with automatic seat generation</p></div></div>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <form className="card" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Input label="Event Title" id="event-title" name="title" placeholder="e.g. Coldplay World Tour 2026" value={form.title} onChange={handleChange} />
          <Input label="Description (optional)" id="event-desc" name="description" placeholder="Describe your event..." value={form.description} onChange={handleChange} />
          <Input label="Start Date & Time" id="event-time" name="startTime" type="datetime-local" value={form.startTime} onChange={handleChange} />
          <Select label="Venue" id="event-venue" name="venueId" value={form.venueId} onChange={handleChange}>
            <option value="">Select a venue</option>
            {venues.map(v => <option key={v.id} value={v.id}>{v.name} — {v.city}</option>)}
          </Select>
          <Input label="Default Ticket Price (₹)" id="event-price" name="defaultPrice" type="number" min="0" step="0.01" placeholder="1500" value={form.defaultPrice} onChange={handleChange} />
          <div style={{ display: 'flex', gap: 12 }}>
            <Button type="submit" loading={loading}>Create Event</Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/events')}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
