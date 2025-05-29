const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { auth } = require('../middleware/auth.middleware');

// Authentication routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/me', auth, AuthController.getProfile);

// These routes aren't implemented yet, commenting out for now
// router.put('/profile', authenticateToken, AuthController.updateProfile);
// router.put('/change-password', authenticateToken, AuthController.changePassword);

module.exports = router;
