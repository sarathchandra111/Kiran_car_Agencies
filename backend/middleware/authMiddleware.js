const { verifyToken } = require('../utils/jwtUtils');

// Verify JWT Token Middleware
const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token is required'
      });
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || 'Unauthorized access'
    });
  }
};

module.exports = authMiddleware;
