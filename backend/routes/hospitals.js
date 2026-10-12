const router = require('express').Router();
const axios = require('axios');
const auth = require('../middleware/auth');

const km = (a, b, c, d) => {
  const R = 6371, r = (x) => (x * Math.PI) / 180;
  const dLat = r(c - a), dLon = r(d - b);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(a)) * Math.cos(r(c)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

// Uses free OpenStreetMap data (no API key needed)
router.get('/', auth, async (req, res) => {
  const lat = parseFloat(req.query.lat), lng = parseFloat(req.query.lng);
  const radius = Math.min(parseInt(req.query.radius) || 5000, 20000);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return res.status(400).json({ message: 'lat and lng are required.' });

  const q = `[out:json][timeout:25];(node["amenity"="hospital"](around:${radius},${lat},${lng});way["amenity"="hospital"](around:${radius},${lat},${lng}););out center 40;`;
  try {
    const r = await axios.post('https://overpass-api.de/api/interpreter', `data=${encodeURIComponent(q)}`, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 30000,
    });
    const hospitals = r.data.elements
      .map((e) => {
        const la = e.lat ?? e.center?.lat, lo = e.lon ?? e.center?.lon;
        if (la == null || lo == null) return null;
        const t = e.tags || {};
        return {
          id: e.id, name: t.name || 'Hospital (name not listed)', lat: la, lng: lo,
          phone: t.phone || t['contact:phone'] || null,
          address: [t['addr:street'], t['addr:city']].filter(Boolean).join(', ') || null,
          emergency: t.emergency === 'yes',
          distanceKm: Math.round(km(lat, lng, la, lo) * 10) / 10,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 20);
    res.json({ hospitals });
  } catch (e) {
    res.status(502).json({ message: 'Could not load hospitals right now. Try again in a minute.' });
  }
});

module.exports = router;
