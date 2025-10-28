import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const register = async (req, res) => {
  const { name, email, password, phone, role, service, location, experience, pricePerHour } = req.body;

  try {
    console.log('Registration attempt:', { name, email, role, phone: phone || 'none', location: location || 'none' });
    
    // Validate required fields
    if (!name || !email || !password) {
      console.log('Missing required fields:', { name: !!name, email: !!email, password: !!password });
      return res.status(400).json({ msg: 'Name, email, and password are required' });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ msg: 'Password must be at least 6 characters long' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ msg: 'Please enter a valid email address' });
    }

    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      console.log('User already exists:', email);
      return res.status(400).json({ msg: 'User already exists with this email' });
    }

    // Create new user fields
    const newUserFields = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone || '',
      role: role || 'user',
    };

    // Add location for all users (optional for regular users)
    if (location && location.trim()) {
      newUserFields.address = location.trim();
      newUserFields.coordinates = {
        type: 'Point',
        coordinates: [78.486671, 17.385044] // Default Hyderabad coordinates
      };
    }

    // Helper-specific validation and fields
    if (role === 'helper') {
      if (!service || !location || !experience || !pricePerHour) {
        console.log('Missing helper fields:', { service: !!service, location: !!location, experience: !!experience, pricePerHour: !!pricePerHour });
        return res.status(400).json({ 
          msg: 'Service type, location, experience, and pricing are required for helpers' 
        });
      }
      
      newUserFields.service = service;
      newUserFields.experience = parseInt(experience);
      newUserFields.pricePerHour = parseInt(pricePerHour);
      newUserFields.rating = 4.5; // Default rating for new helpers
    }

    console.log('Creating user with fields:', { ...newUserFields, password: '[HIDDEN]' });

    // Create new user
    user = new User(newUserFields);

    // Hash password
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(password, salt);

    // Save user to database
    await user.save();
    console.log('User saved successfully:', user.email);

    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };

    // Sign JWT
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' }, // Token expires in 7 days
      (err, token) => {
        if (err) {
          console.error('JWT signing error:', err);
          return res.status(500).json({ msg: 'Error creating authentication token' });
        }
        
        console.log('Registration successful for:', user.email);
        res.status(201).json({ 
          success: true,
          msg: 'User registered successfully', 
          token, 
          role: user.role,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            profile: user.profile
          }
        });
      }
    );
  } catch (err) {
    console.error('Registration error details:', {
      message: err.message,
      stack: err.stack,
      code: err.code,
      name: err.name
    });
    
    if (err.code === 11000) {
      return res.status(400).json({ msg: 'Email already exists' });
    }
    
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ msg: `Validation error: ${validationErrors.join(', ')}` });
    }
    
    res.status(500).json({ msg: 'Server error during registration' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ success: false, msg: 'Email and password are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, msg: 'Please enter a valid email address' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ success: false, msg: 'Password must be at least 6 characters long' });
    }

    // Check if user exists
    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ success: false, msg: 'Invalid email or password' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(400).json({ success: false, msg: 'Account is deactivated. Please contact support.' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, msg: 'Invalid email or password' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };

    // Sign JWT
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' }, // Token expires in 7 days
      (err, token) => {
        if (err) {
          console.error('JWT signing error:', err);
          return res.status(500).json({ msg: 'Error creating authentication token' });
        }
        
        res.json({ 
          success: true,
          msg: 'Logged in successfully', 
          token, 
          role: user.role,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            profile: user.profile
          }
        });
      }
    );
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ msg: 'Server error during login' });
  }
};

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json({
      user: user.profile,
      role: user.role
    });
  } catch (err) {
    console.error('Get profile error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  const { name, phone, location } = req.body;
  
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Update fields
    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (location) {
      user.location.address = location;
    }

    await user.save();
    
    res.json({
      msg: 'Profile updated successfully',
      user: user.profile
    });
  } catch (err) {
    console.error('Update profile error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};
