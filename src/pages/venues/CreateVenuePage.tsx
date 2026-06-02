import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { createVenue } from '../../api/venues';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

export default function CreateVenuePage() {
  const [form, setForm] = useState({ name: '', city: '', address: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.city || !form.address) return toast.error('All fields are required');
    setLoading(true);
    try {
      const res = await createVenue(form);
      toast.success('Venue created!');
      navigate(`/venues/${res.data.data.id}`);
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to create venue'); }
    finally { setLoading(false); }
  };

  return (
    <div className="page animate-fade-in">
      <div className="page-header"><div><h1 className="page-title">Create Venue</h1><p className="page-subtitle">Add a new venue to host events</p></div></div>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <form className="card" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Input label="Venue Name" id="venue-name" name="name" placeholder="e.g. Phoenix Palladium" value={form.name} onChange={handleChange} />
          <Input label="City" id="venue-city" name="city" placeholder="e.g. Mumbai" value={form.city} onChange={handleChange} />
          <Input label="Address" id="venue-address" name="address" placeholder="Full street address" value={form.address} onChange={handleChange} />
          <div style={{ display: 'flex', gap: 12 }}>
            <Button type="submit" loading={loading}>Create Venue</Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/venues')}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
