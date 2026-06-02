import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill in all fields');
    if (password.length < 8) return toast.error('Password must be at least 8 characters');
    if (password !== confirmPassword) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await register(email, password);
      toast.success('Account created! Welcome to VenueFlow');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
            <Zap size={28} color="var(--accent-500)" />
            <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>VenueFlow</span>
          </div>
          <h1>Create your account</h1>
          <p>Start booking events in seconds</p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <Input label="Email" id="reg-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
          <Input label="Password" id="reg-password" type="password" placeholder="Min 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Input label="Confirm Password" id="reg-confirm" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          <Button type="submit" loading={loading} className="w-full" size="lg">Create Account</Button>
        </form>
        <div className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></div>
      </div>
    </div>
  );
}
