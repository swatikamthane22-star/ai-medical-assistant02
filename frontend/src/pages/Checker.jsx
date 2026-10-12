import { useEffect, useMemo, useState } from 'react';
import api, { errMsg } from '../api';
import { useAuth } from '../auth.jsx';
import Result from '../components/Result.jsx';

const pretty = (s) => s.replace(/_/g, ' ');

export default function Checker() {
  const { user } = useAuth();
  const [all, setAll] = useState([]);
  const [picked, setPicked] = useState([]);
  const [q, setQ] = useState('');
  const [age, setAge] = useState(user?.age || '');
  const [gender, setGender] = useState(user?.gender || '');
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { api.get('/symptoms').then((r) => setAll(r.data.symptoms)).catch((e) => setErr(errMsg(e))); }, []);
  const shown = useMemo(() => all.filter((s) => pretty(s).includes(q.toLowerCase())), [all, q]);
  const toggle = (s) => setPicked((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  const analyse = async () => {
    setErr(''); setBusy(true); setResult(null);
    try {
      const r = await api.post('/predict', { symptoms: picked, age: age ? Number(age) : undefined, gender });
      setResult(r.data.prediction);
      setTimeout(() => document.getElementById('res')?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (e) { setErr(errMsg(e)); } finally { setBusy(false); }
  };

  return (
    <>
      <h1>Symptom checker</h1>
      <p className="muted">Select everything you are feeling right now (at least 2).</p>
      <div className="card">
        <input className="search" placeholder="Search symptoms, e.g. fever" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="chips">
          {shown.map((s) => (
            <button key={s} type="button" className={`chip ${picked.includes(s) ? 'on' : ''}`} onClick={() => toggle(s)} aria-pressed={picked.includes(s)}>
              {pretty(s)}
            </button>
          ))}
          {!shown.length && <p className="muted">No symptom matches “{q}”.</p>}
        </div>
        <div className="row">
          <label>Age<input type="number" min="0" max="120" value={age} onChange={(e) => setAge(e.target.value)} /></label>
          <label>Gender
            <select value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="">Select</option><option value="male">Male</option>
              <option value="female">Female</option><option value="other">Other</option>
            </select>
          </label>
        </div>
        {err && <p className="error">{err}</p>}
        <div className="actions">
          <span className="muted">{picked.length} selected</span>
          <button className="primary" disabled={picked.length < 2 || busy} onClick={analyse}>{busy ? 'Analysing…' : 'Analyse symptoms'}</button>
        </div>
      </div>
      <div id="res">{result && <Result p={result} />}</div>
    </>
  );
}
