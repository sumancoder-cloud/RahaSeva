/**
 * Auth Controller Adapter
 * 
 * This adapter extends the auth controller to use mock data when
 * the database is not available.
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import * as authController from '../controllers/authController.js';

/**
 * Enhanced register function with fallback support
 */
export const register = async (req, res) => {
  if (req.isMongoConnected) {
    return authController.register(req, res);
  }
  
  // Mock implementation
  try {
    const { name, email, password, phone, role } = req.body;
    
    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ msg: 'Name, email, and password are required' });
    }
    
    // Check if user exists in mock data
    const existingUser = await req.mockDataStore.findOne('users', { email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists with this email' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user in mock data
    const newUser = await req.mockDataStore.create('users', {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || '',
      role: role || 'user',
      isVerified: true, // Auto verify in mock mode
      createdAt: new Date()
    });
    
    // Generate JWT
    const payload = {
      user: {
        id: newUser._id,
        role: newUser.role
      }
    };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'mock-jwt-secret',
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        
        // Success response
        res.status(201).json({
          msg: 'User registered successfully',
          token,
          user: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
          }
        });
      }
    );
  } catch (err) {
    console.error('Error in register (mock):', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * Enhanced login function with fallback support
 */
export const login = async (req, res) => {
  if (req.isMongoConnected) {
    return authController.login(req, res);
  }
  
  // Mock implementation
  try {
    const { email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ msg: 'Email and password are required' });
    }
    
    // Check if user exists in mock data
    const user = await req.mockDataStore.findOne('users', { email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    
    // Generate JWT
    const payload = {
      user: {
        id: user._id,
        role: user.role
      }
    };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'mock-jwt-secret',
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        
        // Success response
        res.json({
          msg: 'Login successful',
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          }
        });
      }
    );
  } catch (err) {
    console.error('Error in login (mock):', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * Enhanced getUserProfile function with fallback support
 */
export const getUserProfile = async (req, res) => {
  if (req.isMongoConnected) {
    return authController.getUserProfile(req, res);
  }
  
  // Mock implementation
  try {
    // In mock mode, use the ID from JWT
    const user = await req.mockDataStore.findById('users', req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    res.json({
      user: userWithoutPassword
    });
  } catch (err) {
    console.error('Error in getUserProfile (mock):', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Export other functions from original controller with fallback handlers
export const { verifyEmail, forgotPassword, resetPassword, updatePassword, updateProfile } = authController;
