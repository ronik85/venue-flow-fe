import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill in all fields');
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
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
          <h1>Welcome back</h1>
          <p>Sign in to manage your events & bookings</p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <Input label="Email" id="login-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
          <Input label="Password" id="login-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit" loading={loading} className="w-full" size="lg">Sign In</Button>
        </form>
        <div className="auth-footer">Don't have an account? <Link to="/register">Create one</Link></div>
      </div>
    </div>
  );
}
