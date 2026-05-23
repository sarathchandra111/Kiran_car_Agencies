const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

// Generate JWT Token
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    jwtConfig.JWT_SECRET,
    { expiresIn: jwtConfig.JWT_EXPIRE, algorithm: jwtConfig.ALGORITHM }
  );
};

// Verify JWT Token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or Expired Token');
  }
};

module.exports = {
  generateToken,
  verifyToken
};
