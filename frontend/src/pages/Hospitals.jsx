import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api, { errMsg } from '../api';

export default function Hospitals() {
  const mapEl = useRef(null);
  const map = useRef(null);
  const layer = useRef(null);
  const [radius, setRadius] = useState(5000);
  const [list, setList] = useState(null);
  const [me, setMe] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    map.current = L.map(mapEl.current).setView([12.9716, 77.5946], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' }).addTo(map.current);
    layer.current = L.layerGroup().addTo(map.current);
    return () => map.current.remove();
  }, []);

  const draw = (pos, hospitals) => {
    layer.current.clearLayers();
    L.circleMarker(pos, { radius: 9, color: '#0f4c45', fillColor: '#0f4c45', fillOpacity: 1 }).bindPopup('You are here').addTo(layer.current);
    hospitals.forEach((h) =>
      L.circleMarker([h.lat, h.lng], { radius: 8, color: '#c8321e', fillColor: '#e4572e', fillOpacity: 0.9 })
        .bindPopup(`<b>${h.name}</b><br/>${h.distanceKm} km away${h.phone ? `<br/>${h.phone}` : ''}`).addTo(layer.current));
    const pts = [pos, ...hospitals.map((h) => [h.lat, h.lng])];
    map.current.fitBounds(L.latLngBounds(pts), { padding: [30, 30], maxZoom: 15 });
  };

  const find = () => {
    setErr(''); setBusy(true);
    if (!navigator.geolocation) { setErr('Your browser does not support location.'); setBusy(false); return; }
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const pos = [coords.latitude, coords.longitude];
      setMe(pos);
      try {
        const r = await api.get('/hospitals', { params: { lat: pos[0], lng: pos[1], radius } });
        setList(r.data.hospitals); draw(pos, r.data.hospitals);
      } catch (e) { setErr(errMsg(e)); } finally { setBusy(false); }
    }, () => { setErr('Location permission denied. Allow location access in your browser and try again.'); setBusy(false); });
  };

  const directions = (h) => `https://www.openstreetmap.org/directions?from=${me?.[0]},${me?.[1]}&to=${h.lat},${h.lng}`;

  return (
    <>
      <h1>Nearby hospitals</h1>
      <div className="toolbar">
        <label>Search radius
          <select value={radius} onChange={(e) => setRadius(Number(e.target.value))}>
            <option value={3000}>3 km</option><option value={5000}>5 km</option>
            <option value={10000}>10 km</option><option value={20000}>20 km</option>
          </select>
        </label>
        <button className="primary" onClick={find} disabled={busy}>{busy ? 'Searching…' : 'Find hospitals near me'}</button>
      </div>
      {err && <p className="error">{err}</p>}
      <div className="map" ref={mapEl} />
      {list && !list.length && <p className="muted">No hospitals found in this radius. Try a larger radius.</p>}
      <div className="hosp">
        {list?.map((h) => (
          <article className="card" key={h.id}>
            <b>{h.name}</b>
            <p className="muted small">{h.distanceKm} km away{h.address ? ` · ${h.address}` : ''}</p>
            <div className="btns">
              {h.phone && <a className="ghost btn" href={`tel:${h.phone}`}>Call {h.phone}</a>}
              <a className="ghost btn" href={directions(h)} target="_blank" rel="noreferrer">Directions</a>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
