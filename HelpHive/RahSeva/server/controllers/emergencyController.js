import EmergencyService from '../models/EmergencyService.js';
import User from '../models/User.js';
import ServiceProvider from '../models/ServiceProvider.js';
import mongoose from 'mongoose';

/**
 * Emergency Service Controller - Handles emergency service requests
 * Supports the Emergency Mode feature in the HelpHive platform
 */

// Request emergency service
export const requestEmergencyService = async (req, res) => {
  try {
    const { serviceType, description, location, priority } = req.body;
    
    // Validate required fields
    if (!serviceType || !description || !location || !location.coordinates) {
      return res.status(400).json({ 
        success: false, 
        message: 'Service type, description, and location are required' 
      });
    }
    
    // Parse coordinates
    const coordinates = location.coordinates.map(coord => parseFloat(coord));
    
    // Create new emergency service request
    const emergencyService = new EmergencyService({
      user: req.user.id,
      serviceType,
      description,
      location: {
        address: location.address || 'Location provided by coordinates',
        coordinates: {
          type: 'Point',
          coordinates
        }
      },
      priority: priority || 'high'
    });
    
    await emergencyService.save();
    
    // Start provider search process (would typically be handled by a separate process)
    findNearbyProviders(emergencyService);
    
    res.status(201).json({
      success: true,
      message: 'Emergency service request created successfully',
      data: {
        id: emergencyService._id,
        status: emergencyService.status,
        statusDisplay: emergencyService.statusDisplay,
        trackingLink: emergencyService.trackingLink
      }
    });
  } catch (err) {
    console.error('Error in requestEmergencyService:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// Helper function to find nearby providers
// In a real implementation, this would likely be a separate service/worker
const findNearbyProviders = async (emergencyService) => {
  try {
    // Update status to searching
    emergencyService.status = 'searching';
    await emergencyService.save();
    
    // Find nearby service providers
    const providers = await User.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: emergencyService.location.coordinates.coordinates
          },
          distanceField: 'distance',
          maxDistance: 10000, // 10km radius
          spherical: true,
          query: {
            role: 'helper',
            service: emergencyService.serviceType,
            isActive: true
          }
        }
      },
      { $limit: 5 } // Limit to nearest 5 providers
    ]);
    
    // In a real implementation, you would:
    // 1. Send notifications to these providers
    // 2. Wait for acceptance
    // 3. Assign to the first provider who accepts
    
    console.log(`Found ${providers.length} nearby providers for emergency service ${emergencyService._id}`);
    
    // For demo purposes, simulate assignment to the nearest provider
    if (providers.length > 0) {
      const nearestProvider = providers[0];
      
      // Update emergency service with assigned provider
      emergencyService.provider = nearestProvider._id;
      emergencyService.status = 'assigned';
      emergencyService.assignedAt = new Date();
      emergencyService.estimatedArrival = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
      
      // Add tracking entry
      emergencyService.tracking.push({
        status: 'assigned',
        location: {
          coordinates: nearestProvider.coordinates.coordinates
        },
        timestamp: new Date(),
        notes: `Assigned to provider ${nearestProvider.name}`
      });
      
      await emergencyService.save();
      console.log(`Emergency service ${emergencyService._id} assigned to provider ${nearestProvider._id}`);
    } else {
      console.log(`No providers found for emergency service ${emergencyService._id}`);
    }
  } catch (err) {
    console.error('Error finding nearby providers:', err);
  }
};

