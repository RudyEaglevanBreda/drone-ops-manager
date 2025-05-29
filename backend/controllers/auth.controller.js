const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const config = require('../config/config');
const { ApiError } = require('../middleware/errorHandler');

const AuthController = {
  /**
   * Register a new user
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   */
  async register(req, res, next) {
    try {
      const { username, email, password, firstName, lastName, role } = req.body;

      // Check if user already exists
      const existingUserByEmail = await User.findByEmail(email);
      if (existingUserByEmail) {
        throw new ApiError('User with this email already exists', 400);
      }

      const existingUserByUsername = await User.findByUsername(username);
      if (existingUserByUsername) {
        throw new ApiError('Username already taken', 400);
      }

      // Create new user
      const newUser = await User.create({
        username,
        email,
        password,
        firstName,
        lastName,
        role
      });

      // Generate JWT token
      const payload = {
        user: {
          id: newUser.userid,
          username: newUser.username,
          role: newUser.role
        }
      };

      jwt.sign(
        payload,
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn },
        (err, token) => {
          if (err) throw err;
          res.status(201).json({
            token,
            user: {
              id: newUser.userid,
              username: newUser.username,
              email: newUser.email,
              firstName: newUser.firstname,
              lastName: newUser.lastname,
              role: newUser.role
            }
          });
        }
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * Login user
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        throw new ApiError('Invalid credentials', 401);
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.passwordhash);
      if (!isMatch) {
        throw new ApiError('Invalid credentials', 401);
      }

      // Update last login time
      await User.updateLastLogin(user.userid);

      // Generate JWT token
      const payload = {
        user: {
          id: user.userid,
          username: user.username,
          role: user.role
        }
      };

      jwt.sign(
        payload,
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn },
        (err, token) => {
          if (err) throw err;
          res.json({
            token,
            user: {
              id: user.userid,
              username: user.username,
              email: user.email,
              firstName: user.firstname,
              lastName: user.lastname,
              role: user.role
            }
          });
        }
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get current user profile
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   */
  async getProfile(req, res, next) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        throw new ApiError('User not found', 404);
      }

      res.json({
        id: user.userid,
        username: user.username,
        email: user.email,
        firstName: user.firstname,
        lastName: user.lastname,
        role: user.role,
        createdAt: user.createdat,
        lastLogin: user.lastlogin
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = AuthController;
