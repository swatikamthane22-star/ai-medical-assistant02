import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  return (
    <header className="nav">
      <div className="nav-in">
        <NavLink to="/" className="brand">
          <svg width="34" height="20" viewBox="0 0 34 20" aria-hidden="true">
            <polyline points="0,10 8,10 11,2 16,18 20,6 23,10 34,10" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
          </svg>
          MediAssist <span>AI</span>
        </NavLink>
        {user && (
          <nav className="links">
            {user.role === 'admin' ? (
              <NavLink to="/admin">Admin console</NavLink>
            ) : (
              <>
                <NavLink to="/" end>My reports</NavLink>
                <NavLink to="/check">Check symptoms</NavLink>
                <NavLink to="/hospitals">Hospitals</NavLink>
              </>
            )}
            <button className="ghost" onClick={() => { logout(); nav('/login'); }}>Log out</button>
          </nav>
        )}
      </div>
    </header>
  );
}
