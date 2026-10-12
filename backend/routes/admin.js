const router = require('express').Router();
const bcrypt = require('bcryptjs');
const admin = require('../middleware/admin');
const User = require('../models/User');
const Prediction = require('../models/Prediction');

router.get('/stats', admin, async (req, res) => {
  const [users, predictions, emergencies] = await Promise.all([
    User.countDocuments({ role: { $ne: 'admin' } }),
    Prediction.countDocuments(),
    Prediction.countDocuments({ emergency: true }),
  ]);
  res.json({ users, predictions, emergencies });
});

router.get('/summary', admin, async (req, res) => {
  const [users, predictions, emergencies, recent] = await Promise.all([
    User.countDocuments({ role: { $ne: 'admin' } }),
    Prediction.countDocuments(),
    Prediction.countDocuments({ emergency: true }),
    Prediction.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(8),
  ]);
  res.json({ summary: { users, predictions, emergencies }, recent });
});

router.get('/users', admin, async (req, res) => {
  const users = await User.find({ role: { $ne: 'admin' } }).sort({ createdAt: -1 }).select('-password').lean();
  const counts = await Prediction.aggregate([
    { $match: { user: { $in: users.map((user) => user._id) } } },
    { $group: { _id: '$user', count: { $sum: 1 } } },
  ]);
  const countByUser = new Map(counts.map((item) => [String(item._id), item.count]));
  res.json({ users: users.map((user) => ({ ...user, predictionCount: countByUser.get(String(user._id)) || 0 })) });
});

router.delete('/users/:id', admin, async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  if (user.role === 'admin') return res.status(403).json({ message: 'Admin accounts cannot be deleted here.' });
  await Promise.all([User.deleteOne({ _id: id }), Prediction.deleteMany({ user: id })]);
  res.json({ message: `User '${user.email}' and their data have been removed.` });
});

router.get('/predictions', admin, async (req, res) => {
  const predictions = await Prediction.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(100);
  res.json({ predictions });
});

router.post('/create-admin', admin, async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required.' });
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ message: 'This email is already registered.' });
  const adminUser = await User.create({ name, email, password: await bcrypt.hash(password, 10), role: 'admin' });
  res.status(201).json({ id: adminUser._id, name: adminUser.name, email: adminUser.email, role: adminUser.role });
});

module.exports = router;
