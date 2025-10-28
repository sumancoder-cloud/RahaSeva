/**
 * Implementation of updateProfile for mock data support
 */

import * as authController from '../controllers/authController.js';

/**
 * Enhanced updateProfile function with fallback support
 */
export const updateProfile = async (req, res) => {
  if (req.isMongoConnected) {
    return authController.updateUserProfile(req, res);
  }
  
  // Mock implementation
  try {
    const { name, email, phone, address } = req.body;
    
    // Find user in mock data
    const user = await req.mockDataStore.findById('users', req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Update fields if provided
    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (phone) user.phone = phone;
    if (address) user.address = address;
    
    // Add update timestamp
    user.updatedAt = new Date();
    
    // Save updated user
    const updatedUser = await req.mockDataStore.update('users', user._id, user);
    
    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;
    
    res.json({
      success: true,
      msg: 'Profile updated successfully',
      user: userWithoutPassword
    });
  } catch (err) {
    console.error('Error in updateProfile (mock):', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};
