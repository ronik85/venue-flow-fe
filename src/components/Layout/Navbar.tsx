import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Zap, Calendar, MapPin, Ticket, LogOut, Shield } from 'lucide-react';
import Button from '../ui/Button';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <Zap size={24} className="logo-icon" />
          VenueFlow
        </Link>
        <div className="navbar-links">
          <NavLink to="/events" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
            <Calendar size={16} /> Events
          </NavLink>
          <NavLink to="/venues" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
            <MapPin size={16} /> Venues
          </NavLink>
          {user && (
            <NavLink to="/bookings/me" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
              <Ticket size={16} /> My Bookings
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin/bookings" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
              <Shield size={16} /> Admin
            </NavLink>
          )}
        </div>
        <div className="navbar-user">
          {user ? (
            <>
              <div className="navbar-user-info">
                <span className="navbar-user-email">{user.email}</span>
                <span className="navbar-user-role">{user.role}</span>
              </div>
              <div className="navbar-avatar">{user.email[0].toUpperCase()}</div>
              <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut size={16} /></Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Sign In</Button>
              <Button variant="primary" size="sm" onClick={() => navigate('/register')}>Get Started</Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
