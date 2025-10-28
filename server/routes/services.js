import express from 'express';
import { 
  getNearbyProviders, 
  getServiceTypes, 
  getProviderDetails,
  createMockProviders,
  registerProvider
} from '../controllers/serviceController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/services/types
// @desc    Get all available service types
// @access  Public
router.get('/types', getServiceTypes);

// @route   GET /api/services/providers
// @desc    Get nearby service providers
// @access  Private
router.get('/providers', auth, getNearbyProviders);

// @route   GET /api/services/provider/:providerId
// @desc    Get provider details by ID
// @access  Private
router.get('/provider/:providerId', auth, getProviderDetails);

// @route   POST /api/services/providers/register
// @desc    Register a new service provider
// @access  Private
router.post('/providers/register', auth, registerProvider);

// @route   POST /api/services/mock-providers
// @desc    Create mock providers for testing (DEV ONLY)
// @access  Private
router.post('/mock-providers', auth, createMockProviders);

export default router;