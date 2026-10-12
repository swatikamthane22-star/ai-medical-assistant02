import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { downloadReport, errMsg } from '../api';
import { useAuth } from '../auth.jsx';
import Result from '../components/Result.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [items, setItems] = useState(null);
  const [open, setOpen] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => { api.get('/predictions').then((r) => setItems(r.data.predictions)).catch((e) => setErr(errMsg(e))); }, []);

  return (
    <>
      <h1>Hello, {user.name.split(' ')[0]}</h1>
      <p className="muted">Your previous symptom checks and reports.</p>
      {err && <p className="error">{err}</p>}
      {items && !items.length && (
        <div className="card empty">
          <h3>No checks yet</h3>
          <p className="muted">Start your first symptom check to get a report.</p>
          <Link className="primary btn" to="/check">Check symptoms</Link>
        </div>
      )}
      {items?.map((p) => (
        <article className="card hist" key={p._id}>
          <div className="hist-row">
            <div>
              <b>{p.results[0]?.disease || 'No result'}</b>
              <p className="muted small">{new Date(p.createdAt).toLocaleString()} · {p.symptoms.map((s) => s.replace(/_/g, ' ')).join(', ')}</p>
            </div>
            <div className="btns">
              <button className="ghost" onClick={() => setOpen(open === p._id ? null : p._id)}>{open === p._id ? 'Hide' : 'View'}</button>
              <button className="ghost" onClick={() => downloadReport(p._id)}>PDF</button>
            </div>
          </div>
          {open === p._id && <Result p={p} />}
        </article>
      ))}
    </>
  );
}
