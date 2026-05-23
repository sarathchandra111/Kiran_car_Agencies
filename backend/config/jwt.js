// JWT Configuration
module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  ALGORITHM: 'HS256'
};
