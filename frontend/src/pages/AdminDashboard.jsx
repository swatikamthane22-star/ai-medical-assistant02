import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';

const tabs = ['Overview', 'Users', 'Reports'];

export default function AdminDashboard() {
  const [tab, setTab] = useState('Overview');
  const [summary, setSummary] = useState(null);
  const [users, setUsers] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  useEffect(() => {
    setError('');
    const endpoint = tab === 'Overview' ? '/admin/summary' : tab === 'Users' ? '/admin/users' : '/admin/predictions';
    api.get(endpoint).then(({ data }) => {
      if (tab === 'Overview') setSummary(data);
      if (tab === 'Users') setUsers(data.users);
      if (tab === 'Reports') setPredictions(data.predictions);
    }).catch((e) => setError(errMsg(e)));
  }, [tab]);

  const removeUser = async (user) => {
    if (!window.confirm(`Delete ${user.name} and all ${user.predictionCount} associated reports? This cannot be undone.`)) return;
    setBusyId(user._id);
    try {
      await api.delete(`/admin/users/${user._id}`);
      setUsers((items) => items.filter((item) => item._id !== user._id));
    } catch (e) { setError(errMsg(e)); } finally { setBusyId(''); }
  };

  const removePrediction = async (prediction) => {
    if (!window.confirm('Delete this health report permanently?')) return;
    setBusyId(prediction._id);
    try {
      await api.delete(`/admin/predictions/${prediction._id}`);
      setPredictions((items) => items.filter((item) => item._id !== prediction._id));
    } catch (e) { setError(errMsg(e)); } finally { setBusyId(''); }
  };

  const filteredUsers = users?.filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <section className="admin-page">
      <div className="admin-heading">
        <div><p className="eyebrow">MEDIASSIST / ADMINISTRATION</p><h1>Admin console</h1></div>
        <span className="admin-role">Administrator</span>
      </div>
      <nav className="admin-tabs" aria-label="Admin sections">
        {tabs.map((item) => <button key={item} className={tab === item ? 'selected' : ''} onClick={() => setTab(item)}>{item}</button>)}
      </nav>
      {error && <p className="error" role="alert">{error}</p>}

      {tab === 'Overview' && (
        summary ? <>
          <div className="admin-stats">
            <article><span>Patient accounts</span><strong>{summary.summary.users}</strong></article>
            <article><span>Health reports</span><strong>{summary.summary.predictions}</strong></article>
            <article><span>Emergency flags</span><strong>{summary.summary.emergencies}</strong></article>
          </div>
          <div className="admin-section-head"><h2>Recent reports</h2><button className="ghost" onClick={() => setTab('Reports')}>View all</button></div>
          <PredictionList predictions={summary.recent} />
        </> : <p className="muted">Loading overview…</p>
      )}

      {tab === 'Users' && (
        users ? <>
          <label className="admin-search">Find a patient<input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name or email" /></label>
          <div className="admin-table-wrap"><table className="admin-table">
            <thead><tr><th>Patient</th><th>Joined</th><th>Reports</th><th>Action</th></tr></thead>
            <tbody>{filteredUsers.map((user) => <tr key={user._id}>
              <td><strong>{user.name}</strong><span>{user.email}</span></td>
              <td>{new Date(user.createdAt).toLocaleDateString()}</td>
              <td>{user.predictionCount}</td>
              <td><button className="danger-button" disabled={busyId === user._id} onClick={() => removeUser(user)}>{busyId === user._id ? 'Deleting…' : 'Delete account'}</button></td>
            </tr>)}</tbody>
          </table>{!filteredUsers.length && <p className="empty muted">No matching patients.</p>}</div>
          <p className="muted small">Showing up to 200 patient accounts.</p>
        </> : <p className="muted">Loading patient accounts…</p>
      )}

      {tab === 'Reports' && (predictions ? <PredictionList predictions={predictions} onDelete={removePrediction} busyId={busyId} /> : <p className="muted">Loading reports…</p>)}
    </section>
  );
}

function PredictionList({ predictions = [], onDelete, busyId }) {
  if (!predictions.length) return <p className="empty muted">No reports found.</p>;
  return <div className="admin-report-list">{predictions.map((item) => (
    <article className="admin-report" key={item._id}>
      <div className="admin-report-main">
        <strong>{item.results?.[0]?.disease || 'No result'}</strong>
        <span>{item.user?.name || 'Deleted account'} · {item.user?.email || '—'}</span>
        <span className="muted small">{new Date(item.createdAt).toLocaleString()} · {item.symptoms?.map((symptom) => symptom.replace(/_/g, ' ')).join(', ')}</span>
      </div>
      <div className="admin-report-actions">
        {item.emergency && <span className="tag high">Emergency</span>}
        {onDelete && <button className="danger-button" disabled={busyId === item._id} onClick={() => onDelete(item)}>{busyId === item._id ? 'Deleting…' : 'Delete report'}</button>}
      </div>
    </article>
  ))}</div>;
}