// Get emergency service by ID
export const getEmergencyServiceById = async (req, res) => {
  try {
    const emergencyService = await EmergencyService.findById(req.params.id)
      .populate('user', 'name phone')
      .populate('provider', 'name phone');
    
    if (!emergencyService) {
      return res.status(404).json({ success: false, message: 'Emergency service not found' });
    }
    
    // Check if user is authorized to view this emergency service
    if (emergencyService.user._id.toString() !== req.user.id && 
        (emergencyService.provider && emergencyService.provider._id.toString() !== req.user.id) &&
        req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this emergency service' });
    }
    
    res.json({
      success: true,
      data: emergencyService
    });
  } catch (err) {
    console.error('Error in getEmergencyServiceById:', err.message);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Update emergency service status
export const updateEmergencyServiceStatus = async (req, res) => {
  try {
    const { status, coordinates, notes } = req.body;
    
    if (!status || !coordinates) {
      return res.status(400).json({ 
        success: false, 
        message: 'Status and coordinates are required' 
      });
    }
    
    const emergencyService = await EmergencyService.findById(req.params.id);
    
    if (!emergencyService) {
      return res.status(404).json({ success: false, message: 'Emergency service not found' });
    }
    
    // Check if the provider is authorized to update this emergency service
    if (emergencyService.provider && emergencyService.provider.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this emergency service' });
    }
    
    // Update tracking
    await emergencyService.updateTracking(status, coordinates, notes);
    
    res.json({
      success: true,
      message: 'Emergency service status updated',
      data: {
        id: emergencyService._id,
        status: emergencyService.status,
        statusDisplay: emergencyService.statusDisplay
      }
    });
  } catch (err) {
    console.error('Error in updateEmergencyServiceStatus:', err.message);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Get all emergency services for a user
export const getUserEmergencyServices = async (req, res) => {
  try {
    const emergencyServices = await EmergencyService.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('provider', 'name phone');
    
    res.json({
      success: true,
      count: emergencyServices.length,
      data: emergencyServices
    });
  } catch (err) {
    console.error('Error in getUserEmergencyServices:', err.message);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Get all emergency services for a provider
export const getProviderEmergencyServices = async (req, res) => {
  try {
    const emergencyServices = await EmergencyService.find({ provider: req.user.id })
      .sort({ createdAt: -1 })
      .populate('user', 'name phone');
    
    res.json({
      success: true,
      count: emergencyServices.length,
      data: emergencyServices
    });
  } catch (err) {
    console.error('Error in getProviderEmergencyServices:', err.message);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Cancel emergency service
export const cancelEmergencyService = async (req, res) => {
  try {
    const { reason } = req.body;
    
    const emergencyService = await EmergencyService.findById(req.params.id);
    
    if (!emergencyService) {
      return res.status(404).json({ success: false, message: 'Emergency service not found' });
    }
    
    // Check if the user is authorized to cancel this emergency service
    if (emergencyService.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this emergency service' });
    }
    
    // Can't cancel if it's already completed
    if (emergencyService.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Cannot cancel a completed emergency service' });
    }
    
    emergencyService.status = 'cancelled';
    emergencyService.tracking.push({
      status: 'cancelled',
      location: emergencyService.location.coordinates,
      timestamp: new Date(),
      notes: reason || 'Cancelled by user'
    });
    
    await emergencyService.save();
    
    res.json({
      success: true,
      message: 'Emergency service cancelled successfully',
      data: {
        id: emergencyService._id,
        status: emergencyService.status,
        statusDisplay: emergencyService.statusDisplay
      }
    });
  } catch (err) {
    console.error('Error in cancelEmergencyService:', err.message);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Submit feedback for emergency service
export const submitEmergencyFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Valid rating between 1 and 5 is required' });
    }
    
    const emergencyService = await EmergencyService.findById(req.params.id);
    
    if (!emergencyService) {
      return res.status(404).json({ success: false, message: 'Emergency service not found' });
    }
    
    // Check if the user is authorized to submit feedback for this emergency service
    if (emergencyService.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to submit feedback for this emergency service' });
    }
    
    // Can't submit feedback if not completed
    if (emergencyService.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Can only submit feedback for completed emergency services' });
    }
    
    emergencyService.feedback = {
      rating,
      comment,
      providedAt: new Date()
    };
    
    await emergencyService.save();
    
    // Update provider's rating if available
    if (emergencyService.provider) {
      const provider = await ServiceProvider.findById(emergencyService.provider);
      
      if (provider) {
        // Calculate new rating average
        const newTotalReviews = provider.rating.totalReviews + 1;
        const newRatingAvg = 
          ((provider.rating.average * provider.rating.totalReviews) + rating) / newTotalReviews;
        
        provider.rating.average = newRatingAvg;
        provider.rating.totalReviews = newTotalReviews;
        
        await provider.save();
      }
    }
    
    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      data: {
        id: emergencyService._id,
        feedback: emergencyService.feedback
      }
    });
  } catch (err) {
    console.error('Error in submitEmergencyFeedback:', err.message);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
