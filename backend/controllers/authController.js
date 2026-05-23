const pool = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/passwordUtils');
const { generateToken } = require('../utils/jwtUtils');

// User Login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Find user by username
    const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    const user = userResult.rows[0];

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'User account is inactive'
      });
    }

    // Compare passwords
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Generate JWT token
    const token = generateToken(user.user_id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

// Logout (Client-side implementation - token removal)
const logout = (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

module.exports = {
  login,
  logout
};
