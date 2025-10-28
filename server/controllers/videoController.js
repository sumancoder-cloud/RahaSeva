import VideoConsultation from '../models/VideoConsultation.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import ServiceProvider from '../models/ServiceProvider.js';
import mongoose from 'mongoose';
import crypto from 'crypto';

/**
 * VideoConsultation Controller - Handles video consultation functionality
 * Supports the Video Call Support feature in the HelpHive platform
 */

// Create video consultation for a booking
export const createVideoConsultation = async (req, res) => {
  try {
    const { bookingId, scheduledStartTime, scheduledEndTime } = req.body;
    
    if (!bookingId || !scheduledStartTime || !scheduledEndTime) {
      return res.status(400).json({ 
        success: false, 
        message: 'Booking ID, start time, and end time are required' 
      });
    }
    
    // Check if booking exists
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    // Check if user is authorized
    if (booking.user.toString() !== req.user.id && booking.provider.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    // Check if video consultation already exists for this booking
    const existingConsultation = await VideoConsultation.findOne({ booking: bookingId });
    
    if (existingConsultation) {
      return res.status(400).json({ 
        success: false, 
        message: 'Video consultation already exists for this booking',
        data: existingConsultation
      });
    }
    
    // Generate unique session ID and tokens
    const sessionId = crypto.randomBytes(16).toString('hex');
    const userToken = crypto.randomBytes(32).toString('hex');
    const providerToken = crypto.randomBytes(32).toString('hex');
    
    // Create meeting URL
    const meetingUrl = `/video-call/${sessionId}`;
    
    // Create new video consultation
    const videoConsultation = new VideoConsultation({
      booking: bookingId,
      user: booking.user,
      provider: booking.provider,
      scheduledStartTime: new Date(scheduledStartTime),
      scheduledEndTime: new Date(scheduledEndTime),
      sessionId,
      sessionToken: {
        userToken,
        providerToken
      },
      meetingUrl,
      problemDescription: booking.serviceDetails.problemDescription,
      features: {
        arEnabled: booking.serviceDetails.serviceType !== 'doctor', // Enable AR for non-medical consultations
        recording: booking.serviceDetails.serviceType === 'doctor', // Enable recording for medical consultations
        screenSharing: true,
        chat: true
      }
    });
    
    await videoConsultation.save();
    
    // Update booking with video consultation information
    booking.communication.meetingLink = meetingUrl;
    await booking.save();
    
    res.status(201).json({
      success: true,
      message: 'Video consultation created successfully',
      data: {
        id: videoConsultation._id,
        sessionId: videoConsultation.sessionId,
        meetingUrl: videoConsultation.meetingUrl,
        scheduledStartTime: videoConsultation.scheduledStartTime,
        scheduledEndTime: videoConsultation.scheduledEndTime,
        status: videoConsultation.status
      }
    });
  } catch (err) {
    console.error('Error in createVideoConsultation:', err.message);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Get video consultation by ID
export const getVideoConsultationById = async (req, res) => {
  try {
    const videoConsultation = await VideoConsultation.findById(req.params.id)
      .populate('user', 'name phone')
      .populate('provider', 'name phone service');
    
    if (!videoConsultation) {
      return res.status(404).json({ success: false, message: 'Video consultation not found' });
    }
    
    // Check if user is authorized
    const isUser = videoConsultation.user._id.toString() === req.user.id;
    const isProvider = videoConsultation.provider._id.toString() === req.user.id;
    
    if (!isUser && !isProvider && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    // Determine which token to send based on user role
    const token = isUser ? 
      videoConsultation.sessionToken.userToken : 
      videoConsultation.sessionToken.providerToken;
    
    res.json({
      success: true,
      data: {
        ...videoConsultation._doc,
        sessionToken: token, // Only send the appropriate token
        isParticipant: isUser || isProvider,
        role: isUser ? 'user' : (isProvider ? 'provider' : 'admin')
      }
    });
  } catch (err) {
    console.error('Error in getVideoConsultationById:', err.message);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Start video consultation
export const startVideoConsultation = async (req, res) => {
  try {
    const videoConsultation = await VideoConsultation.findById(req.params.id);
    
    if (!videoConsultation) {
      return res.status(404).json({ success: false, message: 'Video consultation not found' });
    }
    
    // Check if user is authorized
    if (videoConsultation.provider.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only the provider can start the consultation' });
    }
    
    // Check if consultation can be started
    if (videoConsultation.status !== 'scheduled' && videoConsultation.status !== 'ready') {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot start consultation in ${videoConsultation.status} status` 
      });
    }
    
    // Start the session
    await videoConsultation.startSession();
    
    res.json({
      success: true,
      message: 'Video consultation started',
      data: {
        id: videoConsultation._id,
        status: videoConsultation.status,
        statusDisplay: videoConsultation.statusDisplay,
        actualStartTime: videoConsultation.actualStartTime
      }
    });
  } catch (err) {
    console.error('Error in startVideoConsultation:', err.message);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// End video consultation
export const endVideoConsultation = async (req, res) => {
  try {
    const { diagnosis, recommendations } = req.body;
    
    const videoConsultation = await VideoConsultation.findById(req.params.id);
    
    if (!videoConsultation) {
      return res.status(404).json({ success: false, message: 'Video consultation not found' });
    }
    
    // Check if user is authorized
    if (videoConsultation.provider.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only the provider can end the consultation' });
    }
    
    // Check if consultation can be ended
    if (videoConsultation.status !== 'in-progress') {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot end consultation in ${videoConsultation.status} status` 
      });
    }
    
    // Add diagnosis and recommendations if provided
    if (diagnosis) videoConsultation.diagnosis = diagnosis;
    if (recommendations) videoConsultation.recommendations = recommendations;
    
    // End the session
    await videoConsultation.endSession();
    
    // Update booking status
    const booking = await Booking.findById(videoConsultation.booking);
    if (booking) {
      booking.status = 'completed';
      booking.schedule.completedAt = new Date();
      await booking.save();
    }
    
    res.json({
      success: true,
      message: 'Video consultation ended',
      data: {
        id: videoConsultation._id,
        status: videoConsultation.status,
        statusDisplay: videoConsultation.statusDisplay,
        actualEndTime: videoConsultation.actualEndTime,
        duration: videoConsultation.duration
      }
    });
  } catch (err) {
    console.error('Error in endVideoConsultation:', err.message);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Add artifact to video consultation
export const addArtifact = async (req, res) => {
  try {
    const { type, url, name, mimeType } = req.body;
    
    if (!type || !url || !name) {
      return res.status(400).json({ success: false, message: 'Type, URL, and name are required' });
    }
    
    const videoConsultation = await VideoConsultation.findById(req.params.id);
    
    if (!videoConsultation) {
      return res.status(404).json({ success: false, message: 'Video consultation not found' });
    }
    
    // Check if user is authorized
    const isUser = videoConsultation.user.toString() === req.user.id;
    const isProvider = videoConsultation.provider.toString() === req.user.id;
    
    if (!isUser && !isProvider && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    // Add artifact
    await videoConsultation.addArtifact(
      type,
      url,
      name,
      mimeType || 'application/octet-stream',
      isUser ? 'user' : 'provider'
    );
    
    res.json({
      success: true,
      message: 'Artifact added successfully',
      data: {
        artifacts: videoConsultation.artifacts
      }
    });
  } catch (err) {
    console.error('Error in addArtifact:', err.message);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Submit feedback for video consultation
export const submitFeedback = async (req, res) => {
  try {
    const { rating, comments } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Valid rating between 1 and 5 is required' });
    }
    
    const videoConsultation = await VideoConsultation.findById(req.params.id);
    
    if (!videoConsultation) {
      return res.status(404).json({ success: false, message: 'Video consultation not found' });
    }
    
    // Check if user is authorized and determine feedback type
    const isUser = videoConsultation.user.toString() === req.user.id;
    const isProvider = videoConsultation.provider.toString() === req.user.id;
    
    if (!isUser && !isProvider && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to submit feedback' });
    }
    
    // Update feedback
    if (isUser) {
      videoConsultation.feedback.userRating = rating;
      videoConsultation.feedback.userComments = comments || '';
    } else {
      videoConsultation.feedback.providerRating = rating;
      videoConsultation.feedback.providerComments = comments || '';
    }
    
    await videoConsultation.save();
    
    // Update provider's rating if user provided feedback
    if (isUser) {
      const provider = await ServiceProvider.findById(videoConsultation.provider);
      
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
        id: videoConsultation._id,
        feedback: videoConsultation.feedback
      }
    });
  } catch (err) {
    console.error('Error in submitFeedback:', err.message);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Get all video consultations for a user
export const getUserVideoConsultations = async (req, res) => {
  try {
    const videoConsultations = await VideoConsultation.find({ user: req.user.id })
      .sort({ scheduledStartTime: -1 })
      .populate('provider', 'name service')
      .populate('booking', 'bookingId');
    
    res.json({
      success: true,
      count: videoConsultations.length,
      data: videoConsultations
    });
  } catch (err) {
    console.error('Error in getUserVideoConsultations:', err.message);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Get all video consultations for a provider
export const getProviderVideoConsultations = async (req, res) => {
  try {
    const videoConsultations = await VideoConsultation.find({ provider: req.user.id })
      .sort({ scheduledStartTime: -1 })
      .populate('user', 'name')
      .populate('booking', 'bookingId');
    
    res.json({
      success: true,
      count: videoConsultations.length,
      data: videoConsultations
    });
  } catch (err) {
    console.error('Error in getProviderVideoConsultations:', err.message);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
