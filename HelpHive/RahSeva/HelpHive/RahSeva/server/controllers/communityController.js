import CommunityVolunteer from '../models/CommunityVolunteer.js';
import CommunityHelpRequest from '../models/CommunityHelpRequest.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

/**
 * Community Help Controller - Handles community volunteer services
 * Supports the Community Help Mode feature in the HelpHive platform
 */

// Register as volunteer
export const registerAsVolunteer = async (req, res) => {
  try {
    const {
      name,
      skills,
      organization,
      isNGO,
      contact,
      availability,
      location,
      bio,
      experience,
      servicesOffered
    } = req.body;

    // Validate required fields
    if (!name || !skills || !skills.length || !contact || !contact.phone || !location || !location.address) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if user already registered as volunteer
    const existingVolunteer = await CommunityVolunteer.findOne({ user: req.user.id });

    if (existingVolunteer) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered as a volunteer'
      });
    }

    // Parse coordinates
    let coordinates = [78.486671, 17.385044]; // Default Hyderabad
    if (location.coordinates && location.coordinates.length === 2) {
      coordinates = location.coordinates.map(coord => parseFloat(coord));
    }

    // Create new volunteer
    const volunteer = new CommunityVolunteer({
      user: req.user.id,
      name,
      skills,
      organization: organization || '',
      isNGO: isNGO || false,
      contact: {
        phone: contact.phone,
        email: contact.email || req.user.email,
        whatsapp: contact.whatsapp || ''
      },
      availability: {
        days: availability && availability.days ? availability.days : ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        hours: {
          start: availability && availability.hours ? availability.hours.start : '09:00',
          end: availability && availability.hours ? availability.hours.end : '18:00',
        },
        frequency: availability && availability.frequency ? availability.frequency : 'weekly'
      },
      location: {
        address: location.address,
        city: location.city || '',
        state: location.state || '',
        coordinates: {
          type: 'Point',
          coordinates
        },
        serviceRadius: location.serviceRadius || 10
      },
      bio: bio || '',
      experience: experience || 0,
      servicesOffered: servicesOffered || skills.map(skill => ({ service: skill, description: '' }))
    });

    await volunteer.save();

    // Update user role if not already helper
    const user = await User.findById(req.user.id);
    if (user && user.role === 'user') {
      user.role = 'helper';
      await user.save();
    }

    res.status(201).json({
      success: true,
      message: 'Successfully registered as a community volunteer',
      data: {
        id: volunteer._id,
        name: volunteer.name,
        skills: volunteer.skills
      }
    });
  } catch (err) {
    console.error('Error in registerAsVolunteer:', err.message);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Get volunteer profile
export const getVolunteerProfile = async (req, res) => {
  try {
    const volunteer = await CommunityVolunteer.findOne({ user: req.user.id });

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer profile not found'
      });
    }

    res.json({
      success: true,
      data: volunteer
    });
  } catch (err) {
    console.error('Error in getVolunteerProfile:', err.message);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Update volunteer profile
export const updateVolunteerProfile = async (req, res) => {
  try {
    const {
      name,
      skills,
      organization,
      isNGO,
      contact,
      availability,
      location,
      bio,
      experience,
      servicesOffered
    } = req.body;

    // Find volunteer
    const volunteer = await CommunityVolunteer.findOne({ user: req.user.id });

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer profile not found'
      });
    }

    // Update fields
    if (name) volunteer.name = name;
    if (skills && skills.length) volunteer.skills = skills;
    if (organization !== undefined) volunteer.organization = organization;
    if (isNGO !== undefined) volunteer.isNGO = isNGO;
    
    if (contact) {
      if (contact.phone) volunteer.contact.phone = contact.phone;
      if (contact.email) volunteer.contact.email = contact.email;
      if (contact.whatsapp !== undefined) volunteer.contact.whatsapp = contact.whatsapp;
    }
    
    if (availability) {
      if (availability.days) volunteer.availability.days = availability.days;
      if (availability.hours) {
        volunteer.availability.hours.start = availability.hours.start || volunteer.availability.hours.start;
        volunteer.availability.hours.end = availability.hours.end || volunteer.availability.hours.end;
      }
      if (availability.frequency) volunteer.availability.frequency = availability.frequency;
    }
    
    if (location) {
      if (location.address) volunteer.location.address = location.address;
      if (location.city) volunteer.location.city = location.city;
      if (location.state) volunteer.location.state = location.state;
      if (location.coordinates && location.coordinates.length === 2) {
        volunteer.location.coordinates.coordinates = location.coordinates.map(coord => parseFloat(coord));
      }
      if (location.serviceRadius) volunteer.location.serviceRadius = location.serviceRadius;
    }
    
    if (bio !== undefined) volunteer.bio = bio;
    if (experience !== undefined) volunteer.experience = experience;
    if (servicesOffered && servicesOffered.length) volunteer.servicesOffered = servicesOffered;

    // Update last active
    volunteer.lastActive = new Date();
    
    await volunteer.save();

    res.json({
      success: true,
      message: 'Volunteer profile updated successfully',
      data: volunteer
    });
  } catch (err) {
    console.error('Error in updateVolunteerProfile:', err.message);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Create community help request
export const createHelpRequest = async (req, res) => {
  try {
    const {
      helpType,
      description,
      location,
      schedule,
      urgency,
      isOnSite,
      communication
    } = req.body;

    // Validate required fields
    if (!helpType || !description || !location || !schedule || !schedule.requestedDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Parse coordinates
    const coordinates = location.coordinates 
      ? location.coordinates.map(coord => parseFloat(coord))
      : [78.486671, 17.385044]; // Default Hyderabad
    
    // Create new help request
    const helpRequest = new CommunityHelpRequest({
      user: req.user.id,
      helpType,
      description,
      location: {
        address: location.address || 'Address not provided',
        coordinates: {
          type: 'Point',
          coordinates
        }
      },
      schedule: {
        requestedDate: new Date(schedule.requestedDate),
        requestedTime: schedule.requestedTime || '10:00'
      },
      urgency: urgency || 'medium',
      isOnSite: isOnSite !== undefined ? isOnSite : true,
      isPublic: true,
      communication: communication || {}
    });

    // Add initial tracking entry
    helpRequest.tracking.push({
      status: 'pending',
      timestamp: new Date(),
      notes: 'Help request created',
      updatedBy: 'user'
    });

    await helpRequest.save();

    // Automatically start searching for volunteers (would be handled by a separate process in production)
    findNearbyVolunteers(helpRequest);

    res.status(201).json({
      success: true,
      message: 'Help request created successfully',
      data: {
        id: helpRequest._id,
        requestId: helpRequest.requestId,
        status: helpRequest.status,
        statusDisplay: helpRequest.statusDisplay
      }
    });
  } catch (err) {
    console.error('Error in createHelpRequest:', err.message);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Helper function to find nearby volunteers
const findNearbyVolunteers = async (helpRequest) => {
  try {
    // Update status to searching
    helpRequest.status = 'searching';
    await helpRequest.save();
    
    // Find nearby volunteers with matching skills
    const volunteers = await CommunityVolunteer.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: helpRequest.location.coordinates.coordinates
          },
          distanceField: 'distance',
          maxDistance: 10000, // 10km radius
          spherical: true,
          query: {
            skills: helpRequest.helpType,
            isActive: true,
            "verification.isVerified": true
          }
        }
      },
      { $limit: 5 } // Limit to nearest 5 volunteers
    ]);
    
    // In a real implementation, you would:
    // 1. Send notifications to these volunteers
    // 2. Wait for acceptance
    // 3. Assign to the first volunteer who accepts
    
    console.log(`Found ${volunteers.length} nearby volunteers for help request ${helpRequest._id}`);
    
    // For demo purposes, simulate assignment to the nearest volunteer if available
    if (volunteers.length > 0) {
      const nearestVolunteer = volunteers[0];
      
      // Update help request with assigned volunteer
      helpRequest.volunteer = nearestVolunteer._id;
      helpRequest.status = 'accepted';
      helpRequest.schedule.confirmedDate = new Date();
      helpRequest.schedule.confirmedTime = new Date().toTimeString().substring(0, 5);
      
      // Add tracking entry
      helpRequest.tracking.push({
        status: 'accepted',
        timestamp: new Date(),
        notes: `Accepted by volunteer ${nearestVolunteer.name}`,
        updatedBy: 'volunteer'
      });
      
      await helpRequest.save();
      console.log(`Help request ${helpRequest._id} assigned to volunteer ${nearestVolunteer._id}`);
    } else {
      console.log(`No volunteers found for help request ${helpRequest._id}`);
    }
  } catch (err) {
    console.error('Error finding nearby volunteers:', err);
  }
};

