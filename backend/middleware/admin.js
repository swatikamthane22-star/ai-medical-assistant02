const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Please log in first.' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ message: 'User not found.' });
    if (user.role !== 'admin') return res.status(403).json({ message: 'Admin access is required.' });
    req.userId = user._id;
    req.user = { id: user._id, name: user.name, email: user.email, role: user.role };
    next();
  } catch {
    res.status(401).json({ message: 'Session expired. Please log in again.' });
  }
};
