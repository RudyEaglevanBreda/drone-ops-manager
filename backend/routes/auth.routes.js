const express = require('express');
const router = express.Router();
const { login, register, getCurrentUser, updateProfile, changePassword } = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Authentication routes
router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, getCurrentUser);
router.put('/profile', authenticateToken, updateProfile);
router.put('/change-password', authenticateToken, changePassword);

module.exports = router;