// Get user help requests
export const getUserHelpRequests = async (req, res) => {
  try {
    const helpRequests = await CommunityHelpRequest.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('volunteer', 'name contact.phone');
    
    res.json({
      success: true,
      count: helpRequests.length,
      data: helpRequests
    });
  } catch (err) {
    console.error('Error in getUserHelpRequests:', err.message);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Get volunteer help requests
export const getVolunteerHelpRequests = async (req, res) => {
  try {
    // Find volunteer ID
    const volunteer = await CommunityVolunteer.findOne({ user: req.user.id });
    
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer profile not found'
      });
    }
    
    // Get assigned requests
    const assignedRequests = await CommunityHelpRequest.find({ 
      volunteer: volunteer._id 
    })
    .sort({ createdAt: -1 })
    .populate('user', 'name');
    
    // Get nearby public pending requests
    const nearbyRequests = await CommunityHelpRequest.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: volunteer.location.coordinates.coordinates
          },
          distanceField: 'distance',
          maxDistance: volunteer.location.serviceRadius * 1000, // Convert to meters
          spherical: true,
          query: {
            status: { $in: ['pending', 'searching'] },
            isPublic: true,
            helpType: { $in: volunteer.skills },
            volunteer: { $exists: false }
          }
        }
      },
      { $limit: 10 }
    ]);
    
    res.json({
      success: true,
      data: {
        assignedRequests: {
          count: assignedRequests.length,
          requests: assignedRequests
        },
        nearbyRequests: {
          count: nearbyRequests.length,
          requests: nearbyRequests
        }
      }
    });
  } catch (err) {
    console.error('Error in getVolunteerHelpRequests:', err.message);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Get help request by ID
export const getHelpRequestById = async (req, res) => {
  try {
    const helpRequest = await CommunityHelpRequest.findById(req.params.id)
      .populate('user', 'name phone')
      .populate('volunteer', 'name contact');
    
    if (!helpRequest) {
      return res.status(404).json({ 
        success: false, 
        message: 'Help request not found' 
      });
    }
    
    // Check if user is authorized to view this request
    const isUser = helpRequest.user._id.toString() === req.user.id;
    let isVolunteer = false;
    
    if (helpRequest.volunteer) {
      const volunteer = await CommunityVolunteer.findOne({ user: req.user.id });
      isVolunteer = volunteer && volunteer._id.toString() === helpRequest.volunteer._id.toString();
    }
    
    if (!isUser && !isVolunteer && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to view this help request' 
      });
    }
    
    res.json({
      success: true,
      data: helpRequest
    });
  } catch (err) {
    console.error('Error in getHelpRequestById:', err.message);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Accept help request (for volunteers)
export const acceptHelpRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    
    // Find volunteer
    const volunteer = await CommunityVolunteer.findOne({ user: req.user.id });
    
    if (!volunteer) {
      return res.status(404).json({ 
        success: false, 
        message: 'Volunteer profile not found' 
      });
    }
    
    // Find help request
    const helpRequest = await CommunityHelpRequest.findById(id);
    
    if (!helpRequest) {
      return res.status(404).json({ 
        success: false, 
        message: 'Help request not found' 
      });
    }
    
    // Check if request is available to accept
    if (helpRequest.status !== 'pending' && helpRequest.status !== 'searching') {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot accept request in ${helpRequest.status} status` 
      });
    }
    
    if (helpRequest.volunteer) {
      return res.status(400).json({ 
        success: false, 
        message: 'This request has already been accepted by another volunteer' 
      });
    }
    
    // Check if volunteer has the required skill
    if (!volunteer.skills.includes(helpRequest.helpType)) {
      return res.status(400).json({ 
        success: false, 
        message: 'You do not have the required skill for this help request' 
      });
    }
    
    // Accept the request
    helpRequest.volunteer = volunteer._id;
    helpRequest.status = 'accepted';
    helpRequest.schedule.confirmedDate = new Date();
    helpRequest.schedule.confirmedTime = new Date().toTimeString().substring(0, 5);
    
    // Add tracking entry
    helpRequest.tracking.push({
      status: 'accepted',
      timestamp: new Date(),
      notes: notes || `Accepted by volunteer ${volunteer.name}`,
      updatedBy: 'volunteer'
    });
    
    await helpRequest.save();
    
    // Update volunteer stats
    volunteer.stats.totalHelpRequests += 1;
    volunteer.lastActive = new Date();
    await volunteer.save();
    
    res.json({
      success: true,
      message: 'Help request accepted successfully',
      data: {
        id: helpRequest._id,
        status: helpRequest.status,
        statusDisplay: helpRequest.statusDisplay,
        schedule: helpRequest.schedule
      }
    });
  } catch (err) {
    console.error('Error in acceptHelpRequest:', err.message);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Update help request status
export const updateHelpRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    if (!status) {
      return res.status(400).json({ 
        success: false, 
        message: 'Status is required' 
      });
    }
    
    // Find help request
    const helpRequest = await CommunityHelpRequest.findById(id);
    
    if (!helpRequest) {
      return res.status(404).json({ 
        success: false, 
        message: 'Help request not found' 
      });
    }
    
    // Check if user is authorized to update this request
    let isVolunteer = false;
    if (helpRequest.volunteer) {
      const volunteer = await CommunityVolunteer.findOne({ user: req.user.id });
      isVolunteer = volunteer && volunteer._id.toString() === helpRequest.volunteer.toString();
    }
    
    const isUser = helpRequest.user.toString() === req.user.id;
    
    if (!isUser && !isVolunteer && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this help request' 
      });
    }
    
    // Update status
    const oldStatus = helpRequest.status;
    helpRequest.status = status;
    
    // Add tracking entry
    helpRequest.tracking.push({
      status,
      timestamp: new Date(),
      notes: notes || `Status updated from ${oldStatus} to ${status}`,
      updatedBy: isUser ? 'user' : (isVolunteer ? 'volunteer' : 'admin')
    });
    
    // Update additional fields based on status
    if (status === 'in-progress') {
      // Nothing additional to update
    } else if (status === 'completed') {
      helpRequest.schedule.completedAt = new Date();
      
      // Update volunteer stats if available
      if (helpRequest.volunteer) {
        const volunteer = await CommunityVolunteer.findById(helpRequest.volunteer);
        if (volunteer) {
          volunteer.stats.completedRequests += 1;
          volunteer.stats.peopleHelped += 1;
          volunteer.stats.hoursDonated += 1; // Default 1 hour if not specified
          await volunteer.save();
        }
      }
    } else if (status === 'cancelled') {
      // Additional logic for cancellation if needed
    }
    
    await helpRequest.save();
    
    res.json({
      success: true,
      message: 'Help request status updated successfully',
      data: {
        id: helpRequest._id,
        status: helpRequest.status,
        statusDisplay: helpRequest.statusDisplay,
        tracking: helpRequest.tracking
      }
    });
  } catch (err) {
    console.error('Error in updateHelpRequestStatus:', err.message);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Submit help request feedback
export const submitHelpRequestFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review, hoursSpent, materialsProvided, additionalPeopleHelped } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid rating between 1 and 5 is required' 
      });
    }
    
    // Find help request
    const helpRequest = await CommunityHelpRequest.findById(id);
    
    if (!helpRequest) {
      return res.status(404).json({ 
        success: false, 
        message: 'Help request not found' 
      });
    }
    
    // Check if user is authorized and determine feedback type
    const isUser = helpRequest.user.toString() === req.user.id;
    let isVolunteer = false;
    
    if (helpRequest.volunteer) {
      const volunteer = await CommunityVolunteer.findOne({ user: req.user.id });
      isVolunteer = volunteer && volunteer._id.toString() === helpRequest.volunteer.toString();
    }
    
    if (!isUser && !isVolunteer && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to submit feedback for this help request' 
      });
    }
    
    // Can't submit feedback if not completed
    if (helpRequest.status !== 'completed') {
      return res.status(400).json({ 
        success: false, 
        message: 'Can only submit feedback for completed help requests' 
      });
    }
    
    // Update feedback
    if (isUser) {
      helpRequest.feedback.userRating = rating;
      helpRequest.feedback.userReview = review || '';
    } else {
      helpRequest.feedback.volunteerRating = rating;
      helpRequest.feedback.volunteerReview = review || '';
      
      // Update help details
      if (hoursSpent) helpRequest.helpDetails.hoursSpent = hoursSpent;
      if (materialsProvided) helpRequest.helpDetails.materialsProvided = materialsProvided;
      if (additionalPeopleHelped) helpRequest.helpDetails.additionalPeopleHelped = additionalPeopleHelped;
    }
    
    helpRequest.feedback.reviewDate = new Date();
    
    await helpRequest.save();
    
    // Update volunteer rating if user provided feedback
    if (isUser && helpRequest.volunteer) {
      const volunteer = await CommunityVolunteer.findById(helpRequest.volunteer);
      
      if (volunteer) {
        // Calculate new rating average
        const newTotalReviews = volunteer.stats.totalReviews + 1;
        const newRatingAvg = 
          ((volunteer.stats.rating * volunteer.stats.totalReviews) + rating) / newTotalReviews;
        
        volunteer.stats.rating = newRatingAvg;
        volunteer.stats.totalReviews = newTotalReviews;
        
        await volunteer.save();
      }
    }
    
    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      data: {
        id: helpRequest._id,
        feedback: helpRequest.feedback
      }
    });
  } catch (err) {
    console.error('Error in submitHelpRequestFeedback:', err.message);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
