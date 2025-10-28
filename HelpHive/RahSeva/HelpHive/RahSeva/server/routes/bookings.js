import express from 'express';
import { 
  createBooking,
  getUserBookings,
  getBookingDetails,
  updateBookingStatus,
  addBookingFeedback
} from '../controllers/bookingController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private
router.post('/', auth, createBooking);

// @route   GET /api/bookings
// @desc    Get user's booking history
// @access  Private
router.get('/', auth, getUserBookings);

// @route   GET /api/bookings/:bookingId
// @desc    Get booking details by ID
// @access  Private
router.get('/:bookingId', auth, getBookingDetails);

// @route   PUT /api/bookings/:bookingId/status
// @desc    Update booking status
// @access  Private
router.put('/:bookingId/status', auth, updateBookingStatus);

// @route   POST /api/bookings/:bookingId/feedback
// @desc    Add feedback to completed booking
// @access  Private
router.post('/:bookingId/feedback', auth, addBookingFeedback);

export default router;