import { downloadReport } from '../api';

const pretty = (s) => s.replace(/_/g, ' ');

export default function Result({ p }) {
  return (
    <section className="result">
      {p.emergency && (
        <div className="alert">
          <strong>Possible emergency.</strong> Chest pain or breathing trouble can be serious. Go to the nearest hospital or call 108 / 112 now.
        </div>
      )}
      <div className="result-head">
        <div>
          <h2>Possible conditions</h2>
          <p className="muted small">Symptoms: {p.symptoms.map(pretty).join(', ')} · engine: {p.engine}</p>
        </div>
        <button className="primary" onClick={() => downloadReport(p._id)}>Download PDF report</button>
      </div>

      {p.results.map((r, i) => (
        <article className="card cond" key={r.disease}>
          <div className="cond-top">
            <h3>{i + 1}. {r.disease}</h3>
            <span className={`tag ${r.severity}`}>{r.severity} severity</span>
          </div>
          <div className="bar"><i style={{ width: `${r.probability}%` }} /></div>
          <p className="small"><b>{r.probability}%</b> match · See: {r.doctor}</p>
          <div className="cols">
            <div><h4>Medicine guidance</h4><ul>{r.medicines.map((m) => <li key={m}>{m}</li>)}</ul></div>
            <div><h4>Precautions</h4><ul>{r.precautions.map((m) => <li key={m}>{m}</li>)}</ul></div>
          </div>
        </article>
      ))}
      <p className="muted small">This is not a diagnosis. Confirm with a qualified doctor before taking any medicine.</p>
    </section>
  );
}
