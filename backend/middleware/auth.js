const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Please log in first.' });
  try {
    req.userId = jwt.verify(token, process.env.JWT_SECRET).id;
    next();
  } catch {
    res.status(401).json({ message: 'Session expired. Please log in again.' });
  }
};
