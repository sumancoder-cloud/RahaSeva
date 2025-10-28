import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import ServiceProvider from '../models/ServiceProvider.js';

// Create a new booking
export const createBooking = async (req, res) => {
  try {
    const {
      providerId,
      serviceType,
      problemDescription,
      urgency,
      bookingType,
      location,
      requestedDate,
      requestedTime,
      baseAmount
    } = req.body;

    // Validate required fields
    if (!providerId || !serviceType || !problemDescription || !bookingType || !location) {
      return res.status(400).json({ 
        success: false,
        msg: 'Missing required fields' 
      });
    }

    // Check if provider exists
    const provider = await ServiceProvider.findById(providerId);
    if (!provider) {
      return res.status(404).json({ 
        success: false,
        msg: 'Service provider not found' 
      });
    }

    // Get user details
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        msg: 'User not found' 
      });
    }

    // Calculate total amount (base amount + any additional charges)
    const totalAmount = baseAmount || provider.pricing.basePrice;

    // Create booking
    const booking = new Booking({
      user: req.user.id,
      provider: providerId,
      serviceDetails: {
        serviceType,
        problemDescription,
        urgency: urgency || 'normal'
      },
      bookingType,
      location: {
        address: location,
        coordinates: {
          type: 'Point',
          coordinates: user.location?.coordinates?.coordinates || [78.486671, 17.385044]
        }
      },
      schedule: {
        requestedDate: requestedDate || new Date(),
        requestedTime: requestedTime || '10:00'
      },
      pricing: {
        baseAmount: totalAmount,
        totalAmount: totalAmount
      },
      communication: {
        providerPhone: provider.contact.phone,
        userPhone: user.phone
      },
      status: 'confirmed' // Auto-confirm for demo
    });

    await booking.save();

    // Update user booking count
    user.totalBookings += 1;
    await user.save();

    // Update provider booking count
    provider.stats.totalBookings += 1;
    await provider.save();

    // Populate booking details for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('provider', 'businessName contact')
      .populate('user', 'name phone');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: {
        id: populatedBooking._id,
        bookingId: populatedBooking.bookingId,
        service: populatedBooking.serviceDetails.serviceType,
        provider: populatedBooking.provider.businessName,
        date: populatedBooking.formattedDate,
        status: populatedBooking.statusDisplay,
        amount: `₹${populatedBooking.pricing.totalAmount}`,
        type: populatedBooking.bookingType
      }
    });

  } catch (err) {
    console.error('Create booking error:', err.message);
    res.status(500).json({ 
      success: false,
      msg: 'Server error while creating booking' 
    });
  }
};

// Get user's booking history
export const getUserBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    // Check if MongoDB is connected
    if (!mongoose.connection.readyState) {
      console.log('MongoDB not connected, using mock booking data');
      // Return mock data when database is not available
      const mockBookings = [
        { 
          id: 1, 
          bookingId: 'BK001', 
          service: 'Plumber', 
          provider: 'Ravi Kumar', 
          date: '2024-01-15', 
          status: 'Completed', 
          amount: '₹299',
          type: 'On-site',
          urgency: 'normal',
          providerPhone: '+91 9876543210',
          location: 'Hyderabad, Telangana'
        },
        { 
          id: 2, 
          bookingId: 'BK002',
          service: 'Doctor', 
          provider: 'Dr. Priya Sharma', 
          date: '2024-01-10', 
          status: 'Completed', 
          amount: '₹500',
          type: 'Video Call',
          urgency: 'high',
          providerPhone: '+91 9876543211',
          location: 'Hyderabad, Telangana'
        },
        { 
          id: 3, 
          bookingId: 'BK003',
          service: 'Electrician', 
          provider: 'Electrical Solutions', 
          date: '2024-01-08', 
          status: 'In Progress', 
          amount: '₹300',
          type: 'On-site',
          urgency: 'normal',
          providerPhone: '+91 9876543212',
          location: 'Hyderabad, Telangana'
        }
      ];
      
      return res.json({
        success: true,
        bookings: mockBookings,
        pagination: {
          current: parseInt(page),
          total: 1,
          count: mockBookings.length
        },
        usingMockData: true
      });
    }
    
    const query = { user: req.user.id };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('provider', 'businessName contact rating')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    // Format bookings for frontend
    const formattedBookings = bookings.map(booking => ({
      id: booking._id,
      bookingId: booking.bookingId,
      service: booking.serviceDetails.serviceType,
      provider: booking.provider.businessName,
      date: booking.formattedDate,
      status: booking.statusDisplay,
      amount: `₹${booking.pricing.totalAmount}`,
      type: booking.bookingType,
      urgency: booking.serviceDetails.urgency,
      providerPhone: booking.communication.providerPhone,
      location: booking.location.address
    }));

    res.json({
      success: true,
      bookings: formattedBookings,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: total
      }
    });

  } catch (err) {
    console.error('Get user bookings error:', err.message);
    
    // Fallback to mock data on any error
    const mockBookings = [
      { 
        id: 1, 
        bookingId: 'BK001', 
        service: 'Plumber', 
        provider: 'Ravi Kumar', 
        date: '2024-01-15', 
        status: 'Completed', 
        amount: '₹299',
        type: 'On-site',
        urgency: 'normal',
        providerPhone: '+91 9876543210',
        location: 'Hyderabad, Telangana'
      },
      { 
        id: 2, 
        bookingId: 'BK002',
        service: 'Doctor', 
        provider: 'Dr. Priya Sharma', 
        date: '2024-01-10', 
        status: 'Completed', 
        amount: '₹500',
        type: 'Video Call',
        urgency: 'high',
        providerPhone: '+91 9876543211',
        location: 'Hyderabad, Telangana'
      },
      { 
        id: 3, 
        bookingId: 'BK003',
        service: 'Electrician', 
        provider: 'Electrical Solutions', 
        date: '2024-01-08', 
        status: 'In Progress', 
        amount: '₹300',
        type: 'On-site',
        urgency: 'normal',
        providerPhone: '+91 9876543212',
        location: 'Hyderabad, Telangana'
      }
    ];
    
    res.json({
      success: true,
      bookings: mockBookings,
      pagination: {
        current: parseInt(req.query.page || 1),
        total: 1,
        count: mockBookings.length
      },
      usingMockData: true,
      message: 'Using fallback data due to database connection issue'
    });
  }
};

