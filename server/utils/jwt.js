// jwt.js
const jwt = require('jsonwebtoken');
exports.generateToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
exports.verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);
