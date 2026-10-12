import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { errMsg } from '../api';

export default function AuthPage({ mode }) {
  const isReg = mode === 'register';
  const { user, login, register } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', password: '', age: '', gender: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/" replace />;

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      isReg ? await register({ ...f, age: f.age ? Number(f.age) : undefined }) : await login(f);
      nav('/');
    } catch (x) { setErr(errMsg(x)); } finally { setBusy(false); }
  };

  return (
    <div className="auth">
      <div className="auth-intro">
        <h1>Describe how you feel. Get clear next steps.</h1>
        <p>Pick your symptoms, see the most likely conditions, safe medicine guidance, nearby hospitals and a PDF report to show your doctor.</p>
      </div>
      <form className="card" onSubmit={submit}>
        <h2>{isReg ? 'Create your account' : 'Log in'}</h2>
        {isReg && <label>Full name<input required value={f.name} onChange={set('name')} /></label>}
        <label>Email<input type="email" required value={f.email} onChange={set('email')} /></label>
        <label>Password<input type="password" required minLength={6} value={f.password} onChange={set('password')} /></label>
        {isReg && (
          <div className="row">
            <label>Age<input type="number" min="0" max="120" value={f.age} onChange={set('age')} /></label>
            <label>Gender
              <select value={f.gender} onChange={set('gender')}>
                <option value="">Select</option><option value="male">Male</option>
                <option value="female">Female</option><option value="other">Other</option>
              </select>
            </label>
          </div>
        )}
        {err && <p className="error">{err}</p>}
        <button className="primary" disabled={busy}>{busy ? 'Please wait…' : isReg ? 'Create account' : 'Log in'}</button>
        <p className="muted small">
          {isReg ? <>Already registered? <Link to="/login">Log in</Link></> : <>New here? <Link to="/register">Create an account</Link></>}
        </p>
      </form>
    </div>
  );
}
