import express from 'express';
import jwt from 'jsonwebtoken';
import * as authAdapter from '../adapters/authAdapter.js';
import { updateProfile } from '../adapters/profileAdapter.js';
import auth from '../middleware/authAdapter.js';
import User from '../models/User.js';

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

// @route   POST /api/auth/google
// @desc    Google OAuth authentication
// @access  Public
router.post('/google', async (req, res) => {
    try {
        console.log('Google auth request received:', req.body);
        
        const { email, name, picture, sub } = req.body;
        
        if (!email || !name || !sub) {
            return res.status(400).json({ 
                message: 'Missing required fields from Google' 
            });
        }
        
        // Check if user exists
        let user = await User.findOne({ email });
        
        if (!user) {
            console.log('Creating new user for:', email);
            // Create new user with Google info
            user = new User({
                name,
                email,
                profilePicture: picture || '',
                googleId: sub,
                isVerified: true,
                password: 'GOOGLE_AUTH_NO_PASSWORD_NEEDED', // Placeholder for Google users
                role: 'user', // Default role
                phone: '',
                address: 'Not specified',
                coinsEarned: 250, // Welcome bonus
                coordinates: {
                    type: 'Point',
                    coordinates: [78.486671, 17.385044] // Default coordinates
                }
            });
            await user.save();
            console.log('New user created successfully:', user._id);
        } else {
            console.log('Existing user found:', user._id);
            // Update googleId if not set
            if (!user.googleId) {
                user.googleId = sub;
                user.profilePicture = picture || user.profilePicture;
                await user.save();
            }
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        console.log('Google auth successful for:', email);
        
        res.json({ 
            token, 
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture
            }
        });

    } catch (error) {
        console.error('Google auth error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        res.status(500).json({ 
            message: 'Server error during Google authentication',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

export default router;
