const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const sign = (u) => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const pub = (u) => ({ id: u._id, name: u.name, email: u.email, age: u.age, gender: u.gender, role: u.role });

router.post('/register', async (req, res) => {
  const { name, email, password, age, gender } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required.' });
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ message: 'This email is already registered.' });
  const user = await User.create({ name, email, age, gender, password: await bcrypt.hash(password, 10) });
  res.status(201).json({ token: sign(user), user: pub(user) });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() });
  if (!user || !(await bcrypt.compare(password || '', user.password)))
    return res.status(401).json({ message: 'Wrong email or password.' });
  res.json({ token: sign(user), user: pub(user) });
});

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  res.json({ user: pub(user) });
});

module.exports = router;
