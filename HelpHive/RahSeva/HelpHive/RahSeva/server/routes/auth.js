import express from 'express';
import * as authAdapter from '../adapters/authAdapter.js';
import { updateProfile } from '../adapters/profileAdapter.js';
import auth from '../middleware/authAdapter.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register user or helper
// @access  Public
router.post('/register', authAdapter.register);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', authAdapter.login);

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, authAdapter.getUserProfile);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, updateProfile);

export default router;
