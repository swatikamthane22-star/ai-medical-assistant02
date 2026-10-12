const axios = require('axios');
const data = require('../data/diseases.json');

const ALL_SYMPTOMS = [...new Set(data.diseases.flatMap((d) => d.symptoms))].sort();

// Built-in rule engine: used when the Python ML service is not running.
function localPredict(symptoms) {
  const chosen = new Set(symptoms);
  const scored = data.diseases.map((d) => {
    const matched = d.symptoms.filter((s) => chosen.has(s)).length;
    const score = matched === 0 ? 0 : (matched / d.symptoms.length) * 0.6 + (matched / chosen.size) * 0.4;
    return { disease: d.name, score };
  });
  const total = scored.reduce((a, b) => a + b.score, 0) || 1;
  return scored
    .filter((s) => s.score > 0)
    .map((s) => ({ disease: s.disease, probability: s.score / total }))
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 3);
}

async function predict(symptoms) {
  const url = process.env.ML_SERVICE_URL;
  if (url) {
    try {
      const r = await axios.post(`${url}/predict`, { symptoms }, { timeout: 3000 });
      if (r.data?.predictions?.length) return { engine: 'ml-model', list: r.data.predictions };
    } catch { /* fall back below */ }
  }
  return { engine: 'rule-engine', list: localPredict(symptoms) };
}

function enrich(list) {
  return list.map((p) => {
    const info = data.diseases.find((d) => d.name === p.disease) || {};
    return {
      disease: p.disease,
      probability: Math.round(p.probability * 1000) / 10, // percent
      severity: info.severity || 'low',
      doctor: info.doctor || 'General Physician',
      medicines: info.medicines || [],
      precautions: info.precautions || [],
    };
  });
}

const isEmergency = (symptoms) => symptoms.some((s) => data.emergencySymptoms.includes(s));

module.exports = { ALL_SYMPTOMS, predict, enrich, isEmergency };
