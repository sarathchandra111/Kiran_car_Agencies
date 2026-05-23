const pool = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/passwordUtils');

// Create Supervisor Account (Admin only)
const createSupervisor = async (req, res) => {
  try {
    const { name, username, password, mobile_number, email, status } = req.body;

    // Validation
    if (!name || !username || !password || !mobile_number || !email) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if username exists
    const userCheck = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create supervisor
    const result = await pool.query(
      `INSERT INTO users (name, username, password, email, mobile_number, role, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING user_id, name, username, email, role, status, created_at`,
      [name, username, hashedPassword, email, mobile_number, 'supervisor', status || 'active', req.user.userId]
    );

    res.status(201).json({
      success: true,
      message: 'Supervisor account created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create Supervisor error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

// Create Advisor Account (Admin only)
const createAdvisor = async (req, res) => {
  try {
    const { name, username, password, mobile_number, email, assigned_supervisor_id, status } = req.body;

    // Validation
    if (!name || !username || !password || !mobile_number || !email || !assigned_supervisor_id) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if username exists
    const userCheck = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // Verify supervisor exists
    const supervisorCheck = await pool.query(
      'SELECT * FROM users WHERE user_id = $1 AND role = $2',
      [assigned_supervisor_id, 'supervisor']
    );
    if (supervisorCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid supervisor ID'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create advisor
    const result = await pool.query(
      `INSERT INTO users (name, username, password, email, mobile_number, role, assigned_supervisor_id, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING user_id, name, username, email, role, assigned_supervisor_id, status, created_at`,
      [name, username, hashedPassword, email, mobile_number, 'advisor', assigned_supervisor_id, status || 'active', req.user.userId]
    );

    res.status(201).json({
      success: true,
      message: 'Advisor account created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create Advisor error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

// Get All Users
const getAllUsers = async (req, res) => {
  try {
    const { role, status } = req.query;
    let query = 'SELECT user_id, name, username, email, mobile_number, role, status, created_at FROM users WHERE 1=1';
    const params = [];

    if (role) {
      query += ' AND role = $' + (params.length + 1);
      params.push(role);
    }

    if (status) {
      query += ' AND status = $' + (params.length + 1);
      params.push(status);
    }

    const result = await pool.query(query, params);

    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

// Get User by ID
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      'SELECT user_id, name, username, email, mobile_number, role, status, created_at FROM users WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

// Update User Profile
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, mobile_number, status } = req.body;

    const result = await pool.query(
      `UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email), 
       mobile_number = COALESCE($3, mobile_number), status = COALESCE($4, status), updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $5
       RETURNING user_id, name, username, email, mobile_number, role, status, updated_at`,
      [name, email, mobile_number, status, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password is required'
      });
    }

    const hashedPassword = await hashPassword(newPassword);

    const result = await pool.query(
      `UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2
       RETURNING user_id, username, email, role`,
      [hashedPassword, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

// Delete User
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query('DELETE FROM users WHERE user_id = $1 RETURNING user_id', [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

module.exports = {
  createSupervisor,
  createAdvisor,
  getAllUsers,
  getUserById,
  updateUser,
  resetPassword,
  deleteUser
};