// Get booking details by ID
export const getBookingDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
      .populate('user', 'name phone email')
      .populate('provider', 'businessName contact rating location');

    if (!booking) {
      return res.status(404).json({ 
        success: false,
        msg: 'Booking not found' 
      });
    }

    // Check if user owns this booking
    if (booking.user._id.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        msg: 'Not authorized to view this booking' 
      });
    }

    res.json({
      success: true,
      booking: {
        id: booking._id,
        bookingId: booking.bookingId,
        serviceDetails: booking.serviceDetails,
        provider: booking.provider,
        schedule: booking.schedule,
        pricing: booking.pricing,
        status: booking.status,
        statusDisplay: booking.statusDisplay,
        communication: booking.communication,
        location: booking.location,
        createdAt: booking.createdAt,
        bookingType: booking.bookingType
      }
    });

  } catch (err) {
    console.error('Get booking details error:', err.message);
    res.status(500).json({ 
      success: false,
      msg: 'Server error' 
    });
  }
};

// Update booking status
export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, reason } = req.body;

    const validStatuses = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        msg: 'Invalid status' 
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        msg: 'Booking not found' 
      });
    }

    // Check authorization
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        msg: 'Not authorized' 
      });
    }

    // Update status
    booking.status = status;
    
    if (status === 'cancelled') {
      booking.cancellation = {
        cancelledBy: 'user',
        reason: reason || 'No reason provided',
        cancelledAt: new Date()
      };
    }

    if (status === 'completed') {
      booking.schedule.completedAt = new Date();
      
      // Update user and provider stats
      const user = await User.findById(booking.user);
      user.completedBookings += 1;
      user.coinsEarned += 10; // Reward coins for completion
      await user.save();

      const provider = await ServiceProvider.findById(booking.provider);
      provider.stats.completedBookings += 1;
      await provider.save();
    }

    await booking.save();

    res.json({
      success: true,
      message: `Booking ${status} successfully`,
      booking: {
        id: booking._id,
        status: booking.status,
        statusDisplay: booking.statusDisplay
      }
    });

  } catch (err) {
    console.error('Update booking status error:', err.message);
    res.status(500).json({ 
      success: false,
      msg: 'Server error' 
    });
  }
};

// Add feedback to booking
export const addBookingFeedback = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false,
        msg: 'Rating must be between 1 and 5' 
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        msg: 'Booking not found' 
      });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        msg: 'Not authorized' 
      });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ 
        success: false,
        msg: 'Can only rate completed bookings' 
      });
    }

    // Add feedback
    booking.feedback.userRating = rating;
    booking.feedback.userReview = review || '';
    await booking.save();

    // Update provider rating
    const provider = await ServiceProvider.findById(booking.provider);
    const currentTotal = provider.rating.average * provider.rating.totalReviews;
    provider.rating.totalReviews += 1;
    provider.rating.average = (currentTotal + rating) / provider.rating.totalReviews;
    await provider.save();

    res.json({
      success: true,
      message: 'Feedback added successfully'
    });

  } catch (err) {
    console.error('Add booking feedback error:', err.message);
    res.status(500).json({ 
      success: false,
      msg: 'Server error' 
    });
  }
};