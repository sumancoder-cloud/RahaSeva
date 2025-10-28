import express from 'express';
import auth from '../middleware/auth.js';
import { 
  requestEmergencyService,
  getEmergencyServiceById,
  updateEmergencyServiceStatus,
  getUserEmergencyServices,
  getProviderEmergencyServices,
  cancelEmergencyService,
  submitEmergencyFeedback
} from '../controllers/emergencyController.js';

const router = express.Router();

// @route   POST /api/emergency
// @desc    Request emergency service
// @access  Private
router.post('/', auth, requestEmergencyService);

// @route   GET /api/emergency/:id
// @desc    Get emergency service by ID
// @access  Private
router.get('/:id', auth, getEmergencyServiceById);

// @route   PUT /api/emergency/:id/status
// @desc    Update emergency service status (for providers)
// @access  Private
router.put('/:id/status', auth, updateEmergencyServiceStatus);

// @route   GET /api/emergency/user/services
// @desc    Get all emergency services for logged in user
// @access  Private
router.get('/user/services', auth, getUserEmergencyServices);

// @route   GET /api/emergency/provider/services
// @desc    Get all emergency services for logged in provider
// @access  Private
router.get('/provider/services', auth, getProviderEmergencyServices);

// @route   PUT /api/emergency/:id/cancel
// @desc    Cancel emergency service
// @access  Private
router.put('/:id/cancel', auth, cancelEmergencyService);

// @route   POST /api/emergency/:id/feedback
// @desc    Submit feedback for emergency service
// @access  Private
router.post('/:id/feedback', auth, submitEmergencyFeedback);

export default router;
