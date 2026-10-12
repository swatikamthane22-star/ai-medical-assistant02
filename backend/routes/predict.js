const router = require('express').Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Prediction = require('../models/Prediction');
const { ALL_SYMPTOMS, predict, enrich, isEmergency } = require('../utils/engine');
const buildReport = require('../utils/pdf');

router.get('/symptoms', (_req, res) => res.json({ symptoms: ALL_SYMPTOMS }));

router.post('/predict', auth, async (req, res) => {
  const { symptoms, age, gender } = req.body;
  const valid = (Array.isArray(symptoms) ? symptoms : []).filter((s) => ALL_SYMPTOMS.includes(s));
  if (valid.length < 2) return res.status(400).json({ message: 'Please select at least 2 symptoms.' });

  const { engine, list } = await predict(valid);
  const saved = await Prediction.create({
    user: req.userId, symptoms: valid, age, gender, engine,
    emergency: isEmergency(valid), results: enrich(list),
  });
  res.status(201).json({ prediction: saved });
});

router.get('/predictions', auth, async (req, res) => {
  const items = await Prediction.find({ user: req.userId }).sort({ createdAt: -1 }).limit(50);
  res.json({ predictions: items });
});

router.get('/predictions/:id/report', auth, async (req, res) => {
  const prediction = await Prediction.findOne({ _id: req.params.id, user: req.userId });
  if (!prediction) return res.status(404).json({ message: 'Report not found.' });
  const user = await User.findById(req.userId);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=health-report-${prediction._id}.pdf`);
  buildReport(res, { user, prediction });
});

module.exports = router;
